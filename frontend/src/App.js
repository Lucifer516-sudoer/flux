import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Plus, BarChart3, Calculator, Filter, Download, Upload, Activity, DollarSign, Target, AlertTriangle, Calendar, Search, FileDown } from 'lucide-react';
import './App.css';

function App() {
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    pair: '',
    direction: '',
    dateFrom: '',
    dateTo: '',
    searchText: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    pair: '',
    direction: 'buy',
    entry_price: '',
    exit_price: '',
    stop_loss: '',
    take_profit: '',
    risk_amount: '',
    result_amount: '',
    notes: ''
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Load trades on component mount
  useEffect(() => {
    fetchTrades();
  }, []);

  // Apply filters when trades or filters change
  useEffect(() => {
    applyFilters();
  }, [trades, filters]);

  const applyFilters = () => {
    let filtered = trades;

    // Filter by pair
    if (filters.pair) {
      filtered = filtered.filter(trade => 
        trade.pair.toLowerCase().includes(filters.pair.toLowerCase())
      );
    }

    // Filter by direction
    if (filters.direction) {
      filtered = filtered.filter(trade => trade.direction === filters.direction);
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(trade => 
        new Date(trade.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(trade => 
        new Date(trade.date) <= new Date(filters.dateTo)
      );
    }

    // Filter by search text in notes
    if (filters.searchText) {
      filtered = filtered.filter(trade => 
        trade.notes?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        trade.pair.toLowerCase().includes(filters.searchText.toLowerCase())
      );
    }

    setFilteredTrades(filtered);
  };

  const fetchTrades = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/trades`);
      setTrades(response.data);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tradeData = {
        ...formData,
        entry_price: parseFloat(formData.entry_price),
        exit_price: parseFloat(formData.exit_price),
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
        take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
        risk_amount: parseFloat(formData.risk_amount),
        result_amount: parseFloat(formData.result_amount),
      };

      if (editingTrade) {
        await axios.put(`${API_BASE_URL}/api/trades/${editingTrade.id}`, tradeData);
      } else {
        await axios.post(`${API_BASE_URL}/api/trades`, tradeData);
      }
      
      await fetchTrades();
      resetForm();
      setIsAddTradeOpen(false);
    } catch (error) {
      console.error('Error saving trade:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      pair: '',
      direction: 'buy',
      entry_price: '',
      exit_price: '',
      stop_loss: '',
      take_profit: '',
      risk_amount: '',
      result_amount: '',
      notes: ''
    });
    setEditingTrade(null);
  };

  const handleEdit = (trade) => {
    setFormData({
      date: new Date(trade.date).toISOString().split('T')[0],
      pair: trade.pair,
      direction: trade.direction,
      entry_price: trade.entry_price.toString(),
      exit_price: trade.exit_price.toString(),
      stop_loss: trade.stop_loss?.toString() || '',
      take_profit: trade.take_profit?.toString() || '',
      risk_amount: trade.risk_amount.toString(),
      result_amount: trade.result_amount.toString(),
      notes: trade.notes || ''
    });
    setEditingTrade(trade);
    setIsAddTradeOpen(true);
  };

  const handleDelete = async (tradeId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/trades/${tradeId}`);
      await fetchTrades();
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  // Calculate stats using filtered trades
  const stats = {
    totalTrades: filteredTrades.length,
    winningTrades: filteredTrades.filter(t => parseFloat(t.result_amount) > 0).length,
    losingTrades: filteredTrades.filter(t => parseFloat(t.result_amount) < 0).length,
    totalProfit: filteredTrades.reduce((sum, t) => sum + parseFloat(t.result_amount), 0),
    winRate: filteredTrades.length > 0 ? (filteredTrades.filter(t => parseFloat(t.result_amount) > 0).length / filteredTrades.length * 100) : 0,
    profitFactor: filteredTrades.length > 0 ? 
      filteredTrades.filter(t => parseFloat(t.result_amount) > 0).reduce((sum, t) => sum + parseFloat(t.result_amount), 0) /
      Math.abs(filteredTrades.filter(t => parseFloat(t.result_amount) < 0).reduce((sum, t) => sum + parseFloat(t.result_amount), 0)) || 0 : 0,
    largestWin: filteredTrades.length > 0 ? Math.max(...filteredTrades.map(t => parseFloat(t.result_amount))) : 0,
    largestLoss: filteredTrades.length > 0 ? Math.min(...filteredTrades.map(t => parseFloat(t.result_amount))) : 0,
    averageWin: filteredTrades.filter(t => parseFloat(t.result_amount) > 0).length > 0 ? 
      filteredTrades.filter(t => parseFloat(t.result_amount) > 0).reduce((sum, t) => sum + parseFloat(t.result_amount), 0) / 
      filteredTrades.filter(t => parseFloat(t.result_amount) > 0).length : 0,
    averageLoss: filteredTrades.filter(t => parseFloat(t.result_amount) < 0).length > 0 ? 
      Math.abs(filteredTrades.filter(t => parseFloat(t.result_amount) < 0).reduce((sum, t) => sum + parseFloat(t.result_amount), 0)) / 
      filteredTrades.filter(t => parseFloat(t.result_amount) < 0).length : 0
  };

  // Prepare chart data using filtered trades
  const equityData = filteredTrades
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, trade, index) => {
      const equity = index === 0 ? parseFloat(trade.result_amount) : acc[index - 1].equity + parseFloat(trade.result_amount);
      acc.push({
        trade: index + 1,
        equity: equity,
        date: new Date(trade.date).toLocaleDateString(),
        profit: parseFloat(trade.result_amount)
      });
      return acc;
    }, []);

  // Calculate drawdown data
  const drawdownData = equityData.reduce((acc, point, index) => {
    if (index === 0) {
      acc.push({ trade: point.trade, drawdown: 0, peak: point.equity });
      return acc;
    }
    
    const prevPoint = acc[index - 1];
    const newPeak = Math.max(prevPoint.peak, point.equity);
    const drawdown = ((point.equity - newPeak) / newPeak) * 100;
    
    acc.push({
      trade: point.trade,
      drawdown: drawdown,
      peak: newPeak,
      date: point.date
    });
    return acc;
  }, []);

  const maxDrawdown = drawdownData.length > 0 ? Math.min(...drawdownData.map(d => d.drawdown)) : 0;

  // Monthly performance data
  const monthlyData = filteredTrades.reduce((acc, trade) => {
    const month = new Date(trade.date).toISOString().substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { month, profit: 0, trades: 0 };
    }
    acc[month].profit += parseFloat(trade.result_amount);
    acc[month].trades += 1;
    return acc;
  }, {});

  const monthlyPerformance = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Risk/Reward distribution
  const riskRewardData = filteredTrades
    .filter(t => parseFloat(t.risk_amount) > 0)
    .map(trade => {
      const result = parseFloat(trade.result_amount);
      const risk = parseFloat(trade.risk_amount);
      return {
        trade: trade.pair,
        ratio: result / risk,
        result: result,
        date: trade.date
      };
    });

  const winLossData = [
    { name: 'Wins', value: stats.winningTrades, color: '#00ff88' },
    { name: 'Losses', value: stats.losingTrades, color: '#ff2e63' }
  ];

  // Export functions
  const exportToCSV = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/trades/export/csv`);
      const blob = new Blob([response.data.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename || 'trades_export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const Sidebar = () => (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <BarChart3 className="logo-icon" />
          <span>TradeJournal</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <Activity className="nav-icon" />
          Dashboard
        </button>
        <button
          className={`nav-item ${currentView === 'journal' ? 'active' : ''}`}
          onClick={() => setCurrentView('journal')}
        >
          <Calculator className="nav-icon" />
          Trade Journal
        </button>
        <button
          className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentView('analytics')}
        >
          <TrendingUp className="nav-icon" />
          Analytics
        </button>
        <button
          className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentView('settings')}
        >
          <Calculator className="nav-icon" />
          Export
        </button>
      </nav>
    </div>
  );

  const FilterPanel = () => (
    <Card className="filter-panel">
      <CardHeader>
        <CardTitle className="filter-title">
          <Filter className="w-4 h-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="filter-grid">
          <div className="filter-group">
            <Label htmlFor="filter-pair">Trading Pair</Label>
            <Input
              id="filter-pair"
              placeholder="e.g., EUR/USD, GBPUSD.m"
              value={filters.pair}
              onChange={(e) => setFilters({ ...filters, pair: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <Label htmlFor="filter-direction">Direction</Label>
            <Select value={filters.direction} onValueChange={(value) => setFilters({ ...filters, direction: value === 'all' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="All directions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="buy">Buy Only</SelectItem>
                <SelectItem value="sell">Sell Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="filter-group">
            <Label htmlFor="filter-from">Date From</Label>
            <Input
              id="filter-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <Label htmlFor="filter-to">Date To</Label>
            <Input
              id="filter-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
          <div className="filter-group full-width">
            <Label htmlFor="filter-search">Search Notes</Label>
            <Input
              id="filter-search"
              placeholder="Search in notes or pair names..."
              value={filters.searchText}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            />
          </div>
        </div>
        <div className="filter-actions">
          <Button 
            variant="outline" 
            onClick={() => setFilters({ pair: '', direction: '', dateFrom: '', dateTo: '', searchText: '' })}
          >
            Clear All
          </Button>
          <Badge variant="outline" className="filter-results">
            {filteredTrades.length} of {trades.length} trades
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const AddTradeForm = () => (
    <form onSubmit={handleSubmit} className="trade-form">
      <div className="form-grid">
        <div className="form-group">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <Label htmlFor="pair">Trading Pair</Label>
          <Input
            id="pair"
            value={formData.pair}
            onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
            placeholder="e.g., EUR/USD"
            required
          />
        </div>
        <div className="form-group">
          <Label htmlFor="direction">Direction</Label>
          <Select value={formData.direction} onValueChange={(value) => setFormData({ ...formData, direction: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="form-group">
          <Label htmlFor="entry_price">Entry Price</Label>
          <Input
            id="entry_price"
            type="number"
            step="0.00001"
            value={formData.entry_price}
            onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <Label htmlFor="exit_price">Exit Price</Label>
          <Input
            id="exit_price"
            type="number"
            step="0.00001"
            value={formData.exit_price}
            onChange={(e) => setFormData({ ...formData, exit_price: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <Label htmlFor="stop_loss">Stop Loss</Label>
          <Input
            id="stop_loss"
            type="number"
            step="0.00001"
            value={formData.stop_loss}
            onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
          />
        </div>
        <div className="form-group">
          <Label htmlFor="take_profit">Take Profit</Label>
          <Input
            id="take_profit"
            type="number"
            step="0.00001"
            value={formData.take_profit}
            onChange={(e) => setFormData({ ...formData, take_profit: e.target.value })}
          />
        </div>
        <div className="form-group">
          <Label htmlFor="risk_amount">Risk Amount ($)</Label>
          <Input
            id="risk_amount"
            type="number"
            step="0.01"
            value={formData.risk_amount}
            onChange={(e) => setFormData({ ...formData, risk_amount: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <Label htmlFor="result_amount">Result ($)</Label>
          <Input
            id="result_amount"
            type="number"
            step="0.01"
            value={formData.result_amount}
            onChange={(e) => setFormData({ ...formData, result_amount: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="form-group full-width">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Trade notes, strategy, lessons learned..."
          rows={4}
        />
      </div>
      <div className="form-actions">
        <Button type="button" variant="outline" onClick={() => { resetForm(); setIsAddTradeOpen(false); }}>
          Cancel
        </Button>
        <Button type="submit" className="submit-btn">
          {editingTrade ? 'Update Trade' : 'Add Trade'}
        </Button>
      </div>
    </form>
  );

  const DashboardView = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Trading Dashboard</h1>
        <div className="header-actions">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="filter-toggle">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="export-btn">
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddTradeOpen} onOpenChange={setIsAddTradeOpen}>
            <DialogTrigger asChild>
              <Button className="add-trade-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="dialog-content">
              <DialogHeader>
                <DialogTitle>{editingTrade ? 'Edit Trade' : 'Add New Trade'}</DialogTitle>
              </DialogHeader>
              <AddTradeForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showFilters && <FilterPanel />}

      <div className="stats-grid">
        <Card className="stat-card">
          <CardHeader className="stat-header">
            <CardTitle className="stat-title">
              <DollarSign className="stat-icon" />
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent className="stat-content">
            <div className={`stat-value ${stats.totalProfit >= 0 ? 'profit' : 'loss'}`}>
              ${stats.totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-header">
            <CardTitle className="stat-title">
              <Target className="stat-icon" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="stat-content">
            <div className="stat-value">{stats.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-header">
            <CardTitle className="stat-title">
              <Calculator className="stat-icon" />
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent className="stat-content">
            <div className="stat-value">{stats.totalTrades}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-header">
            <CardTitle className="stat-title">
              <TrendingUp className="stat-icon" />
              Profit Factor
            </CardTitle>
          </CardHeader>
          <CardContent className="stat-content">
            <div className="stat-value">{stats.profitFactor.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-header">
            <CardTitle className="stat-title">
              <AlertTriangle className="stat-icon" />
              Max Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent className="stat-content">
            <div className="stat-value loss">{maxDrawdown.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-header">
            <CardTitle className="stat-title">
              <TrendingUp className="stat-icon profit" />
              Largest Win
            </CardTitle>
          </CardHeader>
          <CardContent className="stat-content">
            <div className="stat-value profit">${stats.largestWin.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {equityData.length > 0 && (
        <div className="chart-grid">
          <Card className="chart-card large">
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="trade" stroke="#c9d1d9" />
                  <YAxis stroke="#c9d1d9" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #00d9ff',
                      borderRadius: '8px',
                      color: '#c9d1d9'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#00d9ff"
                    strokeWidth={3}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="chart-card">
            <CardHeader>
              <CardTitle>Win vs Loss Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #00d9ff',
                      borderRadius: '8px',
                      color: '#c9d1d9'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="chart-card large">
            <CardHeader>
              <CardTitle>Drawdown Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={drawdownData}>
                  <defs>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff2e63" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff2e63" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="trade" stroke="#c9d1d9" />
                  <YAxis stroke="#c9d1d9" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #ff2e63',
                      borderRadius: '8px',
                      color: '#c9d1d9'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="drawdown"
                    stroke="#ff2e63"
                    strokeWidth={2}
                    fill="url(#drawdownGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {monthlyPerformance.length > 0 && (
            <Card className="chart-card">
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" stroke="#c9d1d9" />
                    <YAxis stroke="#c9d1d9" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #00d9ff',
                        borderRadius: '8px',
                        color: '#c9d1d9'
                      }}
                    />
                    <Bar 
                      dataKey="profit" 
                      fill="#00d9ff"
                      stroke="#00d9ff"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const JournalView = () => (
    <div className="journal">
      <div className="journal-header">
        <h1>Trade Journal</h1>
        <div className="header-actions">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="filter-toggle">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="export-btn">
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddTradeOpen} onOpenChange={setIsAddTradeOpen}>
            <DialogTrigger asChild>
              <Button className="add-trade-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="dialog-content">
              <DialogHeader>
                <DialogTitle>{editingTrade ? 'Edit Trade' : 'Add New Trade'}</DialogTitle>
              </DialogHeader>
              <AddTradeForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showFilters && <FilterPanel />}

      <Card className="journal-table-card">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>R:R</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => {
                const riskReward = parseFloat(trade.risk_amount) > 0 ? 
                  (parseFloat(trade.result_amount) / parseFloat(trade.risk_amount)).toFixed(2) : 'N/A';
                
                return (
                  <TableRow key={trade.id}>
                    <TableCell>{new Date(trade.date).toLocaleDateString()}</TableCell>
                    <TableCell className="pair-cell">{trade.pair}</TableCell>
                    <TableCell>
                      <Badge className={`direction-badge ${trade.direction}`}>
                        {trade.direction.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{trade.entry_price}</TableCell>
                    <TableCell>{trade.exit_price}</TableCell>
                    <TableCell className="risk-cell">${trade.risk_amount}</TableCell>
                    <TableCell className={`result-cell ${parseFloat(trade.result_amount) >= 0 ? 'profit' : 'loss'}`}>
                      ${trade.result_amount}
                    </TableCell>
                    <TableCell className={`rr-cell ${parseFloat(trade.result_amount) >= 0 ? 'profit' : 'loss'}`}>
                      {riskReward}
                    </TableCell>
                    <TableCell>
                      <div className="action-buttons">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(trade)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(trade.id)} className="delete-btn">
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredTrades.length === 0 && (
            <div className="empty-state">
              <Activity className="empty-icon" />
              <h3>No trades found</h3>
              <p>Try adjusting your filters or add your first trade</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsView = () => (
    <div className="analytics">
      <div className="analytics-header">
        <h1>Advanced Analytics</h1>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="filter-toggle">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {showFilters && <FilterPanel />}

      <div className="analytics-grid">
        <Card className="analytics-card">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metrics-list">
              <div className="metric-item">
                <span className="metric-label">Average Win:</span>
                <span className="metric-value profit">${stats.averageWin.toFixed(2)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Average Loss:</span>
                <span className="metric-value loss">${stats.averageLoss.toFixed(2)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Largest Win:</span>
                <span className="metric-value profit">${stats.largestWin.toFixed(2)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Largest Loss:</span>
                <span className="metric-value loss">${stats.largestLoss.toFixed(2)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Max Drawdown:</span>
                <span className="metric-value loss">{maxDrawdown.toFixed(2)}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Profit Factor:</span>
                <span className="metric-value">{stats.profitFactor.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {riskRewardData.length > 0 && (
          <Card className="analytics-card">
            <CardHeader>
              <CardTitle>Risk/Reward Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskRewardData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#c9d1d9" />
                  <YAxis stroke="#c9d1d9" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #00d9ff',
                      borderRadius: '8px',
                      color: '#c9d1d9'
                    }}
                  />
                  <Bar 
                    dataKey="ratio" 
                    fill="#00d9ff"
                    stroke="#00d9ff"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="analytics-card large">
          <CardHeader>
            <CardTitle>Equity Curve with Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="trade" stroke="#c9d1d9" />
                <YAxis stroke="#c9d1d9" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #00d9ff',
                    borderRadius: '8px',
                    color: '#c9d1d9'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke="#00d9ff"
                  strokeWidth={3}
                  dot={{ fill: '#00d9ff', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="analytics-card">
          <CardHeader>
            <CardTitle>Trade Distribution by Direction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="direction-stats">
              <div className="direction-item">
                <Badge className="direction-badge buy">BUY</Badge>
                <div className="direction-metrics">
                  <span>Trades: {filteredTrades.filter(t => t.direction === 'buy').length}</span>
                  <span className={filteredTrades.filter(t => t.direction === 'buy').reduce((sum, t) => sum + parseFloat(t.result_amount), 0) >= 0 ? 'profit' : 'loss'}>
                    P&L: ${filteredTrades.filter(t => t.direction === 'buy').reduce((sum, t) => sum + parseFloat(t.result_amount), 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="direction-item">
                <Badge className="direction-badge sell">SELL</Badge>
                <div className="direction-metrics">
                  <span>Trades: {filteredTrades.filter(t => t.direction === 'sell').length}</span>
                  <span className={filteredTrades.filter(t => t.direction === 'sell').reduce((sum, t) => sum + parseFloat(t.result_amount), 0) >= 0 ? 'profit' : 'loss'}>
                    P&L: ${filteredTrades.filter(t => t.direction === 'sell').reduce((sum, t) => sum + parseFloat(t.result_amount), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ExportView = () => (
    <div className="export">
      <div className="export-header">
        <h1>Data Export & Management</h1>
      </div>

      <div className="export-grid">
        <Card className="export-card">
          <CardHeader>
            <CardTitle>
              <FileDown className="w-5 h-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="export-description">
              Export your trading data to CSV format for backup or analysis in external tools.
            </p>
            <Button onClick={exportToCSV} className="export-action-btn">
              <FileDown className="w-4 h-4 mr-2" />
              Download CSV Export
            </Button>
          </CardContent>
        </Card>

        <Card className="export-card">
          <CardHeader>
            <CardTitle>
              <Activity className="w-5 h-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="stat-number">{trades.length}</span>
                <span className="stat-label">Total Trades</span>
              </div>
              <div className="quick-stat">
                <span className={`stat-number ${stats.totalProfit >= 0 ? 'profit' : 'loss'}`}>
                  ${stats.totalProfit.toFixed(2)}
                </span>
                <span className="stat-label">Total P&L</span>
              </div>
              <div className="quick-stat">
                <span className="stat-number">{stats.winRate.toFixed(1)}%</span>
                <span className="stat-label">Win Rate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="export-card">
          <CardHeader>
            <CardTitle>
              <Calendar className="w-5 h-5" />
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trades.length > 0 ? (
              <div className="date-range-info">
                <div className="date-item">
                  <span className="date-label">First Trade:</span>
                  <span className="date-value">
                    {new Date(Math.min(...trades.map(t => new Date(t.date)))).toLocaleDateString()}
                  </span>
                </div>
                <div className="date-item">
                  <span className="date-label">Last Trade:</span>
                  <span className="date-value">
                    {new Date(Math.max(...trades.map(t => new Date(t.date)))).toLocaleDateString()}
                  </span>
                </div>
                <div className="date-item">
                  <span className="date-label">Trading Days:</span>
                  <span className="date-value">
                    {new Set(trades.map(t => t.date)).size} days
                  </span>
                </div>
              </div>
            ) : (
              <p>No trades recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'journal' && <JournalView />}
        {currentView === 'analytics' && <AnalyticsView />}
        {currentView === 'settings' && <ExportView />}
      </main>
    </div>
  );
}

export default App;