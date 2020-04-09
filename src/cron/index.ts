// TODO: figure out more appropriate solution for running cron jobs
// Leaning towards compute engine vm with crontab

import logger from 'logger'

import { start as startDnsLookups } from './dns-lookup'

export const startCronJobs = () => {
  logger.info('Cron Jobs Started')
  startDnsLookups()
}
