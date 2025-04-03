# Speech to Text App

A React application that offers multiple options for converting speech to text.

## Features

- **Video to Text**: Upload a video file and get text transcription.
- **Link to Text**: Convert audio/video from a URL into text.
- **Live Transcription**: Real-time speech-to-text using your microphone.

## Getting Started

### Prerequisites

- Node.js (version 14.0 or later)
- npm (version 6.0 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/speech-to-text-app.git
   cd speech-to-text-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- React Router

## Project Structure

```
speech-to-text-app/
├── src/
│   ├── components/
│   │   └── Layout.tsx
│   │   ├── Home.tsx
│   │   ├── VideoToText.tsx
│   │   ├── LinkToText.tsx
│   │   └── LiveTranscription.tsx
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
├── public/
└── ...configuration files
```

## Implementation Notes

This is a frontend-only implementation with simulated transcription functionality. In a production environment, you would need to:

1. Implement actual speech recognition using the Web Speech API or a similar service
2. Add backend services to handle file uploads and transcription processing
3. Integrate with third-party speech-to-text APIs like Google Speech-to-Text, Amazon Transcribe, etc.

## License

MIT 