import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import Flashcard from './Flashcard';
import NeonButton from './NeonButton';
import NeonToggle from './NeonToggle';
import ProgressBar from './ProgressBar';
import CategoryDisplay from './CategoryDisplay';
import AIContextDisplay from './AIContextDisplay';
import { ShuffleIcon, ResetIcon, CheckIcon, XIcon, SparklesIcon } from './Icons';
import type { Card, LanguageDirection, AIContext } from '../types';
import { getApiKey } from '../hooks/useLocalStorage';

interface FlashcardViewProps {
  cards: Card[];
  onEndSession: () => void;
  onProgressUpdate?: (updatedCards: Card[]) => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const FlashcardView: React.FC<FlashcardViewProps> = ({ cards, onEndSession, onProgressUpdate }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [cardProgress, setCardProgress] = useState<Map<number, number>>(new Map());
  const [activeCards, setActiveCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<LanguageDirection>('de-en');

  // AI Context State
  const [aiContext, setAiContext] = useState<AIContext | null>(null);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  useEffect(() => {
    const key = getApiKey() || process.env.API_KEY;
    setIsAiEnabled(!!key);
  }, [cards]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const resetCardState = useCallback(() => {
    setIsFlipped(false);
  }, []);

  const initializeSession = useCallback(() => {
    const initialProgress = new Map<number, number>();
    cards.forEach((card, index) => {
      initialProgress.set(index, card.progress ?? 0);
    });
    setCardProgress(initialProgress);
    setActiveCards(shuffleArray(cards));
    setCurrentIndex(0);
    resetCardState();
    setIsInitialized(true);
  }, [cards, resetCardState]);

  useEffect(() => {
    setIsInitialized(false);
    initializeSession();
  }, [cards, initializeSession]);

  const handleFlip = useCallback((event?: React.MouseEvent | React.TouchEvent) => {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    if (!isFlipped) {
      setIsFlipped(true);
    }
  }, [isFlipped]);

  const currentCard = useMemo(() => activeCards.length > 0 ? activeCards[currentIndex] : null, [activeCards, currentIndex]);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setAiContext(null);
    setIsContextLoading(false);
    setContextError(null);
  }, [currentCard]);

  const handleGetAIContext = async (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!currentCard) return;

    const apiKey = getApiKey() || process.env.API_KEY;

    if (!apiKey) {
      setContextError("Gemini API Key not found. Please add it in the settings.");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsContextLoading(true);
    setAiContext(null);
    setContextError(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const timeoutId = setTimeout(() => abortController.abort(), 15000);

    try {
      const ai = new GoogleGenAI({ apiKey });

      const language = direction === 'de-en' ? 'German' : 'English';
      const wordToExplain = direction === 'de-en' ? currentCard.original : currentCard.translation;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          sampleSentence: {
            type: Type.STRING,
            description: `A simple sample sentence in ${language} using the word.`,
          },
          sentenceTranslation: {
            type: Type.STRING,
            description: 'The English translation of the sample sentence.',
          },
          explanation: {
            type: Type.STRING,
            description: "A brief, simple explanation of the word's meaning or usage.",
          },
        },
        required: ['sampleSentence', 'sentenceTranslation', 'explanation'],
      };

      const apiCall = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide context for the ${language} word "${wordToExplain}". Give me a simple sample sentence, its English translation, and a brief explanation.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      const timeoutPromise = new Promise((_, reject) => {
        abortController.signal.addEventListener('abort', () => {
          reject(new Error('Request timeout'));
        });
      });

      const response = await Promise.race([apiCall, timeoutPromise]);

      if (!response.text) {
        throw new Error("No response text received from AI");
      }

      const rawText = response.text.trim();
      const jsonText = rawText.replace(/^```json\s*|```$/g, '');

      const data: AIContext = JSON.parse(jsonText);
      setAiContext(data);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error("AI context error:", err);
      if (err instanceof Error && err.message === 'Request timeout') {
        setContextError("Request timed out. Please check your connection and try again.");
      } else {
        setContextError("Failed to generate context. The AI might be offline or the API key is invalid.");
      }
    } finally {
      clearTimeout(timeoutId);
      setIsContextLoading(false);
    }
  };

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (!currentCard) return;

    const originalIndex = cards.findIndex(c => c.original === currentCard.original && c.translation === currentCard.translation);
    if (originalIndex === -1) return;

    const currentStreak = cardProgress.get(originalIndex) || 0;
    const newProgress = new Map(cardProgress);
    let nextStreak = currentStreak;

    if (isCorrect) {
      nextStreak = Math.min(currentStreak + 1, 3);
    } else {
      nextStreak = 0;
    }
    newProgress.set(originalIndex, nextStreak);
    setCardProgress(newProgress);

    const updatedCards = cards.map((card, index) => ({
      ...card,
      progress: newProgress.get(index) ?? 0
    }));

    if (onProgressUpdate) {
      onProgressUpdate(updatedCards);
    }

    resetCardState();

    if (isCorrect && nextStreak === 3) {
      const nextActiveCards = activeCards.filter(c => c.original !== currentCard.original || c.translation !== currentCard.translation);
      const nextIndex = currentIndex >= nextActiveCards.length ? 0 : currentIndex;
      setActiveCards(nextActiveCards);
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex(prev => (prev + 1) % (activeCards.length || 1));
    }
  }, [activeCards, currentIndex, cards, cardProgress, resetCardState, currentCard, onProgressUpdate]);

  const handleShuffle = () => {
    const nonMasteredCards = cards.filter((_, index) => (cardProgress.get(index) || 0) < 3);
    setActiveCards(shuffleArray(nonMasteredCards));
    setCurrentIndex(0);
    resetCardState();
  };

  const handleDirectionChange = useCallback(() => {
    setDirection(d => (d === 'de-en' ? 'en-de' : 'de-en'));
    resetCardState();
  }, [resetCardState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip]);

  const masteredCount = useMemo(() => {
    let count = 0;
    cardProgress.forEach(progress => {
      if (progress >= 3) count++;
    });
    return count;
  }, [cardProgress]);

  if (!isInitialized) {
    return (
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)' }}>
        <p>Initializing Transmission...</p>
      </div>
    );
  }

  if (activeCards.length === 0) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)',
          padding: 'var(--space-8)',
          border: '1px solid var(--color-green)'
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-3xl)',
            color: 'var(--color-green)'
          }}
        >
          // SESSION COMPLETE //
        </h2>
        <p>All cards have been mastered. Excellent work.</p>
        <div className="flex gap-4">
          <NeonButton onClick={initializeSession} color="green">Study Again</NeonButton>
          <NeonButton onClick={onEndSession} color="red">End Session</NeonButton>
        </div>
      </motion.div>
    );
  }

  if (!currentCard) {
    return (
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-display)', color: 'var(--color-red)' }}>
        // CRITICAL STATE ERROR: RE-INITIALIZING... //
      </p>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ alignItems: 'center' }}
    >
      <div style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
        <Flashcard
          frontText={direction === 'de-en' ? currentCard.original : currentCard.translation}
          backText={direction === 'de-en' ? currentCard.translation : currentCard.original}
          isFlipped={isFlipped}
          onClick={handleFlip}
        />
        <NeonButton
          onClick={handleGetAIContext}
          onTouchStart={handleGetAIContext}
          disabled={isContextLoading || !isAiEnabled}
          color="purple"
          className="btn-icon"
          style={{
            position: 'absolute',
            bottom: 'var(--space-2)',
            right: 'var(--space-2)',
            zIndex: 10,
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation',
            pointerEvents: 'auto'
          }}
          title={isAiEnabled ? "Get AI Context" : "API Key not set"}
        >
          <SparklesIcon />
        </NeonButton>
      </div>

      <div style={{ width: '100%', maxWidth: '600px', minHeight: '10rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AIContextDisplay
          isLoading={isContextLoading}
          contextData={aiContext}
          error={contextError}
        />
      </div>

      <div style={{ height: '3rem', width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <NeonButton onClick={handleFlip} color="cyan" style={{ width: '12rem' }}>
                Reveal Answer
              </NeonButton>
            </motion.div>
          ) : (
            <motion.div
              key="answer"
              className="flex flex-center gap-4 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <NeonButton onClick={() => handleAnswer(false)} color="red" className="flex flex-center gap-2" style={{ width: '10rem' }}>
                <XIcon /> Incorrect
              </NeonButton>
              <NeonButton onClick={() => handleAnswer(true)} color="green" className="flex flex-center gap-2" style={{ width: '10rem' }}>
                <CheckIcon /> Correct
              </NeonButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="card card-purple p-4 flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ width: '100%', maxWidth: '600px' }}
      >
        <CategoryDisplay cardProgress={cardProgress} />
        <p style={{ fontFamily: 'var(--font-display)', textAlign: 'center', fontSize: 'var(--font-size-xl)' }}>
          {activeCards.length} Cards Remaining
        </p>
        <ProgressBar current={masteredCount} total={cards.length} />

        <div className="grid grid-cols-2 gap-4">
          <NeonButton onClick={handleShuffle} color="purple" className="flex flex-center gap-2">
            <ShuffleIcon /> Shuffle
          </NeonButton>
          <NeonButton onClick={initializeSession} color="purple" className="flex flex-center gap-2">
            <ResetIcon /> Reset
          </NeonButton>
        </div>
        <div className="flex flex-center">
          <NeonToggle
            label="DE↔EN"
            checked={direction === 'en-de'}
            onChange={handleDirectionChange}
          />
        </div>
      </motion.div>

      <NeonButton onClick={onEndSession} color="red">End Session</NeonButton>
    </motion.div>
  );
};

export default FlashcardView;
