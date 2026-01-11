'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  const clearLocalCache = async () => {
    if (typeof window === 'undefined') return;

    localStorage.clear();
    sessionStorage.clear();

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  };

  const handleRetry = async () => {
    await clearLocalCache();
    reset();
  };

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
            <div className="flex flex-col items-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Application Error
              </h2>
              <p className="text-gray-600 text-center mb-6">
                {error.message || 'A fatal error occurred'}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-400 mb-6">
                  Error ID: {error.digest}
                </p>
              )}
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Retry
              </button>
              <p className="text-sm text-gray-500 mt-4 text-center">
                The local cache has been cleared. If the problem persists, please
                refresh the page.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
