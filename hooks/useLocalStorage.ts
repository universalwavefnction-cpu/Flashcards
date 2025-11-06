import type { Card, Deck } from '../types';

const LEGACY_STORAGE_KEY = 'vocab-cards';

const simulateApiCall = <T>(data: T, delay = 50): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

/**
 * This function now only serves to read the original, non-deck-based
 * vocabulary from localStorage for a one-time migration.
 */
export const migrateLegacyData = async (): Promise<Deck | null> => {
    try {
        const oldDataRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (oldDataRaw) {
            const oldCards: Card[] = JSON.parse(oldDataRaw);
            
            // We don't remove the item here anymore, the main app logic will handle that.
            // This prevents data loss if the user decides not to import.
            
            if (Array.isArray(oldCards) && oldCards.length > 0) {
                const legacyDeck: Deck = {
                    id: 'legacy-import', // This ID is temporary and won't be used in Firestore
                    name: 'My Imported Deck',
                    cards: oldCards
                };
                return simulateApiCall(legacyDeck);
            }
        }
        return simulateApiCall(null);
    } catch (error) {
        console.error("Failed to read old vocabulary data for migration:", error);
        return simulateApiCall(null);
    }
};
