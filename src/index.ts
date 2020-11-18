import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'
import * as responseTime from 'response-time'
import { commentTreeLeafState } from 'db/comment-cache'
import { client as dbClient } from 'db/client'

import { serverPort } from 'env'
import logger from 'logger'

import routes from './routes'
import { startCronJobs } from './cron'

const app = express()

app.use((req, res, next) =>
  responseTime((_, __, time) => {
    const trimmedTimemsg = Math.round(time)

    const msg = `[${req.method} ${req.originalUrl}] - Completed in ${trimmedTimemsg}ms`

    if (trimmedTimemsg > 150) {
      logger.warn(msg)
    } else {
      logger.info(msg)
    }
  })(req, res, next)
)

app.use(helmet())
app.use(bodyParser.json())

app.use(routes)

// Add catch-all route for
// undefined routes
app.use('*', (_, res) => {
  res.sendStatus(404)
})

const startServer = async () => {
  logger.info('Loading comment tree state')
  await commentTreeLeafState.loadCommentTreeState()

  app.listen(serverPort, () =>
    logger.info(`Listening for tcp connections on port ${serverPort}`)
  )
}

startServer()
startCronJobs()

process.on('uncaughtException', (err) => {
  logger.error('Uncaugh Exception ' + err)
  logger.warn('Shutting down server because of uncaught exception')

  dbClient.$disconnect()

  // TODO: stream errors to sentry

  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  // kills process running query engine and drops db connections
  dbClient.$disconnect()

  const errorMsg = [`Unhandled Promise Rejection`, `Reason: ${reason}`].join(
    ',\n'
  )

  console.log({
    error: errorMsg,
  })

  // need to log the promise without stringifying it to properly
  // display all rejection info
  console.log(promise)

  // TODO: stream errors to sentry

  process.exit(1)
})
