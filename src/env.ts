import { String } from 'runtypes'

const {
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  CRON_INTERVAL_MS
} = process.env


if (!CRON_INTERVAL_MS) {
  throw new Error('CRON_INTERVAL_MINS is undefined')
}

const cronIntervalMs_ = parseInt(CRON_INTERVAL_MS, 10)

if (Number.isNaN(cronIntervalMs_)) {
  throw new Error('CRON_INTERVAL_MINS is not a number')
}

export const cronIntervalMs = cronIntervalMs_

export const databaseHost = String.check(DATABASE_HOST)
export const databseUser = String.check(DATABASE_USER)
export const databasePassword = String.check(DATABASE_PASSWORD)
export const databaseName = String.check(DATABASE_NAME)
export const serverPort = 8080
