const {
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} = process.env

const envError = (name: string) => {
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

export const databaseHost = DATABASE_HOST as string
export const databseUser = DATABASE_USER as string
export const databasePassword = DATABASE_PASSWORD as string
export const databaseName = DATABASE_NAME as string
export const serverPort = 8080
