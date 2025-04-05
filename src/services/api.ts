import axios from 'axios';
import config from '../config';
import mockSpeechToTextService from './mockApi';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Log the error
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API implementation
const realSpeechToTextService = {
  // Upload video file for transcription
  transcribeVideo: async (videoFile: File, languageCode: string = 'en') => {
    const formData = new FormData();
    formData.append('videoFile', videoFile);
    formData.append('languageCode', languageCode);
    
    try {
      const response = await apiClient.post('/transcribe/video', formData);
      return response.data;
    } catch (error) {
      console.error('Error transcribing video:', error);
      throw error;
    }
  },

  // Process URL to transcribe audio/video
  transcribeUrl: async (url: string) => {
    try {
      const response = await apiClient.post('/transcribe/url', { url }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error transcribing URL:', error);
      throw error;
    }
  },

  // Process URL to transcribe with link endpoint
  transcribeLink: async (url: string, languageCode: string = 'en') => {
    try {
      const response = await apiClient.post('/transcribe/link', { 
        mediaUrl: url,
        languageCode
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error transcribing link:', error);
      throw error;
    }
  },

  // Live transcription API call
  startLiveTranscription: async () => {
    try {
      const response = await apiClient.post('/transcribe/live/start');
      return response.data;
    } catch (error) {
      console.error('Error starting live transcription:', error);
      throw error;
    }
  },

  stopLiveTranscription: async () => {
    try {
      const response = await apiClient.post('/transcribe/live/stop');
      return response.data;
    } catch (error) {
      console.error('Error stopping live transcription:', error);
      throw error;
    }
  },

  // Get transcription status
  getTranscriptionStatus: async (transcriptionId: string) => {
    try {
      const response = await apiClient.get(`/transcription/${transcriptionId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting transcription status:', error);
      throw error;
    }
  },

  // Get transcription result
  getTranscriptionResult: async (transcriptionId: string) => {
    try {
      const response = await apiClient.get(`/transcription/${transcriptionId}/result`);
      return response.data;
    } catch (error) {
      console.error('Error getting transcription result:', error);
      throw error;
    }
  }
};

// Export either the real or mock service based on configuration
const speechToTextService = config.useMockData ? mockSpeechToTextService : realSpeechToTextService;

export default speechToTextService; 