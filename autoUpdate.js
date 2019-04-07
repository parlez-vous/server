
const enableAutoUpdate = (tableName) => `
  CREATE TRIGGER update_${tableName}_modtime
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
`

const disableAutoUpdate = (tableName) => `
  DROP TRIGGER IF EXISTS update_${tableName}_modtime ON ${tableName};
`

module.exports = {
  enableAutoUpdate,
  disableAutoUpdate
}
