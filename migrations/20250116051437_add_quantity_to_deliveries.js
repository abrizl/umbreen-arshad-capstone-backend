exports.up = function(knex) {
    return knex.schema.table('deliveries', (table) => {
      table.integer('quantity').defaultTo(1).notNullable();  // Add quantity column
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('deliveries', (table) => {
      table.dropColumn('quantity');  // Rollback to remove quantity
    });
  };
