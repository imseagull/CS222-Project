import React, { useState } from 'react';
import PredictionForm from './PredictionForm'; 
import PredictionsChart from './PredictionsChart'; 
import './styles.css';

function App() {
  const [predictions, setPredictions] = useState(null);
  const [dates, setDates] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (formData) => {
    setError(null);
    setPredictions(null);
    setDates(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const respData = await response.json();
        const message = respData.detail || `An error has occurred: ${response.statusText}`;
        setError(message);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setDates(data.dates);
      setPredictions(data.predictions);
      setLoading(false);
    } catch (err) {
      setError(`Network error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Stock Predictor</h1>
      <p>This process will take about 2 minutes!</p>
      
      <PredictionForm onPredict={handlePredict} />

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {!loading && predictions && dates && (
        <div className="results-container">
          <h2>Predictions Table</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Low (10th)</th>
                <th>Median (50th)</th>
                <th>High (90th)</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((dayPredictions, idx) => {
                const low = dayPredictions[0][0];    
                const median = dayPredictions[1][0]; 
                const high = dayPredictions[2][0];   
                return (
                  <tr key={idx}>
                    <td>{dates[idx]}</td>
                    <td>{low.toFixed(2)}</td>
                    <td>{median.toFixed(2)}</td>
                    <td>{high.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2>Predictions Chart</h2>
          <PredictionsChart dates={dates} predictions={predictions} />
        </div>
      )}
    </div>
  );
}

export default App;
