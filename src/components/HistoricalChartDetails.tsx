import React, { useState, useEffect } from 'react';
import { HistoricalData } from '../types';

interface HistoricalChartDetailsProps {
  historicalData: HistoricalData | null;
  className?: string;
}

const HistoricalChartDetails: React.FC<HistoricalChartDetailsProps> = ({
  historicalData,
  className = '',
}) => {
  const [stats, setStats] = useState<{
    min: { value: number; date: string } | null;
    max: { value: number; date: string } | null;
    avg: number | null;
    change: { value: number; percentage: number } | null;
  }>({
    min: null,
    max: null,
    avg: null,
    change: null,
  });

  useEffect(() => {
    if (!historicalData || !historicalData.rates.length) {
      setStats({ min: null, max: null, avg: null, change: null });
      return;
    }

    // Calculate statistics
    const rates = historicalData.rates;
    const dates = historicalData.dates;
    
    // Find min and max
    let minValue = rates[0];
    let minDate = dates[0];
    let maxValue = rates[0];
    let maxDate = dates[0];
    
    rates.forEach((rate, index) => {
      if (rate < minValue) {
        minValue = rate;
        minDate = dates[index];
      }
      if (rate > maxValue) {
        maxValue = rate;
        maxDate = dates[index];
      }
    });
    
    // Calculate average
    const sum = rates.reduce((acc, rate) => acc + rate, 0);
    const avg = sum / rates.length;
    
    // Calculate change (first to last)
    const firstRate = rates[0];
    const lastRate = rates[rates.length - 1];
    const changeValue = lastRate - firstRate;
    const changePercentage = (changeValue / firstRate) * 100;
    
    setStats({
      min: { value: minValue, date: minDate },
      max: { value: maxValue, date: maxDate },
      avg: avg,
      change: { value: changeValue, percentage: changePercentage },
    });
  }, [historicalData]);

  if (!historicalData || !stats.min || !stats.max || stats.avg === null || !stats.change) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatRate = (rate: number) => {
    return rate.toFixed(4);
  };

  // Get date range description
  const getDateRangeDescription = () => {
    if (!historicalData || !historicalData.dates.length) return '';
    
    const firstDate = new Date(historicalData.dates[0]);
    const lastDate = new Date(historicalData.dates[historicalData.dates.length - 1]);
    
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return `${firstDate.toLocaleDateString(undefined, options)} - ${lastDate.toLocaleDateString(undefined, options)}`;
  };

  // Get recent rates description
  const getRecentRatesDescription = () => {
    if (!historicalData || historicalData.dates.length < 7) {
      return 'All Available Data';
    }
    
    const recentDates = historicalData.dates.slice(-7);
    const firstDate = new Date(recentDates[0]);
    const lastDate = new Date(recentDates[recentDates.length - 1]);
    
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return `${firstDate.toLocaleDateString(undefined, options)} - ${lastDate.toLocaleDateString(undefined, options)}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">
        Key Statistics
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Data period: {getDateRangeDescription()}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400">Lowest Rate</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {formatRate(stats.min.value)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            on {formatDate(stats.min.date)}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400">Highest Rate</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {formatRate(stats.max.value)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            on {formatDate(stats.max.date)}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400">Average Rate</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {formatRate(stats.avg)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            over entire period
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400">Overall Change</div>
          <div className={`text-lg font-semibold ${
            stats.change.value > 0 
              ? 'text-green-600 dark:text-green-400' 
              : stats.change.value < 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-800 dark:text-white'
          }`}>
            {stats.change.value > 0 ? '+' : ''}{formatRate(stats.change.value)} 
            ({stats.change.percentage > 0 ? '+' : ''}{stats.change.percentage.toFixed(2)}%)
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            first to last day
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recent Exchange Rates
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getRecentRatesDescription()}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rate (1 {historicalData.base} = X {historicalData.target})
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Daily Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {historicalData.dates.slice(-7).map((date, index) => {
                const rate = historicalData.rates[historicalData.dates.indexOf(date)];
                const prevIndex = historicalData.dates.indexOf(date) - 1;
                const prevRate = prevIndex >= 0 ? historicalData.rates[prevIndex] : null;
                const dailyChange = prevRate !== null ? rate - prevRate : null;
                const dailyChangePercentage = prevRate !== null ? (dailyChange! / prevRate) * 100 : null;
                
                return (
                  <tr key={date}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(date)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatRate(rate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {dailyChange !== null ? (
                        <span className={`${
                          dailyChange > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : dailyChange < 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {dailyChange > 0 ? '+' : ''}{formatRate(dailyChange)} 
                          ({dailyChangePercentage! > 0 ? '+' : ''}{dailyChangePercentage!.toFixed(2)}%)
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">First day</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoricalChartDetails; 