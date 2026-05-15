const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.put('/mine', authMiddleware, validate(schemas.restaurantUpdate), restaurantController.updateRestaurant);
router.put('/open-status', authMiddleware, restaurantController.toggleOpenStatus);
router.post('/products', authMiddleware, validate(schemas.product), restaurantController.addProduct);
router.put('/products/:id', authMiddleware, validate(schemas.productUpdate), restaurantController.updateProduct);
router.delete('/products/:id', authMiddleware, restaurantController.deleteProduct);

module.exports = router;
