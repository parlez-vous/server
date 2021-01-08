import { PrismaClient } from '@prisma/client'
import logger from 'logger'

// expose a singleton
export const client = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    }
  ],
})

// https://www.prisma.io/docs/concepts/components/prisma-client/logging#logging-query-events
client.$on('query', e => {
  if (e.duration > 100) {
    logger.warn(`Slow query (${e.duration}ms) - Query:\n${e.query}`)
  }
})

