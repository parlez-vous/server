
const enableAutoUpdate = (tableName) => `
  CREATE TRIGGER update_customer_modtime
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
`

const disableAutoUpdate = (tableName) => `
  DROP TRIGGER IF EXISTS update_customer_modtime ON ${tableName};
`

module.exports = {
  enableAutoUpdate,
  disableAutoUpdate
}
