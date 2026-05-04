const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/auth');

module.exports = (io) => {
    // Client routes
    router.get('/places', authMiddleware, reservationController.getPlacesWithQueue);
    router.post('/reservations', authMiddleware, (req, res) => reservationController.createReservation(req, res, io));
    router.get('/reservations/my', authMiddleware, reservationController.getMyReservations);
    router.put('/reservations/:id/cancel', authMiddleware, (req, res) => reservationController.cancelReservation(req, res, io));
    router.get('/reservations/queue/:reservationId', authMiddleware, reservationController.getQueueInfo);

    // Admin routes
    router.get('/reservations/all', authMiddleware, reservationController.getAllReservations);
    router.put('/reservations/:id/status', authMiddleware, (req, res) => reservationController.updateReservationStatus(req, res, io));

    // Place owner routes
    router.get('/reservations/my-place', authMiddleware, reservationController.getMyPlaceReservations);
    router.put('/reservations/:id/info', authMiddleware, (req, res) => reservationController.updateReservationInfo(req, res, io));
    router.put('/my-place/open-status', authMiddleware, reservationController.togglePlaceOpenStatus);
    router.put('/places/:id', authMiddleware, reservationController.updatePlace);

    return router;
};
