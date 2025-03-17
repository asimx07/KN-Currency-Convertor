import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ExchangeRatesProvider, useExchangeRates } from '../ExchangeRatesContext';

// Mock the fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock component to test the context
const TestComponent = () => {
  const { rates, loading, error, lastUpdated } = useExchangeRates();
  return (
    <div>
      <div data-testid="rates">{JSON.stringify(rates)}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error?.message || 'no error'}</div>
      <div data-testid="lastUpdated">{lastUpdated?.toString() || 'no update'}</div>
    </div>
  );
};

describe('ExchangeRatesContext', () => {
  const mockRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110,
    PKR: 170,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should fetch rates on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ rates: mockRates }),
    });

    render(
      <ExchangeRatesProvider>
        <TestComponent />
      </ExchangeRatesProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    await waitFor(() => {
      expect(screen.getByTestId('rates')).toHaveTextContent(JSON.stringify(mockRates));
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should handle fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <ExchangeRatesProvider>
        <TestComponent />
      </ExchangeRatesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should use cached rates when available', async () => {
    const cachedRates = { rates: mockRates, timestamp: Date.now() };
    localStorage.setItem('exchangeRates', JSON.stringify(cachedRates));

    render(
      <ExchangeRatesProvider>
        <TestComponent />
      </ExchangeRatesProvider>
    );

    expect(screen.getByTestId('rates')).toHaveTextContent(JSON.stringify(mockRates));
    expect(mockFetch).not.toHaveBeenCalled();
  });
}); 