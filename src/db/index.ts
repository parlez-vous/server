import * as Knex from 'knex'

import { databaseUrl } from '../env'

const dbClient: Knex = require('knex')({
  client: 'pg',
  connection: databaseUrl,
  pool: { min: 5, max: 50 },
})

export default dbClient
