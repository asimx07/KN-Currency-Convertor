import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currencyCode?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  currencyCode,
  label = 'Amount',
  id = 'amount-input',
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only allow numbers and decimal point
    if (/^$|^[0-9]+\.?[0-9]*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      <div className="relative rounded-md shadow-sm">
        <input
          type="text"
          id={id}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="block w-full px-3 py-2 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="0.00"
          aria-label={`Amount in ${currencyCode || ''}`}
          tabIndex={0}
        />
        {currencyCode && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
              {currencyCode}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmountInput; 