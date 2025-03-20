
console.log('Current NODE_ENV:', process.env.NODE_ENV);
const config = {
    apiUrl: process.env.NODE_ENV === 'production' 
      ? 'https://financial-transcription-app.onrender.com' 
      : '' // Empty string for development, which will use the proxy
  };

export default config;
