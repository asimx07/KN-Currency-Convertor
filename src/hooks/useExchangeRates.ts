import { useState, useEffect, useCallback, useRef } from 'react';
import { ExchangeRate } from '../types';
import { getLatestRates } from '../services/api';
import { 
  getRatesFromStorage, 
  saveRatesToStorage, 
  areRatesStale 
} from '../utils/storage';
import { REFRESH_INTERVAL, API_KEY } from '../utils/constants';

interface UseExchangeRatesResult {
  rates: ExchangeRate | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refreshRates: () => Promise<void>;
}

const useExchangeRates = (baseCurrency: string = 'PKR'): UseExchangeRatesResult => {
  const [rates, setRates] = useState<ExchangeRate | null>(getRatesFromStorage());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    rates?.timestamp ? new Date(rates.timestamp) : null
  );
  
  // Use a ref to track if a fetch is in progress to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false);
  // Use a ref to store the interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRates = useCallback(async () => {
    // If already fetching or loading state is true, don't fetch again
    if (isFetchingRef.current || loading) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // If API key is not set, show a warning but continue with fallback data
      if (!API_KEY) {
        console.warn('API key is not set. Using fallback exchange rates.');
      }
      
      const freshRates = await getLatestRates(baseCurrency);
      setRates(freshRates);
      setLastUpdated(new Date(freshRates.timestamp));
      saveRatesToStorage(freshRates);
    } catch (err) {
      // Improved error handling with more specific error messages
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      // Check for axios error with response data
      const axiosError = err as any;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data;
        
        if (status === 400) {
          errorMessage = `Bad request (400): ${data?.error?.info || 'Invalid parameters'}`;
          console.error('API 400 error details:', data);
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
      
      // If we have cached rates, continue using them
      const cachedRates = getRatesFromStorage();
      if (cachedRates) {
        console.log('Using cached rates due to API error');
        setRates(cachedRates);
        setLastUpdated(new Date(cachedRates.timestamp));
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [baseCurrency, loading]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    // Check if we need to fetch fresh rates
    if (!rates || areRatesStale(REFRESH_INTERVAL)) {
      fetchRates();
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set up periodic refresh with a longer interval (30 minutes instead of 10)
    intervalRef.current = setInterval(() => {
      fetchRates();
    }, REFRESH_INTERVAL * 3); // Triple the refresh interval
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchRates, rates]);

  // Refresh when base currency changes
  useEffect(() => {
    // Only fetch if the base currency changes and we don't have rates for that currency
    if (!rates || rates.base !== baseCurrency) {
      fetchRates();
    }
  }, [baseCurrency, fetchRates, rates]);

  // Manual refresh function that users can trigger
  const refreshRates = useCallback(async () => {
    // Only allow manual refresh if not already fetching
    if (!isFetchingRef.current) {
      await fetchRates();
    }
  }, [fetchRates]);

  return {
    rates,
    loading,
    error,
    lastUpdated,
    refreshRates,
  };
};

export default useExchangeRates; 