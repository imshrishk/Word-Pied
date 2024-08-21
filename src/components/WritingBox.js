import React, { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';

const WritingBox = ({ id }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    const textRef = ref(database, `texts/${id}`);

    onValue(textRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setText(data);
      }
    });
  }, [id]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    set(ref(database, `texts/${id}`), newText);
  };

  return <textarea value={text} onChange={handleTextChange} placeholder={`Write here... ${id}`} rows="4" />;
};

export default WritingBox;