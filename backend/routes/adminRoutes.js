const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');
const { validate, schemas } = require('../middleware/validate');

// All routes here are protected by both auth and admin middleware
router.use(authMiddleware, adminMiddleware);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/restaurants', adminController.getAllRestaurants);
router.get('/orders', adminController.getAllOrders);
router.put('/users/:id/role', validate(schemas.adminRole), adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
