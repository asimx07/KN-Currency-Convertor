import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../utils/constants';
import { ExchangeRate, HistoricalData } from '../types';
import { getRatesFromStorage } from '../utils/storage';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  params: {
    access_key: API_KEY,
  },
});

// Fallback exchange rates in case the API is not available and no cached rates exist
const fallbackRates: ExchangeRate = {
  base: 'USD',
  date: new Date().toISOString().split('T')[0],
  rates: {
    EUR: 0.92,
    GBP: 0.78,
    JPY: 150.25,
    CAD: 1.35,
    AUD: 1.52,
    CNY: 7.23,
    INR: 83.12,
    PKR: 278.45,
    AED: 3.67,
    SAR: 3.75,
  },
  timestamp: Date.now(),
};

// Add a strong request throttling mechanism to prevent rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 10 * 60 * 1000; // 10 minutes minimum between requests

// Helper function to check if we should make a new request
const shouldMakeRequest = (): boolean => {
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    console.log('Throttling API request - using cached or fallback data');
    return false;
  }
  lastRequestTime = now;
  return true;
};

// Helper function to get fallback rates (from localStorage or hardcoded)
const getFallbackRates = (base: string): ExchangeRate => {
  // First try to get rates from localStorage
  const cachedRates = getRatesFromStorage();
  
  if (cachedRates) {
    // If the cached rates have the same base, use them directly
    if (cachedRates.base === base) {
      return cachedRates;
    }
    
    // If we have cached rates but with a different base, try to convert them
    if (cachedRates.rates[base]) {
      const baseRate = cachedRates.rates[base];
      const convertedRates: Record<string, number> = {};
      
      // Convert all rates to the new base currency
      for (const [currency, rate] of Object.entries(cachedRates.rates)) {
        convertedRates[currency] = (rate as number) / baseRate;
      }
      
      return {
        base,
        date: cachedRates.date,
        rates: convertedRates,
        timestamp: Date.now(),
      };
    }
  }
  
  // If no cached rates or can't convert, use hardcoded fallback
  return {
    ...fallbackRates,
    base,
    timestamp: Date.now(),
  };
};

export const getLatestRates = async (base: string = 'USD'): Promise<ExchangeRate> => {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.warn('API key is not set. Using cached or fallback exchange rates.');
      return getFallbackRates(base);
    }

    // Check if we should make a new request or use fallback data
    if (!shouldMakeRequest()) {
      console.log('Using cached or fallback rates due to throttling');
      return getFallbackRates(base);
    }

    console.log('Fetching fresh rates from API...');
    
    // Most free plans only support EUR as base currency
    // So we'll fetch with EUR as base and convert manually
    const response = await api.get('/latest', {
      timeout: 10000, // 10 second timeout
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    // Validate response data
    if (!response.data || !response.data.rates) {
      throw new Error('Invalid response from exchange rate API');
    }
    
    console.log('Successfully fetched fresh rates');
    
    // If the requested base is EUR, return as is
    if (base === 'EUR') {
      return {
        ...response.data,
        timestamp: Date.now(),
      };
    }
    
    // Otherwise, convert rates to the requested base currency
    const rates = { ...response.data.rates };
    const baseRate = rates[base];
    
    // If the requested base currency isn't in the rates, use fallback
    if (!baseRate) {
      console.warn(`Base currency ${base} not found in API response. Using cached or fallback rates.`);
      return getFallbackRates(base);
    }
    
    // Convert all rates to the new base currency
    const convertedRates: Record<string, number> = {};
    for (const [currency, rate] of Object.entries(rates)) {
      convertedRates[currency] = (rate as number) / baseRate;
    }
    
    // Add the base currency itself with rate 1
    convertedRates[base] = 1;
    
    return {
      base,
      date: response.data.date,
      rates: convertedRates,
      timestamp: Date.now(),
    };
  } catch (error) {
    // Handle specific error types
    const axiosError = error as any;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      
      if (status === 429) {
        console.error('Rate limit exceeded (429). Using cached or fallback rates.');
        // Extend the throttling time on rate limit errors
        lastRequestTime = Date.now();
      } else if (status === 401) {
        console.error('API key is invalid or expired (401). Using cached or fallback rates.');
      } else {
        console.error(`API error (${status}): Using cached or fallback rates.`);
      }
    } else if (axiosError.request) {
      // The request was made but no response was received
      console.error('No response received from API. Using cached or fallback rates.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up API request:', error);
    }
    
    // Return cached or fallback rates if API call fails
    return getFallbackRates(base);
  }
};

export const getHistoricalRates = async (
  base: string,
  target: string,
  days: number
): Promise<HistoricalData> => {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.warn('API key is not set. Using generated historical data.');
      return generateFallbackHistoricalData(base, target, days);
    }

    // Check if we should make a new request or use fallback data
    if (!shouldMakeRequest()) {
      console.log('Throttling historical API request - using generated data');
      return generateFallbackHistoricalData(base, target, days);
    }

    console.log('Fetching historical rates from API...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Most free plans only support EUR as base currency
    // We'll need to fetch both the target currency and the base currency (if not EUR)
    // to calculate the correct rates
    const symbols = base === 'EUR' ? target : `${target},${base}`;
    
    const response = await api.get('/timeseries', {
      params: {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        symbols: symbols,
      },
      timeout: 15000, // 15 second timeout
    });
    
    // Validate response data
    if (!response.data || !response.data.rates) {
      throw new Error('Invalid response from exchange rate API');
    }
    
    const { rates } = response.data;
    const dates = Object.keys(rates);
    
    // If base is EUR, we can use the rates directly
    if (base === 'EUR') {
      const rateValues = dates.map(date => rates[date][target]);
      
      return {
        base,
        target,
        dates,
        rates: rateValues,
      };
    }
    
    // Otherwise, we need to convert the rates
    const rateValues = dates.map(date => {
      const dateRates = rates[date];
      // If either rate is missing, return null
      if (!dateRates[target] || !dateRates[base]) {
        return null;
      }
      // Convert the rate: target/base
      return dateRates[target] / dateRates[base];
    });
    
    // Filter out any null values
    const validDates: string[] = [];
    const validRates: number[] = [];
    
    dates.forEach((date, index) => {
      if (rateValues[index] !== null) {
        validDates.push(date);
        validRates.push(rateValues[index] as number);
      }
    });
    
    return {
      base,
      target,
      dates: validDates,
      rates: validRates,
    };
  } catch (error) {
    // Handle specific error types
    const axiosError = error as any;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      
      if (status === 429) {
        console.error('Rate limit exceeded (429) for historical data. Using generated data.');
        // Extend the throttling time on rate limit errors
        lastRequestTime = Date.now();
      } else if (status === 401) {
        console.error('API key is invalid or expired (401) for historical data. Using generated data.');
      } else {
        console.error(`API error (${status}) for historical data. Using generated data.`);
      }
    } else if (axiosError.request) {
      // The request was made but no response was received
      console.error('No response received from API for historical data. Using generated data.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up historical API request:', error);
    }
    
    // Return generated historical data if API call fails
    return generateFallbackHistoricalData(base, target, days);
  }
};

// Helper function to generate fallback historical data
const generateFallbackHistoricalData = (base: string, target: string, days: number): HistoricalData => {
  // Get the current exchange rate from cached or fallback rates
  const currentRates = getFallbackRates(base);
  const baseRate = currentRates.rates[target] || 1;
  
  const dates: string[] = [];
  const rates: number[] = [];
  
  // Generate dates and slightly varying rates for the specified number of days
  const endDate = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
    
    // Generate a rate with small random variations
    const randomVariation = 0.95 + (Math.random() * 0.1); // Between 0.95 and 1.05
    rates.push(baseRate * randomVariation);
  }
  
  return {
    base,
    target,
    dates,
    rates,
  };
}; 