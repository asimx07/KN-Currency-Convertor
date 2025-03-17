import React from 'react';

const HelpGuide: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Currency Converter User Guide</h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Basic Currency Conversion</h3>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Enter the amount you want to convert in the input field</li>
            <li>Select your source currency from the dropdown menu</li>
            <li>Select your target currency from the dropdown menu</li>
            <li>View the conversion result instantly</li>
            <li>Use the swap button (↔️) to quickly reverse the conversion</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Multi-Currency Conversion</h3>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Enter the amount you want to convert</li>
            <li>Select your source currency</li>
            <li>In the multi-currency section, select the currencies you want to convert to</li>
            <li>View all conversion results at once</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Historical Exchange Rates</h3>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Navigate to the "Historical Rates" tab</li>
            <li>Select the source and target currencies</li>
            <li>Choose a time period (7 days, 30 days, 6 months, or 1 year)</li>
            <li>View the exchange rate trend in the graph</li>
            <li>Hover over points on the graph to see specific rates for each date</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Favorite Currencies</h3>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Click the star icon (★) next to any currency pair to add it to your favorites</li>
            <li>Access your favorite currency pairs quickly from the favorites section</li>
            <li>Click the star icon again to remove a currency pair from your favorites</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Offline Mode</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            The app works offline by using cached exchange rates from your last online session:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Exchange rates are automatically cached when you're online</li>
            <li>If you lose internet connection, the app will use the cached rates</li>
            <li>A notification will appear indicating you're using offline rates</li>
            <li>Rates will automatically update when you're back online</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Additional Features</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
            <li><strong>Copy Results:</strong> Click the copy icon to copy conversion results to your clipboard</li>
            <li><strong>Share Results:</strong> Use the share buttons to share conversion results via social media or email</li>
            <li><strong>Dark Mode:</strong> Toggle between light and dark mode using the theme switch in the header</li>
            <li><strong>Auto-Refresh:</strong> Exchange rates automatically refresh every 5-10 minutes when you're online</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Troubleshooting</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
            <li><strong>Rates Not Updating:</strong> Check your internet connection and refresh the page</li>
            <li><strong>Conversion Not Working:</strong> Ensure you've entered a valid amount and selected currencies</li>
            <li><strong>Historical Data Not Loading:</strong> Try selecting a different time period or currency pair</li>
            <li><strong>App Not Responding:</strong> Clear your browser cache and reload the application</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default HelpGuide; 