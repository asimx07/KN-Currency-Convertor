import { Currency } from '../types';

export const CURRENCIES: Currency[] = [
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export const DEFAULT_BASE_CURRENCY = 'PKR';
export const DEFAULT_TARGET_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR'];

export const API_BASE_URL = 'https://api.exchangeratesapi.io/v1';

// Ensure API key is properly loaded from environment variables
// Log a warning if it's not available
const apiKey = process.env.REACT_APP_EXCHANGE_API_KEY || '';
if (!apiKey) {
  console.warn('API key is not set in environment variables. Using fallback data.');
}
export const API_KEY = apiKey;

export const REFRESH_INTERVAL = 60 * 60 * 1000; // 60 minutes in milliseconds

export const HISTORICAL_PERIODS = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '1 Year', value: 365 },
]; 