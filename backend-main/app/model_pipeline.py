import pandas as pd
import numpy as np
from pytorch_forecasting import TimeSeriesDataSet, TemporalFusionTransformer
from pytorch_forecasting.metrics import QuantileLoss
from pytorch_lightning import Trainer
import torch

def prepare_dataset(data: pd.DataFrame, indicators: list) -> TimeSeriesDataSet:
    valid_indicators = [col for col in indicators if col in data.columns]

    dataset = TimeSeriesDataSet(
        data,
        time_idx="time_idx",
        target="target",
        group_ids=["group"],
        max_encoder_length=60,
        max_prediction_length=20,
        static_categoricals=["group"],
        time_varying_known_reals=["time_idx"],
        time_varying_unknown_reals=["Adj Close", "target", "Returns", "Trend_Slope"] + valid_indicators,
    )
    return dataset

def train_model(dataset: TimeSeriesDataSet) -> TemporalFusionTransformer:
    dataloader = dataset.to_dataloader(train=True, batch_size=64)
    quantiles = [0.1, 0.5, 0.9]

    tft = TemporalFusionTransformer.from_dataset(
        dataset,
        learning_rate=0.03,
        hidden_size=8,
        attention_head_size=1,
        dropout=0.1,
        hidden_continuous_size=8,
        output_size=len(quantiles),
        loss=QuantileLoss(quantiles=quantiles),
    )

    trainer = Trainer(max_epochs=5, gradient_clip_val=0.1, enable_progress_bar=False)
    trainer.fit(tft, train_dataloaders=dataloader)
    return tft

def predict_future(tft: TemporalFusionTransformer, dataset: TimeSeriesDataSet, days_to_predict: int):
    raw_predictions, x = tft.predict(dataset, mode="raw", return_x=True)
    predictions = raw_predictions[0][-days_to_predict:] 
    return predictions.tolist()
from fastapi import HTTPException

def run_prediction_pipeline(ticker: str, indicators: list, days_to_predict: int, download_func, preprocess_func, indicator_func) -> dict:
    data = download_func(ticker)
    if data.empty:
        raise HTTPException(status_code=400, detail="Invalid ticker symbol or no data available.")

    data = preprocess_func(data)
    data = indicator_func(data)
    dataset = prepare_dataset(data, indicators)
    model = train_model(dataset)
    predictions = predict_future(model, dataset, days_to_predict)

    last_date = pd.to_datetime(data["Date"].iloc[-1])
    future_dates = [(last_date + pd.offsets.BDay(i)).strftime("%Y-%m-%d") for i in range(1, days_to_predict+1)]

    return {
        "dates": future_dates,
        "predictions": predictions
    }
