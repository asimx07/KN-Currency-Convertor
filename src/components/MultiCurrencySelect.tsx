import React, { useState, useEffect, useRef } from 'react';
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
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          id={`${id}-button`}
          onClick={handleToggle}
          className={`w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-dark-300 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all duration-200
            ${disabled 
              ? 'opacity-60 cursor-not-allowed' 
              : 'hover:border-primary-300 dark:hover:border-primary-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
            }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          tabIndex={0}
        >
          <span className="block truncate text-left text-gray-900 dark:text-white">
            {getButtonText()}
          </span>
          <span className="ml-2 pointer-events-none">
            <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-300 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto focus:outline-none max-h-60">
            <div className="sticky top-0 z-10 bg-white dark:bg-dark-300 p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-dark-200 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search currencies..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="flex justify-between mt-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm px-3 py-1.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors duration-200"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-sm px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <ul className="py-1 overflow-auto" role="listbox" aria-labelledby={`${id}-button`}>
              {filteredCurrencies.length === 0 ? (
                <li className="text-gray-500 dark:text-gray-400 px-4 py-3 text-sm text-center">
                  No currencies found
                </li>
              ) : (
                filteredCurrencies.map(currency => {
                  const isSelected = selectedCurrencies.includes(currency.code);
                  return (
                    <li
                      key={currency.code}
                      onClick={() => handleCurrencyToggle(currency.code)}
                      className={`cursor-pointer select-none relative py-2.5 pl-4 pr-10 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-150 ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                          <span className="text-primary-700 dark:text-primary-300">{currency.symbol}</span>
                        </div>
                        <div>
                          <div className={`font-medium text-gray-900 dark:text-white ${isSelected ? 'font-semibold' : ''}`}>
                            {currency.code}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {currency.name}
                          </div>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600 dark:text-primary-400">
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
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedCurrencies.map(code => {
            const currency = CURRENCIES.find(c => c.code === code);
            if (!currency) return null;
            
            return (
              <div 
                key={code}
                className="inline-flex items-center bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-lg text-sm border border-primary-100 dark:border-primary-800"
              >
                <span className="mr-1.5 font-medium">{currency.symbol}</span>
                <span>{currency.code}</span>
                <button
                  type="button"
                  onClick={() => handleCurrencyToggle(code)}
                  className="ml-2 text-primary-500 hover:text-primary-700 dark:hover:text-primary-200 focus:outline-none transition-colors duration-200"
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