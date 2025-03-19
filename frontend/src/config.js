// const config = {
//     apiUrl: process.env.NODE_ENV === 'production' 
//       ? 'https://financial-transcription-app.onrender.com' 
//       : 'http://localhost:5001'
//   };

const config = {
    apiUrl: process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-domain.onrender.com' 
      : '' // Empty string for development, which will use the proxy
  };
  
export default config;
