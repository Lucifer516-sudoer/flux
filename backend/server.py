from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Trade Journal API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = "trade_journal"
COLLECTION_NAME = "trades"

client = AsyncIOMotorClient(MONGO_URL)
database = client[DATABASE_NAME]
trades_collection = database[COLLECTION_NAME]

# Pydantic models
class TradeBase(BaseModel):
    date: str
    pair: str
    direction: str  # 'buy' or 'sell'
    entry_price: float
    exit_price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    risk_amount: float
    result_amount: float
    notes: Optional[str] = ""

class TradeCreate(TradeBase):
    pass

class TradeUpdate(TradeBase):
    pass

class Trade(TradeBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Helper function to convert MongoDB document to Trade model
def trade_helper(trade) -> dict:
    return {
        "id": trade["id"],
        "date": trade["date"],
        "pair": trade["pair"],
        "direction": trade["direction"],
        "entry_price": trade["entry_price"],
        "exit_price": trade["exit_price"],
        "stop_loss": trade.get("stop_loss"),
        "take_profit": trade.get("take_profit"),
        "risk_amount": trade["risk_amount"],
        "result_amount": trade["result_amount"],
        "notes": trade.get("notes", ""),
        "created_at": trade["created_at"],
        "updated_at": trade["updated_at"],
    }

@app.get("/")
async def root():
    return {"message": "Trade Journal API is running"}

@app.post("/api/trades", response_model=Trade)
async def create_trade(trade: TradeCreate):
    """Create a new trade entry"""
    trade_dict = trade.dict()
    trade_dict["id"] = str(uuid.uuid4())
    trade_dict["created_at"] = datetime.utcnow()
    trade_dict["updated_at"] = datetime.utcnow()
    
    # Insert the trade into MongoDB
    result = await trades_collection.insert_one(trade_dict)
    
    if result.inserted_id:
        # Retrieve the created trade
        created_trade = await trades_collection.find_one({"id": trade_dict["id"]})
        return trade_helper(created_trade)
    
    raise HTTPException(status_code=400, detail="Trade creation failed")

@app.get("/api/trades", response_model=List[Trade])
async def get_trades(
    skip: int = 0, 
    limit: int = 1000,
    pair: Optional[str] = None,
    direction: Optional[str] = None
):
    """Get all trades with optional filtering"""
    query = {}
    
    if pair:
        query["pair"] = {"$regex": pair, "$options": "i"}
    if direction:
        query["direction"] = direction
    
    trades = []
    cursor = trades_collection.find(query).skip(skip).limit(limit).sort("date", -1)
    
    async for trade in cursor:
        trades.append(trade_helper(trade))
    
    return trades

@app.get("/api/trades/{trade_id}", response_model=Trade)
async def get_trade(trade_id: str):
    """Get a specific trade by ID"""
    trade = await trades_collection.find_one({"id": trade_id})
    
    if trade:
        return trade_helper(trade)
    
    raise HTTPException(status_code=404, detail="Trade not found")

@app.put("/api/trades/{trade_id}", response_model=Trade)
async def update_trade(trade_id: str, trade_update: TradeUpdate):
    """Update an existing trade"""
    # Check if trade exists
    existing_trade = await trades_collection.find_one({"id": trade_id})
    if not existing_trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    # Prepare update data
    update_data = trade_update.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the trade
    result = await trades_collection.update_one(
        {"id": trade_id}, 
        {"$set": update_data}
    )
    
    if result.modified_count == 1:
        # Return updated trade
        updated_trade = await trades_collection.find_one({"id": trade_id})
        return trade_helper(updated_trade)
    
    raise HTTPException(status_code=400, detail="Trade update failed")

@app.delete("/api/trades/{trade_id}")
async def delete_trade(trade_id: str):
    """Delete a trade"""
    result = await trades_collection.delete_one({"id": trade_id})
    
    if result.deleted_count == 1:
        return {"message": "Trade deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Trade not found")

@app.get("/api/trades/stats/summary")
async def get_trade_stats():
    """Get trading statistics summary"""
    try:
        # Get all trades
        trades = []
        cursor = trades_collection.find({})
        
        async for trade in cursor:
            trades.append(trade_helper(trade))
        
        if not trades:
            return {
                "total_trades": 0,
                "winning_trades": 0,
                "losing_trades": 0,
                "total_profit": 0.0,
                "win_rate": 0.0,
                "profit_factor": 0.0,
                "average_win": 0.0,
                "average_loss": 0.0,
                "largest_win": 0.0,
                "largest_loss": 0.0
            }
        
        # Calculate statistics
        total_trades = len(trades)
        winning_trades = [t for t in trades if t["result_amount"] > 0]
        losing_trades = [t for t in trades if t["result_amount"] < 0]
        
        total_profit = sum(t["result_amount"] for t in trades)
        win_rate = (len(winning_trades) / total_trades * 100) if total_trades > 0 else 0
        
        # Calculate profit factor
        gross_profit = sum(t["result_amount"] for t in winning_trades)
        gross_loss = abs(sum(t["result_amount"] for t in losing_trades))
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else 0
        
        # Calculate averages
        avg_win = (gross_profit / len(winning_trades)) if winning_trades else 0
        avg_loss = (gross_loss / len(losing_trades)) if losing_trades else 0
        
        # Find largest win/loss
        largest_win = max([t["result_amount"] for t in winning_trades]) if winning_trades else 0
        largest_loss = min([t["result_amount"] for t in losing_trades]) if losing_trades else 0
        
        return {
            "total_trades": total_trades,
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            "total_profit": round(total_profit, 2),
            "win_rate": round(win_rate, 2),
            "profit_factor": round(profit_factor, 2),
            "average_win": round(avg_win, 2),
            "average_loss": round(abs(avg_loss), 2),
            "largest_win": round(largest_win, 2),
            "largest_loss": round(largest_loss, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating stats: {str(e)}")

@app.get("/api/trades/export/csv")
async def export_trades_csv():
    """Export all trades as CSV data"""
    try:
        trades = []
        cursor = trades_collection.find({}).sort("date", 1)
        
        async for trade in cursor:
            trades.append(trade_helper(trade))
        
        if not trades:
            return {"data": "", "filename": "trades_export.csv"}
        
        # Create CSV content
        headers = ["Date", "Pair", "Direction", "Entry Price", "Exit Price", "Stop Loss", "Take Profit", "Risk Amount", "Result Amount", "Notes"]
        csv_content = ",".join(headers) + "\n"
        
        for trade in trades:
            row = [
                trade["date"],
                trade["pair"],
                trade["direction"],
                str(trade["entry_price"]),
                str(trade["exit_price"]),
                str(trade["stop_loss"]) if trade["stop_loss"] else "",
                str(trade["take_profit"]) if trade["take_profit"] else "",
                str(trade["risk_amount"]),
                str(trade["result_amount"]),
                trade["notes"].replace(",", ";") if trade["notes"] else ""
            ]
            csv_content += ",".join(row) + "\n"
        
        return {
            "data": csv_content,
            "filename": f"trades_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting trades: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)