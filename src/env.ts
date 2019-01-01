const {
  DATABASE_URL,
  HASH_ID_SALT,
  SERVER_PORT,
} = process.env


export const hashIdSalt = HASH_ID_SALT
export const databaseUrl = DATABASE_URL
export const serverPort = parseInt(SERVER_PORT)

const envError = (name: string) => {
  throw new Error(`Missing envinroment variable: ${name}`)
}

if (!hashIdSalt) {
  envError('HASH_ID_SALT')
}

if (!databaseUrl) {
  envError('DATABASE_URL')
}

if (!serverPort) {
  envError('SERVER_PORT')
}

if (Number.isNaN(serverPort)) {
  throw new Error('Port must be a valid integer')
}
