// Wraps async route handlers so a thrown/rejected error is forwarded to the
// Express error middleware instead of crashing the process or leaving the
// request hanging. Replaces try/catch boilerplate in every controller.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
