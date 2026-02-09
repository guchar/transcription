'use client';

import { useState, useEffect } from 'react';
import AudioUploader from '@/components/AudioUploader';
import TranscriptionDisplay from '@/components/TranscriptionDisplay';
import TranscriptionHistory from '@/components/TranscriptionHistory';
import type { TranscriptionResponse } from '@/lib/types';

interface SavedTranscription {
  id: string;
  timestamp: number;
  fileName: string;
  transcription: TranscriptionResponse;
}

export default function Home() {
  const [currentTranscription, setCurrentTranscription] = useState<TranscriptionResponse | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [savedTranscriptions, setSavedTranscriptions] = useState<SavedTranscription[]>([]);
  const [currentTranscriptionId, setCurrentTranscriptionId] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(true);

  // Load saved transcriptions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('transcriptions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedTranscriptions(parsed);
      } catch (error) {
        console.error('Failed to load saved transcriptions:', error);
      }
    }
  }, []);

  // Save transcriptions to localStorage whenever they change
  useEffect(() => {
    if (savedTranscriptions.length > 0) {
      localStorage.setItem('transcriptions', JSON.stringify(savedTranscriptions));
    }
  }, [savedTranscriptions]);

  function handleTranscriptionComplete(result: TranscriptionResponse, fileName?: string) {
    const newId = Date.now().toString();
    const newSaved: SavedTranscription = {
      id: newId,
      timestamp: Date.now(),
      fileName: fileName || 'Untitled Audio',
      transcription: result,
    };

    setSavedTranscriptions((prev) => [newSaved, ...prev]);
    setCurrentTranscription(result);
    setCurrentFileName(fileName || 'Untitled Audio');
    setCurrentTranscriptionId(newId);
    setShowUploader(false);
  }

  function handleSelectTranscription(id: string) {
    const selected = savedTranscriptions.find((t) => t.id === id);
    if (selected) {
      setCurrentTranscription(selected.transcription);
      setCurrentFileName(selected.fileName);
      setCurrentTranscriptionId(id);
      setShowUploader(false);
    }
  }

  function handleDeleteTranscription(id: string) {
    setSavedTranscriptions((prev) => prev.filter((t) => t.id !== id));
    
    // If we deleted the currently viewed transcription, reset to uploader
    if (currentTranscriptionId === id) {
      setCurrentTranscription(null);
      setCurrentTranscriptionId(null);
      setShowUploader(true);
    }
  }

  function handleNewTranscription() {
    setShowUploader(true);
    setCurrentTranscription(null);
    setCurrentTranscriptionId(null);
  }

  function handleClearAll() {
    if (confirm('Are you sure you want to delete all transcriptions? This cannot be undone.')) {
      setSavedTranscriptions([]);
      setCurrentTranscription(null);
      setCurrentTranscriptionId(null);
      setShowUploader(true);
      localStorage.removeItem('transcriptions');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Audio Transcription
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Transcribe audio files up to 1 hour long using Cartesia STT
          </p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handleNewTranscription}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              New Transcription
            </button>
            {savedTranscriptions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Transcription History */}
        <TranscriptionHistory
          savedTranscriptions={savedTranscriptions}
          currentTranscriptionId={currentTranscriptionId}
          onSelectTranscription={handleSelectTranscription}
          onDeleteTranscription={handleDeleteTranscription}
        />

        {/* Content */}
        {showUploader ? (
          <AudioUploader onTranscriptionComplete={handleTranscriptionComplete} />
        ) : currentTranscription ? (
          <TranscriptionDisplay
            transcription={currentTranscription}
            fileName={currentFileName}
            onReset={handleNewTranscription}
          />
        ) : null}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by Cartesia Ink Whisper STT API
          </p>
        </div>
      </div>
    </main>
  );
}
