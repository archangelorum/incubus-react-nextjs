/**
 * ErrorMessage component
 * 
 * A reusable error message component with customizable appearance
 */

import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
  withIcon?: boolean;
  onRetry?: () => void;
}

export default function ErrorMessage({
  message,
  className = '',
  withIcon = true,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 text-red-800 rounded-md p-4 ${className}`}>
      <div className="flex">
        {withIcon && (
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
        <div className={`${withIcon ? 'ml-3' : ''} flex-1 md:flex md:justify-between`}>
          <p className="text-sm">{message}</p>
          {onRetry && (
            <p className="mt-3 text-sm md:mt-0 md:ml-6">
              <button
                onClick={onRetry}
                className="whitespace-nowrap font-medium text-red-700 hover:text-red-600"
              >
                Retry
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}