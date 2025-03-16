import React from 'react';
import { ConversionResult as ConversionResultType } from '../types';
import { CURRENCIES } from '../utils/constants';

interface ConversionResultProps {
  result: ConversionResultType;
  onCopy: (result: ConversionResultType) => void;
}

const ConversionResult: React.FC<ConversionResultProps> = ({ result, onCopy }) => {
  const fromCurrencySymbol = CURRENCIES.find(c => c.code === result.fromCurrency)?.symbol || '';
  const toCurrencySymbol = CURRENCIES.find(c => c.code === result.toCurrency)?.symbol || '';
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(result.amount);
  
  const formattedResult = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(result.result);
  
  const formattedRate = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(result.rate);

  const handleCopyClick = () => {
    onCopy(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onCopy(result);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {result.fromCurrency} to {result.toCurrency}
        </h3>
        <div 
          className="text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
          onClick={handleCopyClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`Copy ${result.fromCurrency} to ${result.toCurrency} conversion result`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
          Copy
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {fromCurrencySymbol} {formattedAmount}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Converted Amount</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {toCurrencySymbol} {formattedResult}
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Exchange Rate: 1 {result.fromCurrency} = {formattedRate} {result.toCurrency}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Last updated: {new Date(result.date).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ConversionResult; 