# 🚀 TradeJournal - Futuristic Trading Journal

> A beautiful, offline-first trading journal with advanced analytics and a dark terminal theme

![TradeJournal Demo](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-React%20|%20FastAPI%20|%20MongoDB-orange?style=for-the-badge)

## ✨ Features

### 🎨 **Visual Design**
- **Dark Futuristic Theme** - Terminal-inspired UI with neon glow effects
- **Glass-morphism Effects** - Modern backdrop blur and transparency
- **Neon Color Palette** - Cyan highlights (#00d9ff), neon green profits (#00ff88), neon red losses (#ff2e63)
- **Smooth Animations** - Hover effects, transitions, and micro-interactions
- **JetBrains Mono Typography** - Professional monospace font for that trading terminal feel

### 📊 **Core Trading Features**
- **Trade Logging** - Complete trade entry with all essential fields
- **Real-time Statistics** - Win rate, profit factor, total P&L, drawdown analysis
- **Interactive Charts** - Equity curve, win/loss distribution, drawdown visualization
- **Trade Management** - Edit, delete, and filter trades
- **Export/Import** - CSV backup and restore functionality
- **Advanced Analytics** - Risk/reward ratios, streak analysis, performance metrics

### 🛠 **Technical Features**
- **Offline-First** - Works without internet connection
- **Fast Performance** - Optimized React frontend with efficient data handling
- **RESTful API** - Complete FastAPI backend with full CRUD operations
- **MongoDB Storage** - Reliable database with UUID-based trade IDs
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **PWA Ready** - Progressive Web App capabilities

## 🚀 Quick Start

### Prerequisites
- Linux system (Ubuntu, Fedora, Arch, etc.)
- Internet connection for initial setup
- Sudo privileges for system package installation

### Automated Installation

```bash
# Clone the repository
git clone <repository-url>
cd tradejournal

# Make setup script executable
chmod +x setup.sh

# Run the automated setup
./setup.sh
```

The setup script will automatically:
- ✅ Detect your Linux distribution
- ✅ Install system dependencies (Python3, Node.js, MongoDB, Supervisor)
- ✅ Setup Python virtual environment
- ✅ Install all required packages
- ✅ Configure MongoDB database
- ✅ Setup process management with Supervisor
- ✅ Create startup/stop scripts

### Manual Installation

If you prefer manual installation or the automated script doesn't work for your system:

<details>
<summary>Click to expand manual installation steps</summary>

#### 1. Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv nodejs npm mongodb supervisor
```

**Fedora/RHEL:**
```bash
sudo dnf install python3 python3-pip nodejs npm mongodb-server supervisor
```

**Arch Linux:**
```bash
sudo pacman -S python python-pip nodejs npm mongodb supervisor
```

#### 2. Setup Backend
```bash
# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
cd backend
pip install -r requirements.txt

# Create environment file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=trade_journal
DEBUG=True
EOF
```

#### 3. Setup Frontend
```bash
# Install Node.js dependencies
cd ../frontend
npm install -g yarn
yarn install

# Create environment file
cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_APP_NAME=TradeJournal
EOF
```

#### 4. Start Services
```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Start backend (in one terminal)
cd backend
source ../venv/bin/activate
python server.py

# Start frontend (in another terminal)
cd frontend
yarn start
```

</details>

## 🎮 Usage

### Starting the Application
```bash
# Start all services
./start_tradejournal.sh

# Application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
```

### Stopping the Application
```bash
# Stop all services
./stop_tradejournal.sh
```

### Managing Services
```bash
# Check service status
sudo supervisorctl status

# View logs
sudo tail -f /var/log/supervisor/tradejournal*.log

# Restart individual services
sudo supervisorctl restart tradejournalbackend
sudo supervisorctl restart tradejournalfront
```

## 📖 User Guide

### 📝 Adding Trades

1. Click the **"+ Add Trade"** button
2. Fill in the trade details:
   - **Date**: Trade execution date
   - **Pair**: Trading instrument (e.g., EUR/USD, GBPUSD.m)
   - **Direction**: Buy or Sell
   - **Entry Price**: Your entry price
   - **Exit Price**: Your exit price
   - **Stop Loss**: Optional stop loss level
   - **Take Profit**: Optional take profit level
   - **Risk Amount**: Amount risked on the trade
   - **Result**: Profit or loss in dollars
   - **Notes**: Trade analysis, strategy notes, lessons learned

3. Click **"Add Trade"** to save

### 📊 Dashboard Overview

The dashboard provides comprehensive trading analytics:

#### **Statistics Cards**
- **Total P&L**: Your overall profit/loss
- **Win Rate**: Percentage of winning trades
- **Total Trades**: Number of trades logged
- **Profit Factor**: Gross profit ÷ Gross loss

#### **Charts & Visualizations**
- **Equity Curve**: Shows your account balance progression over time
- **Win/Loss Distribution**: Pie chart showing winning vs losing trades
- **Drawdown Analysis**: Peak-to-trough equity decline
- **Monthly Performance**: Trade performance by month
- **Risk/Reward Distribution**: Analysis of your risk management

### 🔍 Filtering & Search

- **By Pair**: Filter trades for specific instruments
- **By Direction**: Show only Buy or Sell trades
- **Date Range**: View trades within specific time periods
- **Keyword Search**: Search through trade notes
- **Performance Filter**: Show only winning/losing trades

### 💾 Data Management

#### **Export Data**
```bash
# Export all trades to CSV
curl "http://localhost:8001/api/trades/export/csv" > my_trades.csv
```

#### **Backup Database**
```bash
# Create MongoDB backup
mongodump --db trade_journal --out backup_$(date +%Y%m%d)
```

#### **Restore Database**
```bash
# Restore from backup
mongorestore --db trade_journal backup_YYYYMMDD/trade_journal
```

## 🔧 API Documentation

### Base URL
```
http://localhost:8001
```

### Endpoints

#### **Trades**
- `GET /api/trades` - Get all trades (with filtering)
- `POST /api/trades` - Create new trade
- `GET /api/trades/{id}` - Get specific trade
- `PUT /api/trades/{id}` - Update trade
- `DELETE /api/trades/{id}` - Delete trade

#### **Analytics**
- `GET /api/trades/stats/summary` - Get trading statistics
- `GET /api/trades/export/csv` - Export trades as CSV

#### **Example API Usage**

<details>
<summary>Click to expand API examples</summary>

```bash
# Get all trades
curl "http://localhost:8001/api/trades"

# Create a new trade
curl -X POST "http://localhost:8001/api/trades" \
     -H "Content-Type: application/json" \
     -d '{
       "date": "2025-01-15",
       "pair": "EUR/USD",
       "direction": "buy",
       "entry_price": 1.0850,
       "exit_price": 1.0920,
       "risk_amount": 100.0,
       "result_amount": 150.0,
       "notes": "Strong bullish momentum"
     }'

# Get trading statistics
curl "http://localhost:8001/api/trades/stats/summary"

# Filter trades by pair
curl "http://localhost:8001/api/trades?pair=EUR/USD"

# Filter by direction
curl "http://localhost:8001/api/trades?direction=buy"
```

</details>

## 🏗 Architecture

### Tech Stack
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui components
- **Backend**: FastAPI (Python) + Motor (async MongoDB driver)
- **Database**: MongoDB with UUID-based document IDs
- **Charts**: Recharts for interactive visualizations
- **Process Management**: Supervisor
- **Styling**: Tailwind CSS with custom dark theme

### Project Structure
```
tradejournal/
├── backend/                 # FastAPI backend
│   ├── server.py           # Main application server
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Custom styling
│   │   └── components/ui/ # shadcn/ui components
│   ├── package.json       # Node.js dependencies
│   └── .env              # Frontend environment variables
├── setup.sh              # Automated setup script
├── start_tradejournal.sh # Startup script
├── stop_tradejournal.sh  # Stop script
└── README.md             # This file
```

### Database Schema

```javascript
// Trade Document Structure
{
  id: "uuid-string",           // Unique identifier
  date: "2025-01-15",         // Trade date (YYYY-MM-DD)
  pair: "EUR/USD",            // Trading instrument
  direction: "buy",           // "buy" or "sell"
  entry_price: 1.0850,       // Entry price (float)
  exit_price: 1.0920,        // Exit price (float)
  stop_loss: 1.0800,         // Stop loss (optional)
  take_profit: 1.0950,       // Take profit (optional)
  risk_amount: 100.0,        // Risk amount in dollars
  result_amount: 150.0,      // Profit/loss in dollars
  notes: "Trade analysis...", // Optional notes
  created_at: "2025-01-15T10:30:00Z",
  updated_at: "2025-01-15T10:30:00Z"
}
```

## 🎨 Customization

### Theme Colors
The application uses a carefully designed dark theme. You can customize colors in `/frontend/src/App.css`:

```css
/* Color Palette */
:root {
  --bg-primary: #0d1117;      /* Dark navy background */
  --bg-secondary: #161b22;     /* Secondary background */
  --accent-cyan: #00d9ff;      /* Neon cyan highlights */
  --profit-green: #00ff88;     /* Profit color */
  --loss-red: #ff2e63;         /* Loss color */
  --text-primary: #c9d1d9;     /* Primary text */
  --text-secondary: #8b949e;   /* Secondary text */
}
```

### Adding Custom Indicators

You can extend the analytics by modifying the backend statistics endpoint in `/backend/server.py`:

```python
@app.get("/api/trades/stats/custom")
async def get_custom_stats():
    # Add your custom calculations here
    return {"custom_metric": calculated_value}
```

## 🔒 Security & Privacy

- **Offline-First**: All data stays on your local machine
- **No External Dependencies**: No third-party tracking or analytics
- **Local Database**: MongoDB runs locally, no cloud storage
- **Environment Variables**: Sensitive configuration stored in .env files
- **UUID-based IDs**: No predictable sequential IDs

## 🐛 Troubleshooting

### Common Issues

#### **MongoDB Connection Error**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo journalctl -u mongod -f
```

#### **Frontend Won't Start**
```bash
# Clear Node.js cache
cd frontend
rm -rf node_modules package-lock.json
yarn install

# Check for port conflicts
sudo netstat -tulpn | grep :3000
```

#### **Backend API Errors**
```bash
# Check Python environment
source venv/bin/activate
python --version

# Check backend logs
sudo tail -f /var/log/supervisor/tradejournalbackend.err.log
```

#### **Permission Issues**
```bash
# Fix log file permissions
sudo chown $USER:$USER /var/log/supervisor/tradejournal*

# Fix database permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
```

### Debug Mode

Enable debug mode by setting in `/backend/.env`:
```env
DEBUG=True
```

This will provide detailed error messages and request logging.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Setup

```bash
# Clone your fork
git clone <your-fork-url>
cd tradejournal

# Install dependencies
./setup.sh

# Start development servers
cd backend && python server.py &
cd frontend && yarn start &
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful React components
- **Recharts** - Powerful charting library
- **FastAPI** - Modern Python web framework
- **MongoDB** - Document database
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support

If you encounter any issues or have questions:

1. **Check the troubleshooting section** above
2. **Review the logs**: `sudo tail -f /var/log/supervisor/tradejournal*.log`
3. **Open an issue** on GitHub with detailed error information
4. **Include your system information**: OS, Python version, Node.js version

---

<div align="center">

**🚀 Built for Traders, by Traders 🚀**

*Start your trading journal journey today!*

</div>