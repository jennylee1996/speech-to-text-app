import { useState, useRef } from 'react'
import speechToTextService from '../services/api'

const VideoToText = () => {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      // Check if file is a video
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please upload a valid video file')
        setFile(null)
        return
      }
      
      setFile(selectedFile)
      setError('')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      
      // Check if file is a video
      if (!droppedFile.type.startsWith('video/')) {
        setError('Please upload a valid video file')
        return
      }
      
      setFile(droppedFile)
      setError('')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleTranscribe = async () => {
    if (!file) return
    
    setIsUploading(true)
    setError('')
    
    try {
      // Send the file to the backend service for transcription
      const response = await speechToTextService.transcribeVideo(file);
      
      // Check if the response has the text field (from the backend)
      if (response.text) {
        setTranscript(response.text);
        setIsUploading(false);
      }
      // Check if the transcription is already completed
      else if (response.status === 'completed' && response.transcript) {
        setTranscript(response.transcript);
        setIsUploading(false);
      } else {
        // Store the transcription ID returned from the backend
        setTranscriptionId(response.transcriptionId);
        
        // Check transcription status periodically
        checkTranscriptionStatus(response.transcriptionId);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error uploading file for transcription');
      setIsUploading(false);
    }
  }
  
  const checkTranscriptionStatus = async (id: string) => {
    try {
      const statusResponse = await speechToTextService.getTranscriptionStatus(id);
      
      if (statusResponse.status === 'completed') {
        // Transcription is complete, fetch the result
        const resultResponse = await speechToTextService.getTranscriptionResult(id);
        setTranscript(resultResponse.transcript);
        setIsUploading(false);
      } else if (statusResponse.status === 'failed') {
        // Transcription failed
        setError('Transcription failed: ' + (statusResponse.error || 'Unknown error'));
        setIsUploading(false);
      } else {
        // Transcription is still in progress, check again after a delay
        setTimeout(() => checkTranscriptionStatus(id), 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error checking transcription status');
      setIsUploading(false);
    }
  }

  const handleReset = () => {
    setFile(null)
    setTranscript('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Video to Text Transcription</h1>
      
      {!transcript ? (
        <>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 ${
              error ? 'border-red-500' : 'border-gray-300 hover:border-blue-500'
            } transition-colors`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            
            <p className="mb-2 text-lg">Drag and drop your video file here, or</p>
            
            <label className="inline-block bg-blue-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-700 transition-colors">
              Choose File
              <input 
                type="file" 
                accept="video/*"
                className="hidden" 
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
            
            {error && <p className="mt-3 text-red-500">{error}</p>}
            
            {file && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-left">
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleTranscribe}
              disabled={!file || isUploading}
              className={`py-2 px-6 rounded font-medium ${
                !file || isUploading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors`}
            >
              {isUploading ? 'Processing...' : 'Transcribe Video'}
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Transcription Result</h2>
            <button
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-800"
            >
              ← New Transcription
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-y-auto">
            <p className="whitespace-pre-line">{transcript}</p>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                navigator.clipboard.writeText(transcript)
              }}
              className="mr-2 py-2 px-4 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => {
                const blob = new Blob([transcript], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'transcript.txt'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Download Text
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoToText 