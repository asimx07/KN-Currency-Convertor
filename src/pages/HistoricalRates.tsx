import React, { useState, useEffect } from 'react';
import CurrencySelect from '../components/CurrencySelect';
import HistoricalChart from '../components/HistoricalChart';
import HistoricalChartDetails from '../components/HistoricalChartDetails';
import { getHistoricalRates } from '../services/api';
import { HistoricalData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

type ViewMode = 'chart' | 'details';

const HistoricalRates: React.FC = () => {
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [targetCurrency, setTargetCurrency] = useState<string>('EUR');
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<string>('30d');
  const [viewMode, setViewMode] = useState<ViewMode>('chart');

  const dateRangeOptions = [
    { value: '7d', label: '7 Days', days: 7 },
    { value: '30d', label: '30 Days', days: 30 },
    { value: '6m', label: '6 Months', days: 180 },
    { value: '1y', label: '1 Year', days: 365 },
  ];

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

  const handleBaseChange = (currency: string) => {
    setBaseCurrency(currency);
  };

  const handleTargetChange = (currency: string) => {
    setTargetCurrency(currency);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRange(e.target.value);
  };

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const getSelectedRangeLabel = () => {
    return dateRangeOptions.find(option => option.value === selectedRange)?.label || '30 Days';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Historical Exchange Rates
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <CurrencySelect 
              value={baseCurrency} 
              onChange={handleBaseChange}
              label="Base Currency"
              id="base-currency"
            />
          </div>
          
          <div>
            <CurrencySelect 
              value={targetCurrency} 
              onChange={handleTargetChange}
              label="Target Currency"
              id="target-currency"
            />
          </div>

          <div>
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              id="date-range"
              value={selectedRange}
              onChange={handleRangeChange}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-md mb-8">
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-0">
                {baseCurrency} to {targetCurrency} - {getSelectedRangeLabel()} History
              </h2>
              
              <div className="flex items-center">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                  <button
                    onClick={() => toggleViewMode('chart')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      viewMode === 'chart'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                    aria-label="Switch to chart view"
                  >
                    Chart
                  </button>
                  <button
                    onClick={() => toggleViewMode('details')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      viewMode === 'details'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                    aria-label="Switch to details view"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
            
            {viewMode === 'chart' ? (
              <HistoricalChart 
                baseCurrency={baseCurrency} 
                targetCurrency={targetCurrency} 
              />
            ) : (
              historicalData && (
                <HistoricalChartDetails 
                  historicalData={historicalData} 
                />
              )
            )}
          </div>
          
          {viewMode === 'chart' && historicalData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <HistoricalChartDetails 
                historicalData={historicalData} 
              />
            </div>
          )}
        </>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          About Historical Exchange Rates
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This chart displays the historical exchange rate between the selected base currency and target currency.
          You can select different time periods to view how the exchange rate has changed over time.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          The data is updated regularly from our exchange rate provider. In case of connectivity issues,
          we use cached data to ensure you always have access to historical trends.
        </p>
      </div>
    </div>
  );
};

export default HistoricalRates; 