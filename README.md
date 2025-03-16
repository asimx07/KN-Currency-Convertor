# Currency Converter

A web-based currency converter application that allows users to convert PKR to multiple currencies and vice versa, view historical exchange rate trends, work offline using cached exchange rates, and more.

## Features

- Convert PKR to multiple currencies (USD, AED, SAR, GBP, EUR, CAD, etc.) and vice versa
- View real-time exchange rates with automatic updates
- Work offline using cached exchange rates
- Copy conversion results to clipboard
- Multi-currency conversion in a single view
- Mobile-friendly responsive design

## Upcoming Features

- Historical exchange rate trends (7 days, 30 days, 1 year)
- Dark mode support
- Bookmark favorite currencies for quick access
- Social sharing options

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/currency-converter.git
   cd currency-converter
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your API key:
   ```
   REACT_APP_EXCHANGE_API_KEY=your_api_key_here
   ```
   
   You can get an API key from [Exchange Rates API](https://exchangeratesapi.io/) or any other currency exchange rate API.

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Technologies Used

- React.js with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- Chart.js for data visualization (coming soon)
- Local Storage for offline data caching

## API Integration

This application uses the Exchange Rates API to fetch real-time and historical exchange rates. You'll need to sign up for an API key at [https://exchangeratesapi.io/](https://exchangeratesapi.io/) or use an alternative API.

## Deployment

The application can be deployed to Netlify or any other static site hosting service:

```
npm run build
```

This will create a production-ready build in the `build` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Exchange Rates API for providing the exchange rate data
- React and Tailwind CSS communities for the excellent documentation and resources
