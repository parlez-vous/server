const { enableAutoUpdate, disableAutoUpdate } = require('../autoUpdate')

const table = 'comments'

exports.up = (knex) => knex.raw(`
  CREATE TABLE IF NOT EXISTS ${table} (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id INT REFERENCES comments(id),
    author_id INT REFERENCES users(id),
    body VARCHAR(10000) NOT NULL,
    votes INT NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    CHECK (id <> parent_id)
  );

  ${enableAutoUpdate(table)}
`)

exports.down = (knex) => knex.raw(`
  ${disableAutoUpdate(table)}
  DROP TABLE IF EXISTS ${table};
`)
