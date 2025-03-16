import React, { useState, useEffect } from 'react';
import { Currency } from '../types';
import { CURRENCIES } from '../utils/constants';

interface MultiCurrencySelectProps {
  selectedCurrencies: string[];
  onChange: (currencies: string[]) => void;
  excludeCurrency?: string;
  label: string;
  id: string;
  disabled?: boolean;
}

const MultiCurrencySelect: React.FC<MultiCurrencySelectProps> = ({
  selectedCurrencies,
  onChange,
  excludeCurrency,
  label,
  id,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>([]);

  // Filter currencies when excludeCurrency changes
  useEffect(() => {
    setFilteredCurrencies(
      CURRENCIES.filter((currency) => currency.code !== excludeCurrency)
    );
  }, [excludeCurrency]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleToggle();
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  const handleCurrencyToggle = (currencyCode: string) => {
    const newSelectedCurrencies = selectedCurrencies.includes(currencyCode)
      ? selectedCurrencies.filter((code) => code !== currencyCode)
      : [...selectedCurrencies, currencyCode];
    
    onChange(newSelectedCurrencies);
  };

  const handleSelectAll = () => {
    onChange(filteredCurrencies.map((currency) => currency.code));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest(`#${id}-container`)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, id]);

  return (
    <div className="w-full relative" id={`${id}-container`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      
      <div
        id={id}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm px-3 py-2 flex justify-between items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
      >
        <div className="flex flex-wrap gap-1">
          {selectedCurrencies.length === 0 ? (
            <span className="text-gray-500 dark:text-gray-400">Select currencies</span>
          ) : (
            selectedCurrencies.map((code) => (
              <span 
                key={code} 
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded"
              >
                {code}
              </span>
            ))
          )}
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-300 dark:border-gray-700 max-h-60 overflow-auto">
          <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Clear All
            </button>
          </div>
          <ul className="py-1" role="listbox">
            {filteredCurrencies.map((currency) => {
              const isSelected = selectedCurrencies.includes(currency.code);
              return (
                <li
                  key={currency.code}
                  onClick={() => handleCurrencyToggle(currency.code)}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {currency.code} - {currency.name} ({currency.symbol})
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiCurrencySelect; 