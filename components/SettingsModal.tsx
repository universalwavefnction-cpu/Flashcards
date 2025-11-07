import React, { useState, useEffect } from 'react';
import NeonButton from './NeonButton';
import { saveApiKey, getApiKey } from '../hooks/useLocalStorage';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);

  useEffect(() => {
    const currentKey = getApiKey();
    if (currentKey) {
      setIsKeySet(true);
      // For security, we don't display the key in the input
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
        saveApiKey(apiKey.trim());
    }
    onClose();
  };
  
  const handleClear = () => {
    saveApiKey(''); // This will remove the key
    setApiKey('');
    setIsKeySet(false);
  }

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
    >
      <div 
        className="p-6 border border-[#9d4edd] bg-[#1a1a2e] shadow-lg shadow-[#9d4edd]/20 rounded-lg flex flex-col gap-6 items-center w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-title" className="font-orbitron text-3xl text-center text-[#9d4edd]">
          // SETTINGS //
        </h2>
        
        <div className="w-full flex flex-col gap-2">
            <label htmlFor="api-key-input" className="font-bold uppercase tracking-wider text-[#00f3ff]">
              // Gemini API Key
            </label>
            <p className="text-xs text-gray-400 mb-2">// Your key is stored locally in your browser and never sent anywhere else.</p>
            {isKeySet && (
              <p className="text-sm text-green-400 mb-2">// An API key is already set. Enter a new key to overwrite it, or clear the existing one.</p>
            )}
            <input
                id="api-key-input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full p-3 bg-[#0a0e27]/80 border-2 border-[#00f3ff] rounded-md focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e] text-white transition-all duration-300 shadow-inner shadow-[#00f3ff]/20"
            />
        </div>

        <div className="flex w-full gap-4 mt-2">
            <NeonButton onClick={onClose} color="cyan" className="flex-1">
              Close
            </NeonButton>
            {isKeySet && <NeonButton onClick={handleClear} color="red" className="flex-1">Clear Key</NeonButton>}
            <NeonButton onClick={handleSave} color="magenta" className="flex-1" disabled={!apiKey.trim()}>
              Save Key
            </NeonButton>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;