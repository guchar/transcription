import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Audio Transcription App',
  description: 'Transcribe audio files using Cartesia STT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
