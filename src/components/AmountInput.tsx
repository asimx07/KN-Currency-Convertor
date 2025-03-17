import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currencyCode?: string;
  label?: string;
  id?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  currencyCode,
  label = 'Amount',
  id = 'amount-input'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only allow numbers and decimal point
    if (newValue === '' || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >
        {label}
      </label>
      
      <div className="relative rounded-lg shadow-sm">
        <input
          type="text"
          id={id}
          value={value}
          onChange={handleChange}
          className="block w-full pl-4 pr-12 py-3 bg-white dark:bg-dark-300 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="0.00"
          aria-label={currencyCode ? `Amount in ${currencyCode}` : 'Amount'}
        />
        
        {currencyCode && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {currencyCode}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmountInput; 