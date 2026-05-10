const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { rateLimit, ipKey } = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validate');

// Login: tight per-IP cap. 10 attempts in 15 min stops credential-stuffing
// without inconveniencing a real user who mistyped a few times.
const loginLimiter = rateLimit({
  windowSec: 15 * 60,
  max: 10,
  keyFn: ipKey('login'),
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
});

// Register: stricter — bot signup floods are the main abuse vector.
const registerLimiter = rateLimit({
  windowSec: 60 * 60,
  max: 5,
  keyFn: ipKey('reg'),
  message: 'Trop de comptes créés depuis cette adresse. Réessayez plus tard.',
});

router.post('/register', registerLimiter, validate(schemas.register), authController.register);
router.post('/login', loginLimiter, validate(schemas.login), authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
