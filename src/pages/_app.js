import React from 'react';
import { WritingProvider } from '../context/WritingContext';
import { ThemeProvider } from 'next-themes';
import '../styles/global.css';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class">
      <WritingProvider>
        <Component {...pageProps} />
      </WritingProvider>
    </ThemeProvider>
  );
}

export default MyApp;
