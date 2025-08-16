/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('trades').del();

  // Inserts seed entries
  await knex('trades').insert([
    {
      open_datetime: '2024-03-01T09:30:00Z',
      close_datetime: '2024-03-01T15:45:00Z',
      pair: 'EUR/USD',
      direction: 'buy',
      entry_price: 1.08500,
      exit_price: 1.08750,
      stop_loss: 1.08400,
      take_profit: 1.08800,
      risk_usd: 50.00,
      result_usd: 125.00,
      notes: 'Good momentum following news release.'
    },
    {
      open_datetime: '2024-03-02T11:00:00Z',
      close_datetime: '2024-03-02T14:20:00Z',
      pair: 'GBP/JPY',
      direction: 'sell',
      entry_price: 191.200,
      exit_price: 190.950,
      stop_loss: 191.400,
      take_profit: 190.900,
      risk_usd: 100.00,
      result_usd: -50.00,
      notes: 'Hit stop loss due to unexpected volatility.'
    },
    {
      open_datetime: '2024-03-03T14:00:00Z',
      close_datetime: '2024-03-04T10:00:00Z',
      pair: 'AUD/USD',
      direction: 'buy',
      entry_price: 0.65250,
      exit_price: 0.65750,
      stop_loss: 0.65150,
      take_profit: 0.65800,
      risk_usd: 75.00,
      result_usd: 250.00,
      notes: 'Held overnight, strong trend continuation.'
    },
    {
      open_datetime: '2024-03-05T08:00:00Z',
      close_datetime: '2024-03-05T12:00:00Z',
      pair: 'USD/CAD',
      direction: 'sell',
      entry_price: 1.35500,
      exit_price: 1.35200,
      stop_loss: 1.35700,
      take_profit: 1.35100,
      risk_usd: 80.00,
      result_usd: 120.00,
      notes: 'Scalp trade, good entry at resistance.'
    }
  ]);
};
