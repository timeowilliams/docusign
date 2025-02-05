'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'Authentication_failed':
        return 'Authentication failed. Please try signing in again.';
      case 'No_code_provided':
        return 'No authentication code was provided.';
      default:
        return 'An unknown error occurred.';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">
          {getErrorMessage(message || '')}
        </p>
        <Link 
          href="/" 
          className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </main>
  );
}