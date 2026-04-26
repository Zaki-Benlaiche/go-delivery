const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// In-memory rate limiter — no external dependency required
const loginAttempts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15-minute sliding window
const MAX_ATTEMPTS = 10;

const rateLimitLogin = (req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const attempts = (loginAttempts.get(ip) || []).filter(t => now - t < WINDOW_MS);

  if (attempts.length >= MAX_ATTEMPTS) {
    return res.status(429).json({
      message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    });
  }

  attempts.push(now);
  loginAttempts.set(ip, attempts);
  next();
};

// Purge stale entries every hour to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempts] of loginAttempts.entries()) {
    const recent = attempts.filter(t => now - t < WINDOW_MS);
    if (recent.length === 0) loginAttempts.delete(ip);
    else loginAttempts.set(ip, recent);
  }
}, 60 * 60 * 1000);

router.post('/register', authController.register);
router.post('/login', rateLimitLogin, authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
