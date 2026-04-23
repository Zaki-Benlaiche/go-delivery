const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/auth');

// Client routes
router.get('/places', authMiddleware, reservationController.getPlacesWithQueue);
router.post('/reservations', authMiddleware, reservationController.createReservation);
router.get('/reservations/my', authMiddleware, reservationController.getMyReservations);
router.put('/reservations/:id/cancel', authMiddleware, reservationController.cancelReservation);
router.get('/reservations/queue/:reservationId', authMiddleware, reservationController.getQueueInfo);

// Admin routes
router.get('/reservations/all', authMiddleware, reservationController.getAllReservations);
router.put('/reservations/:id/status', authMiddleware, reservationController.updateReservationStatus);

// Place owner routes
router.get('/reservations/my-place', authMiddleware, reservationController.getMyPlaceReservations);
router.put('/places/:id', authMiddleware, reservationController.updatePlace);

module.exports = router;
