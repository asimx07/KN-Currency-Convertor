import React from 'react';
import { ConversionResult as ConversionResultType } from '../types';
import { CURRENCIES } from '../utils/constants';

interface ConversionResultProps {
  result: ConversionResultType;
  onCopy: (result: ConversionResultType) => void;
}

const ConversionResult: React.FC<ConversionResultProps> = ({ result, onCopy }) => {
  const fromCurrencyData = CURRENCIES.find(c => c.code === result.fromCurrency);
  const toCurrencyData = CURRENCIES.find(c => c.code === result.toCurrency);
  
  const fromCurrencySymbol = fromCurrencyData?.symbol || '';
  const toCurrencySymbol = toCurrencyData?.symbol || '';
  
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
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-soft p-5 transition-all duration-300 hover:shadow-card-hover border border-gray-100 dark:border-gray-800">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Conversion Details */}
        <div className="flex-grow">
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                <span className="text-primary-700 dark:text-primary-300 text-lg font-medium">{fromCurrencyData?.symbol}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {fromCurrencyData?.code}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{fromCurrencyData?.name}</p>
              </div>
            </div>
            
            <div className="mx-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center mr-3">
                <span className="text-secondary-700 dark:text-secondary-300 text-lg font-medium">{toCurrencyData?.symbol}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {toCurrencyData?.code}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{toCurrencyData?.name}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {fromCurrencySymbol} {formattedAmount}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Converted Amount</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {toCurrencySymbol} {formattedResult}
              </p>
            </div>
          </div>
        </div>
        
        {/* Copy Button */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center">
          <div 
            className="flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-colors duration-200"
            onClick={handleCopyClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Copy ${result.fromCurrency} to ${result.toCurrency} conversion result`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
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
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <p>Exchange Rate: 1 {result.fromCurrency} = {formattedRate} {result.toCurrency}</p>
            <p className="mt-1 text-right">
              Last updated: {new Date(result.date).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionResult; 