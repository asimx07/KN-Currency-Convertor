import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { HistoricalData } from '../types';
import { getHistoricalRates } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type DateRange = '7d' | '30d' | '6m' | '1y';

interface HistoricalChartProps {
  baseCurrency: string;
  targetCurrency: string;
  className?: string;
}

const dateRangeOptions: { value: DateRange; label: string; days: number }[] = [
  { value: '7d', label: '7 Days', days: 7 },
  { value: '30d', label: '30 Days', days: 30 },
  { value: '6m', label: '6 Months', days: 180 },
  { value: '1y', label: '1 Year', days: 365 },
];

const HistoricalChart: React.FC<HistoricalChartProps> = ({
  baseCurrency,
  targetCurrency,
  className = '',
}) => {
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange>('30d');

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!baseCurrency || !targetCurrency) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const days = dateRangeOptions.find(option => option.value === selectedRange)?.days || 30;
        const data = await getHistoricalRates(baseCurrency, targetCurrency, days);
        setHistoricalData(data);
      } catch (err) {
        setError('Failed to fetch historical data. Please try again later.');
        console.error('Error fetching historical data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [baseCurrency, targetCurrency, selectedRange]);

  // Format dates for better display
  const formatChartDates = (dates: string[]) => {
    return dates.map(dateStr => {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });
  };

  // Get min and max values for better Y-axis scaling
  const getYAxisMinMax = (rates: number[]) => {
    if (!rates.length) return { min: 0, max: 1 };
    
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    
    // Add a small buffer (5%) for better visualization
    const buffer = (max - min) * 0.05;
    
    return {
      min: Math.max(0, min - buffer),
      max: max + buffer
    };
  };

  const chartData = {
    labels: historicalData ? formatChartDates(historicalData.dates) : [],
    datasets: [
      {
        label: `${baseCurrency} to ${targetCurrency} Exchange Rate`,
        data: historicalData?.rates || [],
        borderColor: 'rgb(59, 130, 246)', // Blue color
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBackgroundColor: 'rgb(37, 99, 235)',
        fill: true,
      },
    ],
  };

  const yAxisMinMax = historicalData?.rates ? getYAxisMinMax(historicalData.rates) : { min: 0, max: 1 };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            if (!historicalData) return '';
            const index = tooltipItems[0].dataIndex;
            const originalDate = new Date(historicalData.dates[index]);
            return originalDate.toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          },
          label: (context) => {
            const value = context.parsed.y;
            return [
              `1 ${baseCurrency} = ${value.toFixed(4)} ${targetCurrency}`,
              `Rate on this date`
            ];
          },
        },
      },
      title: {
        display: true,
        text: `Exchange Rate Trend: ${baseCurrency} to ${targetCurrency}`,
        font: {
          size: 16
        },
        padding: {
          bottom: 20
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
        },
        title: {
          display: true,
          text: 'Date',
          padding: {
            top: 10
          }
        }
      },
      y: {
        beginAtZero: false,
        min: yAxisMinMax.min,
        max: yAxisMinMax.max,
        ticks: {
          precision: 4,
          callback: (value) => {
            return value.toString();
          }
        },
        title: {
          display: true,
          text: `${targetCurrency} per 1 ${baseCurrency}`,
          padding: {
            bottom: 10
          }
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'index',
      intersect: false
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRange(e.target.value as DateRange);
  };

  // Get date range description
  const getDateRangeDescription = () => {
    if (!historicalData || !historicalData.dates.length) return '';
    
    const firstDate = new Date(historicalData.dates[0]);
    const lastDate = new Date(historicalData.dates[historicalData.dates.length - 1]);
    
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return `${firstDate.toLocaleDateString(undefined, options)} - ${lastDate.toLocaleDateString(undefined, options)}`;
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400 block">
            {getDateRangeDescription()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="chart-range" className="text-sm text-gray-600 dark:text-gray-400">
            Time Range:
          </label>
          <select
            id="chart-range"
            value={selectedRange}
            onChange={handleRangeChange}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select time range"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-80 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : historicalData && historicalData.rates.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
            No historical data available
          </div>
        )}
      </div>
      
      {historicalData && historicalData.rates.length > 0 && (
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            Hover over the chart points to see detailed exchange rates for specific dates.
            Use the time range selector to view different periods.
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoricalChart; 