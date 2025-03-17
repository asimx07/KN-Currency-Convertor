import React, { useState } from 'react';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { CURRENCIES } from '../utils/constants';

const Settings: React.FC = () => {
  const { 
    preferences, 
    toggleDarkMode, 
    addFavoriteCurrency, 
    removeFavoriteCurrency, 
    resetPreferences 
  } = useUserPreferences();
  
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleAddFavorite = () => {
    if (selectedCurrency) {
      addFavoriteCurrency(selectedCurrency);
      setSelectedCurrency('');
    }
  };

  const handleRemoveFavorite = (currencyCode: string) => {
    removeFavoriteCurrency(currencyCode);
  };

  const handleResetPreferences = () => {
    resetPreferences();
    setShowResetConfirm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Settings
      </h1>
      
      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Appearance
        </h2>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              preferences.darkMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-pressed={preferences.darkMode}
            aria-label="Toggle dark mode"
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      {/* Favorite Currencies */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Favorite Currencies
        </h2>
        
        <div className="mb-6">
          <div className="flex space-x-2">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a currency</option>
              {CURRENCIES.filter(
                currency => !preferences.favoriteCurrencies.includes(currency.code)
              ).map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddFavorite}
              disabled={!selectedCurrency}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Add currencies to your favorites for quick access during conversion.
          </p>
        </div>
        
        {preferences.favoriteCurrencies.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Favorites
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {preferences.favoriteCurrencies.map(code => {
                const currency = CURRENCIES.find(c => c.code === code);
                return (
                  <div 
                    key={code}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {currency?.code} - {currency?.name}
                    </span>
                    <button
                      onClick={() => handleRemoveFavorite(code)}
                      className="text-red-500 hover:text-red-600 focus:outline-none"
                      aria-label={`Remove ${code} from favorites`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            You haven't added any favorite currencies yet.
          </p>
        )}
      </div>
      
      {/* Reset Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Reset Settings
        </h2>
        
        {showResetConfirm ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-red-700 dark:text-red-400 mb-4">
              Are you sure you want to reset all settings to default? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleResetPreferences}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Reset all settings to their default values, including theme preferences and favorite currencies.
            </p>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset to Defaults
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 