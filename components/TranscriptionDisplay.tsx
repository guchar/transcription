'use client';

import { useState } from 'react';
import type { TranscriptionResponse, TranscriptionWord } from '@/lib/types';
import { formatTimestamp, formatDuration } from '@/lib/utils';

interface TranscriptionDisplayProps {
  transcription: TranscriptionResponse;
  fileName?: string;
  onReset: () => void;
}

export default function TranscriptionDisplay({
  transcription,
  fileName,
  onReset,
}: TranscriptionDisplayProps) {
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);

  function copyToClipboard() {
    navigator.clipboard.writeText(transcription.text);
  }

  function downloadTranscript() {
    const element = document.createElement('a');
    const file = new Blob([transcription.text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transcription Result
            </h2>
          </div>
          {fileName && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              File: {fileName}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="grid grid-cols-2 gap-4">
            {transcription.language && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Language:
                </span>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {transcription.language.toUpperCase()}
                </span>
              </div>
            )}
            {transcription.duration && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Duration:
                </span>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {formatDuration(transcription.duration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Full Transcription Text */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Full Transcript
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Copy
              </button>
              <button
                onClick={downloadTranscript}
                className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
            <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
              {transcription.text}
            </p>
          </div>
        </div>

        {/* Word-Level Timestamps */}
        {transcription.words && transcription.words.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Word-Level Timestamps
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {transcription.words.map((wordData: TranscriptionWord, index: number) => (
                  <span
                    key={index}
                    onMouseEnter={() => setHoveredWordIndex(index)}
                    onMouseLeave={() => setHoveredWordIndex(null)}
                    className="relative inline-block px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-default transition-colors"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {wordData.word}
                    </span>
                    {hoveredWordIndex === index && (
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 dark:bg-gray-700 text-white rounded shadow-lg whitespace-nowrap z-10">
                        {formatTimestamp(wordData.start)} -{' '}
                        {formatTimestamp(wordData.end)}
                        <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></span>
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Hover over words to see timestamps
            </p>
          </div>
        )}

        {/* Statistics */}
        {transcription.words && transcription.words.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Total Words
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {transcription.words.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Words per Minute
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {Math.round(
                    (transcription.words.length / transcription.duration) * 60
                  )}
                </p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Avg Word Duration
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {(transcription.duration / transcription.words.length).toFixed(2)}s
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
