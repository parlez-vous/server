import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'

import routes from './routes'

const app = express()
const port = 3000

app.use(helmet())
app.use(bodyParser.json())

app.use(routes)

app.listen(
  port,
  () => console.log(`Listening on port ${port}!`)
)
