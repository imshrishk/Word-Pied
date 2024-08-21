import React from 'react';
import { WritingProvider } from '../context/WritingContext';
import '../styles/global.css'; // Import global styles here

function MyApp({ Component, pageProps }) {
  return (
    <WritingProvider>
      <Component {...pageProps} />
    </WritingProvider>
  );
}

export default MyApp;
