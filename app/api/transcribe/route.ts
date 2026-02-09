import { NextRequest, NextResponse } from 'next/server';
import { TranscriptionSegment, TranscriptionWord } from '@/lib/types';

// Configure route to handle large files
export const maxDuration = 300; // 5 minutes max for transcription
export const dynamic = 'force-dynamic';

interface DeepgramWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
  punctuated_word?: string;
}

interface DeepgramResponse {
  results: {
    channels: [{
      alternatives: [{
        transcript: string;
        confidence: number;
        words: DeepgramWord[];
      }];
    }];
  };
  metadata: {
    duration: number;
  };
}

function groupWordsBySpeaker(words: DeepgramWord[]): TranscriptionSegment[] {
  if (!words || words.length === 0) return [];

  const segments: TranscriptionSegment[] = [];
  let currentSpeaker = words[0].speaker ?? 0;
  let currentText = '';
  let currentStart = words[0].start;
  let currentEnd = words[0].end;

  words.forEach((word, index) => {
    const speaker = word.speaker ?? 0;
    const wordText = word.punctuated_word || word.word;

    if (speaker !== currentSpeaker) {
      // Speaker changed, save current segment
      segments.push({
        speaker: currentSpeaker,
        text: currentText.trim(),
        start: currentStart,
        end: currentEnd,
      });

      // Start new segment
      currentSpeaker = speaker;
      currentText = wordText;
      currentStart = word.start;
      currentEnd = word.end;
    } else {
      // Same speaker, continue building text
      currentText += ' ' + wordText;
      currentEnd = word.end;
    }

    // Handle last word
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

export async function POST(request: NextRequest) {
  try {
    // Parse form data manually to handle large files
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'en';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 500MB limit' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      console.error('DEEPGRAM_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: API key not configured' },
        { status: 500 }
      );
    }

    // Convert file to array buffer for Deepgram
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Deepgram API with diarization enabled
    const deepgramUrl = `https://api.deepgram.com/v1/listen?model=nova-2&diarize=true&punctuate=true&smart_format=true&language=${language}`;
    
    const deepgramResponse = await fetch(deepgramUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': file.type || 'audio/wav',
      },
      body: buffer,
    });

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();
      console.error('Deepgram API error:', errorText);
      
      let errorMessage = 'Transcription failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = `Transcription failed: ${deepgramResponse.statusText}`;
      }

      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: deepgramResponse.status }
      );
    }

    const deepgramData: DeepgramResponse = await deepgramResponse.json();
    
    // Extract transcript and words from Deepgram response
    const channel = deepgramData.results.channels[0];
    const alternative = channel.alternatives[0];
    const transcript = alternative.transcript;
    const words = alternative.words;
    const duration = deepgramData.metadata.duration;

    // Group words by speaker
    const segments = groupWordsBySpeaker(words);

    // Count unique speakers
    const speakerSet = new Set(words.map(w => w.speaker ?? 0));
    const speakerCount = speakerSet.size;

    // Map words to our interface
    const transcriptionWords: TranscriptionWord[] = words.map(w => ({
      word: w.punctuated_word || w.word,
      start: w.start,
      end: w.end,
      speaker: w.speaker,
    }));

    // Return response in expected format
    return NextResponse.json({
      text: transcript,
      language: language,
      duration: duration,
      words: transcriptionWords,
      segments: segments,
      speakers: speakerCount,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process transcription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
