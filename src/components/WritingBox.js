import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://words-pied.vercel.app"); // Connect to the WebSocket server

const WritingBox = ({ id }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    // Listen for updates from other users
    socket.on('updateText', (data) => {
      if (data.id === id) {
        setText(data.text);
      }
    });

    return () => socket.off('updateText'); // Cleanup on component unmount
  }, [id]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    socket.emit('textChange', { id, text: newText });
  };

  return <textarea value={text} onChange={handleTextChange} placeholder={`Write here... ${id}`} rows="4" />;
};

export default WritingBox;