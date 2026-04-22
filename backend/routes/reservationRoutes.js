const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/auth');

// Protected routes (require login)
router.get('/places', authMiddleware, reservationController.getPlaces);
router.post('/reservations', authMiddleware, reservationController.createReservation);
router.get('/reservations/my', authMiddleware, reservationController.getMyReservations);
router.put('/reservations/:id/cancel', authMiddleware, reservationController.cancelReservation);

module.exports = router;
