#!/usr/bin/env python3
import requests
import json
from datetime import datetime

# Your trading data
trades_data = [
    {"date": "2025-07-28", "pair": "GBPUSD.m", "direction": "buy", "entry_price": 1.34414, "exit_price": 1.34444, "result_amount": 0.30},
    {"date": "2025-07-30", "pair": "GBPUSD.m", "direction": "sell", "entry_price": 1.32999, "exit_price": 1.32992, "result_amount": 0.07},
    {"date": "2025-07-31", "pair": "GBPUSD.m", "direction": "sell", "entry_price": 1.32221, "exit_price": 1.32257, "result_amount": -0.36},
    {"date": "2025-07-31", "pair": "GBPUSD.m", "direction": "sell", "entry_price": 1.32203, "exit_price": 1.32200, "result_amount": 0.03},
    {"date": "2025-07-31", "pair": "GBPUSD.m", "direction": "buy", "entry_price": 1.32085, "exit_price": 1.32083, "result_amount": -0.02},
    {"date": "2025-07-31", "pair": "GBPUSD.m", "direction": "sell", "entry_price": 1.32122, "exit_price": 1.32350, "result_amount": -2.28},
    {"date": "2025-08-01", "pair": "GBPUSD.m", "direction": "sell", "entry_price": 1.32291, "exit_price": 1.31636, "result_amount": 6.55},
    {"date": "2025-08-01", "pair": "GBPUSD.m", "direction": "sell", "entry_price": 1.31611, "exit_price": 1.31638, "result_amount": -0.27},
    {"date": "2025-08-01", "pair": "GBPUSD.m", "direction": "sell", "entry_price": 1.31501, "exit_price": 1.31490, "result_amount": 0.11},
    {"date": "2025-08-01", "pair": "GBPUSD.m", "direction": "buy", "entry_price": 1.32584, "exit_price": 1.32575, "result_amount": -0.09},
    {"date": "2025-08-04", "pair": "GBPUSD.m", "direction": "buy", "entry_price": 1.32994, "exit_price": 1.32950, "result_amount": -0.44},
    {"date": "2025-08-08", "pair": "GBPUSD.m", "direction": "buy", "entry_price": 1.34386, "exit_price": 1.34505, "result_amount": 1.19},
    {"date": "2025-08-08", "pair": "GBPUSD.m", "direction": "buy", "entry_price": 1.34392, "exit_price": 1.34473, "result_amount": 0.81},
    {"date": "2025-08-12", "pair": "GBPUSD.m", "direction": "buy", "entry_price": 1.34739, "exit_price": 1.35092, "result_amount": 3.53}
]

def add_trades_to_app():
    backend_url = "http://localhost:8001"
    
    print("🚀 Loading your GBPUSD.m trading data...")
    print("=" * 50)
    
    added_count = 0
    total_profit = 0
    
    for i, trade in enumerate(trades_data, 1):
        # Calculate risk amount based on result (estimate)
        risk_amount = abs(trade["result_amount"]) + 1.0  # Add buffer for risk
        if risk_amount < 1.0:
            risk_amount = 1.0
            
        # Prepare trade data for API
        trade_payload = {
            "date": trade["date"],
            "pair": trade["pair"],
            "direction": trade["direction"],
            "entry_price": trade["entry_price"],
            "exit_price": trade["exit_price"],
            "stop_loss": None,  # Not provided in your data
            "take_profit": None,  # Not provided in your data
            "risk_amount": risk_amount,
            "result_amount": trade["result_amount"],
            "notes": f"GBPUSD scalping trade #{i}"
        }
        
        try:
            response = requests.post(f"{backend_url}/api/trades", json=trade_payload)
            if response.status_code == 200:
                print(f"✅ Trade {i}: {trade['date']} {trade['direction'].upper()} ${trade['result_amount']:+.2f}")
                added_count += 1
                total_profit += trade["result_amount"]
            else:
                print(f"❌ Failed to add trade {i}: {response.status_code}")
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"❌ Error adding trade {i}: {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"📊 SUMMARY:")
    print(f"   Trades Added: {added_count}/14")
    print(f"   Total P&L: ${total_profit:+.2f}")
    print(f"   Win Rate: {len([t for t in trades_data if t['result_amount'] > 0])/14*100:.1f}%")
    print(f"   Largest Win: ${max([t['result_amount'] for t in trades_data]):.2f}")
    print(f"   Largest Loss: ${min([t['result_amount'] for t in trades_data]):.2f}")
    
    if added_count == 14:
        print("\n🎉 All your trades have been successfully loaded!")
        print("🌐 Your trading journal is now ready to view.")
    else:
        print(f"\n⚠️  Only {added_count} out of 14 trades were loaded.")

if __name__ == "__main__":
    add_trades_to_app()