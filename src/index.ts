import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'
import * as responseTime from 'response-time'

import { serverPort } from 'env'
import logger from 'logger'

import routes from './routes'
import { startCronJobs } from './cron'

const app = express()

app.use((req, res, next) =>
  responseTime((_, __, time) => {
    const trimmedTimemsg = Math.round(time)
    logger.info(`[${req.method} ${req.originalUrl}] - Completed in ${trimmedTimemsg}ms`)
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

app.listen(serverPort, () =>
  console.log(`Listening for tcp connections on port ${serverPort}`)
)

startCronJobs()

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

  process.exit(1)
})
