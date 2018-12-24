
exports.up = (knex) => knex.raw(`
  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    site_id INT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    votes INT NOT NULL DEFAULT 0,
    views INT NOT NULL DEFAULT 0 CHECK(views >= 0),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
  );

  CREATE RULE posts_update AS ON UPDATE
    TO posts
    DO UPDATE posts set updated_at = NOW() where id = NEW.id;
`)

exports.down = (knex) => knex.raw(`
  DROP RULE IF EXISTS posts_update ON posts;
  DROP TABLE IF EXISTS posts;
`)
