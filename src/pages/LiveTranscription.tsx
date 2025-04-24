import { useState, useEffect, useRef } from 'react';

const LiveTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentPartial, setCurrentPartial] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const updateTimer = () => {
    recordingTimeRef.current += 1;
    const minutes = Math.floor(recordingTimeRef.current / 60);
    const seconds = recordingTimeRef.current % 60;
    setRecordingTime(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  };

  const startRecording = async () => {
    setIsRecording(true);
    setIsProcessing(true);
    setErrorMessage('');
    timerRef.current = setInterval(updateTimer, 1000);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(1024, 1, 1);

    wsRef.current = new WebSocket('ws://localhost:8080/audio-stream');

    wsRef.current.onopen = () => {
      console.log('WebSocket connection established');
      setIsProcessing(false);
      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        const pcmData = e.inputBuffer.getChannelData(0);
        const int16Data = new Int16Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32768));
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(int16Data.buffer);
        }
      };
    };

    wsRef.current.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.startsWith('PARTIAL:')) {
        setCurrentPartial(message.replace('PARTIAL: ', ''));
      } else if (message.startsWith('FINAL:')) {
        const finalText = message.replace('FINAL: ', '');
        setTranscript((prev) => prev + (prev ? '\n' : '') + finalText);
        setCurrentPartial('');
      }
    };

    wsRef.current.onerror = (error: Event) => {
      setErrorMessage('WebSocket error occurred');
      setIsRecording(false);
      setIsProcessing(false);
    };
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (wsRef.current) wsRef.current.close();
  };

  const clearTranscription = () => {
    setTranscript('');
    setCurrentPartial('');
    recordingTimeRef.current = 0;
    setRecordingTime('00:00');
  };

  const downloadTranscription = () => {
    if (!transcript.trim()) return;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                    <div
                        className={`w-4 h-4 rounded-full mr-2 ${
                            isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
                        }`}
                    ></div>
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
                      disabled={!transcript && !isRecording && !currentPartial}
                      className={`py-3 px-4 rounded-md border ${
                          !transcript && !isRecording && !currentPartial
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
                        <div className="animate-pulse text-gray-500">Connecting...</div>
                      </div>
                  ) : transcript || currentPartial ? (
                      <div className="whitespace-pre-line">
                        {transcript && <p className="text-gray-900">{transcript}</p>}
                        {currentPartial && (
                            <p className="text-gray-600 italic">{currentPartial}</p>
                        )}
                      </div>
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
  );
};

export default LiveTranscription;