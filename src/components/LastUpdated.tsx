import React, { useState, useEffect, useCallback } from 'react';

interface LastUpdatedProps {
  date: Date | null;
  loading: boolean;
  onRefresh: () => void;
  error?: string | null;
}

const LastUpdated: React.FC<LastUpdatedProps> = ({ 
  date, 
  loading, 
  onRefresh,
  error
}) => {
  const [timeAgoText, setTimeAgoText] = useState<string>('');
  
  const updateTimeAgo = useCallback(() => {
    if (!date) {
      setTimeAgoText('Never');
      return;
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      setTimeAgoText('Just now');
    } else if (diffMin < 60) {
      setTimeAgoText(`${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`);
    } else if (diffHour < 24) {
      setTimeAgoText(`${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`);
    } else {
      setTimeAgoText(`${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`);
    }
  }, [date]);
  
  useEffect(() => {
    updateTimeAgo();
    const intervalId = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(intervalId);
  }, [updateTimeAgo]);
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handleRefreshClick = () => {
    onRefresh();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRefresh();
    }
  };
  
  return (
    <div className="flex items-center text-sm">
      <div className="flex items-center">
        <div className={`flex items-center ${error ? 'text-error-600 dark:text-error-400' : 'text-gray-600 dark:text-gray-400'}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          
          {error ? (
            <span className="text-error-600 dark:text-error-400">Error loading rates</span>
          ) : (
            <>
              <span>Last updated: </span>
              <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                {date ? (
                  <>
                    {timeAgoText} 
                    <span className="text-gray-500 dark:text-gray-500 ml-1">
                      ({formatTime(date)})
                    </span>
                  </>
                ) : (
                  'Never'
                )}
              </span>
            </>
          )}
        </div>
        
        <button
          onClick={handleRefreshClick}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="Refresh exchange rates"
          tabIndex={0}
          className={`ml-3 p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 
            ${loading 
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300'
            }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LastUpdated; 