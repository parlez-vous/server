const {
  DATABASE_URL,
} = process.env

const envError = (name: string) => {
  throw new Error(`Missing envinroment variable: ${name}`)
}

if (!DATABASE_URL) {
  envError('DATABASE_URL')
}

export const databaseUrl = DATABASE_URL as string
export const serverPort = 8080
