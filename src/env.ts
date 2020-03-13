const {
  CRON_INTERVAL_MS
} = process.env


if (!CRON_INTERVAL_MS) {
  throw new Error('CRON_INTERVAL_MS is undefined')
}

const cronIntervalMs_ = parseInt(CRON_INTERVAL_MS, 10)

if (Number.isNaN(cronIntervalMs_)) {
  throw new Error('CRON_INTERVAL_MS is not a number')
}

export const cronIntervalMs = cronIntervalMs_

export const serverPort = 8080
