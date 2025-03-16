import React, { useState, useEffect, useCallback } from 'react';
import AmountInput from '../components/AmountInput';
import CurrencySelect from '../components/CurrencySelect';
import MultiCurrencySelect from '../components/MultiCurrencySelect';
import ConversionResult from '../components/ConversionResult';
import LoadingSpinner from '../components/LoadingSpinner';
import LastUpdated from '../components/LastUpdated';
import useCurrencyConverter from '../hooks/useCurrencyConverter';
import useExchangeRates from '../hooks/useExchangeRates';
import { ConversionResult as ConversionResultType } from '../types';
import { DEFAULT_BASE_CURRENCY, DEFAULT_TARGET_CURRENCIES } from '../utils/constants';
import { getPreferencesFromStorage, savePreferencesToStorage } from '../utils/storage';

const Converter: React.FC = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>(DEFAULT_BASE_CURRENCY);
  const [toCurrencies, setToCurrencies] = useState<string[]>(DEFAULT_TARGET_CURRENCIES);
  const [conversionResults, setConversionResults] = useState<ConversionResultType[]>([]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isReversed, setIsReversed] = useState<boolean>(false);
  
  // Debounce timer for amount changes
  const [debouncedAmount, setDebouncedAmount] = useState<string>(amount);

  // Use the appropriate base currency based on the conversion direction
  const baseCurrency = isReversed ? (toCurrencies.length > 0 ? toCurrencies[0] : DEFAULT_TARGET_CURRENCIES[0]) : fromCurrency;
  
  const { rates, loading: ratesLoading, error: ratesError, lastUpdated, refreshRates } = useExchangeRates(baseCurrency);
  const { convert, loading: conversionLoading } = useCurrencyConverter();

  // Load user preferences
  useEffect(() => {
    const preferences = getPreferencesFromStorage();
    setFromCurrency(preferences.lastUsedCurrencies.from);
    setToCurrencies(preferences.lastUsedCurrencies.to);
    // Load the reversed state if it exists in preferences
    if (preferences.isReversed !== undefined) {
      setIsReversed(preferences.isReversed);
    }
  }, []);

  // Save user preferences when they change
  useEffect(() => {
    const preferences = getPreferencesFromStorage();
    const updatedPreferences = {
      ...preferences,
      lastUsedCurrencies: {
        from: fromCurrency,
        to: toCurrencies,
      },
      isReversed,
    };
    savePreferencesToStorage(updatedPreferences);
  }, [fromCurrency, toCurrencies, isReversed]);

  // Debounce amount changes to prevent excessive conversions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 500); // 500ms delay
    
    return () => clearTimeout(timer);
  }, [amount]);

  // Perform conversion when inputs change or rates are updated
  useEffect(() => {
    if (debouncedAmount && fromCurrency && toCurrencies.length > 0 && rates) {
      const numericAmount = parseFloat(debouncedAmount);
      if (!isNaN(numericAmount)) {
        if (isReversed) {
          // In reversed mode, convert from the first target currency to the base currency
          const targetCurrency = toCurrencies[0];
          const results = convert(numericAmount, targetCurrency, [fromCurrency]);
          setConversionResults(results);
        } else {
          // Normal mode: convert from base to all target currencies
          const results = convert(numericAmount, fromCurrency, toCurrencies);
          setConversionResults(results);
        }
      }
    }
  }, [debouncedAmount, fromCurrency, toCurrencies, rates, convert, isReversed]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  const handleFromCurrencyChange = (value: string) => {
    setFromCurrency(value);
  };

  const handleToCurrenciesChange = (currencies: string[]) => {
    setToCurrencies(currencies);
  };

  // Memoized copy function to prevent unnecessary re-renders
  const handleCopyResult = useCallback((result: ConversionResultType) => {
    const textToCopy = `${result.amount} ${result.fromCurrency} = ${result.result.toFixed(4)} ${result.toCurrency} (Rate: ${result.rate.toFixed(6)})`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopySuccess(`Copied ${result.fromCurrency} to ${result.toCurrency}`);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(() => {
        setCopySuccess('Failed to copy');
        setTimeout(() => setCopySuccess(null), 2000);
      });
  }, []);

  // Manual refresh with throttling
  const handleRefresh = useCallback(() => {
    refreshRates();
  }, [refreshRates]);

  // Toggle between normal and reversed conversion
  const handleDirectionToggle = () => {
    setIsReversed(!isReversed);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Currency Converter
      </h1>
      
      {ratesError && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">Error loading exchange rates</p>
          <p>{ratesError.message}</p>
          <p className="text-sm mt-1">Using cached rates if available. You can try again later.</p>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
        {/* Direction toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center">
            <span className={`mr-2 text-sm ${isReversed ? 'text-gray-500' : 'font-medium text-gray-700 dark:text-white'}`}>
              PKR to Foreign
            </span>
            <button 
              type="button"
              onClick={handleDirectionToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isReversed ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              aria-pressed={isReversed}
              aria-labelledby="conversion-direction"
            >
              <span className="sr-only">Toggle conversion direction</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isReversed ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <span className={`ml-2 text-sm ${isReversed ? 'font-medium text-gray-700 dark:text-white' : 'text-gray-500'}`}>
              Foreign to PKR
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <AmountInput
            value={amount}
            onChange={handleAmountChange}
            currencyCode={isReversed ? (toCurrencies.length > 0 ? toCurrencies[0] : DEFAULT_TARGET_CURRENCIES[0]) : fromCurrency}
            disabled={ratesLoading}
          />
          
          {isReversed ? (
            <CurrencySelect
              id="to-currency"
              label="From Currency"
              value={toCurrencies.length > 0 ? toCurrencies[0] : DEFAULT_TARGET_CURRENCIES[0]}
              onChange={(value) => setToCurrencies([value])}
              disabled={ratesLoading}
            />
          ) : (
            <CurrencySelect
              id="from-currency"
              label="From Currency"
              value={fromCurrency}
              onChange={handleFromCurrencyChange}
              disabled={ratesLoading}
            />
          )}
        </div>
        
        <div className="mb-4">
          {isReversed ? (
            <CurrencySelect
              id="from-currency-reversed"
              label="To Currency"
              value={fromCurrency}
              onChange={handleFromCurrencyChange}
              disabled={ratesLoading}
            />
          ) : (
            <MultiCurrencySelect
              id="to-currencies"
              label="To Currencies"
              selectedCurrencies={toCurrencies}
              onChange={handleToCurrenciesChange}
              excludeCurrency={fromCurrency}
              disabled={ratesLoading}
            />
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <LastUpdated
            date={lastUpdated}
            loading={ratesLoading}
            onRefresh={handleRefresh}
            error={ratesError}
          />
          
          {copySuccess && (
            <div className="text-sm text-green-600 dark:text-green-400">
              {copySuccess}
            </div>
          )}
        </div>
      </div>
      
      {(ratesLoading || conversionLoading) && (
        <div className="flex justify-center my-8">
          <LoadingSpinner 
            size="large" 
            message={ratesLoading ? "Fetching latest exchange rates..." : "Calculating conversion results..."}
          />
        </div>
      )}
      
      {!ratesLoading && !conversionLoading && conversionResults.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">No conversion results</p>
          <p>Please enter a valid amount and select currencies to convert.</p>
        </div>
      )}
      
      {!ratesLoading && !conversionLoading && conversionResults.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Conversion Results
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conversionResults.map((result) => (
              <ConversionResult
                key={`${result.fromCurrency}-${result.toCurrency}`}
                result={result}
                onCopy={handleCopyResult}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Converter; 