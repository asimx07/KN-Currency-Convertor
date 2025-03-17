import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Currency } from '../types';
import { CURRENCIES } from '../utils/constants';

interface MultiCurrencySelectProps {
  selectedCurrencies: string[];
  onChange: (currencies: string[]) => void;
  excludeCurrency?: string;
  excludeCurrencies?: string[];
  label: string;
  id: string;
  disabled?: boolean;
}

const MultiCurrencySelect: React.FC<MultiCurrencySelectProps> = ({
  selectedCurrencies,
  onChange,
  excludeCurrency,
  excludeCurrencies = [],
  label,
  id,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Combine excludeCurrency and excludeCurrencies for backward compatibility
  const allExcludedCurrencies = excludeCurrency 
    ? [...excludeCurrencies, ...excludeCurrency.split(',')] 
    : excludeCurrencies;

  // Filter currencies based on search term and excluded currencies
  const filteredCurrencies = CURRENCIES.filter(currency => {
    const matchesSearch = currency.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         currency.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isExcluded = allExcludedCurrencies.includes(currency.code);
    return matchesSearch && !isExcluded;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Toggle currency selection
  const handleCurrencyToggle = (currencyCode: string) => {
    const newSelectedCurrencies = selectedCurrencies.includes(currencyCode)
      ? selectedCurrencies.filter(code => code !== currencyCode)
      : [...selectedCurrencies, currencyCode];
    
    onChange(newSelectedCurrencies);
  };

  // Select all visible currencies
  const handleSelectAll = () => {
    onChange([...selectedCurrencies, ...filteredCurrencies.map(c => c.code).filter(code => !selectedCurrencies.includes(code))]);
  };

  // Clear all selected currencies
  const handleClearAll = () => {
    onChange([]);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Get display text for the dropdown button
  const getButtonText = () => {
    if (selectedCurrencies.length === 0) {
      return 'Select currencies';
    } else if (selectedCurrencies.length === 1) {
      const currency = CURRENCIES.find(c => c.code === selectedCurrencies[0]);
      return currency ? `${currency.code} - ${currency.name}` : 'Select currencies';
    } else {
      return `${selectedCurrencies.length} currencies selected`;
    }
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      <label 
        htmlFor={`${id}-button`}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          id={`${id}-button`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-full flex justify-between items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          tabIndex={0}
        >
          <span className="block truncate text-left">
            {getButtonText()}
          </span>
          <span className="ml-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none max-h-60">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              
              <div className="flex justify-between mt-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <ul className="py-1 overflow-auto" role="listbox" aria-labelledby={`${id}-button`}>
              {filteredCurrencies.length === 0 ? (
                <li className="text-gray-500 dark:text-gray-400 px-4 py-2 text-sm">
                  No currencies found
                </li>
              ) : (
                filteredCurrencies.map(currency => {
                  const isSelected = selectedCurrencies.includes(currency.code);
                  return (
                    <li
                      key={currency.code}
                      onClick={() => handleCurrencyToggle(currency.code)}
                      className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-300'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{currency.symbol}</span>
                        <span className={`font-medium ${isSelected ? 'font-semibold' : ''}`}>
                          {currency.code}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {currency.name}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
      
      {selectedCurrencies.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedCurrencies.map(code => {
            const currency = CURRENCIES.find(c => c.code === code);
            if (!currency) return null;
            
            return (
              <div 
                key={code}
                className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-sm"
              >
                <span className="mr-1">{currency.symbol}</span>
                <span>{currency.code}</span>
                <button
                  type="button"
                  onClick={() => handleCurrencyToggle(code)}
                  className="ml-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-200 focus:outline-none"
                  aria-label={`Remove ${currency.code}`}
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiCurrencySelect; 