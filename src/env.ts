const {
  DATABASE_URL,
  HASH_ID_SALT,
} = process.env


export const hashIdSalt = HASH_ID_SALT
export const databaseUrl = DATABASE_URL

const envError = (name: string) => {
  throw new Error(`Missing envinroment variable: ${name}`)
}

if (!hashIdSalt) {
  envError('HASH_ID_SALT')
}

if (!databaseUrl) {
  envError('DATABASE_URL')
}
