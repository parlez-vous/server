import * as Knex from 'knex'

import {
  databseUser,
  databasePassword,
  databaseHost,
  databaseName,
} from 'env'

const config = {
  user: databseUser,
  password: databasePassword,
  database: databaseName,
  host: databaseHost
}

const dbClient: Knex = require('knex')({
  client: 'pg',
  connection: config,
  pool: { min: 5, max: 50 },
})

export default dbClient
