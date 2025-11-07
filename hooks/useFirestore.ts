import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import type { Card, Deck } from '../types';

const getDecksCollection = (userId: string) => collection(db, 'users', userId, 'decks');

export const getDecks = async (userId: string): Promise<Deck[]> => {
    if (!userId) return [];
    try {
        const decksCollection = getDecksCollection(userId);
        const snapshot = await getDocs(decksCollection);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deck));
    } catch (error) {
        console.error("Error fetching decks from Firestore:", error);
        return [];
    }
};

export const saveDeck = async (userId: string, deckToSave: Deck): Promise<Deck> => {
    if (!userId) throw new Error("User not authenticated");
    try {
        const deckRef = doc(db, 'users', userId, 'decks', deckToSave.id);
        await setDoc(deckRef, deckToSave, { merge: true });
        return deckToSave;
    } catch (error) {
        console.error("Error saving deck to Firestore:", error);
        throw error;
    }
};

export const createDeck = async (userId: string, deckData: { name: string; cards: Card[] }): Promise<Deck> => {
    if (!userId) throw new Error("User not authenticated");
    try {
        const newDocRef = doc(getDecksCollection(userId)); // Generate ref with new ID
        const newDeck: Deck = {
            id: newDocRef.id,
            name: deckData.name,
            cards: deckData.cards,
        };
        await setDoc(newDocRef, newDeck);
        return newDeck;
    } catch (error) {
        console.error("Error creating deck in Firestore:", error);
        throw error;
    }
};

export const deleteDeck = async (userId: string, deckId: string): Promise<void> => {
    if (!userId) throw new Error("User not authenticated");
    try {
        const deckRef = doc(db, 'users', userId, 'decks', deckId);
        await deleteDoc(deckRef);
    } catch (error) {
        console.error("Error deleting deck from Firestore:", error);
        throw error;
    }
};

export const importLegacyDecks = async (userId: string, decks: Deck[]): Promise<void> => {
    if (!userId) throw new Error("User not authenticated");
    if (!decks || decks.length === 0) return;

    try {
        const batch = writeBatch(db);
        const decksCollection = getDecksCollection(userId);
        
        decks.forEach(deck => {
            // Create a new document reference for each imported deck
            const newDeckRef = doc(decksCollection);
            const newDeckData = {
                id: newDeckRef.id,
                name: deck.name,
                cards: deck.cards,
            };
            batch.set(newDeckRef, newDeckData);
        });
        
        await batch.commit();
    } catch(error) {
        console.error("Error batch importing legacy decks to Firestore:", error);
        throw error;
    }
};