/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('deliveries', table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users');
        table.integer('area_id').unsigned().references('id').inTable('areas');
        table.enu('delivery_slot', ['Morning', 'Evening']).notNullable();
        table.date('scheduled_date').notNullable();
        table.enu('status', ['Pending', 'Delivered', 'Canceled']).defaultTo('Pending');
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('deliveries');
};
