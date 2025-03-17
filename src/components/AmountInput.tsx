import React from 'react';

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
  currencyCode?: string;
  label?: string;
  id?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  isLoading = false,
  error,
  className = '',
  currencyCode,
  label = 'Amount',
  id = 'amount-input'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange(value);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >
        {label}
      </label>
      
      <div className="relative rounded-lg shadow-sm">
        <input
          type="number"
          id={id}
          role="spinbutton"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className={`
            block w-full pl-4 pr-12 py-3 bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200 text-gray-900 dark:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 dark:border-red-400' : ''}
          `}
          placeholder="0.00"
          aria-label={currencyCode ? `Amount in ${currencyCode}` : 'Amount'}
          aria-invalid={!!error}
          aria-describedby={error ? 'amount-error' : undefined}
        />
        
        {currencyCode && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {currencyCode}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p
          id="amount-error"
          className="mt-1 text-sm text-red-500 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default AmountInput; 