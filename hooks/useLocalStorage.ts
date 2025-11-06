import type { Card, Deck } from '../types';

const DECKS_STORAGE_KEY = 'flashcard-decks';
const LEGACY_STORAGE_KEY = 'vocab-cards';

// --- Helper to simulate async API calls ---
const simulateApiCall = <T>(data: T, delay = 50): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

const readDecksFromStorage = (): Deck[] => {
    try {
        const data = window.localStorage.getItem(DECKS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to read decks from localStorage:", error);
        return [];
    }
}

const writeDecksToStorage = (decks: Deck[]) => {
    try {
        window.localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
    } catch (error) {
        console.error("Failed to write decks to localStorage:", error);
    }
}

// --- Exported Data Service Functions ---

export const getDecks = async (): Promise<Deck[]> => {
    const decks = readDecksFromStorage();
    return simulateApiCall(decks);
};

export const saveDeck = async (deckToSave: Deck): Promise<Deck> => {
  const decks = readDecksFromStorage();
  const deckIndex = decks.findIndex(d => d.id === deckToSave.id);

  if (deckIndex > -1) {
    decks[deckIndex] = deckToSave;
  } else {
    // This case should be handled by createDeck, but as a fallback:
    decks.push(deckToSave);
  }
  
  writeDecksToStorage(decks);
  return simulateApiCall(deckToSave);
};


export const createDeck = async (deckData: { name: string; cards: Card[] }): Promise<Deck> => {
    const decks = readDecksFromStorage();
    const newDeck: Deck = {
        id: `deck-${Date.now()}`,
        name: deckData.name,
        cards: deckData.cards
    };
    const updatedDecks = [...decks, newDeck];
    writeDecksToStorage(updatedDecks);
    return simulateApiCall(newDeck);
};


export const deleteDeck = async (deckId: string): Promise<void> => {
    let decks = readDecksFromStorage();
    decks = decks.filter(d => d.id !== deckId);
    writeDecksToStorage(decks);
    return simulateApiCall(undefined);
};

export const migrateLegacyData = async (): Promise<Deck | null> => {
    try {
        const oldDataRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (oldDataRaw) {
            const oldCards: Card[] = JSON.parse(oldDataRaw);
            window.localStorage.removeItem(LEGACY_STORAGE_KEY);
            
            if (Array.isArray(oldCards) && oldCards.length > 0) {
                const newDeckData = {
                    name: 'My Imported Deck',
                    cards: oldCards
                };
                const createdDeck = await createDeck(newDeckData);
                return simulateApiCall(createdDeck);
            }
        }
        return simulateApiCall(null);
    } catch (error) {
        console.error("Failed to migrate old vocabulary data:", error);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        return simulateApiCall(null);
    }
};
