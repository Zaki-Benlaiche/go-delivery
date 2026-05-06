const { Place, Reservation, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const todayStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

// 30-second cache for the places-with-queue list. Every customer hit on the
// reservation tab calls this; waitingCount can be slightly stale.
let placesCache = { data: null, expiresAt: 0 };
const PLACES_TTL_MS = 30_000;

const invalidatePlacesCache = () => { placesCache.expiresAt = 0; };
exports.invalidatePlacesCache = invalidatePlacesCache;

const parsePagination = (req, defaultLimit = 100, maxLimit = 500) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || defaultLimit, 1), maxLimit);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    return { limit, offset };
};

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
exports.createReservation = async (req, res, io) => {
    try {
        const { placeId } = req.body;
        const userId = req.user.id;
        const startOfDay = todayStart();

        const queueCount = await Reservation.count({
            where: { placeId, date: startOfDay }
        });

        const queueNumber = queueCount + 1;

        const newReservation = await Reservation.create({
            userId,
            placeId,
            queueNumber,
            peopleBefore: queueCount,
            date: startOfDay,
            estimatedWaitMinutes: queueCount * 15,
        });

        invalidatePlacesCache();

        const fullReservation = await Reservation.findByPk(newReservation.id, {
            include: [
                { model: Place, as: 'place' },
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
            ],
        });

        // Notify the place owner so their dashboard updates instantly.
        const place = fullReservation.place;
        if (io && place?.userId) {
            io.to(`place_${place.userId}`).emit('reservation_created', fullReservation);
        }

        res.status(201).json(fullReservation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating reservation', error: error.message });
    }
};

// 3. Get my reservations
exports.getMyReservations = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit, offset } = parsePagination(req, 50, 200);
        const reservations = await Reservation.findAll({
            where: { userId },
            include: [{ model: Place, as: 'place' }],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations', error: error.message });
    }
};

// 4. Cancel my reservation
exports.cancelReservation = async (req, res, io) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const reservation = await Reservation.findOne({
            where: { id, userId },
            include: [{ model: Place, as: 'place' }],
        });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        reservation.status = 'cancelled';
        await reservation.save();
        invalidatePlacesCache();

        if (io && reservation.place?.userId) {
            io.to(`place_${reservation.place.userId}`).emit('reservation_updated', reservation);
        }

        res.json({ message: 'Reservation cancelled successfully', reservation });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
    }
};

// 5. Admin: Get all reservations (all places, all users)
exports.getAllReservations = async (req, res) => {
    try {
        const { limit, offset } = parsePagination(req);
        const reservations = await Reservation.findAll({
            include: [
                { model: Place, as: 'place' },
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }
            ],
            order: [['date', 'DESC'], ['queueNumber', 'ASC']],
            limit,
            offset,
        });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all reservations', error: error.message });
    }
};

// 6. Admin / Place owner: Update reservation status (waiting -> called -> done)
exports.updateReservationStatus = async (req, res, io) => {
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
        // Status flips affect the waitingCount surfaced in /places.
        if (status === 'done' || status === 'cancelled' || status === 'called') invalidatePlacesCache();

        if (io) {
            if (reservation.place?.userId) {
                io.to(`place_${reservation.place.userId}`).emit('reservation_updated', reservation);
            }
            io.to(`client_${reservation.userId}`).emit('reservation_updated', reservation);
        }

        res.json({ message: `Reservation status updated to ${status}`, reservation });
    } catch (error) {
        res.status(500).json({ message: 'Error updating reservation', error: error.message });
    }
};

// 6b. Place owner: edit ticket number, people-before, and ETA for a reservation.
// This is what lets the doctor say "you're #5, 3 people remain ahead of you".
exports.updateReservationInfo = async (req, res, io) => {
    try {
        const { id } = req.params;
        const { queueNumber, peopleBefore, estimatedWaitMinutes } = req.body;

        const reservation = await Reservation.findByPk(id, {
            include: [{ model: Place, as: 'place' }, { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
        });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Only the place owner (or admin) can override these values.
        const isOwner = reservation.place?.userId === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (queueNumber !== undefined && Number.isFinite(Number(queueNumber))) {
            reservation.queueNumber = Number(queueNumber);
        }
        if (peopleBefore !== undefined && Number.isFinite(Number(peopleBefore))) {
            reservation.peopleBefore = Math.max(0, Number(peopleBefore));
        }
        if (estimatedWaitMinutes !== undefined && Number.isFinite(Number(estimatedWaitMinutes))) {
            reservation.estimatedWaitMinutes = Math.max(0, Number(estimatedWaitMinutes));
        }

        await reservation.save();

        if (io) {
            if (reservation.place?.userId) {
                io.to(`place_${reservation.place.userId}`).emit('reservation_updated', reservation);
            }
            io.to(`client_${reservation.userId}`).emit('reservation_updated', reservation);
        }

        res.json({ message: 'Reservation info updated', reservation });
    } catch (error) {
        res.status(500).json({ message: 'Error updating reservation info', error: error.message });
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

        const { limit, offset } = parsePagination(req, 100, 500);
        const reservations = await Reservation.findAll({
            where: { placeId: place.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
                { model: Place, as: 'place' }
            ],
            order: [['date', 'DESC'], ['queueNumber', 'ASC']],
            limit,
            offset,
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

        // If the place owner has set explicit values, honor them — they know the actual queue better than us.
        const usingDoctorValues = reservation.peopleBefore > 0 || reservation.estimatedWaitMinutes > 0;

        let peopleAhead = reservation.peopleBefore;
        if (!usingDoctorValues) {
            peopleAhead = await Reservation.count({
                where: {
                    placeId: reservation.placeId,
                    date: todayStart(),
                    status: 'waiting',
                    queueNumber: { [Op.lt]: reservation.queueNumber }
                }
            });
        }

        res.json({
            queueNumber: reservation.queueNumber,
            status: reservation.status,
            peopleAhead,
            estimatedWaitMinutes: reservation.estimatedWaitMinutes || peopleAhead * 15,
            place: reservation.place
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching queue info', error: error.message });
    }
};

// 9. Get places with today's queue count (single GROUP BY query — no N+1).
exports.getPlacesWithQueue = async (req, res) => {
    try {
        const now = Date.now();
        if (placesCache.data && placesCache.expiresAt > now) {
            return res.json(placesCache.data);
        }

        const startOfDay = todayStart();

        const places = await Place.findAll({
            attributes: {
                include: [
                    [
                        literal(`(
                            SELECT COUNT(*)
                            FROM "Reservations" AS r
                            WHERE r."placeId" = "Place"."id"
                              AND r."date" = '${startOfDay.toISOString().split('T')[0]}'
                              AND r."status" = 'waiting'
                        )`),
                        'waitingCount'
                    ]
                ]
            },
            order: [['id', 'ASC']],
        });

        placesCache = { data: places, expiresAt: now + PLACES_TTL_MS };
        res.json(places);
    } catch (error) {
        // Fallback path for SQLite (table name unquoted, etc.) — keeps dev environments working.
        try {
            const startOfDay = todayStart();
            const places = await Place.findAll();
            const counts = await Reservation.findAll({
                where: { date: startOfDay, status: 'waiting' },
                attributes: ['placeId', [fn('COUNT', col('id')), 'count']],
                group: ['placeId'],
                raw: true,
            });
            const countMap = new Map(counts.map(c => [c.placeId, Number(c.count)]));
            const placesData = places.map(p => ({ ...p.toJSON(), waitingCount: countMap.get(p.id) || 0 }));
            placesCache = { data: placesData, expiresAt: Date.now() + PLACES_TTL_MS };
            res.json(placesData);
        } catch (e2) {
            res.status(500).json({ message: 'Error', error: e2.message });
        }
    }
};

// 10. Place Owner: Toggle open/closed status
exports.togglePlaceOpenStatus = async (req, res) => {
    try {
        const place = await Place.findOne({ where: { userId: req.user.id } });
        if (!place) return res.status(404).json({ message: 'Place not found.' });

        await place.update({ isOpen: !place.isOpen });
        invalidatePlacesCache();
        res.json({ isOpen: place.isOpen });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling place status', error: error.message });
    }
};

// 11. Update place info (owner or admin)
exports.updatePlace = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, description, type, icon } = req.body;

        const place = await Place.findByPk(id);
        if (!place) {
            return res.status(404).json({ message: 'Place not found' });
        }

        // Allow only the owner or admin
        if (place.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (name) place.name = name;
        if (address !== undefined) place.address = address;
        if (description !== undefined) place.description = description;
        if (type) place.type = type;
        if (icon) place.icon = icon;

        await place.save();
        invalidatePlacesCache();
        res.json({ message: 'Place updated', place });
    } catch (error) {
        res.status(500).json({ message: 'Error updating place', error: error.message });
    }
};
