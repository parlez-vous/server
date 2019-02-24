
exports.up = (knex) => knex.raw(`
  CREATE OR REPLACE FUNCTION update_modified_column() 
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW; 
  END;
  $$ language 'plpgsql';
`)

exports.down = (knex) => knex.raw(`
  DROP FUNCTION IF EXISTS update_modified_column();
`)
