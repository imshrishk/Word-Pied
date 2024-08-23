import { useEffect, useState, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import styles from './WritingBox.module.css';

const WritingBox = ({ boxNumber }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const textboxRef = useRef(null);
  const [dynamicClass, setDynamicClass] = useState(generateDynamicClass());
  const [showLinkButton, setShowLinkButton] = useState(false);
  const [selectionRange, setSelectionRange] = useState(null);

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

    return () => {
      boxUnsubscribe();
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
      setShowLinkButton(true);
      setSelectionRange(selection.getRangeAt(0));
    } else {
      setShowLinkButton(false);
    }
  };

  const addLink = () => {
    const url = prompt('Enter the URL for the link:');
    if (url && selectionRange) {
      let validUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        validUrl = `https://${url}`;
      }

      const anchor = document.createElement('a');
      anchor.href = validUrl;
      anchor.textContent = selectionRange.toString();
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';

      selectionRange.deleteContents();
      selectionRange.insertNode(anchor);

      const newContent = textboxRef.current.innerHTML;
      setHtmlContent(newContent);
      set(ref(database, `boxes/${boxNumber}`), safeEncodeContent(newContent));
      localStorage.setItem(`boxText_${boxNumber}`, safeEncodeContent(newContent));
      setShowLinkButton(false);
    }
  };

  return (
    <div className={styles.container}>
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
      {showLinkButton && (
        <button className={styles.linkButton} onClick={addLink}>
          Add Link
        </button>
      )}
    </div>
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
