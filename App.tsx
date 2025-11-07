import React, { useState, useCallback, useEffect } from 'react';
import DeckEditor from './components/VocabularyInput';
import FlashcardView from './components/FlashcardView';
import * as firestoreService from './hooks/useFirestore';
import * as localStorageService from './hooks/useLocalStorage';
import type { Card, Deck } from './types';
import NeonButton from './components/NeonButton';
import { SettingsIcon, LogoutIcon } from './components/Icons';
import SettingsModal from './components/SettingsModal';
import DeckList from './components/DeckList';
import DeckView from './components/DeckView';
import { useAuth } from './auth/AuthContext';
import Login from './auth/Login';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

type AppView = 'deck-list' | 'deck-editor' | 'deck-view' | 'flashcards';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSessionCards, setCurrentSessionCards] = useState<Card[]>([]);
  const [view, setView] = useState<AppView>('deck-list');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [legacyDecks, setLegacyDecks] = useState<Deck[] | null>(null);

  useEffect(() => {
    if (user) {
      const initializeApp = async () => {
        setIsLoading(true);
        const currentDecks = await firestoreService.getDecks(user.uid);
        setDecks(currentDecks);
        // Check for legacy decks on first load after login
        const localDecks = await localStorageService.getDecks();
        if (localDecks.length > 0) {
            setLegacyDecks(localDecks);
        }
        setIsLoading(false);
      };
      initializeApp();
    } else {
      setDecks([]);
      setIsLoading(false);
    }
  }, [user]);
  
  const handleMigrateDecks = async () => {
    if (user && legacyDecks) {
      try {
        await firestoreService.importLegacyDecks(user.uid, legacyDecks);
        // Clear legacy decks from local storage after successful migration
        await localStorageService.deleteDeck('all');
        const currentDecks = await firestoreService.getDecks(user.uid);
        setDecks(currentDecks);
        setLegacyDecks(null); // Hide migration prompt
      } catch (error) {
        console.error("Failed to migrate decks:", error);
        alert("There was an error migrating your decks. Please try again.");
      }
    }
  };


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
    await firestoreService.deleteDeck(user.uid, deckId);
    setDecks(decks.filter(d => d.id !== deckId));
    setView('deck-list');
    setActiveDeckId(null);
  }

  const handleSaveDeck = useCallback(async (deckData: { id?: string; name: string; cards: Card[] }) => {
    if (!user) return;
    const { id, name, cards } = deckData;
    if (id) { // Editing existing deck
      const updatedDeck = await firestoreService.saveDeck(user.uid, { id, name, cards });
      setDecks(prevDecks => prevDecks.map(deck => (deck.id === id ? updatedDeck : deck)));
    } else { // Creating new deck
      const newDeck = await firestoreService.createDeck(user.uid, { name, cards });
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
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const activeDeck = decks.find(d => d.id === activeDeckId);

  const renderContent = () => {
    if (isLoading || authLoading) {
      return (
        <div className="p-6 text-center">
            <h2 className="font-orbitron text-2xl text-center text-[#9d4edd] animate-pulse">// ACCESSING SECURE CONNECTION... //</h2>
        </div>
      );
    }
    
    if (!user) {
        return <Login />;
    }

    if (legacyDecks && legacyDecks.length > 0) {
        return (
            <div className="p-6 text-center border border-[#9d4edd] bg-[#1a1a2e]/50 backdrop-blur-sm shadow-lg shadow-[#9d4edd]/20 rounded-lg">
                <h2 className="font-orbitron text-2xl text-[#9d4edd] mb-4">// LEGACY DATA DETECTED //</h2>
                <p className="mb-6 text-gray-300">We found {legacyDecks.length} deck(s) in your browser's storage. Would you like to import them into your account?</p>
                <NeonButton color="magenta" onClick={handleMigrateDecks}>
                    Import Decks
                </NeonButton>
            </div>
        );
    }

    switch(view) {
      case 'deck-editor':
        return <DeckEditor
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

  return (
    <div className="min-h-screen w-full bg-[#0a0e27] text-[#00f3ff] bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:3rem_3rem] p-4 sm:p-8 flex flex-col items-center justify-center">
      <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8 cursor-pointer" onClick={() => { setView('deck-list'); setActiveDeckId(null); }}>
          <h1 className="font-orbitron text-4xl md:text-6xl font-bold uppercase tracking-widest text-shadow-glow">
            Cyber Vocab
          </h1>
          <p className="text-lg text-[#ff006e]">Jack in. Learn fast.</p>
        </header>

        <main className="w-full">
          {renderContent()}
        </main>

        <footer className="text-center mt-8 text-xs text-purple-400/50">
            <p>// PROTOTYPE INTERFACE v2.6 //</p>
            <p>{user ? `// CONNECTION ESTABLISHED: ${user.email}` : '// DATA SERVICE OFFLINE //'}</p>
            <div className="flex items-center justify-center gap-4 mt-2">
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-purple-400/50 hover:text-purple-300 transition-colors flex items-center gap-2 mx-auto"
                    aria-label="Open API Settings"
                >
                    <SettingsIcon /> API Settings
                </button>
                {user && (
                    <button 
                        onClick={handleLogout}
                        className="text-purple-400/50 hover:text-purple-300 transition-colors flex items-center gap-2 mx-auto"
                        aria-label="Logout"
                    >
                        <LogoutIcon /> Logout
                    </button>
                )}
            </div>
        </footer>
      </div>
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;