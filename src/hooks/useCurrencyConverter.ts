import { useState, useCallback } from 'react';
import { ConversionResult } from '../types';
import useExchangeRates from './useExchangeRates';

interface UseCurrencyConverterResult {
  convert: (amount: number, fromCurrency: string, toCurrencies: string[]) => ConversionResult[];
  results: ConversionResult[];
  loading: boolean;
  error: Error | null;
}

const useCurrencyConverter = (): UseCurrencyConverterResult => {
  const [results, setResults] = useState<ConversionResult[]>([]);
  const { rates, loading, error } = useExchangeRates();

  const convert = useCallback(
    (amount: number, fromCurrency: string, toCurrencies: string[]): ConversionResult[] => {
      if (!rates || !rates.rates) {
        return [];
      }

      // If the base currency in the rates is not the fromCurrency, we need to convert
      const baseRate = fromCurrency === rates.base ? 1 : rates.rates[fromCurrency];
      
      if (!baseRate && fromCurrency !== rates.base) {
        console.error(`Exchange rate for ${fromCurrency} not found`);
        return [];
      }

      const newResults = toCurrencies.map((toCurrency) => {
        // If converting to the same currency, rate is 1
        if (fromCurrency === toCurrency) {
          return {
            fromCurrency,
            toCurrency,
            amount,
            result: amount,
            rate: 1,
            date: rates.date,
          };
        }

        // Get the exchange rate for the target currency
        const targetRate = rates.rates[toCurrency];
        
        if (!targetRate && toCurrency !== rates.base) {
          console.error(`Exchange rate for ${toCurrency} not found`);
          return {
            fromCurrency,
            toCurrency,
            amount,
            result: 0,
            rate: 0,
            date: rates.date,
          };
        }

        // Calculate the conversion rate
        let conversionRate: number;
        
        if (fromCurrency === rates.base) {
          // Direct conversion from base currency
          conversionRate = targetRate;
        } else if (toCurrency === rates.base) {
          // Converting to base currency
          conversionRate = 1 / baseRate;
        } else {
          // Cross-currency conversion
          conversionRate = targetRate / baseRate;
        }

        // Calculate the result
        const result = amount * conversionRate;

        return {
          fromCurrency,
          toCurrency,
          amount,
          result,
          rate: conversionRate,
          date: rates.date,
        };
      });

      setResults(newResults);
      return newResults;
    },
    [rates]
  );

  return {
    convert,
    results,
    loading,
    error,
  };
};

export default useCurrencyConverter; 