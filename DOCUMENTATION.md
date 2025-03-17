# Currency Converter Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Features](#core-features)
4. [Technical Implementation](#technical-implementation)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Offline Support](#offline-support)
8. [Deployment](#deployment)
9. [Environment Variables](#environment-variables)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)
12. [Future Enhancements](#future-enhancements)

## Introduction

The Currency Converter is a web-based application that allows users to convert between multiple currencies, view historical exchange rate trends, work offline using cached exchange rates, and more. This documentation provides a comprehensive overview of the application's architecture, features, and implementation details.

## Project Structure

The project follows a standard React application structure with TypeScript:

```
currency-converter/
├── public/                 # Static assets and HTML template
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # API and service functions
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   └── index.tsx           # Application entry point
├── .env                    # Environment variables
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # Project overview and setup instructions
```

## Core Features

### Currency Conversion

The application allows users to:
- Convert between any currencies (USD, EUR, GBP, JPY, PKR, AED, SAR, etc.)
- Perform reverse conversion with a toggle button
- Convert one currency to multiple currencies simultaneously
- Copy conversion results to clipboard
- Share conversion results via social media

### Historical Exchange Rates

Users can:
- View historical exchange rate trends
- Select different time periods (7 days, 30 days, 6 months, 1 year)
- Visualize trends with interactive charts

### User Preferences

The application supports:
- Dark/light mode toggle with theme persistence
- Favorite currencies for quick access
- Settings panel for user preferences

### Offline Support

The application works offline by:
- Caching the latest exchange rates in localStorage
- Automatically using cached rates when offline
- Displaying a notification when using offline rates
- Auto-updating rates when back online

## Technical Implementation

### Frontend Framework

- **React.js**: The application is built using React with functional components and hooks
- **TypeScript**: Used for type safety and better developer experience
- **React Router**: Handles client-side routing

### Styling

- **Tailwind CSS**: Used for styling with utility-first approach
- **Responsive Design**: Mobile-first approach for all components

### Data Visualization

- **Chart.js**: Used for rendering historical exchange rate charts
- **React-Chartjs-2**: React wrapper for Chart.js

## API Integration

The application uses the Exchange Rates API to fetch real-time and historical exchange rates:

### Real-time Rates

```typescript
// Example API call for real-time rates
const fetchExchangeRates = async (baseCurrency: string) => {
  try {
    const response = await axios.get(
      `https://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY}&base=${baseCurrency}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};
```

### Historical Rates

```typescript
// Example API call for historical rates
const fetchHistoricalRates = async (
  baseCurrency: string,
  targetCurrency: string,
  startDate: string,
  endDate: string
) => {
  try {
    const response = await axios.get(
      `https://api.exchangeratesapi.io/v1/timeseries?access_key=${API_KEY}&base=${baseCurrency}&symbols=${targetCurrency}&start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    throw error;
  }
};
```

## State Management

The application uses React Context API for state management:

### User Preferences Context

Manages user preferences such as dark mode, favorite currencies, and other settings:

```typescript
// Example UserPreferencesContext
const UserPreferencesContext = createContext<UserPreferencesContextType>({
  preferences: defaultPreferences,
  updatePreferences: () => {},
  toggleDarkMode: () => {},
  addFavoriteCurrency: () => {},
  removeFavoriteCurrency: () => {},
});
```

### Exchange Rates Context

Manages exchange rate data, including fetching, caching, and offline support:

```typescript
// Example ExchangeRatesContext
const ExchangeRatesContext = createContext<ExchangeRatesContextType>({
  rates: {},
  baseCurrency: 'USD',
  isLoading: false,
  error: null,
  lastUpdated: null,
  isOffline: false,
  fetchRates: () => Promise.resolve(),
  setBaseCurrency: () => {},
});
```

## Offline Support

The application implements offline support using localStorage:

### Caching Exchange Rates

```typescript
// Example of caching exchange rates
const cacheExchangeRates = (rates: RatesData, timestamp: number) => {
  localStorage.setItem(
    'cachedRates',
    JSON.stringify({
      rates,
      timestamp,
    })
  );
};
```

### Using Cached Rates When Offline

```typescript
// Example of using cached rates when offline
const getCachedRates = (): CachedRatesData | null => {
  const cachedRates = localStorage.getItem('cachedRates');
  if (cachedRates) {
    return JSON.parse(cachedRates);
  }
  return null;
};
```

## Deployment

The application is configured for deployment to Netlify:

### Netlify Configuration

The `netlify.toml` file configures the build settings:

```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deployment Options

1. **Netlify UI**: Drag and drop the build folder
2. **Netlify CLI**: Deploy using the command line
3. **GitHub Integration**: Set up continuous deployment from GitHub

## Environment Variables

The application uses the following environment variables:

- `REACT_APP_EXCHANGE_API_KEY`: API key for the Exchange Rates API

These variables should be set in a `.env` file for local development and in the Netlify environment variables for production.

## Testing

The application includes comprehensive tests:

### Unit Tests

Tests for utility functions, formatters, and other isolated functionality:

```typescript
// Example unit test
test('formats currency correctly', () => {
  expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
});
```

### Component Tests

Tests for React components using React Testing Library:

```typescript
// Example component test
test('renders currency selector with correct options', () => {
  render(<CurrencySelector currencies={mockCurrencies} />);
  expect(screen.getByText('USD - US Dollar')).toBeInTheDocument();
});
```

### Integration Tests

Tests for API interactions and data flow:

```typescript
// Example integration test
test('fetches and displays exchange rates', async () => {
  // Test implementation
});
```

## Troubleshooting

### Common Issues

1. **API Rate Limits**: The free tier of Exchange Rates API has rate limits. If you exceed these limits, you may see errors.
2. **Offline Mode Issues**: If the application doesn't work correctly in offline mode, try clearing localStorage and reloading.
3. **Chart Rendering Issues**: If charts don't render correctly, check browser compatibility and try a different browser.

### Error Handling

The application implements comprehensive error handling:

```typescript
// Example error handling
try {
  await fetchExchangeRates(baseCurrency);
} catch (error) {
  if (error.response && error.response.status === 429) {
    // Handle rate limit error
  } else if (!navigator.onLine) {
    // Handle offline error
  } else {
    // Handle general error
  }
}
```

## Future Enhancements

Planned future enhancements include:

1. **Currency Calculator**: Support for math operations in the input field
2. **Export Data**: Allow users to download conversion history in CSV/PDF format
3. **Progressive Web App (PWA)**: Enable installation on mobile devices
4. **User Accounts**: Save preferences across devices
5. **Advanced Visualization**: More chart types and comparison views
6. **Currency News**: Display latest currency news and updates 