import React, { useState, useCallback, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { useAuth } from './auth/AuthContext';

import DeckList from './components/DeckList';
import DeckView from './components/DeckView';
import VocabularyInput from './components/VocabularyInput';
import FlashcardView from './components/FlashcardView';
import * as dataService from './hooks/useFirestore';
import * as legacyDataService from './hooks/useLocalStorage';

import type { Card, Deck } from './types';
import NeonButton from './components/NeonButton';
import { PlusIcon, EditIcon, TrashIcon, ArrowLeftIcon, GoogleIcon, LogoutIcon } from './components/Icons';


// --- Authentication & Login Components ---

const LoginView = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="p-6 border border-[#9d4edd] bg-[#1a1a2e]/50 backdrop-blur-sm shadow-lg shadow-[#9d4edd]/20 rounded-lg flex flex-col gap-6 items-center animate-fade-in">
      <h2 className="font-orbitron text-3xl text-center text-[#9d4edd]">
        // AUTHENTICATION REQUIRED //
      </h2>
      <p className="text-center text-gray-300">
        Sign in to access your databanks and synchronize your progress across devices.
      </p>
      <NeonButton onClick={handleLogin} color="cyan" className="mt-4 w-full max-w-xs flex items-center justify-center gap-2">
        <GoogleIcon /> Sign in with Google
      </NeonButton>
    </div>
  );
};


// --- Main App Component ---

type AppView = 'deck-list' | 'deck-editor' | 'deck-view' | 'flashcards';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSessionCards, setCurrentSessionCards] = useState<Card[]>([]);
  const [view, setView] = useState<AppView>('deck-list');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      const initializeApp = async () => {
        setIsLoading(true);

        // One-time migration of legacy data
        const hasMigrated = localStorage.getItem('hasMigratedToFirestore');
        if (!hasMigrated) {
          const legacyDeck = await legacyDataService.migrateLegacyData();
          if (legacyDeck) {
              if(window.confirm("We've found a deck in your browser's local storage. Would you like to import it to your account?")) {
                  await dataService.importLegacyDeck(user.uid, legacyDeck);
              }
          }
          localStorage.setItem('hasMigratedToFirestore', 'true');
        }

        const userDecks = await dataService.getDecks(user.uid);
        setDecks(userDecks);
        setIsLoading(false);
      };
      initializeApp();
    } else if (!authLoading && !user) {
      // Clear state when user logs out
      setDecks([]);
      setIsLoading(false);
      setView('deck-list');
      setActiveDeckId(null);
    }
  }, [user, authLoading]);

  const handleCreateNewDeck = () => {
    setActiveDeckId(null);
    setView('deck-editor');
  };

  const handleSelectDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    setView('deck-view');
  };

  const handleEditDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    setView('deck-editor');
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!user) return;
    await dataService.deleteDeck(user.uid, deckId);
    setDecks(decks.filter(d => d.id !== deckId));
    setView('deck-list');
    setActiveDeckId(null);
  }

  const handleSaveDeck = useCallback(async (deckData: { id?: string; name: string; cards: Card[] }) => {
    if (!user) return;
    const { id, name, cards } = deckData;
    if (id) { // Editing existing deck
      const updatedDeck = await dataService.saveDeck(user.uid, { id, name, cards });
      setDecks(prevDecks => prevDecks.map(deck => (deck.id === id ? updatedDeck : deck)));
    } else { // Creating new deck
      const newDeck = await dataService.createDeck(user.uid, { name, cards });
      setDecks(prevDecks => [...prevDecks, newDeck]);
    }
    setView('deck-list');
    setActiveDeckId(null);
  }, [user]);

  const handleStartSession = useCallback((cards: Card[]) => {
    if (cards.length > 0) {
      setCurrentSessionCards(cards);
      setView('flashcards');
    }
  }, []);

  const handleEndSession = () => {
    setView(activeDeckId ? 'deck-view' : 'deck-list');
  };

  const activeDeck = decks.find(d => d.id === activeDeckId);

  const renderContent = () => {
    if (authLoading || (user && isLoading)) {
      return (
        <div className="p-6 text-center">
            <h2 className="font-orbitron text-2xl text-center text-[#9d4edd] animate-pulse">// ACCESSING SECURE CHANNEL... //</h2>
        </div>
      );
    }

    if (!user) {
      return <LoginView />;
    }

    switch(view) {
      case 'deck-editor':
        return <VocabularyInput
                  onSaveDeck={handleSaveDeck}
                  onCancel={() => setView(activeDeckId ? 'deck-view' : 'deck-list')}
                  deckToEdit={activeDeck}
                />
      case 'deck-view':
        return activeDeck ? <DeckView
                              deck={activeDeck}
                              onStartSession={handleStartSession}
                              onEditDeck={() => handleEditDeck(activeDeck.id)}
                              onDeleteDeck={() => handleDeleteDeck(activeDeck.id)}
                              onBack={() => { setView('deck-list'); setActiveDeckId(null); }}
                            /> : <p>Error: Deck not found.</p>;
      case 'flashcards':
        return <FlashcardView cards={currentSessionCards} onEndSession={handleEndSession} />
      case 'deck-list':
      default:
        return <DeckList decks={decks} onSelectDeck={handleSelectDeck} onCreateDeck={handleCreateNewDeck} />
    }
  }

  const handleLogout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout Error:', error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0e27] text-[#00f3ff] bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:3rem_3rem] p-4 sm:p-8 flex flex-col items-center justify-center">
      <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 text-left">
                {user && <span className="text-xs text-gray-400 hidden sm:inline-block">User: {user.displayName}</span>}
            </div>
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => { if (user) { setView('deck-list'); setActiveDeckId(null); } }}
            >
              <h1 className="font-orbitron text-4xl md:text-6xl font-bold uppercase tracking-widest text-shadow-glow">
                Cyber Vocab
              </h1>
              <p className="text-lg text-[#ff006e]">Jack in. Learn fast.</p>
            </div>
             <div className="flex-1 text-right">
                {user && (
                    <NeonButton onClick={handleLogout} color="red" className="!p-2 flex items-center gap-2 ml-auto">
                      <LogoutIcon /> <span className="hidden sm:inline">Log Out</span>
                    </NeonButton>
                )}
            </div>
          </div>
        </header>

        <main className="w-full">
          {renderContent()}
        </main>

        <footer className="text-center mt-8 text-xs text-purple-400/50">
            <p>// PROTOTYPE INTERFACE v3.0 //</p>
            <p>// {user ? 'FIRESTORE CONNECTION: SECURE' : 'AWAITING AUTHENTICATION'} //</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
