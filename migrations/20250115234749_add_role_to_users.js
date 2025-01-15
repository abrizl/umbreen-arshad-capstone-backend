exports.up = function(knex) {
    return knex.schema.table('users', (table) => {
      table.string('role').defaultTo('guest');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('users', (table) => {
      table.dropColumn('role');
    });
  };
