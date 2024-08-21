import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';

const WritingBox = ({ boxNumber }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    // Reference to this specific box in Firebase
    const boxRef = ref(database, `boxes/${boxNumber}`);

    // This function will be called whenever the data in Firebase changes
    const updateText = (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setText(data);
        // Optionally update localStorage for offline or initial load purposes
        localStorage.setItem(`boxText_${boxNumber}`, data);
      }
    };

    // Initial load from localStorage or set default
    const localText = localStorage.getItem(`boxText_${boxNumber}`);
    if (localText) {
      setText(localText);
    } else {
      setText('');
    }

    // Subscribe to changes in the specific box in Firebase
    const boxUnsubscribe = onValue(boxRef, updateText);

    // Cleanup function to unsubscribe from Firebase when component unmounts
    return () => {
      boxUnsubscribe();
    };
  }, [boxNumber]);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Update Firebase with the new text for the specific box
    set(ref(database, `boxes/${boxNumber}`), newText);

    // Optionally update localStorage
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
