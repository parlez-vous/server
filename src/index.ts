import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'

import { serverPort } from 'env'

import routes from './routes'
import { startCronJobs } from './cron'

const app = express()

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
  console.log({
    error: `Unhandled Rejection at: ${promise},\nReason: ${reason}`,
  })

  // Application specific logging, throwing an error, or other logic here

  process.exit(1)
})
