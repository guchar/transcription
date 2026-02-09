import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  // Return the API key to the client
  // Note: This exposes your key to the client. For production, consider:
  // 1. Using Deepgram's project-specific keys with usage limits
  // 2. Implementing rate limiting
  // 3. Using temporary keys or session-based authentication
  return NextResponse.json({ apiKey });
}
