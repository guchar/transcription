# Audio Transcription App

A modern web application for transcribing audio files using Cartesia's STT (Speech-to-Text) API.

## Features

- 🎤 Upload audio files up to 500MB (approximately 3-5 hours of audio)
- 🌍 Support for 25+ languages (90+ available via Cartesia)
- ⏱️ Word-level timestamps for precise playback
- 📊 Statistics including word count and speaking rate
- 🎨 Beautiful, responsive UI with dark mode support
- 📥 Download transcriptions as text files
- 📋 Copy transcription to clipboard
- 🔄 Drag-and-drop file upload
- 💾 Transcription history with localStorage persistence

## Supported Audio Formats

- MP3
- WAV
- M4A
- FLAC
- OGG
- WebM
- MP4

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Cartesia API key (sign up at [cartesia.ai](https://cartesia.ai))

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd transcription
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your Cartesia API key:

```
CARTESIA_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Important: File Size Limits in Development

⚠️ **Development Mode Limitation**: Next.js development server has a default body size limit of ~4-5MB. For files larger than 5MB, you need to use production mode:

###Solution for Large Files:

1. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

2. **Or test with smaller files** (< 5MB) in development mode

3. **In production** (Vercel, etc.), the full 500MB limit will work automatically

## Usage

1. Select the language of your audio file
2. Upload an audio file (drag-and-drop or click to browse)
3. Click "Transcribe Audio" and wait for processing
4. View the transcription with word-level timestamps
5. Copy or download the transcript as needed
6. Access transcription history to view previous transcriptions

## API Pricing

Cartesia charges **1 credit per 2 seconds** of audio:
- 1-minute audio = 30 credits
- 1-hour audio = 1,800 credits

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Cartesia Ink Whisper STT

## Project Structure

```
transcription/
├── app/
│   ├── api/
│   │   └── transcribe/
│   │       └── route.ts      # API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── AudioUploader.tsx     # File upload component
│   ├── TranscriptionDisplay.tsx # Results display
│   └── TranscriptionHistory.tsx # History viewer
├── lib/
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
├── .env                      # Environment variables
└── package.json
```

## Building for Production

```bash
npm run build
npm start
```

## Deployment

This app works great with Vercel:

```bash
vercel deploy
```

Make sure to add your `CARTESIA_API_KEY` environment variable in your Vercel project settings.

## License

MIT

## Support

For issues with the Cartesia API, visit [docs.cartesia.ai](https://docs.cartesia.ai)
