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
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      
      <div
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm px-3 py-2 flex justify-between items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id}
      >
        <div className="flex items-center">
          <span className="mr-2">{selectedCurrency.symbol}</span>
          <span>{selectedCurrency.code} - {selectedCurrency.name}</span>
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
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              id={`${id}-input`}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by currency code or name..."
              value={searchTerm}
              onChange={handleSearchChange}
              autoFocus
            />
          </div>
          
          <ul className="py-1" role="listbox">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <li
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency.code)}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    currency.code === value ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                  role="option"
                  aria-selected={currency.code === value}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{currency.symbol}</span>
                    <span className="font-medium">{currency.code}</span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">- {currency.name}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
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