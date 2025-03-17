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
  refreshRates: () => void;
}

// Track the last API request time globally to prevent rate limiting
let lastApiRequestTime = 0;
const MIN_REQUEST_INTERVAL = 10 * 60 * 1000; // 10 minutes minimum between API calls

const useExchangeRates = (baseCurrency: string = DEFAULT_BASE_CURRENCY): UseExchangeRatesResult => {
  // Initialize state from localStorage
  const initialRates = useRef(getRatesFromStorage()).current;
  
  // State
  const [rates, setRates] = useState<ExchangeRate | null>(initialRates);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    initialRates?.timestamp ? new Date(initialRates.timestamp) : null
  );
  
  // Refs to prevent dependency issues
  const isFetchingRef = useRef(false);
  const currentBaseCurrencyRef = useRef(baseCurrency);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  // Check if we should make an API request based on rate limiting
  const shouldMakeApiRequest = useCallback(() => {
    const now = Date.now();
    if (now - lastApiRequestTime < MIN_REQUEST_INTERVAL) {
      console.log('Throttling API request - using cached data');
      return false;
    }
    return true;
  }, []);
  
  // Fetch rates function with rate limiting
  const fetchRates = useCallback(async (forceRefresh = false) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current || !mountedRef.current) return;
    
    // Check rate limiting unless forced refresh
    if (!forceRefresh && !shouldMakeApiRequest()) {
      // Use cached rates instead
      const cachedRates = getRatesFromStorage();
      if (cachedRates) {
        setRates(cachedRates);
        setLastUpdated(new Date(cachedRates.timestamp));
        return;
      }
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      // Update the last request time
      lastApiRequestTime = Date.now();
      
      const freshRates = await getLatestRates(currentBaseCurrencyRef.current);
      
      if (mountedRef.current) {
        setRates(freshRates);
        setLastUpdated(new Date(freshRates.timestamp));
        setError(null);
        saveRatesToStorage(freshRates);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('Error fetching rates:', err);
      
      // Handle rate limit errors specifically
      const axiosError = err as any;
      if (axiosError.response && axiosError.response.status === 429) {
        console.warn('Rate limit exceeded (429). Using cached data and will retry later.');
      }
      
      setError(new Error(err instanceof Error ? err.message : 'Failed to fetch rates'));
      
      // Use cached rates if available
      const cachedRates = getRatesFromStorage();
      if (cachedRates) {
        setRates(cachedRates);
        setLastUpdated(new Date(cachedRates.timestamp));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [shouldMakeApiRequest]);
  
  // Public refresh function - force refresh regardless of rate limiting
  const refreshRates = useCallback(() => {
    fetchRates(true);
  }, [fetchRates]);
  
  // Update base currency ref when it changes
  useEffect(() => {
    currentBaseCurrencyRef.current = baseCurrency;
    
    // Only fetch if we have a different base currency
    if (rates && rates.base !== baseCurrency && !isFetchingRef.current) {
      fetchRates(false);
    }
  }, [baseCurrency, fetchRates]);
  
  // Initial fetch and interval setup - ONLY RUN ONCE
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch if needed
    if (!initialRates || areRatesStale(REFRESH_INTERVAL)) {
      fetchRates(false);
    }
    
    // Set up refresh interval - much less frequent to avoid rate limiting
    intervalRef.current = setInterval(() => {
      if (!isFetchingRef.current) {
        fetchRates(false);
      }
    }, REFRESH_INTERVAL * 6); // 6 hours if REFRESH_INTERVAL is 1 hour
    
    // Cleanup
    return () => {
      mountedRef.current = false;
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchRates]); // Remove rates dependency to prevent infinite loop
  
  return {
    rates,
    loading,
    error,
    lastUpdated,
    refreshRates
  };
};

export default useExchangeRates; 