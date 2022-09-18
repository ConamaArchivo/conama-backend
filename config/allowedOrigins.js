const allowedOrigins = [
  process.env.DEV === 'true' ? 'http://localhost:3000' : null,
  process.env.CLIENT_URL,
];

module.exports = allowedOrigins;
