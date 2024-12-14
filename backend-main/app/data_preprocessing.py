import yfinance as yf
import pandas as pd
import numpy as np
from pandas.tseries.offsets import BDay

def download_data(ticker: str) -> pd.DataFrame:
    data = yf.download(ticker)
    if data is None or data.empty:
        return pd.DataFrame()  
    data.columns = [f"{col[0]}_{col[1]}" if isinstance(col, tuple) else col for col in data.columns]
    data.reset_index(inplace=True)
    if f"Adj Close_{ticker}" in data.columns:
        data.rename(columns={f"Adj Close_{ticker}": "Adj Close"}, inplace=True)
    return data

def preprocess_data(data: pd.DataFrame) -> pd.DataFrame:
    if "Adj Close" not in data.columns:
        raise KeyError("'Adj Close' column is missing in the dataset.")
    data["time_idx"] = np.arange(len(data))
    data["group"] = "0"
    data["target"] = data["Adj Close"]
    data["Returns"] = data["Adj Close"].pct_change().fillna(0)
    data["Trend_Slope"] = data["Returns"].rolling(window=10).mean().fillna(0)
    return data

def generate_future_dates(last_date: pd.Timestamp, days_to_predict: int):
    return [last_date + i * BDay() for i in range(1, days_to_predict + 1)]
