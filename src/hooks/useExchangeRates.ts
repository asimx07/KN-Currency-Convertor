import { useState, useEffect, useCallback, useRef } from 'react';
import { ExchangeRate } from '../types';
import { getLatestRates } from '../services/api';
import { 
  getRatesFromStorage, 
  saveRatesToStorage, 
  areRatesStale 
} from '../utils/storage';
import { REFRESH_INTERVAL, DEFAULT_BASE_CURRENCY, API_KEY } from '../utils/constants';

interface UseExchangeRatesResult {
  rates: ExchangeRate | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refreshRates: () => Promise<void>;
}

const useExchangeRates = (baseCurrency: string = DEFAULT_BASE_CURRENCY): UseExchangeRatesResult => {
  // Get initial rates from storage only once during initialization
  const initialRatesRef = useRef(getRatesFromStorage());
  
  // State management
  const [rates, setRates] = useState<ExchangeRate | null>(initialRatesRef.current);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    initialRatesRef.current?.timestamp ? new Date(initialRatesRef.current.timestamp) : null
  );
  
  // Refs to prevent dependency cycles
  const isFetchingRef = useRef(false);
  const baseCurrencyRef = useRef(baseCurrency);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  
  // Internal fetch function that doesn't depend on any state
  const fetchRatesInternal = useCallback(() => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return Promise.resolve();
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    // Check if API key is available
    if (!API_KEY) {
      console.warn('API key is not set. Using fallback exchange rates.');
    }
    
    return getLatestRates(baseCurrencyRef.current)
      .then(freshRates => {
        setRates(freshRates);
        setLastUpdated(new Date(freshRates.timestamp));
        saveRatesToStorage(freshRates);
        return freshRates;
      })
      .catch(err => {
        // Error handling
        let errorMessage = 'Unknown error occurred';
        
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        const axiosError = err as any;
        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data;
          
          if (status === 400) {
            errorMessage = `Bad request (400): ${data?.error?.info || 'Invalid parameters'}`;
          } else if (status === 401) {
            errorMessage = 'API key is invalid or expired (401)';
          } else if (status === 429) {
            errorMessage = 'Rate limit exceeded (429). Try again later.';
          } else {
            errorMessage = `API error (${status}): ${data?.error?.info || errorMessage}`;
          }
        }
        
        console.error('Error fetching latest rates:', errorMessage);
        setError(new Error(errorMessage));
        
        // Fallback to cached rates
        const cachedRates = getRatesFromStorage();
        if (cachedRates) {
          console.log('Using cached rates due to API error');
          setRates(cachedRates);
          setLastUpdated(new Date(cachedRates.timestamp));
        }
        
        throw err;
      })
      .finally(() => {
        setLoading(false);
        isFetchingRef.current = false;
      });
  }, []);
  
  // Update baseCurrency ref when prop changes
  useEffect(() => {
    const prevBaseCurrency = baseCurrencyRef.current;
    baseCurrencyRef.current = baseCurrency;
    
    // Only fetch if base currency actually changed
    if (prevBaseCurrency !== baseCurrency) {
      fetchRatesInternal();
    }
  }, [baseCurrency, fetchRatesInternal]);
  
  // Setup initial fetch and interval - only run once on mount
  useEffect(() => {
    // Initial fetch if needed
    const shouldFetchInitially = !initialRatesRef.current || areRatesStale(REFRESH_INTERVAL);
    
    if (shouldFetchInitially) {
      fetchRatesInternal();
    }
    
    // Set up interval for periodic refresh
    intervalIdRef.current = setInterval(() => {
      fetchRatesInternal();
    }, REFRESH_INTERVAL * 3);
    
    // Cleanup on unmount
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [fetchRatesInternal]);
  
  // Public refresh function
  const refreshRates = useCallback((): Promise<void> => {
    return fetchRatesInternal()
      .then(() => {}) // Convert any successful result to void
      .catch(() => {}); // Swallow errors as they're already handled in fetchRatesInternal
  }, [fetchRatesInternal]);
  
  return {
    rates,
    loading,
    error,
    lastUpdated,
    refreshRates,
  };
};

export default useExchangeRates; 