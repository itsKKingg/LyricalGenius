"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCodeErrorContent() {
  const [errorDetails, setErrorDetails] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get error details from URL params
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    if (error && errorDescription) {
      setErrorDetails(`${error}: ${errorDescription}`);
    } else if (error) {
      setErrorDetails(error);
    } else {
      setErrorDetails("Authentication failed");
    }

    // Check if user is authenticated anyway (edge case)
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // User is actually authenticated, redirect to editor
          router.push("/editor");
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };

    checkAuth();
  }, [router, searchParams]);

  const handleTryAgain = () => {
    router.push("/auth/login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-orange-50 to-red-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
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
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Authentication Error
            </h1>
            <p className="text-gray-600">
              We couldn't complete your sign-in
            </p>
          </div>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  What happened?
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    The authentication process was interrupted or failed. This could happen due to:
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Expired or invalid authentication code</li>
                    <li>Network connectivity issues</li>
                    <li>Browser privacy settings blocking cookies</li>
                    <li>Provider authentication service temporarily unavailable</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Error Details (if available) */}
          {errorDetails && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-mono">
                {errorDetails}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleTryAgain}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Signing In Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Go Back to Home
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Still having trouble? Try refreshing the page or contact support if the problem persists.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-800 text-sm hover:underline transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}