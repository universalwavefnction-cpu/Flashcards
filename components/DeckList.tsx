
import React from 'react';
import type { Deck } from '../types';
import NeonButton from './NeonButton';
import { PlusIcon } from './Icons';

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

export default DeckList;
