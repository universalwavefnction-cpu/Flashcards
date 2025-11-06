
import React, { useState, useCallback, useEffect } from 'react';
import DeckEditor from './components/VocabularyInput';
import FlashcardView from './components/FlashcardView';
import * as dataService from './hooks/useLocalStorage';
import type { Card, Deck } from './types';
import NeonButton from './components/NeonButton';
import { PlusIcon, EditIcon, TrashIcon, ArrowLeftIcon } from './components/Icons';


// --- Inlined Components to avoid creating new files ---

interface DeckListProps {
  decks: Deck[];
  onSelectDeck: (deckId: string) => void;
  onCreateDeck: () => void;
}

const DeckList: React.FC<DeckListProps> = ({ decks, onSelectDeck, onCreateDeck }) => {
  return (
    <div className="p-6 border border-[#9d4edd] bg-[#1a1a2e]/50 backdrop-blur-sm shadow-lg shadow-[#9d4edd]/20 rounded-lg flex flex-col gap-4 animate-fade-in">
        <h2 className="font-orbitron text-3xl text-center text-[#9d4edd]">
            // SELECT DATABANK //
        </h2>
        {decks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2">
            {decks.map((deck) => (
                <button
                key={deck.id}
                onClick={() => onSelectDeck(deck.id)}
                className="p-4 border-2 border-[#00f3ff] rounded-lg bg-[#0a0e27]/50 hover:bg-[#00f3ff]/10 hover:shadow-[0_0_15px_#00f3ff] transition-all duration-300 text-left"
                >
                <h3 className="font-orbitron text-xl text-white truncate">{deck.name}</h3>
                <p className="text-sm text-gray-400">{deck.cards.length} cards</p>
                </button>
            ))}
            </div>
        ) : (
            <p className="text-center text-gray-400 py-8">// NO DATABANKS FOUND. CREATE ONE TO BEGIN. //</p>
        )}
         <NeonButton onClick={onCreateDeck} color="magenta" className="mt-4 w-full flex items-center justify-center gap-2">
            <PlusIcon /> Create New Databank
        </NeonButton>
    </div>
  );
};

interface DeckViewProps {
    deck: Deck;
    onStartSession: (cards: Card[]) => void;
    onEditDeck: () => void;
    onDeleteDeck: () => void;
    onBack: () => void;
}

const DeckView: React.FC<DeckViewProps> = ({ deck, onStartSession, onEditDeck, onDeleteDeck, onBack }) => {
    const [chunkSize, setChunkSize] = useState(20);

    const handleStart = () => {
        const shuffledCards = [...deck.cards].sort(() => Math.random() - 0.5);
        const sessionChunk = shuffledCards.slice(0, Math.min(chunkSize, deck.cards.length));
        onStartSession(sessionChunk);
    };
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the databank "${deck.name}"? This action cannot be undone.`)) {
            onDeleteDeck();
        }
    };

    return (
        <div className="p-6 border border-[#9d4edd] bg-[#1a1a2e]/50 backdrop-blur-sm shadow-lg shadow-[#9d4edd]/20 rounded-lg flex flex-col gap-6 items-center animate-fade-in">
            <div className="w-full flex justify-between items-center gap-4">
                <NeonButton onClick={onBack} color="purple" className="!p-2"><ArrowLeftIcon /></NeonButton>
                <h2 className="font-orbitron text-2xl sm:text-3xl text-center text-white truncate flex-1">{deck.name}</h2>
                <div className="flex gap-2">
                    <NeonButton onClick={onEditDeck} color="cyan" className="!p-2"><EditIcon /></NeonButton>
                    <NeonButton onClick={handleDelete} color="red" className="!p-2"><TrashIcon /></NeonButton>
                </div>
            </div>

            <p className="font-orbitron text-xl text-[#00f3ff]">{deck.cards.length} Total Cards</p>
            
            <div className="w-full p-4 border border-[#00f3ff]/50 bg-[#0a0e27]/50 rounded-lg flex flex-col items-center gap-4">
                 <h3 className="font-orbitron text-xl text-[#00f3ff]">// INITIATE SESSION //</h3>
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                    <label htmlFor="chunk-size" className="font-bold uppercase tracking-wider text-[#00f3ff]">
                        // Chunk Size
                    </label>
                    <input
                        id="chunk-size"
                        type="number"
                        value={chunkSize}
                        onChange={(e) => setChunkSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        min="1"
                        max={deck.cards.length}
                        className="w-24 p-2 bg-[#0a0e27]/80 border-2 border-[#00f3ff] rounded-md focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e] text-white text-center"
                    />
                </div>
                <NeonButton onClick={handleStart} color="magenta" disabled={deck.cards.length === 0}>
                    Begin Transmission
                </NeonButton>
            </div>
        </div>
    );
};

// --- Main App Component ---

type AppView = 'deck-list' | 'deck-editor' | 'deck-view' | 'flashcards';

const App: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSessionCards, setCurrentSessionCards] = useState<Card[]>([]);
  const [view, setView] = useState<AppView>('deck-list');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      let currentDecks = await dataService.getDecks();
      if (currentDecks.length === 0) {
        // Attempt to migrate legacy data only if no decks exist.
        const migratedDeck = await dataService.migrateLegacyData();
        if (migratedDeck) {
          currentDecks = [migratedDeck];
        }
      }
      setDecks(currentDecks);
      setIsLoading(false);
    };
    initializeApp();
  }, []);

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
    await dataService.deleteDeck(deckId);
    setDecks(decks.filter(d => d.id !== deckId));
    setView('deck-list');
    setActiveDeckId(null);
  }

  const handleSaveDeck = useCallback(async (deckData: { id?: string; name: string; cards: Card[] }) => {
    const { id, name, cards } = deckData;
    if (id) { // Editing existing deck
      const updatedDeck = await dataService.saveDeck({ id, name, cards });
      setDecks(prevDecks => prevDecks.map(deck => (deck.id === id ? updatedDeck : deck)));
    } else { // Creating new deck
      const newDeck = await dataService.createDeck({ name, cards });
      setDecks(prevDecks => [...prevDecks, newDeck]);
    }
    setView('deck-list');
    setActiveDeckId(null);
  }, []);

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
    if (isLoading) {
      return (
        <div className="p-6 text-center">
            <h2 className="font-orbitron text-2xl text-center text-[#9d4edd] animate-pulse">// ACCESSING DATABANKS... //</h2>
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
            <p>// DATA SERVICE CONNECTION ONLINE //</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
