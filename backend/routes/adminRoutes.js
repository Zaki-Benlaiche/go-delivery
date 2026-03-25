const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

// All routes here are protected by both auth and admin middleware
router.use(authMiddleware, adminMiddleware);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/restaurants', adminController.getAllRestaurants);
router.get('/orders', adminController.getAllOrders);
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;
