import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class TradeJournalAPITester:
    def __init__(self, base_url="https://tradelog-21.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_trade_ids = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if method == 'POST' and 'id' in response_data:
                        self.created_trade_ids.append(response_data['id'])
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response text: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_get_trades_empty(self):
        """Test getting trades when database is empty"""
        return self.run_test("Get Trades (Empty)", "GET", "api/trades", 200)

    def test_create_trade(self, trade_data):
        """Create a trade"""
        success, response = self.run_test(
            f"Create Trade ({trade_data['pair']})",
            "POST",
            "api/trades",
            200,  # FastAPI typically returns 200 for successful POST, not 201
            data=trade_data
        )
        return success, response

    def test_get_trades(self):
        """Get all trades"""
        return self.run_test("Get All Trades", "GET", "api/trades", 200)

    def test_get_trade_by_id(self, trade_id):
        """Get a specific trade by ID"""
        return self.run_test(
            f"Get Trade by ID",
            "GET",
            f"api/trades/{trade_id}",
            200
        )

    def test_update_trade(self, trade_id, updated_data):
        """Update an existing trade"""
        return self.run_test(
            f"Update Trade",
            "PUT",
            f"api/trades/{trade_id}",
            200,
            data=updated_data
        )

    def test_delete_trade(self, trade_id):
        """Delete a trade"""
        return self.run_test(
            f"Delete Trade",
            "DELETE",
            f"api/trades/{trade_id}",
            200
        )

    def test_get_stats(self):
        """Get trading statistics"""
        return self.run_test("Get Trading Stats", "GET", "api/trades/stats/summary", 200)

    def test_export_csv(self):
        """Test CSV export"""
        return self.run_test("Export CSV", "GET", "api/trades/export/csv", 200)

    def test_get_trades_with_filters(self):
        """Test getting trades with filters"""
        success1, _ = self.run_test(
            "Get Trades (Filter by Pair)",
            "GET",
            "api/trades",
            200,
            params={"pair": "EUR/USD"}
        )
        success2, _ = self.run_test(
            "Get Trades (Filter by Direction)",
            "GET",
            "api/trades",
            200,
            params={"direction": "buy"}
        )
        return success1 and success2

def main():
    print("🚀 Starting Trade Journal API Tests...")
    print("=" * 50)
    
    # Setup
    tester = TradeJournalAPITester()
    
    # Test data - mix of profitable and losing trades
    sample_trades = [
        {
            "date": "2024-01-15",
            "pair": "EUR/USD",
            "direction": "buy",
            "entry_price": 1.0850,
            "exit_price": 1.0920,
            "stop_loss": 1.0800,
            "take_profit": 1.0950,
            "risk_amount": 100.0,
            "result_amount": 150.0,
            "notes": "Strong bullish momentum, good entry at support level"
        },
        {
            "date": "2024-01-16",
            "pair": "GBP/USD",
            "direction": "sell",
            "entry_price": 1.2650,
            "exit_price": 1.2580,
            "stop_loss": 1.2700,
            "take_profit": 1.2550,
            "risk_amount": 80.0,
            "result_amount": 120.0,
            "notes": "Brexit news caused downward pressure"
        },
        {
            "date": "2024-01-17",
            "pair": "USD/JPY",
            "direction": "buy",
            "entry_price": 148.50,
            "exit_price": 147.80,
            "stop_loss": 147.50,
            "take_profit": 149.50,
            "risk_amount": 90.0,
            "result_amount": -85.0,
            "notes": "Hit stop loss due to unexpected BoJ intervention"
        },
        {
            "date": "2024-01-18",
            "pair": "AUD/USD",
            "direction": "sell",
            "entry_price": 0.6750,
            "exit_price": 0.6820,
            "stop_loss": 0.6800,
            "take_profit": 0.6650,
            "risk_amount": 75.0,
            "result_amount": -70.0,
            "notes": "Wrong direction, commodity prices surged"
        }
    ]

    # Run tests in sequence
    print("\n📋 Phase 1: Basic API Tests")
    print("-" * 30)
    
    # Test root endpoint
    tester.test_root_endpoint()
    
    # Test getting trades when empty
    tester.test_get_trades_empty()
    
    print("\n📋 Phase 2: CRUD Operations")
    print("-" * 30)
    
    # Create sample trades
    created_trades = []
    for trade_data in sample_trades:
        success, response = tester.test_create_trade(trade_data)
        if success and response:
            created_trades.append(response)
    
    # Test getting all trades
    success, all_trades = tester.test_get_trades()
    if success:
        print(f"   📊 Total trades in database: {len(all_trades.get('data', all_trades)) if isinstance(all_trades, dict) else len(all_trades)}")
    
    # Test getting individual trades
    if tester.created_trade_ids:
        tester.test_get_trade_by_id(tester.created_trade_ids[0])
    
    # Test updating a trade
    if tester.created_trade_ids:
        updated_trade_data = {
            "date": "2024-01-15",
            "pair": "EUR/USD",
            "direction": "buy",
            "entry_price": 1.0850,
            "exit_price": 1.0930,  # Changed exit price
            "stop_loss": 1.0800,
            "take_profit": 1.0950,
            "risk_amount": 100.0,
            "result_amount": 160.0,  # Updated result
            "notes": "Updated: Strong bullish momentum, excellent exit timing"
        }
        tester.test_update_trade(tester.created_trade_ids[0], updated_trade_data)
    
    print("\n📋 Phase 3: Advanced Features")
    print("-" * 30)
    
    # Test statistics
    success, stats = tester.test_get_stats()
    if success and stats:
        print(f"   📈 Statistics Summary:")
        print(f"      Total Trades: {stats.get('total_trades', 'N/A')}")
        print(f"      Win Rate: {stats.get('win_rate', 'N/A')}%")
        print(f"      Total Profit: ${stats.get('total_profit', 'N/A')}")
        print(f"      Profit Factor: {stats.get('profit_factor', 'N/A')}")
    
    # Test CSV export
    tester.test_export_csv()
    
    # Test filtering
    tester.test_get_trades_with_filters()
    
    print("\n📋 Phase 4: Cleanup & Delete Tests")
    print("-" * 30)
    
    # Test deleting trades
    for trade_id in tester.created_trade_ids[:2]:  # Delete first 2 trades
        tester.test_delete_trade(trade_id)
    
    # Verify deletion worked
    success, remaining_trades = tester.test_get_trades()
    if success:
        remaining_count = len(remaining_trades.get('data', remaining_trades)) if isinstance(remaining_trades, dict) else len(remaining_trades)
        print(f"   📊 Remaining trades after deletion: {remaining_count}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL TEST RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 ALL TESTS PASSED! Backend API is working correctly.")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed. Backend needs attention.")
        return 1

if __name__ == "__main__":
    sys.exit(main())