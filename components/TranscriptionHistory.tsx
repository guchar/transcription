'use client';

import { formatDuration } from '@/lib/utils';
import type { TranscriptionResponse } from '@/lib/types';

interface SavedTranscription {
  id: string;
  timestamp: number;
  fileName: string;
  transcription: TranscriptionResponse;
}

interface TranscriptionHistoryProps {
  savedTranscriptions: SavedTranscription[];
  currentTranscriptionId: string | null;
  onSelectTranscription: (id: string) => void;
  onDeleteTranscription: (id: string) => void;
}

export default function TranscriptionHistory({
  savedTranscriptions,
  currentTranscriptionId,
  onSelectTranscription,
  onDeleteTranscription,
}: TranscriptionHistoryProps) {
  if (savedTranscriptions.length === 0) {
    return null;
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <div className="w-full max-w-6xl mx-auto mb-6 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transcription History ({savedTranscriptions.length})
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedTranscriptions.map((saved) => (
            <div
              key={saved.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                currentTranscriptionId === saved.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
              }`}
              onClick={() => onSelectTranscription(saved.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {saved.fileName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(saved.timestamp)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTranscription(saved.id);
                  }}
                  className="ml-2 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete transcription"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-1">
                {saved.transcription.language && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Language:</span>{' '}
                    {saved.transcription.language.toUpperCase()}
                  </p>
                )}
                {saved.transcription.duration && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Duration:</span>{' '}
                    {formatDuration(saved.transcription.duration)}
                  </p>
                )}
                {saved.transcription.words && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Words:</span>{' '}
                    {saved.transcription.words.length}
                  </p>
                )}
              </div>
              
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {saved.transcription.text}
              </p>
              
              {currentTranscriptionId === saved.id && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                    Current
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
