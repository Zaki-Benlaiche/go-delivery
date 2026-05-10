const jwt = require('jsonwebtoken');

// Enforce a real secret. In production a missing/weak secret would let anyone
// mint tokens, so we crash loudly at boot rather than silently using a known
// fallback. Dev keeps a generated fallback so local runs Just Work.
const isProd = !!process.env.DATABASE_URL;
let SECRET = process.env.JWT_SECRET;

if (isProd) {
  if (!SECRET || SECRET.length < 32) {
    // eslint-disable-next-line no-console
    console.error('FATAL: JWT_SECRET missing or weak (min 32 chars) in production');
    process.exit(1);
  }
} else if (!SECRET) {
  SECRET = require('crypto').randomBytes(48).toString('hex');
  // eslint-disable-next-line no-console
  console.warn('⚠️  JWT_SECRET not set — generated an ephemeral dev secret. Tokens reset on restart.');
}

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  const token = header.slice(7);

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { authMiddleware, SECRET };
