import React, { useState, useEffect } from 'react';
import { FiUser, FiSave, FiEdit, FiX } from 'react-icons/fi';

const UserProfile = () => {
  const [username, setUsername] = useState('Anonymous');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('username');
      if (savedUsername) {
        setUsername(savedUsername);
      }
    }
  }, []);

  const handleSaveUsername = () => {
    const newUsername = username.trim() || 'Anonymous';
    if (typeof window !== 'undefined') {
      localStorage.setItem('username', newUsername);
    }
    setUsername(newUsername);
    setShowPopup(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all"
        title="User Profile"
      >
        <FiUser size={18} />
        <span className="text-sm font-medium">{username}</span>
      </button>

      {showPopup && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Set Your Display Name</h3>
            <button onClick={() => setShowPopup(false)} className="text-gray-500">
              <FiX size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:border-gray-600 dark:bg-gray-700"
              maxLength={20}
              autoFocus
            />
            <button
              onClick={handleSaveUsername}
              className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              title="Save username"
            >
              <FiSave size={16} />
            </button>
          </div>
          
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            This name will appear on your edits. It's stored locally in your browser.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
