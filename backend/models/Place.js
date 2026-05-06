const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Place = sequelize.define('Place', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('doctor', 'clinic', 'government', 'other'),
        allowNull: false,
        defaultValue: 'other',
    },
    address: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT,
    },
    icon: {
        type: DataTypes.STRING,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    isOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    indexes: [
        { fields: ['userId'] },
    ],
});

module.exports = Place;
