exports.up = function(knex) {
    return knex.schema.table('deliveries', function(table) {
      table.string('address').notNullable();
    });
};
  
exports.down = function(knex) {
    return knex.schema.table('deliveries', function(table) {
      table.dropColumn('address');
    });
};
