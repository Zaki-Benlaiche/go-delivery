const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// io is injected on the request by server.js — the factory signature is kept
// for API stability so server.js doesn't need to change shape.
module.exports = () => {
  router.post('/', authMiddleware, validate(schemas.createOrder), orderController.createOrder);
  router.get('/', authMiddleware, orderController.getOrders);
  router.get('/available', authMiddleware, orderController.getAvailableOrders);
  router.put('/:id/status', authMiddleware, validate(schemas.updateOrderStatus), orderController.updateOrderStatus);
  return router;
};
