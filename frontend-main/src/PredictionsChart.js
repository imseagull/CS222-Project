import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin 
);

function PredictionsChart({ dates, predictions }) {
  const lowValues = predictions.map(day => day[0][0]);
  const medianValues = predictions.map(day => day[1][0]);
  const highValues = predictions.map(day => day[2][0]);

  const data = {
    labels: dates,
    datasets: [
      {
        label: '10th Percentile (Low)',
        data: lowValues,
        borderColor: '#c44f54',
        backgroundColor: 'rgba(196,79,84,0.2)',
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: '50th Percentile (Median)',
        data: medianValues,
        borderColor: '#4e79a7',
        backgroundColor: 'rgba(78,121,167,0.2)',
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: '90th Percentile (High)',
        data: highValues,
        borderColor: '#59a14f',
        backgroundColor: 'rgba(89,161,79,0.2)',
        borderWidth: 2,
        tension: 0.1,
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Stock Price Predictions',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      legend: {
        display: true
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy', 
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'xy', 
          },
          wheel: {
            enabled: true, 
          },
          pinch: {
            enabled: true, 
          },
          mode: 'xy',
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#333'
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price',
          color: '#333'
        },
        beginAtZero: false,
      },
    },
    onClick: (e, elements, chart) => {
      if (chart && chart.ctx) {
        if (e.native?.detail === 2) {
          chart.resetZoom();
        }
      }
    }
  };

  return <Line data={data} options={options} />;
}

export default PredictionsChart;
