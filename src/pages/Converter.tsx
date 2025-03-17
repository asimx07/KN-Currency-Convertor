import React, { useState, useEffect, useCallback, useRef } from 'react';
import AmountInput from '../components/AmountInput';
import CurrencySelect from '../components/CurrencySelect';
import MultiCurrencySelect from '../components/MultiCurrencySelect';
import ConversionResult from '../components/ConversionResult';
import LoadingSpinner from '../components/LoadingSpinner';
import LastUpdated from '../components/LastUpdated';
import SocialShare from '../components/SocialShare';
import FavoriteCurrencies from '../components/FavoriteCurrencies';
import useCurrencyConverter from '../hooks/useCurrencyConverter';
import useExchangeRates from '../hooks/useExchangeRates';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { ConversionResult as ConversionResultType } from '../types';
import { DEFAULT_BASE_CURRENCY, DEFAULT_TARGET_CURRENCIES } from '../utils/constants';

const Converter: React.FC = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>(DEFAULT_BASE_CURRENCY);
  const [toCurrency, setToCurrency] = useState<string>(DEFAULT_TARGET_CURRENCIES[0]);
  const [additionalCurrencies, setAdditionalCurrencies] = useState<string[]>(DEFAULT_TARGET_CURRENCIES.slice(1));
  const [conversionResults, setConversionResults] = useState<ConversionResultType[]>([]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // Get user preferences
  const { preferences, updateLastUsedCurrencies, toggleReversed } = useUserPreferences();
  
  // Debounce timer for amount changes
  const [debouncedAmount, setDebouncedAmount] = useState<string>(amount);
  
  // Use refs to track component state
  const skipConversionRef = useRef(false);
  const isInitialRenderRef = useRef(true);

  // Get rates for the base currency
  const { rates, loading: ratesLoading, error: ratesError, lastUpdated, refreshRates } = useExchangeRates(fromCurrency);
  const { convert, loading: conversionLoading } = useCurrencyConverter();

  // Target currencies include the main toCurrency and any additional currencies
  // Memoize this to prevent unnecessary re-renders
  const targetCurrencies = useCallback(() => {
    return [toCurrency, ...additionalCurrencies];
  }, [toCurrency, additionalCurrencies]);

  // Load user preferences
  useEffect(() => {
    // Only run this effect once on mount
    const fromCurrencyFromPrefs = preferences.lastUsedCurrencies.from;
    const toCurrenciesFromPrefs = preferences.lastUsedCurrencies.to;
    
    if (fromCurrencyFromPrefs) {
      setFromCurrency(fromCurrencyFromPrefs);
    }
    
    if (toCurrenciesFromPrefs.length > 0) {
      setToCurrency(toCurrenciesFromPrefs[0]);
      setAdditionalCurrencies(toCurrenciesFromPrefs.slice(1));
    }
    
    // If reversed is true, swap from and to currencies
    if (preferences.isReversed && fromCurrencyFromPrefs && toCurrenciesFromPrefs.length > 0) {
      setFromCurrency(toCurrenciesFromPrefs[0]);
      setToCurrency(fromCurrencyFromPrefs);
    }
  }, []);

  // Save user preferences when they change
  useEffect(() => {
    // Skip the initial render to prevent infinite loops
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }
    
    updateLastUsedCurrencies(fromCurrency, [toCurrency, ...additionalCurrencies]);
  }, [fromCurrency, toCurrency, additionalCurrencies, updateLastUsedCurrencies]);

  // Debounce amount changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 500);
    return () => clearTimeout(timer);
  }, [amount]);

  // Perform conversion when relevant inputs change
  useEffect(() => {
    if (skipConversionRef.current) {
      skipConversionRef.current = false;
      return;
    }

    const performConversion = async () => {
      if (!debouncedAmount || isNaN(parseFloat(debouncedAmount)) || parseFloat(debouncedAmount) <= 0) {
        setConversionResults([]);
        return;
      }

      // Convert to all target currencies at once
      const results = await convert(
        parseFloat(debouncedAmount),
        fromCurrency,
        targetCurrencies()
      );

      setConversionResults(results);
    };

    performConversion();
  }, [debouncedAmount, fromCurrency, toCurrency, additionalCurrencies, convert, targetCurrencies]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  const handleFromCurrencyChange = (value: string) => {
    setFromCurrency(value);
  };

  const handleToCurrencyChange = (value: string) => {
    // If the new toCurrency is already in additionalCurrencies, swap them
    if (additionalCurrencies.includes(value)) {
      const newAdditional = [...additionalCurrencies];
      const index = newAdditional.indexOf(value);
      newAdditional[index] = toCurrency;
      setToCurrency(value);
      setAdditionalCurrencies(newAdditional);
    } else {
      setToCurrency(value);
    }
  };

  const handleAdditionalCurrenciesChange = (currencies: string[]) => {
    // Make sure toCurrency is not in the additional currencies
    const filteredCurrencies = currencies.filter(c => c !== toCurrency);
    setAdditionalCurrencies(filteredCurrencies);
  };

  const handleSwapCurrencies = () => {
    // Swap the from and to currencies
    const tempFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempFrom);
    
    // Also toggle the reversed state in preferences
    toggleReversed();
    
    // Skip the next conversion effect since we're manually updating the results
    skipConversionRef.current = true;
  };

  const handleFavoriteCurrencySelect = (currencyCode: string) => {
    if (currencyCode === fromCurrency) return;
    
    if (currencyCode === toCurrency) {
      // If it's already the main target currency, do nothing
      return;
    } else if (additionalCurrencies.includes(currencyCode)) {
      // If it's in additional currencies, make it the main target
      const newAdditional = [...additionalCurrencies];
      const index = newAdditional.indexOf(currencyCode);
      newAdditional[index] = toCurrency;
      setToCurrency(currencyCode);
      setAdditionalCurrencies(newAdditional);
    } else {
      // Otherwise, set it as the main target
      setToCurrency(currencyCode);
    }
  };

  const handleCopySuccess = (message: string) => {
    setCopySuccess(message);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Currency Converter
      </h1>
      
      {/* Favorites Section */}
      <FavoriteCurrencies 
        onSelectCurrency={handleFavoriteCurrencySelect}
        className="mb-6"
      />
      
      {/* Converter Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <AmountInput 
              value={amount} 
              onChange={handleAmountChange} 
              currencyCode={fromCurrency}
              label="Amount" 
              id="amount"
            />
          </div>
          
          <div className="flex items-end space-x-4">
            <div className="flex-grow">
              <CurrencySelect 
                value={fromCurrency} 
                onChange={handleFromCurrencyChange} 
                label="From" 
                id="from-currency"
              />
            </div>
            
            <button 
              onClick={handleSwapCurrencies}
              className="mb-2 p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Swap currencies"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
              </svg>
            </button>
            
            <div className="flex-grow">
              <CurrencySelect 
                value={toCurrency} 
                onChange={handleToCurrencyChange} 
                label="To" 
                id="to-currency"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <MultiCurrencySelect 
            selectedCurrencies={additionalCurrencies}
            onChange={handleAdditionalCurrenciesChange}
            excludeCurrency={`${fromCurrency},${toCurrency}`}
            label="Additional Currencies (Optional)"
            id="additional-currencies"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <LastUpdated 
            date={lastUpdated} 
            loading={ratesLoading} 
            onRefresh={refreshRates} 
            error={ratesError}
          />
          
          {ratesError && (
            <div className="text-red-500 text-sm">
              Error loading rates. Using cached data.
            </div>
          )}
        </div>
      </div>
      
      {/* Results Section */}
      {(ratesLoading || conversionLoading) ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : conversionResults.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Conversion Results
            </h2>
            
            {conversionResults.length > 0 && (
              <SocialShare conversionResult={conversionResults[0]} />
            )}
          </div>
          
          <div className="space-y-4">
            {conversionResults.map((result, index) => (
              <ConversionResult 
                key={`${result.fromCurrency}-${result.toCurrency}-${index}`}
                result={result}
                onCopy={() => handleCopySuccess(`Copied ${result.fromCurrency} to ${result.toCurrency} conversion`)}
              />
            ))}
          </div>
          
          {copySuccess && (
            <div className="mt-4 p-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-sm">
              {copySuccess}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Converter; 