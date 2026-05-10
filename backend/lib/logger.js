const pino = require('pino');

const isProd = !!process.env.DATABASE_URL;

const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  base: { pid: process.pid },
  redact: {
    paths: ['req.headers.authorization', 'password', '*.password', 'token', '*.token'],
    censor: '[REDACTED]',
  },
  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino/file',
          options: { destination: 1 },
        },
      }),
});

module.exports = logger;
