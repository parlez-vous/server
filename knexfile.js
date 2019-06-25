const {
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} = process.env

const envError = (name) => {
  throw new Error(`Missing envinroment variable: ${name}`)
}

if (!DATABASE_HOST) {
  envError('DATABASE_HOST')
}

if (!DATABASE_USER) {
  envError('DATABASE_USER')
}

if (!DATABASE_PASSWORD) {
  envError('DATABASE_PASSWORD')
}

if (!DATABASE_NAME) {
  envError('DATABASE_NAME')
}

const config = {
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  host: DATABASE_HOST
}

module.exports = {
  client: 'pg',
  connection: config,
  pool: { min: 5, max: 50 },
}
