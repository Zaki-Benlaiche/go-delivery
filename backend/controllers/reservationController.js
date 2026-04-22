const { Place, Reservation, User } = require('../models');

// 1. Get all places
exports.getPlaces = async (req, res) => {
    try {
        const places = await Place.findAll();
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching places', error: error.message });
    }
};

// 2. Create a reservation
exports.createReservation = async (req, res) => {
    try {
        const { placeId } = req.body;
        const userId = req.user.id;

        // Get the highest queue number for this place today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const queueCount = await Reservation.count({
            where: {
                placeId,
                date: startOfDay,
            }
        });

        const queueNumber = queueCount + 1; // Basic logic: next in line

        const newReservation = await Reservation.create({
            userId,
            placeId,
            queueNumber,
            date: startOfDay,
            estimatedWaitMinutes: queueNumber * 15, // 15 mins per person roughly
        });

        res.status(201).json(newReservation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating reservation', error: error.message });
    }
};

// 3. Get my reservations
exports.getMyReservations = async (req, res) => {
    try {
        const userId = req.user.id;
        const reservations = await Reservation.findAll({
            where: { userId },
            include: [{ model: Place, as: 'place' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations', error: error.message });
    }
};

// 4. Cancel my reservation
exports.cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const reservation = await Reservation.findOne({ where: { id, userId } });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        res.json({ message: 'Reservation cancelled successfully', reservation });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
    }
};
