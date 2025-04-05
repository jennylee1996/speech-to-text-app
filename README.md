# Speech to Text App

A React application for transcribing speech from video files, audio URLs, and live microphone input.

## Features

- Upload video files for transcription
- Transcribe audio/video from URLs
- Live speech-to-text transcription
- Download transcription results

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Backend Speech-to-Text Service (Spring Boot application)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/speech-to-text-app.git
   cd speech-to-text-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Connecting to the Backend API

This frontend application connects to a Spring Boot backend service for speech-to-text processing. By default, it expects the backend to be running at `http://localhost:8080/api`.

### API Configuration

To configure the connection to your backend service, edit the `src/config.ts` file:

```typescript
// Configuration for the application
const config = {
  // Backend API URL
  apiUrl: 'http://localhost:8080/api', // Change this to match your backend URL
  
  // Enable/disable mock mode (for development without backend)
  useMockData: false,
  
  // Other configuration options
  defaultLanguage: 'en-US',
  maxFileSize: 100 * 1024 * 1024, // 100MB in bytes
};
```

- Change `apiUrl` to match your backend service URL
- Set `useMockData` to `true` to use mock data for development without a backend

### API Endpoints

The frontend expects the following endpoints to be available on the backend:

#### Video Transcription
- `POST /api/transcribe/video` - Upload a video file for transcription
  - Request: `multipart/form-data` with `videoFile` field and optional `languageCode` field (defaults to "en")
  - Response: `{ transcriptionId: string, status: string, transcript: string }`

#### Link Transcription
- `POST /api/transcribe/link` - Transcribe content from a URL (direct response)
  - Request: `{ mediaUrl: string, languageCode: string }`
  - Response: `{ status: string, transcript: string, mediaUrl: string }`

#### Live Transcription
- `POST /api/transcribe/live/start` - Start live transcription session
  - Response: `{ sessionId: string, message: string }`
- `POST /api/transcribe/live/stop` - Stop live transcription session
  - Response: `{ message: string }`

#### Transcription Status and Results
- `GET /api/transcription/{id}/status` - Get transcription status
  - Response: `{ transcriptionId: string, status: string, progress: number }`
- `GET /api/transcription/{id}/result` - Get transcription result
  - Response: `{ transcriptionId: string, transcript: string }`

## Development

### Mock API

For development without a backend, you can enable mock mode in `src/config.ts`:

```typescript
const config = {
  // ...
  useMockData: true,
  // ...
};
```

This will use simulated API responses instead of making actual HTTP requests.

## Building for Production

Build the application for production:

```bash
npm run build
```

The build files will be in the `dist` directory.

## License

This project is licensed under the MIT License. 