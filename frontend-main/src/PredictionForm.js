import React, { useState } from 'react';

function PredictionForm({ onPredict }) {
  const [ticker, setTicker] = useState('');
  const [daysToPredict, setDaysToPredict] = useState(20);
  const [indicators, setIndicators] = useState({
    RSI: false,
    MACD: false,
    EMA_20: false,
    EMA_50: false,
    BB_High: false,
    BB_Low: false,
  });
  const [formError, setFormError] = useState(null);

  const handleIndicatorChange = (e) => {
    const { name, checked } = e.target;
    setIndicators((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    const selectedIndicators = Object.keys(indicators).filter((ind) => indicators[ind]);

    if (selectedIndicators.length === 0) {
      setFormError("Please select at least one indicator.");
      return;
    }

    onPredict({
      ticker: ticker.trim(),
      days_to_predict: parseInt(daysToPredict, 10),
      indicators: selectedIndicators,
    });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <div style={{ marginBottom: '10px' }}>
        <label>Stock Ticker:</label>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="e.g., AAPL"
          required
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Days to Predict:</label>
        <input
          type="number"
          value={daysToPredict}
          onChange={(e) => setDaysToPredict(e.target.value)}
          required
          min="1"
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Select Indicators:</strong>
        <div className="indicators-list">
          {Object.keys(indicators).map((ind) => (
            <label key={ind}>
              <input
                type="checkbox"
                name={ind}
                checked={indicators[ind]}
                onChange={handleIndicatorChange}
              />
              {ind}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="predict-button">Predict</button>

      {formError && (
        <div style={{ color: 'red', marginTop: '10px', fontWeight: '600' }}>
          {formError}
        </div>
      )}
    </form>
  );
}

export default PredictionForm;
