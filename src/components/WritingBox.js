import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';

const WritingBox = ({ boxNumber }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    // Firebase Realtime Database reference for this specific box
    const boxRef = ref(database, `boxes/${boxNumber}`);

    // Function to handle incoming data from Firebase
    const updateText = (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setText(data);
        // Optionally, update localStorage for offline capability or initial load
        localStorage.setItem(`boxText_${boxNumber}`, data);
      }
    };

    // Initial load from localStorage or set default empty string
    const localText = localStorage.getItem(`boxText_${boxNumber}`);
    if (localText) {
      setText(localText);
    } else {
      setText('');
    }

    // Listen for changes in Firebase
    const unsubscribe = onValue(boxRef, updateText);

    // Clean up listener on component unmount
    return () => unsubscribe();
  }, [boxNumber]);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Update Firebase with the new text
    set(ref(database, `boxes/${boxNumber}`), newText);
    
    // Optionally, update localStorage
    localStorage.setItem(`boxText_${boxNumber}`, newText);
  };

  return (
    <textarea
      value={text}
      onChange={handleChange}
      placeholder={`Box ${boxNumber} - Start writing...`}
      data-box-number={boxNumber}
    />
  );
};

export default WritingBox;