const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.put('/mine', authMiddleware, restaurantController.updateRestaurant);
router.post('/products', authMiddleware, restaurantController.addProduct);
router.put('/products/:id', authMiddleware, restaurantController.updateProduct);
router.delete('/products/:id', authMiddleware, restaurantController.deleteProduct);

module.exports = router;
