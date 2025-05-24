import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ColorChart({ histogram }) {
  if (!histogram) return null;

  const data = {
    labels: Array.from({ length: histogram.red.length }, (_, i) => i),
    datasets: [
      {
        label: 'Red',
        data: histogram.red,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 0,
      },
      {
        label: 'Green',
        data: histogram.green,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 0,
      },
      {
        label: 'Blue',
        data: histogram.blue,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div style={{ width: 120, height: 60 }}>
      <Bar data={data} options={options} width={120} height={60} />
    </div>
  );
} 