
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Flashcard from './Flashcard';
import NeonButton from './NeonButton';
import NeonToggle from './NeonToggle';
import ProgressBar from './ProgressBar';
import CategoryDisplay from './CategoryDisplay';
import AIContextDisplay from './AIContextDisplay';
import { ShuffleIcon, ResetIcon, CheckIcon, XIcon, SparklesIcon } from './Icons';
import type { Card, LanguageDirection, AIContext } from '../types';

interface FlashcardViewProps {
  cards: Card[];
  onEndSession: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const FlashcardView: React.FC<FlashcardViewProps> = ({ cards, onEndSession }) => {
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

  const resetCardState = useCallback(() => {
    setIsFlipped(false);
  }, []);

  const initializeSession = useCallback(() => {
    const initialProgress = new Map<number, number>();
    cards.forEach((_, index) => {
      initialProgress.set(index, 0);
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

  const handleFlip = useCallback(() => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  }, [isFlipped]);

  const currentCard = useMemo(() => activeCards.length > 0 ? activeCards[currentIndex] : null, [activeCards, currentIndex]);
  
  // Clear AI context when card changes
  useEffect(() => {
    setAiContext(null);
    setIsContextLoading(false);
    setContextError(null);
  }, [currentCard]);


  const handleGetAIContext = async () => {
    if (!currentCard) return;

    setIsContextLoading(true);
    setAiContext(null);
    setContextError(null);

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === '' || apiKey === 'undefined') {
        throw new Error("API key not configured. Please set GEMINI_API_KEY in your .env file.");
      }

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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide context for the ${language} word "${wordToExplain}". Give me a simple sample sentence, its English translation, and a brief explanation.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      if (!response.text) {
        throw new Error("No response text received from AI");
      }

      const rawText = response.text.trim();
      // The model can sometimes wrap the JSON in markdown fences (```json ... ```).
      // This regex strips them before parsing.
      const jsonText = rawText.replace(/^```json\s*|```$/g, '');

      const data: AIContext = JSON.parse(jsonText);
      setAiContext(data);

    } catch (err) {
      console.error("AI context error:", err);
      setContextError("Failed to generate context. The AI might be offline.");
    } finally {
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
      nextStreak = 0; // Reset streak
    }
    newProgress.set(originalIndex, nextStreak);
    setCardProgress(newProgress);
    
    resetCardState();
    
    if (isCorrect && nextStreak === 3) {
        const nextActiveCards = activeCards.filter(c => c.original !== currentCard.original || c.translation !== currentCard.translation);
        const nextIndex = currentIndex >= nextActiveCards.length ? 0 : currentIndex;
        setActiveCards(nextActiveCards);
        setCurrentIndex(nextIndex);
    } else {
        setCurrentIndex(prev => (prev + 1) % (activeCards.length || 1));
    }
  }, [activeCards, currentIndex, cards, cardProgress, resetCardState, currentCard]);

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
    return <p className="text-center font-orbitron">Initializing Transmission...</p>;
  }

  if (activeCards.length === 0) {
    return (
        <div className="text-center flex flex-col items-center gap-4 p-8 bg-[#1a1a2e]/50 backdrop-blur-sm rounded-lg border border-green-400">
            <h2 className="font-orbitron text-3xl text-green-400">// SESSION COMPLETE //</h2>
            <p>All cards have been mastered. Excellent work.</p>
            <div className='flex gap-4'>
                <NeonButton onClick={initializeSession} color="green">Study Again</NeonButton>
                <NeonButton onClick={onEndSession} color="red">End Session</NeonButton>
            </div>
        </div>
    );
  }

  if (!currentCard) {
    return <p className="text-center font-orbitron text-red-500">// CRITICAL STATE ERROR: RE-INITIALIZING... //</p>;
  }


  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-lg relative">
        <Flashcard
          frontText={direction === 'de-en' ? currentCard.original : currentCard.translation}
          backText={direction === 'de-en' ? currentCard.translation : currentCard.original}
          isFlipped={isFlipped}
          onClick={handleFlip}
        />
        <NeonButton 
            onClick={handleGetAIContext} 
            disabled={isContextLoading}
            color="purple" 
            className="!p-2 absolute bottom-2 right-2 z-10"
            title="Get AI Context"
        >
            <SparklesIcon />
        </NeonButton>
      </div>
      
      <div className="w-full max-w-lg min-h-[10rem] flex items-center justify-center">
        <AIContextDisplay 
            isLoading={isContextLoading}
            contextData={aiContext}
            error={contextError}
        />
      </div>


      <div className="h-12 w-full max-w-lg flex items-center justify-center">
        {!isFlipped ? (
            <NeonButton onClick={handleFlip} color="cyan" className="w-48">
              Reveal Answer
            </NeonButton>
        ) : (
          <div className="flex items-center justify-center gap-4 w-full animate-fade-in">
             <NeonButton onClick={() => handleAnswer(false)} color="red" className="flex items-center justify-center gap-2 w-40">
                <XIcon /> Incorrect
            </NeonButton>
            <NeonButton onClick={() => handleAnswer(true)} color="green" className="flex items-center justify-center gap-2 w-40">
                <CheckIcon /> Correct
            </NeonButton>
          </div>
        )}
      </div>

      <div className="w-full max-w-lg p-4 border border-[#9d4edd]/50 bg-[#1a1a2e]/50 backdrop-blur-sm rounded-lg flex flex-col gap-4">
        <CategoryDisplay cardProgress={cardProgress} totalCards={cards.length} />
        <p className="font-orbitron text-center text-xl">{activeCards.length} Cards Remaining</p>
        <ProgressBar current={masteredCount} total={cards.length} />
        
        <div className="grid grid-cols-2 gap-4">
          <NeonButton onClick={handleShuffle} color="purple" className="flex items-center justify-center gap-2">
            <ShuffleIcon /> Shuffle
          </NeonButton>
          <NeonButton onClick={initializeSession} color="purple" className="flex items-center justify-center gap-2">
            <ResetIcon /> Reset
          </NeonButton>
        </div>
        <div className="flex justify-center">
             <NeonToggle
                label="DE↔EN"
                checked={direction === 'en-de'}
                onChange={handleDirectionChange}
            />
        </div>
      </div>
      
      <NeonButton onClick={onEndSession} color="red">End Session</NeonButton>
    </div>
  );
};

export default FlashcardView;
