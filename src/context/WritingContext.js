import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const WritingContext = createContext();

export function useWriting() {
  return useContext(WritingContext);
}

export function WritingProvider({ children }) {
  const [boxes, setBoxes] = useState({});
  const [boxMeta, setBoxMeta] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boxesRef = ref(database, 'boxes');
    const boxesUnsubscribe = onValue(boxesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBoxes(data);
      }
      setLoading(false);
    });

    const metaRef = ref(database, 'boxMeta');
    const metaUnsubscribe = onValue(metaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBoxMeta(data);
      }
    });

    return () => {
      boxesUnsubscribe();
      metaUnsubscribe();
    };
  }, []);

  const value = {
    boxes,
    boxMeta,
    loading
  };

  return (
    <WritingContext.Provider value={value}>
      {children}
    </WritingContext.Provider>
  );
}
