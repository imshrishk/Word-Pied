import { WritingProvider } from '../context/WritingContext';

function MyApp({ Component, pageProps }) {
  return (
    <WritingProvider>
      <Component {...pageProps} />
    </WritingProvider>
  );
}

export default MyApp;