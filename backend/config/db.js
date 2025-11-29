const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'mediconnect', 
    process.env.DB_USER || 'root', 
    process.env.DB_PASS || '', 
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database Connected Successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

testConnection();

module.exports = sequelize;