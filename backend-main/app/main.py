from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from app.model_pipeline import run_prediction_pipeline
from app.data_preprocessing import download_data, preprocess_data
from app.indicators import add_technical_indicators

class PredictionRequest(BaseModel):
    ticker: str
    days_to_predict: int
    indicators: List[str]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the stock prediction API. Use /predict endpoint to get predictions."}

@app.post("/predict")
async def predict_endpoint(req: PredictionRequest):
    result = run_prediction_pipeline(
        ticker=req.ticker,
        indicators=req.indicators,
        days_to_predict=req.days_to_predict,
        download_func=download_data,
        preprocess_func=preprocess_data,
        indicator_func=add_technical_indicators
    )
    return {"dates": result["dates"], "predictions": result["predictions"]}
