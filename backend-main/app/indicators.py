import ta
import pandas as pd

def add_technical_indicators(data: pd.DataFrame) -> pd.DataFrame:
    adj_close_col = "Adj Close"
    volume_col = None

    for col in data.columns:
        if "Volume" in col:
            volume_col = col
            break

    if adj_close_col not in data.columns or volume_col is None:
        raise KeyError("Required columns for indicators are missing ('Adj Close', 'Volume').")

    # RSI
    data["RSI"] = ta.momentum.RSIIndicator(data[adj_close_col], window=14).rsi()

    # MACD
    macd = ta.trend.MACD(data[adj_close_col])
    data["MACD"] = macd.macd()
    data["MACD_Signal"] = macd.macd_signal()
    data["MACD_Diff"] = macd.macd_diff()

    # EMA
    data["EMA_20"] = ta.trend.EMAIndicator(data[adj_close_col], window=20).ema_indicator()
    data["EMA_50"] = ta.trend.EMAIndicator(data[adj_close_col], window=50).ema_indicator()

    # Bollinger Bands
    bb = ta.volatility.BollingerBands(data[adj_close_col])
    data["BB_High"] = bb.bollinger_hband()
    data["BB_Low"] = bb.bollinger_lband()

    for col in ["RSI", "MACD", "MACD_Signal", "MACD_Diff", "EMA_20", "EMA_50", "BB_High", "BB_Low"]:
        if col in data.columns:
            data[col] = data[col].fillna(method="ffill").fillna(method="bfill").fillna(0)

    return data
