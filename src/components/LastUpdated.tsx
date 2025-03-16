import React, { useState, useEffect } from 'react';

interface LastUpdatedProps {
  date: Date | null;
  loading: boolean;
  onRefresh: () => void;
  error?: Error | null;
}

const LastUpdated: React.FC<LastUpdatedProps> = ({ 
  date, 
  loading, 
  onRefresh,
  error
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [isRefreshDisabled, setIsRefreshDisabled] = useState<boolean>(false);
  
  // Update the time ago text every minute
  useEffect(() => {
    if (!date) return;
    
    const updateTimeAgo = () => {
      setTimeAgo(formatTimeAgo(date));
    };
    
    // Initial update
    updateTimeAgo();
    
    // Set up interval to update every minute
    const interval = setInterval(updateTimeAgo, 60000);
    
    return () => clearInterval(interval);
  }, [date]);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  const handleRefreshClick = () => {
    if (loading || isRefreshDisabled) return;
    
    // Disable refresh button for 10 seconds to prevent spam
    setIsRefreshDisabled(true);
    onRefresh();
    
    setTimeout(() => {
      setIsRefreshDisabled(false);
    }, 10000); // 10 seconds cooldown
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !loading && !isRefreshDisabled) {
      handleRefreshClick();
    }
  };

  // Determine status text and color
  let statusText = 'Rates not yet loaded';
  let statusColor = 'text-gray-500 dark:text-gray-400';
  
  if (loading) {
    statusText = 'Updating rates...';
    statusColor = 'text-blue-600 dark:text-blue-400';
  } else if (error) {
    statusText = 'Error updating rates';
    statusColor = 'text-red-600 dark:text-red-400';
  } else if (date) {
    statusText = `Last updated: ${timeAgo}`;
    
    // If rates are older than 2 hours, show in warning color
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const isStale = (new Date().getTime() - date.getTime()) > twoHoursInMs;
    
    if (isStale) {
      statusColor = 'text-yellow-600 dark:text-yellow-400';
    }
  }

  return (
    <div className="flex items-center text-sm">
      <span className={statusColor}>
        {statusText}
      </span>
      <div
        className={`ml-2 cursor-pointer ${(loading || isRefreshDisabled) ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}
        onClick={handleRefreshClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Refresh exchange rates"
        aria-disabled={loading || isRefreshDisabled}
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
      </div>
    </div>
  );
};

export default LastUpdated; 