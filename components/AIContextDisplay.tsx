import React from 'react';
import { motion } from 'framer-motion';
import type { AIContext } from '../types';

interface AIContextDisplayProps {
  isLoading: boolean;
  contextData: AIContext | null;
  error: string | null;
}

const AIContextDisplay: React.FC<AIContextDisplayProps> = ({ isLoading, contextData, error }) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          textAlign: 'center',
          padding: 'var(--space-4)'
        }}
      >
        <p
          className="animate-pulse"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-purple)'
          }}
        >
          // GENERATING CONTEXT... //
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          padding: 'var(--space-4)',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--color-red)',
          borderRadius: 'var(--radius-lg)',
          width: '100%'
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'var(--color-red-light)',
            marginBottom: 'var(--space-2)'
          }}
        >
          // AI TRANSMISSION FAILED //
        </p>
        <p
          style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-red-light)'
          }}
        >
          {error}
        </p>
      </motion.div>
    );
  }

  if (!contextData) {
    return null;
  }

  return (
    <motion.div
      className="card card-purple"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        width: '100%',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }}
    >
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-cyan)',
            marginBottom: 'var(--space-1)'
          }}
        >
          // Example Usage
        </h3>
        <p
          style={{
            fontStyle: 'italic',
            color: 'white',
            marginBottom: 'var(--space-1)'
          }}
        >
          "{contextData.sampleSentence}"
        </p>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic'
          }}
        >
          "{contextData.sentenceTranslation}"
        </p>
      </div>
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-cyan)',
            marginBottom: 'var(--space-1)'
          }}
        >
          // Explanation
        </h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {contextData.explanation}
        </p>
      </div>
    </motion.div>
  );
};

export default AIContextDisplay;
