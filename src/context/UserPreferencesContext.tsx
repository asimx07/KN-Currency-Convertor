import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserPreferences } from '../types';

// Default user preferences
const defaultUserPreferences: UserPreferences = {
  darkMode: false,
  favoriteCurrencies: [],
  lastUsedCurrencies: {
    from: 'USD',
    to: ['EUR', 'GBP', 'JPY']
  },
  isReversed: false
};

// Local storage key
const USER_PREFERENCES_KEY = 'currency_converter_preferences';

// Context type
interface UserPreferencesContextType {
  preferences: UserPreferences;
  toggleDarkMode: () => void;
  addFavoriteCurrency: (currencyCode: string) => void;
  removeFavoriteCurrency: (currencyCode: string) => void;
  updateLastUsedCurrencies: (from: string, to: string[]) => void;
  toggleReversed: () => void;
  resetPreferences: () => void;
}

// Create context
const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Provider props
interface UserPreferencesProviderProps {
  children: ReactNode;
}

// Provider component
export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Load preferences from localStorage on initial render
    try {
      const savedPreferences = localStorage.getItem(USER_PREFERENCES_KEY);
      const parsedPreferences = savedPreferences ? JSON.parse(savedPreferences) : defaultUserPreferences;
      return parsedPreferences;
    } catch (error) {
      console.error('Error loading preferences from localStorage:', error);
      return defaultUserPreferences;
    }
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.darkMode]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
    }
  }, [preferences]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  }, []);

  // Add a currency to favorites
  const addFavoriteCurrency = useCallback((currencyCode: string) => {
    setPreferences(prev => {
      // Don't add if already in favorites
      if (prev.favoriteCurrencies.includes(currencyCode)) {
        return prev;
      }
      
      return {
        ...prev,
        favoriteCurrencies: [...prev.favoriteCurrencies, currencyCode]
      };
    });
  }, []);

  // Remove a currency from favorites
  const removeFavoriteCurrency = useCallback((currencyCode: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCurrencies: prev.favoriteCurrencies.filter(code => code !== currencyCode)
    }));
  }, []);

  // Update last used currencies
  const updateLastUsedCurrencies = useCallback((from: string, to: string[]) => {
    setPreferences(prev => {
      // Skip update if values are the same to prevent infinite loops
      const prevTo = prev.lastUsedCurrencies.to || [];
      const prevFrom = prev.lastUsedCurrencies.from || '';
      
      // Deep comparison of arrays
      const toArraysEqual = 
        prevTo.length === to.length && 
        prevTo.every((val, idx) => val === to[idx]);
      
      if (prevFrom === from && toArraysEqual) {
        return prev;
      }
      
      return {
        ...prev,
        lastUsedCurrencies: { from, to }
      };
    });
  }, []);

  // Toggle reversed state
  const toggleReversed = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      isReversed: !prev.isReversed
    }));
  }, []);

  // Reset preferences to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(defaultUserPreferences);
  }, []);

  const value = {
    preferences,
    toggleDarkMode,
    addFavoriteCurrency,
    removeFavoriteCurrency,
    updateLastUsedCurrencies,
    toggleReversed,
    resetPreferences
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

// Custom hook for using the context
export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}; 