import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        await localStorageService.deleteDeck('all');
        const currentDecks = await firestoreService.getDecks(user.uid);
        setDecks(currentDecks);
        setLegacyDecks(null);
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
  };

  const handleSaveDeck = useCallback(async (deckData: { id?: string; name: string; cards: Card[] }) => {
    if (!user) return;
    const { id, name, cards } = deckData;
    if (id) {
      const updatedDeck = await firestoreService.saveDeck(user.uid, { id, name, cards });
      setDecks(prevDecks => prevDecks.map(deck => (deck.id === id ? updatedDeck : deck)));
    } else {
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

  const handleProgressUpdate = useCallback(async (updatedCards: Card[]) => {
    if (!user || !activeDeckId) return;
    const deckToUpdate = decks.find(d => d.id === activeDeckId);
    if (!deckToUpdate) return;

    const updatedDeck = { ...deckToUpdate, cards: updatedCards };
    await firestoreService.saveDeck(user.uid, updatedDeck);
    setDecks(prevDecks => prevDecks.map(deck => (deck.id === activeDeckId ? updatedDeck : deck)));
  }, [user, activeDeckId, decks]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const activeDeck = decks.find(d => d.id === activeDeckId);

  const renderLoggedInContent = () => {
    if (legacyDecks && legacyDecks.length > 0) {
      return (
        <motion.div
          className="card card-purple p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <h2
            className="text-gradient-purple mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-2xl)'
            }}
          >
            // LEGACY DATA DETECTED //
          </h2>
          <p
            style={{
              marginBottom: 'var(--space-6)',
              color: 'var(--color-text-secondary)'
            }}
          >
            We found {legacyDecks.length} deck(s) in your browser's storage. Would you like to import them into your account?
          </p>
          <NeonButton color="magenta" onClick={handleMigrateDecks}>
            Import Decks
          </NeonButton>
        </motion.div>
      );
    }

    switch (view) {
      case 'deck-editor':
        return (
          <DeckEditor
            onSaveDeck={handleSaveDeck}
            onCancel={() => setView(activeDeckId ? 'deck-view' : 'deck-list')}
            deckToEdit={activeDeck}
          />
        );
      case 'deck-view':
        return activeDeck ? (
          <DeckView
            deck={activeDeck}
            onStartSession={handleStartSession}
            onEditDeck={() => handleEditDeck(activeDeck.id)}
            onDeleteDeck={() => handleDeleteDeck(activeDeck.id)}
            onBack={() => {
              setView('deck-list');
              setActiveDeckId(null);
            }}
          />
        ) : (
          <p>Error: Deck not found.</p>
        );
      case 'flashcards':
        return (
          <FlashcardView
            cards={currentSessionCards}
            onEndSession={handleEndSession}
            onProgressUpdate={handleProgressUpdate}
          />
        );
      case 'deck-list':
      default:
        return <DeckList decks={decks} onSelectDeck={handleSelectDeck} onCreateDeck={handleCreateNewDeck} />;
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-center">
        <motion.h2
          className="text-gradient-purple animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-2xl)',
            textAlign: 'center'
          }}
        >
          // ACCESSING SECURE CONNECTION... //
        </motion.h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-center p-4">
        <Login />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        padding: 'var(--space-4)',
        alignItems: 'center'
      }}
    >
      <div
        className="container flex flex-col"
        style={{
          maxWidth: '80rem',
          flexGrow: 1,
          justifyContent: 'center'
        }}
      >
        <motion.header
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
            cursor: 'pointer'
          }}
          onClick={() => {
            setView('deck-list');
            setActiveDeckId(null);
          }}
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-gradient-cyan"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              marginBottom: 'var(--space-2)'
            }}
          >
            Cyber Vocab
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-magenta)'
            }}
          >
            Jack in. Learn fast.
          </p>
        </motion.header>

        <motion.main
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderLoggedInContent()}
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </div>

      <motion.footer
        className="w-full container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          textAlign: 'center',
          marginTop: 'var(--space-8)',
          fontSize: 'var(--font-size-xs)',
          color: 'rgba(157, 78, 221, 0.5)',
          maxWidth: '80rem'
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)' }}>// PROTOTYPE INTERFACE v2.6 //</p>
        <p>
          {user
            ? `// CONNECTION ESTABLISHED: ${user.email || user.phoneNumber || 'User Authenticated'}`
            : '// DATA SERVICE OFFLINE //'}
        </p>
        <div
          className="flex flex-center gap-4"
          style={{
            marginTop: 'var(--space-2)',
            justifyContent: 'center'
          }}
        >
          <motion.button
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-center gap-2"
            whileHover={{ scale: 1.05, color: 'var(--color-purple-light)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              color: 'rgba(157, 78, 221, 0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-base)',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-xs)'
            }}
            aria-label="Open API Settings"
          >
            <SettingsIcon /> API Settings
          </motion.button>
          {user && (
            <motion.button
              onClick={handleLogout}
              className="flex flex-center gap-2"
              whileHover={{ scale: 1.05, color: 'var(--color-purple-light)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                color: 'rgba(157, 78, 221, 0.5)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-base)',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-xs)'
              }}
              aria-label="Logout"
            >
              <LogoutIcon /> Logout
            </motion.button>
          )}
        </div>
      </motion.footer>
      <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default App;
