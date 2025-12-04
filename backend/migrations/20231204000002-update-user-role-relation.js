'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add roleId as nullable first
    await queryInterface.addColumn('Users', 'roleId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Update existing records with default role (PATIENT = 6)
    await queryInterface.sequelize.query(`
      UPDATE Users 
      SET roleId = 6 
      WHERE roleId IS NULL
    `);

    // Make the column NOT NULL
    await queryInterface.changeColumn('Users', 'roleId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Remove the old role column
    await queryInterface.removeColumn('Users', 'role');
  },

  async down(queryInterface, Sequelize) {
    // Add back the role column
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN'),
      defaultValue: 'PATIENT'
    });

    // Remove the foreign key constraint
    await queryInterface.removeConstraint('Users', 'Users_roleId_foreign_idx');
    
    // Remove the roleId column
    await queryInterface.removeColumn('Users', 'roleId');
  }
};