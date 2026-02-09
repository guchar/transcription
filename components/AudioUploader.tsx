'use client';

import { useState } from 'react';
import { validateAudioFile } from '@/lib/utils';
import type { TranscriptionResponse, TranscriptionError } from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/types';

interface AudioUploaderProps {
  onTranscriptionComplete: (result: TranscriptionResponse, fileName?: string) => void;
}

export default function AudioUploader({ onTranscriptionComplete }: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFileSelect(file: File | null) {
    if (!file) {
      setSelectedFile(null);
      setError(null);
      return;
    }

    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setIsLoading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const fileSize = selectedFile.size;
      const fileSizeMB = fileSize / (1024 * 1024);
      
      // Use direct upload for files larger than 4MB (Vercel Hobby limit is ~4.5MB)
      if (fileSizeMB > 4) {
        await handleDirectUpload();
      } else {
        await handleProxyUpload();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  }

  // Direct upload to Deepgram (for files > 4MB)
  async function handleDirectUpload() {
    if (!selectedFile) return;

    try {
      // Get API key from our secure endpoint
      const keyResponse = await fetch('/api/deepgram-key');
      if (!keyResponse.ok) {
        throw new Error('Failed to get API credentials');
      }
      const { apiKey } = await keyResponse.json();

      // Simulate progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);

      // Upload directly to Deepgram
      const deepgramUrl = `https://api.deepgram.com/v1/listen?model=nova-2&diarize=true&punctuate=true&smart_format=true&language=${selectedLanguage}`;
      
      const arrayBuffer = await selectedFile.arrayBuffer();
      
      const deepgramResponse = await fetch(deepgramUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': selectedFile.type || 'audio/wav',
        },
        body: arrayBuffer,
      });

      clearInterval(uploadInterval);
      setUploadProgress(95);

      if (!deepgramResponse.ok) {
        const errorText = await deepgramResponse.text();
        throw new Error(`Transcription failed: ${deepgramResponse.statusText}`);
      }

      const deepgramData = await deepgramResponse.json();
      
      // Process the response
      const channel = deepgramData.results.channels[0];
      const alternative = channel.alternatives[0];
      const words = alternative.words;

      // Group words by speaker
      const segments = groupWordsBySpeaker(words);
      
      // Count unique speakers
      const speakerSet = new Set(words.map((w: any) => w.speaker ?? 0));
      
      const result: TranscriptionResponse = {
        text: alternative.transcript,
        language: selectedLanguage,
        duration: deepgramData.metadata.duration,
        words: words.map((w: any) => ({
          word: w.punctuated_word || w.word,
          start: w.start,
          end: w.end,
          speaker: w.speaker,
        })),
        segments: segments,
        speakers: speakerSet.size,
      };

      setUploadProgress(100);
      onTranscriptionComplete(result, selectedFile.name);
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      throw error;
    }
  }

  // Proxy upload through API route (for files ≤ 4MB)
  async function handleProxyUpload() {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('language', selectedLanguage);

    // Simulate progress for upload phase
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(uploadInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    clearInterval(uploadInterval);
    setUploadProgress(100);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(
        response.status === 413 
          ? 'File is too large. Please use a smaller file or compress your audio.'
          : `Server error: ${text.substring(0, 100)}`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as TranscriptionError).error || 'Transcription failed');
    }

    onTranscriptionComplete(data as TranscriptionResponse, selectedFile.name);
    setSelectedFile(null);
    setUploadProgress(0);
  }

  // Helper function to group words by speaker
  function groupWordsBySpeaker(words: any[]) {
    if (!words || words.length === 0) return [];

    const segments: any[] = [];
    let currentSpeaker = words[0].speaker ?? 0;
    let currentText = '';
    let currentStart = words[0].start;
    let currentEnd = words[0].end;

    words.forEach((word, index) => {
      const speaker = word.speaker ?? 0;
      const wordText = word.punctuated_word || word.word;

      if (speaker !== currentSpeaker) {
        segments.push({
          speaker: currentSpeaker,
          text: currentText.trim(),
          start: currentStart,
          end: currentEnd,
        });

        currentSpeaker = speaker;
        currentText = wordText;
        currentStart = word.start;
        currentEnd = word.end;
      } else {
        currentText += ' ' + wordText;
        currentEnd = word.end;
      }

      if (index === words.length - 1) {
        segments.push({
          speaker: currentSpeaker,
          text: currentText.trim(),
          start: currentStart,
          end: currentEnd,
        });
      }
    });

    return segments;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Upload Audio File
        </h2>

        {/* Language Selector */}
        <div className="mb-6">
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Select Language
          </label>
          <select
            id="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            accept=".mp3,.wav,.m4a,.flac,.ogg,.webm,.mp4"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
            disabled={isLoading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedFile ? (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {selectedFile.name}
                </span>
              ) : (
                <>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </>
              )}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              MP3, WAV, M4A, FLAC, OGG, WebM up to 500MB
            </span>
          </label>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">File size:</span>{' '}
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        {isLoading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Processing...
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Uploading and transcribing your audio file...
            </p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
          className={`w-full mt-6 px-6 py-3 rounded-md font-medium transition-colors ${
            !selectedFile || isLoading
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Transcribing...
            </span>
          ) : (
            'Transcribe Audio'
          )}
        </button>

        {/* Info Text */}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Transcription may take a few moments depending on file size
        </p>
      </div>
    </div>
  );
}
