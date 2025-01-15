/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('areas', table => {
        table.increments('id').primary();
        table.integer('city_id').unsigned().references('id').inTable('cities');
        table.string('name').notNullable();
        table.boolean('morning_delivery').defaultTo(false);
        table.boolean('evening_delivery').defaultTo(false);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('areas');
};
