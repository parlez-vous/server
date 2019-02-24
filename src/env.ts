const {
  DATABASE_URL,
  HASH_ID_SALT,
  SERVER_PORT,
} = process.env


const envError = (name: string) => {
  throw new Error(`Missing envinroment variable: ${name}`)
}

if (!HASH_ID_SALT) {
  envError('HASH_ID_SALT')
}

if (!DATABASE_URL) {
  envError('DATABASE_URL')
}

if (!SERVER_PORT) {
  envError('SERVER_PORT')
}

if (Number.isNaN(parseInt(SERVER_PORT as string))) {
  throw new Error('Port must be a valid integer')
}

export const hashIdSalt = HASH_ID_SALT as string
export const databaseUrl = DATABASE_URL as string
export const serverPort = parseInt(SERVER_PORT as string)
