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

// 5. Admin: Get all reservations (all places, all users)
exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.findAll({
            include: [
                { model: Place, as: 'place' },
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }
            ],
            order: [['date', 'DESC'], ['queueNumber', 'ASC']]
        });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all reservations', error: error.message });
    }
};

// 6. Admin: Update reservation status (waiting -> called -> done)
exports.updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['waiting', 'called', 'done', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const reservation = await Reservation.findByPk(id, {
            include: [
                { model: Place, as: 'place' },
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }
            ]
        });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        reservation.status = status;
        await reservation.save();

        res.json({ message: `Reservation status updated to ${status}`, reservation });
    } catch (error) {
        res.status(500).json({ message: 'Error updating reservation', error: error.message });
    }
};

// 7. Place Owner: Get reservations for MY place
exports.getMyPlaceReservations = async (req, res) => {
    try {
        const userId = req.user.id;
        const place = await Place.findOne({ where: { userId } });
        if (!place) {
            return res.status(404).json({ message: 'No place found for this user' });
        }

        const reservations = await Reservation.findAll({
            where: { placeId: place.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
                { model: Place, as: 'place' }
            ],
            order: [['date', 'DESC'], ['queueNumber', 'ASC']]
        });

        res.json({ place, reservations });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching place reservations', error: error.message });
    }
};

// 8. Client: Get queue info (people ahead, estimated wait)
exports.getQueueInfo = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const reservation = await Reservation.findByPk(reservationId, {
            include: [{ model: Place, as: 'place' }]
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const peopleAhead = await Reservation.count({
            where: {
                placeId: reservation.placeId,
                date: startOfDay,
                status: 'waiting',
                queueNumber: { [require('sequelize').Op.lt]: reservation.queueNumber }
            }
        });

        res.json({
            queueNumber: reservation.queueNumber,
            status: reservation.status,
            peopleAhead,
            estimatedWaitMinutes: peopleAhead * 15,
            place: reservation.place
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching queue info', error: error.message });
    }
};

// 9. Get places with today's queue count
exports.getPlacesWithQueue = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const places = await Place.findAll();
        const placesData = await Promise.all(places.map(async (place) => {
            const waitingCount = await Reservation.count({
                where: { placeId: place.id, date: startOfDay, status: 'waiting' }
            });
            return { ...place.toJSON(), waitingCount };
        }));

        res.json(placesData);
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};
