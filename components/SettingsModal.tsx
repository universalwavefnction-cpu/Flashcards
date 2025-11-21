import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
    }
    onClose();
  };

  const handleClear = () => {
    saveApiKey('');
    setApiKey('');
    setIsKeySet(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <motion.div
          className="modal-content card card-purple p-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            alignItems: 'center'
          }}
        >
          <h2
            id="settings-title"
            className="text-gradient-purple"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-3xl)',
              textAlign: 'center'
            }}
          >
            // SETTINGS //
          </h2>

          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)'
            }}
          >
            <label
              htmlFor="api-key-input"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-cyan)'
              }}
            >
              // Gemini API Key
            </label>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-2)'
              }}
            >
              // Your key is stored locally in your browser and never sent anywhere else.
            </p>
            {isKeySet && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-green)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                // An API key is already set. Enter a new key to overwrite it, or clear the existing one.
              </motion.p>
            )}
            <input
              id="api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="input"
            />
          </div>

          <div
            className="flex w-full gap-4"
            style={{ marginTop: 'var(--space-2)' }}
          >
            <NeonButton onClick={onClose} color="cyan" style={{ flex: 1 }}>
              Close
            </NeonButton>
            {isKeySet && (
              <NeonButton onClick={handleClear} color="red" style={{ flex: 1 }}>
                Clear Key
              </NeonButton>
            )}
            <NeonButton onClick={handleSave} color="magenta" disabled={!apiKey.trim()} style={{ flex: 1 }}>
              Save Key
            </NeonButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;
