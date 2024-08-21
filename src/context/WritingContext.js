// In WritingContext.js
import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const WritingContext = createContext({
  submitWriting: async () => {
    console.error('Default submitWriting function called. Context not properly set up.');
  }
});

export const WritingProvider = ({ children }) => {
  const [state, setState] = useState({});

  const submitWriting = async (data) => {
    try {
      await api.post(process.env.API_ENDPOINT, data);
    } catch (error) {
      console.error('Failed to submit writing:', error);
    }
  };

  return (
    <WritingContext.Provider value={{ submitWriting, state }}>
      {children}
    </WritingContext.Provider>
  );
};

export const useWritingContext = () => {
  const context = useContext(WritingContext);
  if (context === undefined) {
    throw new Error('useWritingContext must be used within a WritingProvider');
  }
  return context;
};