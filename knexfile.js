const { DATABASE_URL } = process.env

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL not set.')
}

module.exports = {
  client: 'pg',
  connection: DATABASE_URL,
  pool: { min: 5, max: 50 },
}
