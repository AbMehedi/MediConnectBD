'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // Define associations here
      this.hasMany(models.User, {
        foreignKey: 'roleId',
        as: 'users'
      });
    }
  }
  
  Role.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'Roles',
    timestamps: true,
    underscored: false
  });

  return Role;
};
