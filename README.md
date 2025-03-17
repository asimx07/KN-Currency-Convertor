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

### Netlify Deployment

This application is configured for easy deployment to Netlify:

#### Option 1: Deploy via Netlify UI

1. Create a production build:
   ```
   npm run build
   ```

2. Create a Netlify account at [https://app.netlify.com/signup](https://app.netlify.com/signup)

3. Go to [https://app.netlify.com/start](https://app.netlify.com/start) and drag-and-drop the `build` folder from your project

4. Configure your site name and settings

5. Add the environment variable in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add environment variable: `REACT_APP_EXCHANGE_API_KEY` with your API key

#### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```
   npm install netlify-cli -g
   ```

2. Login to Netlify:
   ```
   netlify login
   ```

3. Initialize a new Netlify site:
   ```
   netlify init
   ```

4. Follow the prompts to set up your site

5. Deploy your site:
   ```
   netlify deploy --prod
   ```

6. Add the environment variable in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add environment variable: `REACT_APP_EXCHANGE_API_KEY` with your API key

#### Option 3: Connect to GitHub for Continuous Deployment

1. Push your code to a GitHub repository

2. In Netlify, go to "Add new site" > "Import an existing project"

3. Select GitHub and authorize Netlify

4. Select your repository

5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`

6. Add the environment variable:
   - Expand "Advanced build settings"
   - Add environment variable: `REACT_APP_EXCHANGE_API_KEY` with your API key

7. Click "Deploy site"

Your site will be deployed and automatically updated whenever you push changes to your GitHub repository.

### Accessing Your Deployed Site

Once deployed, your site will be available at a Netlify subdomain (e.g., `your-app-name.netlify.app`). You can configure a custom domain in the Netlify settings.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Exchange Rates API for providing the exchange rate data
- React and Tailwind CSS communities for the excellent documentation and resources
