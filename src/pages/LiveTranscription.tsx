import { useState, useEffect, useRef } from 'react'
import Spinner from '../components/Spinner'

const LiveTranscription = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const recordingTimeRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const [recordingTime, setRecordingTime] = useState('00:00')
  
  // This would be where you connect to the Web Speech API in a real implementation
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMessage('Speech recognition is not supported in your browser. Try Chrome or Edge.')
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])
  
  const updateTimer = () => {
    recordingTimeRef.current += 1
    const minutes = Math.floor(recordingTimeRef.current / 60)
    const seconds = recordingTimeRef.current % 60
    setRecordingTime(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    )
  }
  
  const startRecording = async () => {
    setIsRecording(true)
    setIsProcessing(true)
    setErrorMessage('')
    
    // Reset recording time
    recordingTimeRef.current = 0
    setRecordingTime('00:00')
    
    // Start timer
    timerRef.current = window.setInterval(updateTimer, 1000)
    
    try {
      // Request microphone access and initialize MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          try {
            const response = await fetch('/api/liveTranscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/octet-stream' },
              body: event.data
            });
            const result = await response.text();
            console.log('Audio chunk response:', result);
          } catch (error) {
            console.error('Error sending audio chunk:', error);
          }
        }
      };

      recorder.onstart = () => {
        setIsProcessing(false);
        console.log('Recording started');
      };

      recorder.onstop = () => {
        console.log('Recording stopped');
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording with 1 second time slices
      recorder.start(1000);
      setTranscript('');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Error starting live transcription');
      setIsProcessing(false);
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }
  
  const stopRecording = async () => {
    setIsRecording(false)
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'Error stopping live transcription');
    }
  }
  
  const clearTranscription = () => {
    setTranscript('')
    recordingTimeRef.current = 0
    setRecordingTime('00:00')
  }
  
  const downloadTranscription = () => {
    if (!transcript.trim()) return
    
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Live Transcription</h1>
      
      {errorMessage ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{errorMessage}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="font-medium">{isRecording ? 'Recording' : 'Not Recording'}</span>
              </div>
              <div className="text-lg font-mono">{recordingTime}</div>
            </div>
            
            <div className="flex space-x-4 mb-6">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  Stop Recording
                </button>
              )}
              
              <button
                onClick={clearTranscription}
                disabled={!transcript && !isRecording}
                className={`py-3 px-4 rounded-md border ${
                  !transcript && !isRecording
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors'
                }`}
              >
                Clear
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
              {isProcessing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center">
                    <Spinner size="md" color="text-blue-600" />
                    <p className="mt-2 text-gray-500">Listening...</p>
                  </div>
                </div>
              ) : transcript ? (
                <p className="whitespace-pre-line">{transcript}</p>
              ) : (
                <div className="text-gray-400 text-center h-full flex items-center justify-center">
                  <p>Transcription will appear here as you speak...</p>
                </div>
              )}
            </div>
          </div>
          
          {transcript && (
            <div className="flex justify-end">
              <button
                onClick={() => navigator.clipboard.writeText(transcript)}
                className="mr-3 py-2 px-4 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={downloadTranscription}
                className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Download Text
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LiveTranscription 