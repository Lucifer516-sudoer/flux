/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('trades', (table) => {
    table.increments('id').primary();
    table.datetime('open_datetime').notNullable();
    table.datetime('close_datetime').notNullable();
    table.string('pair', 10).notNullable();
    table.string('direction').notNullable(); // 'buy' or 'sell'
    table.decimal('entry_price', 14, 5).notNullable();
    table.decimal('exit_price', 14, 5).notNullable();
    table.decimal('stop_loss', 14, 5);
    table.decimal('take_profit', 14, 5);
    table.decimal('risk_usd', 14, 2);
    table.decimal('result_usd', 14, 2).notNullable();
    table.text('notes');
    table.timestamps(true, true); // Adds created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('trades');
};
