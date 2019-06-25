import { String } from 'runtypes'

const {
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} = process.env

export const databaseHost = String.check(DATABASE_HOST)
export const databseUser = String.check(DATABASE_USER)
export const databasePassword = String.check(DATABASE_PASSWORD)
export const databaseName = String.check(DATABASE_NAME)
export const serverPort = 8080
