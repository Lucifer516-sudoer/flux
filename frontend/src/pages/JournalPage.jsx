import React, { useState, useEffect, useMemo } from 'react';
import Input from '../components/ui/Input';

const JournalPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    pair: '',
    direction: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const fetchedTrades = await window.api.getTrades();
        setTrades(fetchedTrades);
        setError(null);
      } catch (err) {
        setError('Failed to fetch trades.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      try {
        await window.api.deleteTrade(id);
        setTrades(prevTrades => prevTrades.filter(t => t.id !== id));
      } catch (err) {
        setError('Failed to delete trade.');
        console.error(err);
      }
    }
  };

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const tradeDate = new Date(trade.close_datetime);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (startDate && tradeDate < startDate) return false;
      if (endDate && tradeDate > endDate) return false;
      if (filters.pair && !trade.pair.toLowerCase().includes(filters.pair.toLowerCase())) return false;
      if (filters.direction && trade.direction !== filters.direction) return false;

      return true;
    });
  }, [trades, filters]);

  if (loading) return <p>Loading trades...</p>;
  if (error) return <p className="text-loss">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-highlight mb-6">Trade Journal</h1>

      <div className="bg-background p-4 rounded-lg border-2 border-border-dark mb-6 shadow-glow-neutral">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input id="pair" label="Filter by Pair" value={filters.pair} onChange={handleFilterChange} placeholder="e.g., BTC/USD" />
          <div>
            <label htmlFor="direction" className="block text-sm font-medium text-neutral-text mb-1">Direction</label>
            <select id="direction" value={filters.direction} onChange={handleFilterChange} className="w-full bg-background border-2 border-border-dark rounded-md px-3 py-2 text-neutral-text font-mono focus:outline-none focus:ring-2 focus:ring-highlight focus:border-highlight focus:shadow-glow-highlight transition-all duration-200">
              <option value="">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <Input id="startDate" type="date" label="Start Date" value={filters.startDate} onChange={handleFilterChange} />
          <Input id="endDate" type="date" label="End Date" value={filters.endDate} onChange={handleFilterChange} />
        </div>
      </div>

      <div className="overflow-x-auto bg-background rounded-lg border-2 border-border-dark shadow-glow-neutral">
        <table className="min-w-full divide-y-2 divide-border-dark">
          <thead className="bg-border-dark">
            <tr>
              {['Date', 'Pair', 'Direction', 'Entry', 'Exit', 'Result ($)', 'Actions'].map(header => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-highlight uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {filteredTrades.map(trade => (
              <tr key={trade.id} className="hover:bg-border-dark transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(trade.close_datetime).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{trade.pair}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${trade.direction === 'buy' ? 'text-profit' : 'text-loss'}`}>{trade.direction.toUpperCase()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.entry_price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.exit_price}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${trade.result_usd >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {trade.result_usd >= 0 ? '+' : ''}{trade.result_usd}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button className="text-highlight hover:underline">Edit</button>
                  <button onClick={() => handleDelete(trade.id)} className="text-loss hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JournalPage;
