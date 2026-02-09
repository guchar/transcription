export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 100);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const validExtensions = ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.webm', '.mp4'];
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

  if (!validExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `Unsupported file format. Please use: ${validExtensions.join(', ')}`,
    };
  }

  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 500MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}
