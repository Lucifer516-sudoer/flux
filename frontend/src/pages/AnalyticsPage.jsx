import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const fetchedTrades = await window.api.getTrades();
        setTrades(fetchedTrades);
      } catch (err) {
        setError('Failed to fetch trade data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  const { equityData, winLossData } = useMemo(() => {
    if (!trades || trades.length === 0) {
      return { equityData: [], winLossData: [] };
    }

    // Process for Equity Curve
    let cumulativePnl = 0;
    const processedEquityData = trades.map((trade, index) => {
      cumulativePnl += trade.result_usd;
      return {
        tradeNum: index + 1,
        date: new Date(trade.close_datetime).toLocaleDateString(),
        equity: cumulativePnl,
      };
    });

    // Process for Win/Loss Histogram
    const wins = trades.filter(t => t.result_usd > 0).length;
    const losses = trades.filter(t => t.result_usd <= 0).length;
    const processedWinLossData = [
      { name: 'Wins', count: wins },
      { name: 'Losses', count: losses },
    ];

    return { equityData: processedEquityData, winLossData: processedWinLossData };
  }, [trades]);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-loss">{error}</p>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-border-dark border border-border-light rounded-md shadow-lg">
          <p className="label text-highlight">{`Trade #${label}`}</p>
          <p className="intro text-profit">{`Equity : $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-highlight mb-6">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Equity Curve Card */}
        <div className="bg-background p-4 rounded-lg border-2 border-border-dark shadow-glow-neutral">
          <h2 className="text-xl font-bold text-neutral-text mb-4">Equity Curve</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={equityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3037" />
              <XAxis dataKey="tradeNum" stroke="#c9d1d9" />
              <YAxis stroke="#c9d1d9" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 217, 255, 0.1)' }}/>
              <Legend />
              <Line type="monotone" dataKey="equity" stroke="#00ff88" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Equity ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Win/Loss Histogram Card */}
        <div className="bg-background p-4 rounded-lg border-2 border-border-dark shadow-glow-neutral">
          <h2 className="text-xl font-bold text-neutral-text mb-4">Win vs. Loss</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={winLossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3037" />
              <XAxis dataKey="name" stroke="#c9d1d9" />
              <YAxis stroke="#c9d1d9" />
              <Tooltip cursor={{ fill: 'rgba(0, 217, 255, 0.1)' }} contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #2a3037' }}/>
              <Bar dataKey="count" name="Total Trades">
                {
                  winLossData.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.name === 'Wins' ? '#00ff88' : '#ff2e63'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
