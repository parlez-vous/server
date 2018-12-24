
exports.up = (knex) => knex.raw(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    karma INT NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
  );

  CREATE RULE users_update AS ON UPDATE
    TO users
    DO UPDATE users set updated_at = NOW() where id = NEW.id;
`)

exports.down = (knex) => knex.raw(`
  DROP RULE IF EXISTS users_update ON users;
  DROP TABLE IF EXISTS users;
`)
