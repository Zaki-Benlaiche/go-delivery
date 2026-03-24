const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

module.exports = (io) => {
  router.post('/', authMiddleware, (req, res) => orderController.createOrder(req, res, io));
  router.get('/', authMiddleware, orderController.getOrders);
  router.get('/available', authMiddleware, orderController.getAvailableOrders);
  router.put('/:id/status', authMiddleware, (req, res) => orderController.updateOrderStatus(req, res, io));
  return router;
};
