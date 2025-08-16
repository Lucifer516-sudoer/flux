import React, { useState } from 'react';
import Input from '../components/ui/Input';

const initialTradeState = {
  pair: '',
  direction: 'buy',
  entry_price: '',
  exit_price: '',
  stop_loss: '',
  take_profit: '',
  risk_usd: '',
  result_usd: '',
  notes: '',
  open_datetime: '',
  close_datetime: '',
};

const AddTradePage = () => {
  const [trade, setTrade] = useState(initialTradeState);
  const [status, setStatus] = useState(''); // To show success/error messages

  const handleChange = (e) => {
    const { id, value } = e.target;
    setTrade((prevTrade) => ({
      ...prevTrade,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      // Basic validation
      if (!trade.pair || !trade.entry_price || !trade.exit_price || !trade.result_usd || !trade.open_datetime || !trade.close_datetime) {
        throw new Error('Please fill all required fields.');
      }

      const newTrade = await window.api.addTrade(trade);
      setStatus(`Successfully added trade ID: ${newTrade.id}`);
      setTrade(initialTradeState); // Reset form
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Failed to add trade:', error);
    }
  };

  const inputStyle = "w-full bg-background border-2 border-border-dark rounded-md px-3 py-2 text-neutral-text font-mono focus:outline-none focus:ring-2 focus:ring-highlight focus:border-highlight focus:shadow-glow-highlight transition-all duration-200";


  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-highlight mb-6">Log a New Trade</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input id="pair" label="Pair (e.g., EUR/USD)" value={trade.pair} onChange={handleChange} required />
          <div>
            <label htmlFor="direction" className="block text-sm font-medium text-neutral-text mb-1">Direction</label>
            <select id="direction" value={trade.direction} onChange={handleChange} className={inputStyle}>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <Input id="entry_price" type="number" label="Entry Price" value={trade.entry_price} onChange={handleChange} required />
          <Input id="exit_price" type="number" label="Exit Price" value={trade.exit_price} onChange={handleChange} required />
          <Input id="stop_loss" type="number" label="Stop Loss" value={trade.stop_loss} onChange={handleChange} />
          <Input id="take_profit" type="number" label="Take Profit" value={trade.take_profit} onChange={handleChange} />
          <Input id="risk_usd" type="number" label="Risk ($)" value={trade.risk_usd} onChange={handleChange} />
          <Input id="result_usd" type="number" label="Result ($)" value={trade.result_usd} onChange={handleChange} required />
          <Input id="open_datetime" type="datetime-local" label="Open Time" value={trade.open_datetime} onChange={handleChange} required />
          <Input id="close_datetime" type="datetime-local" label="Close Time" value={trade.close_datetime} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-text mb-1">Notes</label>
          <textarea
            id="notes"
            rows="4"
            value={trade.notes}
            onChange={handleChange}
            className={inputStyle}
            placeholder="Trade setup, execution, and review notes..."
          ></textarea>
        </div>
        <div className="flex items-center justify-end space-x-4">
          {status && <p className="text-sm text-neutral-text">{status}</p>}
          <button
            type="submit"
            className="px-6 py-2 bg-highlight text-background font-bold rounded-lg
                       hover:bg-opacity-90 hover:shadow-glow-highlight transition-all duration-200"
          >
            Save Trade
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTradePage;
