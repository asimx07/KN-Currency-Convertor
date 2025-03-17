import React, { useState } from 'react';
import { ConversionResult } from '../types';
import { CURRENCIES } from '../utils/constants';

interface SocialShareProps {
  result: ConversionResult;
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ result, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  if (!result) return null;
  
  const { fromCurrency, toCurrency, amount, result: convertedAmount, rate, date } = result;
  
  const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency);
  const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);
  
  if (!fromCurrencyData || !toCurrencyData) return null;
  
  const shareText = `I just converted ${amount} ${fromCurrencyData.name} (${fromCurrencyData.symbol}) to ${convertedAmount.toFixed(2)} ${toCurrencyData.name} (${toCurrencyData.symbol}) using the Currency Converter app! Exchange rate: 1 ${fromCurrency} = ${rate} ${toCurrency}`;
  
  const shareVia = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=Currency%20Conversion&summary=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        url = `mailto:?subject=Check%20out%20this%20currency%20conversion&body=${encodeURIComponent(shareText)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const handleCopyLink = () => {
    const textToCopy = `${shareText}\n\nCheck out the Currency Converter app: ${window.location.href}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setShowTooltip('link');
        setTimeout(() => setShowTooltip(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };
  
  return (
    <div className={`${className}`}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        Share this conversion
      </h3>
      
      <div className="flex items-center space-x-3">
        {/* Twitter */}
        <div className="relative">
          <button
            onClick={() => shareVia('twitter')}
            onKeyDown={(e) => handleKeyDown(e, () => shareVia('twitter'))}
            aria-label="Share on Twitter"
            tabIndex={0}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </button>
        </div>
        
        {/* Facebook */}
        <div className="relative">
          <button
            onClick={() => shareVia('facebook')}
            onKeyDown={(e) => handleKeyDown(e, () => shareVia('facebook'))}
            aria-label="Share on Facebook"
            tabIndex={0}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* LinkedIn */}
        <div className="relative">
          <button
            onClick={() => shareVia('linkedin')}
            onKeyDown={(e) => handleKeyDown(e, () => shareVia('linkedin'))}
            aria-label="Share on LinkedIn"
            tabIndex={0}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </button>
        </div>
        
        {/* Email */}
        <div className="relative">
          <button
            onClick={() => shareVia('email')}
            onKeyDown={(e) => handleKeyDown(e, () => shareVia('email'))}
            aria-label="Share via Email"
            tabIndex={0}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        
        {/* Copy Link */}
        <div className="relative">
          <button
            onClick={handleCopyLink}
            onKeyDown={(e) => handleKeyDown(e, handleCopyLink)}
            aria-label="Copy link to clipboard"
            tabIndex={0}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
          {showTooltip === 'link' && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap">
              Copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialShare; 