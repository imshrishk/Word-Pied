import { useEffect, useState, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import styles from './WritingBox.module.css';

const WritingBox = ({ boxNumber }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const textboxRef = useRef(null);
  const [dynamicClass, setDynamicClass] = useState(generateDynamicClass());

  useEffect(() => {
    const boxRef = ref(database, `boxes/${boxNumber}`);

    const updateText = (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        const decodedContent = safeDecodeContent(data);
        setHtmlContent(decodedContent);
        localStorage.setItem(`boxText_${boxNumber}`, data);
      }
    };

    const localText = localStorage.getItem(`boxText_${boxNumber}`);
    if (localText) {
      setHtmlContent(safeDecodeContent(localText));
    } else {
      setHtmlContent('');
    }

    const boxUnsubscribe = onValue(boxRef, updateText);

    // Disable right-click and key combinations to open dev tools
    const disableRightClick = (e) => e.preventDefault();
    const disableDevTools = (e) => {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableDevTools);

    return () => {
      boxUnsubscribe();
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableDevTools);
    };
  }, [boxNumber]);

  const handleBlur = () => {
    const newContent = textboxRef.current.innerHTML;
    setHtmlContent(newContent);

    const encodedContent = safeEncodeContent(newContent);
    set(ref(database, `boxes/${boxNumber}`), encodedContent);
    localStorage.setItem(`boxText_${boxNumber}`, encodedContent);
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      const url = prompt('Enter the URL for the link:');
      if (url) {
        let validUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          validUrl = `https://${url}`;
        }

        const anchor = document.createElement('a');
        anchor.href = validUrl;
        anchor.textContent = selection.toString();
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';

        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(anchor);

        const newContent = textboxRef.current.innerHTML;
        setHtmlContent(newContent);
        set(ref(database, `boxes/${boxNumber}`), safeEncodeContent(newContent));
        localStorage.setItem(`boxText_${boxNumber}`, safeEncodeContent(newContent));
        selection.removeAllRanges();
      }
    }
  };

  return (
    <div
      className={`${styles.writingBox} ${dynamicClass}`}
      contentEditable
      ref={textboxRef}
      onBlur={handleBlur}
      onMouseUp={handleMouseUp}
      placeholder={`Box ${boxNumber} - Start writing...`}
      data-box-number={boxNumber}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default WritingBox;

// Helper functions
const generateDynamicClass = () => {
  return 'writingBox_' + Math.random().toString(36).substr(2, 9);
};

const safeEncodeContent = (content) => {
  try {
    return btoa(unescape(encodeURIComponent(content)));
  } catch (e) {
    console.error('Encoding error:', e);
    return content; // Fallback to plain text if encoding fails
  }
};

const safeDecodeContent = (encodedContent) => {
  try {
    return decodeURIComponent(escape(atob(encodedContent)));
  } catch (e) {
    console.error('Decoding error:', e);
    return encodedContent; // Fallback to plain text if decoding fails
  }
};
