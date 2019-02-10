
exports.up = (knex) => knex.raw(`
  CREATE TABLE IF NOT EXISTS comments (
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

  CREATE RULE comments_update AS ON UPDATE
    TO comments
    DO UPDATE comments set updated_at = NOW() where id = NEW.id;
`)

exports.down = (knex) => knex.raw(`
  DROP RULE IF EXISTS comments_update ON comments;
  DROP TABLE IF EXISTS comments;
`)
