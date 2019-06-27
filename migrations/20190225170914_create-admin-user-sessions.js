const { enableAutoUpdate, disableAutoUpdate } = require('../knexfile')

const table = 'admin_user_sessions'

exports.up = (knex) => knex.raw(`
  CREATE TABLE IF NOT EXISTS ${table} (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    admin_user_id int UNIQUE NOT NULL REFERENCES admin_users(id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
  );

  ${enableAutoUpdate(table)}
`)

exports.down = (knex) => knex.raw(`
  ${disableAutoUpdate(table)}

  DROP TABLE IF EXISTS ${table};
`)
