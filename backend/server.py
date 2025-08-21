from fastapi import FastAPI, HTTPException, Depends, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
import uuid
from dotenv import load_dotenv
import shutil

# Load environment variables
load_dotenv()

from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Trade Journal API", version="1.0.0")

# Mount the 'uploads' directory to serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
UPLOADS_DIR = "uploads"

# Create uploads directory if it doesn't exist
os.makedirs(UPLOADS_DIR, exist_ok=True)


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
    screenshot_url: Optional[str] = None

class TradeCreate(TradeBase):
    pass

class TradeUpdate(BaseModel):
    date: Optional[str] = None
    pair: Optional[str] = None
    direction: Optional[str] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    risk_amount: Optional[float] = None
    result_amount: Optional[float] = None
    notes: Optional[str] = None
    screenshot_url: Optional[str] = None


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
        "screenshot_url": trade.get("screenshot_url"),
        "created_at": trade["created_at"],
        "updated_at": trade["updated_at"],
    }

@app.get("/")
async def root():
    return {"message": "Trade Journal API is running"}

@app.post("/api/trades", response_model=Trade)
async def create_trade(
    date: str = Form(...),
    pair: str = Form(...),
    direction: str = Form(...),
    entry_price: float = Form(...),
    exit_price: float = Form(...),
    stop_loss: Optional[float] = Form(None),
    take_profit: Optional[float] = Form(None),
    risk_amount: float = Form(...),
    result_amount: float = Form(...),
    notes: Optional[str] = Form(""),
    screenshot: Optional[UploadFile] = File(None)
):
    """Create a new trade entry with an optional screenshot"""
    trade_dict = {
        "date": date,
        "pair": pair,
        "direction": direction,
        "entry_price": entry_price,
        "exit_price": exit_price,
        "stop_loss": stop_loss,
        "take_profit": take_profit,
        "risk_amount": risk_amount,
        "result_amount": result_amount,
        "notes": notes,
    }

    if screenshot:
        # Create a unique filename
        file_extension = os.path.splitext(screenshot.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOADS_DIR, unique_filename)

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(screenshot.file, buffer)

        trade_dict["screenshot_url"] = f"/uploads/{unique_filename}"

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
async def update_trade(
    trade_id: str,
    date: str = Form(None),
    pair: str = Form(None),
    direction: str = Form(None),
    entry_price: float = Form(None),
    exit_price: float = Form(None),
    stop_loss: Optional[float] = Form(None),
    take_profit: Optional[float] = Form(None),
    risk_amount: float = Form(None),
    result_amount: float = Form(None),
    notes: Optional[str] = Form(None),
    screenshot: Optional[UploadFile] = File(None)
):
    """Update an existing trade"""
    existing_trade = await trades_collection.find_one({"id": trade_id})
    if not existing_trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    update_data = {
        k: v for k, v in {
            "date": date,
            "pair": pair,
            "direction": direction,
            "entry_price": entry_price,
            "exit_price": exit_price,
            "stop_loss": stop_loss,
            "take_profit": take_profit,
            "risk_amount": risk_amount,
            "result_amount": result_amount,
            "notes": notes,
        }.items() if v is not None
    }

    if screenshot:
        # If there's an old screenshot, delete it
        if existing_trade.get("screenshot_url"):
            old_screenshot_path = os.path.join(UPLOADS_DIR, os.path.basename(existing_trade["screenshot_url"]))
            if os.path.exists(old_screenshot_path):
                os.remove(old_screenshot_path)

        # Save the new screenshot
        file_extension = os.path.splitext(screenshot.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOADS_DIR, unique_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(screenshot.file, buffer)

        update_data["screenshot_url"] = f"/uploads/{unique_filename}"

    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        result = await trades_collection.update_one(
            {"id": trade_id},
            {"$set": update_data}
        )

    # Return updated trade data
    updated_trade = await trades_collection.find_one({"id": trade_id})
    return trade_helper(updated_trade)

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