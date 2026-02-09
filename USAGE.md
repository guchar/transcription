# Quick Start Guide

## Running the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

### Step 1: Select Language
Choose the language of your audio file from the dropdown menu. The default is English (en).

### Step 2: Upload Audio File
- **Option A:** Click the upload area and browse for a file
- **Option B:** Drag and drop an audio file into the upload area

Supported formats:
- MP3, WAV, M4A, FLAC, OGG, WebM, MP4
- Maximum file size: 100MB
- Maximum duration: ~1 hour

### Step 3: Transcribe
Click the "Transcribe Audio" button. The transcription may take a few moments depending on the file size.

### Step 4: View Results
Once complete, you'll see:
- **Full transcript** - The complete transcription text
- **Word-level timestamps** - Hover over any word to see its exact timing
- **Statistics** - Total words, words per minute, and average word duration

### Step 5: Save or Copy
- Click **Copy** to copy the transcript to your clipboard
- Click **Download** to save it as a text file
- Click **New Transcription** to start over

## Troubleshooting

### "Server configuration error: API key not configured"
Make sure you have created a `.env` file in the project root with:
```
CARTESIA_API_KEY=your_actual_api_key_here
```

### File size exceeds limit
Audio files must be under 100MB. Try:
- Using a lower bitrate encoding
- Converting to a more efficient format (e.g., MP3 at 128kbps)
- Splitting longer files into segments

### Transcription takes too long
This is normal for longer files. A 1-hour audio file may take several minutes to process.

## Features

✅ 25+ languages supported (with 90+ available)
✅ Drag-and-drop upload
✅ Real-time file validation
✅ Word-level timestamps
✅ Copy/download transcriptions
✅ Dark mode support
✅ Responsive design
✅ Detailed statistics

## API Costs

Cartesia charges **1 credit per 2 seconds** of audio:
- 30-second clip = 15 credits
- 5-minute audio = 150 credits
- 30-minute audio = 900 credits
- 1-hour audio = 1,800 credits

Monitor your usage at [cartesia.ai](https://cartesia.ai)
