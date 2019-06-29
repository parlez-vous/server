import { String } from 'runtypes'

const {
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  CRON_INTERVAL_MINS
} = process.env


if (!CRON_INTERVAL_MINS) {
  throw new Error('CRON_INTERVAL_MINS is undefined')
}

const cronIntervalMins_ = parseInt(CRON_INTERVAL_MINS, 10)

if (Number.isNaN(cronIntervalMins_)) {
  throw new Error('CRON_INTERVAL_MINS is not a number')
}

export const cronIntervalMins = cronIntervalMins_

export const databaseHost = String.check(DATABASE_HOST)
export const databseUser = String.check(DATABASE_USER)
export const databasePassword = String.check(DATABASE_PASSWORD)
export const databaseName = String.check(DATABASE_NAME)
export const serverPort = 8080
