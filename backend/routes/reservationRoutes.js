const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// io is injected on the request by server.js — the factory signature is kept
// for API stability so server.js doesn't need to change shape.
module.exports = () => {
    // Client routes
    router.get('/places', authMiddleware, reservationController.getPlacesWithQueue);
    router.post('/reservations', authMiddleware, validate(schemas.createReservation), reservationController.createReservation);
    router.get('/reservations/my', authMiddleware, reservationController.getMyReservations);
    router.put('/reservations/:id/cancel', authMiddleware, reservationController.cancelReservation);
    router.get('/reservations/queue/:reservationId', authMiddleware, reservationController.getQueueInfo);

    // Admin routes
    router.get('/reservations/all', authMiddleware, reservationController.getAllReservations);
    router.put('/reservations/:id/status', authMiddleware, validate(schemas.reservationStatus), reservationController.updateReservationStatus);

    // Place owner routes
    router.get('/reservations/my-place', authMiddleware, reservationController.getMyPlaceReservations);
    router.put('/reservations/:id/info', authMiddleware, validate(schemas.reservationInfo), reservationController.updateReservationInfo);
    router.put('/my-place/open-status', authMiddleware, reservationController.togglePlaceOpenStatus);
    router.put('/places/:id', authMiddleware, validate(schemas.placeUpdate), reservationController.updatePlace);

    return router;
};
