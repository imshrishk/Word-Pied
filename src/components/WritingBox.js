import { useEffect, useState, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import styles from './WritingBox.module.css';

const WritingBox = ({ boxNumber }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const textboxRef = useRef(null);

  useEffect(() => {
    const boxRef = ref(database, `boxes/${boxNumber}`);

    const updateText = (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setHtmlContent(data);
        localStorage.setItem(`boxText_${boxNumber}`, data);
      }
    };

    const localText = localStorage.getItem(`boxText_${boxNumber}`);
    if (localText) {
      setHtmlContent(localText);
    } else {
      setHtmlContent('');
    }

    const boxUnsubscribe = onValue(boxRef, updateText);

    return () => {
      boxUnsubscribe();
    };
  }, [boxNumber]);

  const handleBlur = () => {
    const newContent = textboxRef.current.innerHTML; // Use innerHTML to get full HTML content
    setHtmlContent(newContent);

    set(ref(database, `boxes/${boxNumber}`), newContent);
    localStorage.setItem(`boxText_${boxNumber}`, newContent);
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

        // Instead of calling handleInput here, we'll manually update the text
        const newContent = textboxRef.current.innerHTML;
        setHtmlContent(newContent);
        set(ref(database, `boxes/${boxNumber}`), newContent);
        localStorage.setItem(`boxText_${boxNumber}`, newContent);
        selection.removeAllRanges();
      }
    }
  };

  return (
    <div
      className={styles.writingBox}
      contentEditable
      ref={textboxRef}
      onBlur={handleBlur}
      onMouseUp={handleMouseUp}
      placeholder={`Box ${boxNumber} - Start writing...`}
      data-box-number={boxNumber}
      dangerouslySetInnerHTML={{ __html: htmlContent }} // Use dangerouslySetInnerHTML to set HTML content
    />
  );
};

export default WritingBox;
