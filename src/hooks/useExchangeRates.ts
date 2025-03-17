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

// Simple hook implementation without complex state management
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
  
  // Fetch rates function
  const fetchRates = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current || !mountedRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    
    try {
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
  }, []);
  
  // Public refresh function
  const refreshRates = useCallback(() => {
    fetchRates();
  }, [fetchRates]);
  
  // Update base currency ref when it changes
  useEffect(() => {
    currentBaseCurrencyRef.current = baseCurrency;
    
    // Only fetch if we have a different base currency
    if (rates && rates.base !== baseCurrency && !isFetchingRef.current) {
      fetchRates();
    }
  }, [baseCurrency, fetchRates, rates]);
  
  // Initial fetch and interval setup
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch if needed
    if (!rates || areRatesStale(REFRESH_INTERVAL)) {
      fetchRates();
    }
    
    // Set up refresh interval
    intervalRef.current = setInterval(() => {
      if (!isFetchingRef.current) {
        fetchRates();
      }
    }, REFRESH_INTERVAL);
    
    // Cleanup
    return () => {
      mountedRef.current = false;
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchRates, rates]);
  
  return {
    rates,
    loading,
    error,
    lastUpdated,
    refreshRates
  };
};

export default useExchangeRates; 