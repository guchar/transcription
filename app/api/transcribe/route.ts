import { NextRequest, NextResponse } from 'next/server';

// Configure route to handle large files
export const maxDuration = 300; // 5 minutes max for transcription
export const dynamic = 'force-dynamic';

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
    const apiKey = process.env.CARTESIA_API_KEY;
    if (!apiKey) {
      console.error('CARTESIA_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: API key not configured' },
        { status: 500 }
      );
    }

    // Create form data for Cartesia API
    const cartesiaFormData = new FormData();
    cartesiaFormData.append('file', file);
    cartesiaFormData.append('model', 'ink-whisper');
    cartesiaFormData.append('language', language);
    cartesiaFormData.append('timestamp_granularities[]', 'word');

    // Call Cartesia STT API
    const cartesiaResponse = await fetch('https://api.cartesia.ai/stt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Cartesia-Version': '2025-04-16',
      },
      body: cartesiaFormData,
    });

    if (!cartesiaResponse.ok) {
      const errorText = await cartesiaResponse.text();
      console.error('Cartesia API error:', errorText);
      
      let errorMessage = 'Transcription failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = `Transcription failed: ${cartesiaResponse.statusText}`;
      }

      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: cartesiaResponse.status }
      );
    }

    const transcription = await cartesiaResponse.json();

    return NextResponse.json(transcription);
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
