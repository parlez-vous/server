const {
  CRON_INTERVAL_MS,
  PORT,
} = process.env

if (!CRON_INTERVAL_MS) {
  throw new Error('CRON_INTERVAL_MS is undefined')
}

if (!PORT) {
  throw new Error('PORT is undefined')
}

const cronIntervalMs_ = parseInt(CRON_INTERVAL_MS, 10)

if (Number.isNaN(cronIntervalMs_)) {
  throw new Error('CRON_INTERVAL_MS is not a number')
}

const serverPort_ = parseInt(PORT, 10)

if (Number.isNaN(serverPort_)) {
  throw new Error('PORT is not a number')
}

export const serverPort = serverPort_
export const cronIntervalMs = cronIntervalMs_
