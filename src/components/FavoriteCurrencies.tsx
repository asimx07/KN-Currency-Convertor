import React from 'react';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { CURRENCIES } from '../utils/constants';

interface FavoriteCurrenciesProps {
  onSelectCurrency: (currencyCode: string) => void;
  className?: string;
}

const FavoriteCurrencies: React.FC<FavoriteCurrenciesProps> = ({ 
  onSelectCurrency,
  className = '' 
}) => {
  const { preferences, addFavoriteCurrency, removeFavoriteCurrency } = useUserPreferences();
  const { favoriteCurrencies } = preferences;
  
  if (favoriteCurrencies.length === 0) {
    return (
      <div className={`text-center py-3 ${className}`}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No favorite currencies yet. Add some in the Settings page.
        </p>
      </div>
    );
  }
  
  return (
    <div className={`${className}`}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Favorite Currencies
      </h3>
      <div className="flex flex-wrap gap-2">
        {favoriteCurrencies.map(code => {
          const currency = CURRENCIES.find(c => c.code === code);
          if (!currency) return null;
          
          return (
            <button
              key={code}
              onClick={() => onSelectCurrency(code)}
              className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-md text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="mr-1">{currency.symbol}</span>
              <span>{currency.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FavoriteCurrencies; 