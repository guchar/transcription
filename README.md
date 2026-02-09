# Audio Transcription App

A modern web application for transcribing audio files with speaker diarization using Deepgram's Speech-to-Text API.

## Features

- 🎤 Upload audio files up to 500MB (approximately 3-5 hours of audio)
- 👥 **Speaker Diarization** - Automatically identify and label 2-3+ different speakers
- 🎨 **Color-coded Speakers** - Visual distinction between speakers with dedicated color schemes
- 🌍 Support for 25+ languages
- ⏱️ Word-level timestamps for precise playback
- 📊 Statistics including word count and speaking rate
- 💬 Beautiful, responsive UI with dark mode support
- 📥 Download transcriptions as text files (with speaker labels)
- 📋 Copy transcription to clipboard
- 🔄 Drag-and-drop file upload
- 💾 Transcription history with localStorage persistence
- 🔀 Toggle between speaker view and plain text view

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
- A Deepgram API key (sign up at [deepgram.com](https://deepgram.com))

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd transcription
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your Deepgram API key:

```
DEEPGRAM_API_KEY=your_api_key_here
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
4. View the transcription with automatic speaker identification
5. Toggle between "Speaker View" (color-coded by speaker) and "Plain Text" view
6. Copy or download the transcript with speaker labels
7. Access transcription history to view previous transcriptions

## API Pricing

Deepgram charges approximately **$0.0125 per minute** of audio:
- 1-minute audio = $0.0125
- 1-hour audio = $0.75
- Speaker diarization is included at no extra cost

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Deepgram Nova-2 with Speaker Diarization

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

Make sure to add your `DEEPGRAM_API_KEY` environment variable in your Vercel project settings.

## Speaker Diarization

The app automatically detects and labels different speakers in your audio:

- **Automatic Detection**: No need to specify the number of speakers
- **Color-Coded Display**: Each speaker gets a unique color for easy visual distinction
- **Speaker Legend**: Visual guide showing which color corresponds to which speaker
- **Timestamp Tracking**: See exactly when each speaker starts and stops talking
- **Formatted Export**: Download or copy transcripts with "Speaker 1:", "Speaker 2:" labels

### Best Results

For optimal speaker diarization:
- Use clear audio with minimal background noise
- Ensure speakers don't overlap too frequently
- Use recordings where speakers have distinct voices
- Recommend 2-5 speakers for best accuracy

## License

MIT

## Support

For issues with the Deepgram API, visit [developers.deepgram.com](https://developers.deepgram.com)
