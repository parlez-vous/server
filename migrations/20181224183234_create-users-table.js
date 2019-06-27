const { enableAutoUpdate, disableAutoUpdate } = require('../knexfile')

const table = 'users'

exports.up = (knex) => knex.raw(`
  CREATE TABLE IF NOT EXISTS ${table} (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    karma INT NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
  );

  ${enableAutoUpdate(table)}
`)

exports.down = (knex) => knex.raw(`
  ${disableAutoUpdate(table)}
  DROP TABLE IF EXISTS ${table};
`)
