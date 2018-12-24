
exports.up = (knex) => knex.raw(`
  CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    hostname TEXT NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW()
  );
`)

exports.down = (knex) => knex.raw(`
  DROP TABLE IF EXISTS sites;
`)
