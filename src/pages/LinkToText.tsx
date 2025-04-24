import { useState } from 'react'
import speechToTextService from '../services/api'
import config from '../config'
import Spinner from '../components/Spinner'

const LinkToText = () => {
  const [url, setUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    setError('')
  }
  
  const validateUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
    } catch {
      return false
    }
  }
  
  const handleTranscribe = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }
    
    if (!validateUrl(url)) {
      setError('Please enter a valid URL')
      return
    }
    
    setIsProcessing(true)
    setError('')
    
    try {
      // Use the transcribeLink method with language code from config
      const response = await speechToTextService.transcribeLink(url, config.defaultLanguage);
      console.log('API response:', response);
      
      // Check if the text field exists in the response
      if (response && response.text) {
        // Set the transcript from the text field
        setTranscript(response.text);
        setIsProcessing(false);
      } else if (response && response.transcript) {
        // Fall back to transcript field if it exists
        setTranscript(response.transcript);
        setIsProcessing(false);
      } else {
        setError('No transcription text found in the response');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Error processing URL:', error);
      setError(error.response?.data?.message || 'Error processing URL for transcription');
      setIsProcessing(false);
    }
  }
  
  const handleReset = () => {
    setUrl('')
    setTranscript('')
    setError('')
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Link to Text Transcription</h1>
      
      {!transcript ? (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label htmlFor="url-input" className="block text-lg font-medium mb-2">
              Enter URL of audio or video content:
            </label>
            
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com/video.mp4"
              className={`w-full p-3 border rounded-md mb-2 focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="text-sm text-gray-600 mb-6">
              <p>Supported format:</p>
              <ul className="list-disc list-inside ml-2">
                <li>YouTube Link</li>
              </ul>
            </div>
            
            <button
              onClick={handleTranscribe}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                isProcessing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <Spinner size="sm" color="text-white" />
                  <span className="ml-2">Processing...</span>
                </span>
              ) : (
                'Transcribe Content'
              )}
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
          
          <div className="mb-4">
            <span className="text-gray-600">Source: </span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
              {url}
            </a>
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

export default LinkToText 