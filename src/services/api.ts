import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../utils/constants';
import { ExchangeRate, HistoricalData } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  params: {
    access_key: API_KEY,
  },
});

// Fallback exchange rates in case the API is not available
const fallbackRates: ExchangeRate = {
  base: 'PKR',
  date: new Date().toISOString().split('T')[0],
  rates: {
    USD: 0.0036,
    EUR: 0.0033,
    GBP: 0.0028,
    AED: 0.0132,
    SAR: 0.0135,
    CAD: 0.0049,
    AUD: 0.0054,
    JPY: 0.5400,
    CNY: 0.0260,
  },
  timestamp: Date.now(),
};

// Add a simple request throttling mechanism
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 10000; // 10 seconds minimum between requests

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

export const getLatestRates = async (base: string = 'PKR'): Promise<ExchangeRate> => {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.warn('API key is not set. Using fallback exchange rates.');
      return {
        ...fallbackRates,
        base,
        timestamp: Date.now(),
      };
    }

    // Check if we should make a new request or use fallback data
    if (!shouldMakeRequest()) {
      return {
        ...fallbackRates,
        base,
        timestamp: Date.now(),
      };
    }

    // Most free plans only support EUR as base currency
    // So we'll fetch with EUR as base and convert manually
    const response = await api.get('/latest');
    
    // Validate response data
    if (!response.data || !response.data.rates) {
      throw new Error('Invalid response from exchange rate API');
    }
    
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
      console.warn(`Base currency ${base} not found in API response. Using fallback rates.`);
      return {
        ...fallbackRates,
        base,
        timestamp: Date.now(),
      };
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
    console.error('Error fetching latest rates:', error);
    
    // Return fallback rates if API call fails
    return {
      ...fallbackRates,
      base,
      timestamp: Date.now(),
    };
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
      return generateFallbackHistoricalData(base, target, days);
    }

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
    console.error('Error fetching historical rates:', error);
    
    // Return generated historical data if API call fails
    return generateFallbackHistoricalData(base, target, days);
  }
};

// Helper function to generate fallback historical data
const generateFallbackHistoricalData = (base: string, target: string, days: number): HistoricalData => {
  const dates: string[] = [];
  const rates: number[] = [];
  const baseRate = fallbackRates.rates[target] || 1;
  
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