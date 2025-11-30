/**
 * User roles enumeration
 */
const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  HOSPITAL: 'hospital',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
};

/**
 * Appointment status enumeration
 */
const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

/**
 * Emergency priority levels
 */
const EMERGENCY_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Medical specialties
 */
const MEDICAL_SPECIALTIES = [
  'Cardiologist',
  'Dermatologist',
  'ENT Specialist',
  'Endocrinologist',
  'Gastroenterologist',
  'General Physician',
  'Gynecologist',
  'Neurologist',
  'Oncologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Urologist'
];

/**
 * HTTP status codes
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * API response messages
 */
const MESSAGES = {
  SUCCESS: 'Operation successful',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
};

module.exports = {
  USER_ROLES,
  APPOINTMENT_STATUS,
  EMERGENCY_PRIORITY,
  MEDICAL_SPECIALTIES,
  HTTP_STATUS,
  MESSAGES
};
