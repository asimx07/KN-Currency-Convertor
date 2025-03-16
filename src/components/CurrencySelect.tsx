import React from 'react';
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
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="w-full">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={label}
        tabIndex={0}
      >
        {CURRENCIES.map((currency: Currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name} ({currency.symbol})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelect; 