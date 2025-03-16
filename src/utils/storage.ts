import { ExchangeRate, UserPreferences } from '../types';
import { DEFAULT_BASE_CURRENCY, DEFAULT_TARGET_CURRENCIES } from './constants';

const STORAGE_KEYS = {
  EXCHANGE_RATES: 'currency_converter_rates',
  USER_PREFERENCES: 'currency_converter_preferences',
};

// Exchange Rates Storage
export const saveRatesToStorage = (rates: ExchangeRate): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATES, JSON.stringify(rates));
  } catch (error) {
    console.error('Error saving rates to localStorage:', error);
  }
};

export const getRatesFromStorage = (): ExchangeRate | null => {
  try {
    const storedRates = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATES);
    return storedRates ? JSON.parse(storedRates) : null;
  } catch (error) {
    console.error('Error getting rates from localStorage:', error);
    return null;
  }
};

// User Preferences Storage
const defaultPreferences: UserPreferences = {
  darkMode: false,
  favoriteCurrencies: [],
  lastUsedCurrencies: {
    from: DEFAULT_BASE_CURRENCY,
    to: DEFAULT_TARGET_CURRENCIES,
  },
};

export const savePreferencesToStorage = (preferences: UserPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to localStorage:', error);
  }
};

export const getPreferencesFromStorage = (): UserPreferences => {
  try {
    const storedPreferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return storedPreferences ? JSON.parse(storedPreferences) : defaultPreferences;
  } catch (error) {
    console.error('Error getting preferences from localStorage:', error);
    return defaultPreferences;
  }
};

// Check if rates are stale (older than the refresh interval)
export const areRatesStale = (refreshInterval: number): boolean => {
  const storedRates = getRatesFromStorage();
  if (!storedRates || !storedRates.timestamp) return true;
  
  const currentTime = Date.now();
  const timeDifference = currentTime - storedRates.timestamp;
  
  return timeDifference > refreshInterval;
}; 