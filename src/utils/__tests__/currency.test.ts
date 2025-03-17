import { formatCurrency, convertCurrency } from '../currency';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency with correct decimal places', () => {
      expect(formatCurrency(1234.5678, 'USD')).toBe('1,234.57');
      expect(formatCurrency(1234.5678, 'JPY')).toBe('1,235');
      expect(formatCurrency(1234.5678, 'PKR')).toBe('1,234.57');
    });

    it('should handle zero and negative values', () => {
      expect(formatCurrency(0, 'USD')).toBe('0.00');
      expect(formatCurrency(-1234.5678, 'USD')).toBe('-1,234.57');
    });

    it('should handle undefined and null values', () => {
      expect(formatCurrency(undefined as any, 'USD')).toBe('0.00');
      expect(formatCurrency(null as any, 'USD')).toBe('0.00');
    });
  });

  describe('convertCurrency', () => {
    const rates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      PKR: 170,
    };

    it('should convert between currencies correctly', () => {
      expect(convertCurrency(100, 'USD', 'EUR', rates)).toBe(85);
      expect(convertCurrency(100, 'USD', 'GBP', rates)).toBe(73);
      expect(convertCurrency(100, 'USD', 'JPY', rates)).toBe(11000);
      expect(convertCurrency(100, 'USD', 'PKR', rates)).toBe(17000);
    });

    it('should handle same currency conversion', () => {
      expect(convertCurrency(100, 'USD', 'USD', rates)).toBe(100);
    });

    it('should handle zero and negative values', () => {
      expect(convertCurrency(0, 'USD', 'EUR', rates)).toBe(0);
      expect(convertCurrency(-100, 'USD', 'EUR', rates)).toBe(-85);
    });

    it('should handle missing rates', () => {
      const incompleteRates = { USD: 1, EUR: 0.85 };
      expect(convertCurrency(100, 'USD', 'EUR', incompleteRates)).toBe(85);
      expect(convertCurrency(100, 'USD', 'GBP', incompleteRates)).toBe(NaN);
    });
  });
}); 