
import React from 'react';
import type { AIContext } from '../types';

interface AIContextDisplayProps {
  isLoading: boolean;
  contextData: AIContext | null;
  error: string | null;
}

const AIContextDisplay: React.FC<AIContextDisplayProps> = ({ isLoading, contextData, error }) => {
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p className="font-orbitron text-lg text-[#9d4edd] animate-pulse">// GENERATING CONTEXT... //</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-md w-full">
        <p className="font-bold font-orbitron text-center">// AI TRANSMISSION FAILED //</p>
        <p className="text-center text-sm">{error}</p>
      </div>
    );
  }

  if (!contextData) {
    return null; // Render nothing if there's no data, error, or loading state
  }

  return (
    <div className="w-full p-4 border border-[#9d4edd]/50 bg-[#1a1a2e]/50 backdrop-blur-sm rounded-lg flex flex-col gap-3 animate-fade-in">
      <div>
        <h3 className="font-orbitron text-sm uppercase tracking-wider text-[#00f3ff] mb-1">// Example Usage</h3>
        <p className="italic text-white">"{contextData.sampleSentence}"</p>
        <p className="text-sm text-gray-400 italic">"{contextData.sentenceTranslation}"</p>
      </div>
      <div>
        <h3 className="font-orbitron text-sm uppercase tracking-wider text-[#00f3ff] mb-1">// Explanation</h3>
        <p className="text-gray-300">{contextData.explanation}</p>
      </div>
    </div>
  );
};

export default AIContextDisplay;
