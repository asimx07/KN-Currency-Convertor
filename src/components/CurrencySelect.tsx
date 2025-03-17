import React, { useState, useEffect, useRef } from 'react';
import { Currency } from '../types';
import { CURRENCIES } from '../utils/constants';

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
  disabled?: boolean;
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({
  value,
  onChange,
  label,
  id,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>(CURRENCIES);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get the selected currency details
  const selectedCurrency = CURRENCIES.find(currency => currency.code === value) || CURRENCIES[0];

  // Filter currencies based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCurrencies(CURRENCIES);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = CURRENCIES.filter(currency => 
      currency.code.toLowerCase().includes(lowerCaseSearch) || 
      currency.name.toLowerCase().includes(lowerCaseSearch)
    );
    
    setFilteredCurrencies(filtered);
  }, [searchTerm]);

  // Handle click outside to close dropdown
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCurrencySelect = (currencyCode: string) => {
    onChange(currencyCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleDropdown();
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <label 
        htmlFor={`${id}-input`} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >
        {label}
      </label>
      
      <div
        className={`bg-white dark:bg-dark-300 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm px-4 py-3 flex justify-between items-center cursor-pointer transition-all duration-200 
          ${disabled 
            ? 'opacity-60 cursor-not-allowed' 
            : 'hover:border-primary-300 dark:hover:border-primary-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
          }`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
            <span className="text-primary-700 dark:text-primary-300 text-lg font-medium">{selectedCurrency.symbol}</span>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{selectedCurrency.code}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{selectedCurrency.name}</div>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
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
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-300 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
          <div className="sticky top-0 bg-white dark:bg-dark-300 p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id={`${id}-input`}
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-dark-200 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by currency code or name..."
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
              />
            </div>
          </div>
          
          <ul className="py-1" role="listbox">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <li
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency.code)}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-150 ${
                    currency.code === value ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                  role="option"
                  aria-selected={currency.code === value}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                      <span className="text-primary-700 dark:text-primary-300">{currency.symbol}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{currency.code}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{currency.name}</div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                No currencies found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrencySelect; 