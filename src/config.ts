// Configuration for the application
const config = {
  // Backend API URL - using relative URL with the proxy
  apiUrl: '/api', // Changed to relative URL for the proxy
  
  // Enable/disable mock mode (for development without backend)
  useMockData: false, // Set to false to use the real backend API
  
  // Other configuration options
  defaultLanguage: 'en-US',
  maxFileSize: 100 * 1024 * 1024, // 100MB in bytes
};

export default config; 