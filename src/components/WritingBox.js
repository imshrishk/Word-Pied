import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';

const WritingBox = ({ id }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    // Load data from localStorage on component mount
    const savedText = localStorage.getItem(`texts_${id}`);
    if (savedText) {
      setText(savedText);
    }

    // Firebase Realtime Database reference for this specific box
    const textRef = ref(database, `texts/${id}`);

    // Listen for changes in Firebase
    const unsubscribe = onValue(textRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setText(data);
        // Update localStorage when data changes
        localStorage.setItem(`texts_${id}`, data);
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [id]);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Update localStorage
    localStorage.setItem(`texts_${id}`, newText);

    // Update Firebase
    set(ref(database, `texts/${id}`), newText);
  };

  return (
    <textarea
      value={text}
      onChange={handleChange}
      placeholder="Start writing..."
    />
  );
};

export default WritingBox;
