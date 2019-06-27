const { enableAutoUpdate, disableAutoUpdate } = require('../knexfile')

const table = 'posts'

exports.up = (knex) => knex.raw(`
  CREATE TABLE IF NOT EXISTS ${table} (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    site_id INT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    votes INT NOT NULL DEFAULT 0,
    views INT NOT NULL DEFAULT 0 CHECK(views >= 0),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
  );

  ${enableAutoUpdate(table)}
`)

exports.down = (knex) => knex.raw(`
  ${disableAutoUpdate(table)}
  DROP TABLE IF EXISTS ${table};
`)
