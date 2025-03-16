export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRate {
  base: string;
  date: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface ConversionResult {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  result: number;
  rate: number;
  date: string;
}

export interface HistoricalData {
  base: string;
  target: string;
  dates: string[];
  rates: number[];
}

export interface UserPreferences {
  darkMode: boolean;
  favoriteCurrencies: string[];
  lastUsedCurrencies: {
    from: string;
    to: string[];
  };
  isReversed?: boolean;
} 