const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reservation = sequelize.define('Reservation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    placeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    queueNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('waiting', 'called', 'done', 'cancelled'),
        allowNull: false,
        defaultValue: 'waiting',
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    estimatedWaitMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
});

module.exports = Reservation;
