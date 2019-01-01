import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'

import { serverPort } from 'env'

import routes from './routes'

const app = express()

app.use(helmet())
app.use(bodyParser.json())

app.use(routes)

app.listen(
  serverPort,
  () => console.log(`Listening for tcp connections!`)
)
