const { Ambulance, Emergency, User, Hospital, Doctor, sequelize } = require('../models');
const { QueryTypes, Op } = require('sequelize');

const getNearbyAmbulances = async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Coordinates required' });
    }

    try {
        // Raw SQL for Geospatial calculation (ST_Distance_Sphere gives meters)
        // 5000 meters = 5km
        const query = `
            SELECT *, 
            ST_Distance_Sphere(point(longitude, latitude), point(${lng}, ${lat})) as distanceValue
            FROM Ambulances
            WHERE status != 'Busy'
            HAVING distanceValue <= 5000
            ORDER BY distanceValue ASC
        `;

        const ambulances = await sequelize.query(query, { type: QueryTypes.SELECT });
        
        // Format distance for UI
        const formatted = ambulances.map(amb => ({
            ...amb,
            distance: (amb.distanceValue / 1000).toFixed(1) + ' km'
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error finding ambulances' });
    }
};

// @desc    Report new emergency
// @route   POST /api/emergency/report
const reportEmergency = async (req, res) => {
    try {
        const {
            patientId,
            patientName,
            patientAge,
            patientGender,
            patientPhone,
            emergencyContactName,
            emergencyContactPhone,
            currentLocation,
            latitude,
            longitude,
            emergencyType,
            priority,
            description,
            symptoms,
            vitalSigns,
            consciousness,
            ambulanceRequired,
            reportedBy,
            reporterPhone,
            reporterRelation,
            allergies,
            medicalHistory,
            currentMedications
        } = req.body;

        // Generate unique emergency ID
        const emergencyId = `EMG${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Create emergency record
        const emergency = await Emergency.create({
            emergencyId,
            patientId,
            patientName,
            patientAge,
            patientGender,
            patientPhone,
            emergencyContactName,
            emergencyContactPhone,
            currentLocation,
            latitude,
            longitude,
            emergencyType,
            priority: priority || 'Medium',
            triageLevel: getTriageLevel(priority, emergencyType),
            description,
            symptoms: symptoms || [],
            vitalSigns: vitalSigns || {},
            consciousness: consciousness || 'Alert',
            ambulanceRequired: ambulanceRequired || false,
            reportedBy,
            reporterPhone,
            reporterRelation,
            allergies: allergies || [],
            medicalHistory: medicalHistory || [],
            currentMedications: currentMedications || [],
            status: 'Reported',
            isActive: true
        });

        // If ambulance required, try to assign one
        if (ambulanceRequired && latitude && longitude) {
            await assignNearestAmbulance(emergency.id, latitude, longitude);
        }

        // Find nearest suitable hospital
        const nearestHospital = await findNearestHospital(latitude, longitude, emergencyType);
        if (nearestHospital) {
            await emergency.update({
                assignedHospitalId: nearestHospital.id,
                assignedHospitalName: nearestHospital.name
            });
        }

        res.status(201).json({
            message: 'Emergency reported successfully',
            emergency,
            emergencyId: emergency.emergencyId,
            assignedHospital: nearestHospital
        });
    } catch (error) {
        console.error('Report emergency error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get emergency details
// @route   GET /api/emergency/:id
const getEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'patient',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: Hospital,
                    as: 'assignedHospital',
                    attributes: ['id', 'name', 'address', 'contact', 'emergencyServices']
                },
                {
                    model: Doctor,
                    as: 'attendingDoctor',
                    attributes: ['id'],
                    include: [
                        {
                            model: User,
                            attributes: ['name', 'phone']
                        }
                    ]
                },
                {
                    model: Ambulance,
                    as: 'ambulance',
                    attributes: ['id', 'ambulanceNumber', 'driverName', 'driverPhone', 'status']
                }
            ]
        });

        if (!emergency) {
            return res.status(404).json({ message: 'Emergency not found' });
        }

        res.json(emergency);
    } catch (error) {
        console.error('Get emergency error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update emergency status
// @route   PUT /api/emergency/:id/status
const updateEmergencyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            status, 
            attendingDoctorId, 
            initialAssessment, 
            treatment, 
            medications, 
            procedures, 
            outcome, 
            disposition 
        } = req.body;

        const emergency = await Emergency.findByPk(id);

        if (!emergency) {
            return res.status(404).json({ message: 'Emergency not found' });
        }

        const updateData = { status };

        // Add timestamps based on status
        if (status === 'Triaged') {
            updateData.triagedAt = new Date();
        } else if (status === 'Dispatched') {
            updateData.dispatchedAt = new Date();
        } else if (status === 'Arrived') {
            updateData.arrivedAt = new Date();
        } else if (status === 'Treating') {
            updateData.treatmentStartedAt = new Date();
        } else if (['Discharged', 'Transferred', 'Deceased'].includes(status)) {
            updateData.resolvedAt = new Date();
            updateData.isActive = false;
            
            // Calculate response time
            const responseTime = Math.floor((new Date() - emergency.reportedAt) / (1000 * 60));
            updateData.responseTime = responseTime;
        }

        // Add medical data if provided
        if (attendingDoctorId) updateData.attendingDoctorId = attendingDoctorId;
        if (initialAssessment) updateData.initialAssessment = initialAssessment;
        if (treatment) updateData.treatment = treatment;
        if (medications) updateData.medications = medications;
        if (procedures) updateData.procedures = procedures;
        if (outcome) updateData.outcome = outcome;
        if (disposition) updateData.disposition = disposition;

        await emergency.update(updateData);

        res.json({
            message: 'Emergency status updated successfully',
            emergency
        });
    } catch (error) {
        console.error('Update emergency status error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active emergencies for hospital
// @route   GET /api/emergency/hospital/:hospitalId/active
const getHospitalActiveEmergencies = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        
        const emergencies = await Emergency.findAll({
            where: {
                assignedHospitalId: hospitalId,
                isActive: true,
                status: {
                    [Op.in]: ['Reported', 'Triaged', 'Dispatched', 'In Transit', 'Arrived', 'Treating']
                }
            },
            include: [
                {
                    model: Ambulance,
                    as: 'ambulance',
                    attributes: ['ambulanceNumber', 'driverName', 'driverPhone', 'status']
                }
            ],
            order: [['priority', 'DESC'], ['reportedAt', 'ASC']]
        });

        res.json({
            emergencies,
            totalActive: emergencies.length
        });
    } catch (error) {
        console.error('Get hospital emergencies error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper functions
const getTriageLevel = (priority, emergencyType) => {
    if (priority === 'Critical' || emergencyType === 'Cardiac') return '1-Resuscitation';
    if (priority === 'High' || emergencyType === 'Trauma') return '2-Emergent';
    if (priority === 'Medium') return '3-Urgent';
    return '4-Less Urgent';
};

const findNearestHospital = async (latitude, longitude, emergencyType) => {
    // Simplified: In production, use geospatial queries
    const hospitals = await Hospital.findAll({
        where: {
            isActive: true,
            emergencyServices: true
        },
        attributes: ['id', 'name', 'address', 'latitude', 'longitude']
    });

    // Find closest hospital (simplified distance calculation)
    let nearest = null;
    let minDistance = Infinity;

    hospitals.forEach(hospital => {
        if (hospital.latitude && hospital.longitude) {
            const distance = Math.sqrt(
                Math.pow(latitude - hospital.latitude, 2) + 
                Math.pow(longitude - hospital.longitude, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearest = hospital;
            }
        }
    });

    return nearest;
};

const assignNearestAmbulance = async (emergencyId, latitude, longitude) => {
    const availableAmbulances = await Ambulance.findAll({
        where: {
            status: 'Available',
            isActive: true
        }
    });

    if (availableAmbulances.length === 0) return null;

    // Find nearest ambulance (simplified)
    let nearest = availableAmbulances[0];
    let minDistance = Infinity;

    availableAmbulances.forEach(ambulance => {
        if (ambulance.currentLatitude && ambulance.currentLongitude) {
            const distance = Math.sqrt(
                Math.pow(latitude - ambulance.currentLatitude, 2) + 
                Math.pow(longitude - ambulance.currentLongitude, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearest = ambulance;
            }
        }
    });

    // Assign ambulance
    const emergency = await Emergency.findByPk(emergencyId);
    await emergency.update({
        ambulanceId: nearest.id,
        ambulanceStatus: 'Assigned'
    });

    await nearest.update({
        status: 'Dispatched',
        currentEmergencyId: emergencyId
    });

    return nearest;
};

module.exports = {
    getNearbyAmbulances,
    reportEmergency,
    getEmergency,
    updateEmergencyStatus,
    getHospitalActiveEmergencies
};