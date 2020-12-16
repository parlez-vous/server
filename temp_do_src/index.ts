import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'
import * as responseTime from 'response-time'
import logger from './logger'

const { DATABASE_URL, CRON_INTERVAL_MS, PORT } = process.env


logger.info(`> ENVS: ${DATABASE_URL}, ${CRON_INTERVAL_MS}, ${PORT}`);


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

app.get('/health-check', (_, res) => {
  res.sendStatus(200)
})

// Add catch-all route for
// undefined routes
app.use('*', (_, res) => {
  res.sendStatus(404)
})

app.listen(8080, () =>
  logger.info(`Listening for tcp connections on port ${8080}`)
)

process.on('uncaughtException', (err) => {
  logger.error('Uncaugh Exception ' + err)
  logger.warn('Shutting down server because of uncaught exception')

  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
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
