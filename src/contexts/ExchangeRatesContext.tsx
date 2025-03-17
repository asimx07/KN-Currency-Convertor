import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Rates {
  [currency: string]: number;
}

interface ExchangeRatesContextType {
  rates: Rates;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refreshRates: () => Promise<void>;
}

const ExchangeRatesContext = createContext<ExchangeRatesContextType | undefined>(undefined);

export const useExchangeRates = (): ExchangeRatesContextType => {
  const context = useContext(ExchangeRatesContext);
  if (!context) {
    throw new Error('useExchangeRates must be used within an ExchangeRatesProvider');
  }
  return context;
};

interface ExchangeRatesProviderProps {
  children: React.ReactNode;
}

export const ExchangeRatesProvider: React.FC<ExchangeRatesProviderProps> = ({ children }) => {
  const [rates, setRates] = useState<Rates>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have cached rates
      const cachedData = localStorage.getItem('exchangeRates');
      if (cachedData) {
        const { rates: cachedRates, timestamp } = JSON.parse(cachedData);
        const cacheTime = new Date(timestamp);
        const now = new Date();
        
        // Use cache if it's less than 10 minutes old
        if (now.getTime() - cacheTime.getTime() < 10 * 60 * 1000) {
          setRates(cachedRates);
          setLastUpdated(cacheTime);
          setLoading(false);
          return;
        }
      }
      
      // Fetch fresh rates
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      setRates(data.rates);
      
      const now = new Date();
      setLastUpdated(now);
      
      // Cache the rates
      localStorage.setItem('exchangeRates', JSON.stringify({
        rates: data.rates,
        timestamp: now.toISOString()
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      
      // Try to use cached rates even if they're old
      const cachedData = localStorage.getItem('exchangeRates');
      if (cachedData) {
        const { rates: cachedRates, timestamp } = JSON.parse(cachedData);
        setRates(cachedRates);
        setLastUpdated(new Date(timestamp));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    
    // Set up auto-refresh every 10 minutes
    const intervalId = setInterval(fetchRates, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchRates]);

  const refreshRates = useCallback(async () => {
    await fetchRates();
  }, [fetchRates]);

  const value = {
    rates,
    loading,
    error,
    lastUpdated,
    refreshRates
  };

  return (
    <ExchangeRatesContext.Provider value={value}>
      {children}
    </ExchangeRatesContext.Provider>
  );
};

export default ExchangeRatesContext; 