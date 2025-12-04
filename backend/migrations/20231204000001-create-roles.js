'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create roles table
    await queryInterface.createTable('Roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Insert default roles
    const roles = [
      { name: 'SUPER_ADMIN', description: 'Full system access' },
      { name: 'ADMIN', description: 'Administrative access' },
      { name: 'HOSPITAL_ADMIN', description: 'Manages hospital operations' },
      { name: 'DOCTOR', description: 'Medical practitioner' },
      { name: 'NURSE', description: 'Nursing staff' },
      { name: 'PATIENT', description: 'Patient user' },
      { name: 'RECEPTIONIST', description: 'Front desk staff' },
      { name: 'PHARMACIST', description: 'Pharmacy staff' },
      { name: 'LAB_TECHNICIAN', description: 'Lab staff' },
      { name: 'ACCOUNTANT', description: 'Financial staff' }
    ];

    // Add timestamps
    const now = new Date();
    const rolesWithTimestamps = roles.map(role => ({
      ...role,
      createdAt: now,
      updatedAt: now
    }));

    await queryInterface.bulkInsert('Roles', rolesWithTimestamps);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Roles');
  }
};
