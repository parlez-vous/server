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


const enableAutoUpdate = (tableName) => `
  CREATE TRIGGER update_${tableName}_modtime
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
`

const disableAutoUpdate = (tableName) => `
  DROP TRIGGER IF EXISTS update_${tableName}_modtime ON ${tableName};
`



module.exports = {
  client: 'pg',
  connection: config,
  pool: { min: 5, max: 50 },
  enableAutoUpdate,
  disableAutoUpdate
}
