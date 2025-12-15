import { useState } from 'react';
import type { GeneratorOptions } from '../types';
import { generateZip } from '../utils/zipGenerator';

interface DownloadButtonProps {
  options: GeneratorOptions;
}

export function DownloadButton({ options }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    setShowSuccess(false);
    try {
      await generateZip(options);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Step 3: Download</h2>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className={`w-full py-4 px-6 font-semibold rounded-lg transition-colors text-lg flex items-center justify-center gap-2 ${
          isLoading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating...
          </>
        ) : (
          'Download ZIP'
        )}
      </button>
      {showSuccess && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Download complete! Check your downloads folder.</span>
        </div>
      )}
    </div>
  );
}
