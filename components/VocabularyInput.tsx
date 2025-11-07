import React, { useState, useEffect } from 'react';
import NeonButton from './NeonButton';
import type { Card, Deck } from '../types';

interface DeckEditorProps {
  onSaveDeck: (deckData: { id?: string; name:string; cards: Card[] }) => void;
  onCancel: () => void;
  deckToEdit?: Deck | null;
}

const defaultVocab = [
  'die Brücke, the bridge',
  'der Fluss, the river',
  'der Berg, the mountain',
  'das Tal, the valley',
  'der Wald, the forest',
].join('\n');


const DeckEditor: React.FC<DeckEditorProps> = ({ onSaveDeck, onCancel, deckToEdit }) => {
  const [deckName, setDeckName] = useState('');
  const [vocabText, setVocabText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deckToEdit) {
        setDeckName(deckToEdit.name);
        setVocabText(deckToEdit.cards.map(c => `${c.original}, ${c.translation}`).join('\n'));
    } else {
        setDeckName('');
        setVocabText(defaultVocab);
    }
  }, [deckToEdit]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!deckName.trim()) {
        setError('Databank name is required.');
        return;
    }

    const parsedCards: Card[] = vocabText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes(','))
      .map(line => {
        const parts = line.split(',');
        return {
          original: parts[0].trim(),
          translation: parts.slice(1).join(',').trim(),
        };
      })
      .filter(card => card.original && card.translation);

    if (parsedCards.length === 0) {
      setError("No valid vocabulary found. Ensure each line is: `German word, English translation`.");
      return;
    }

    onSaveDeck({
        id: deckToEdit?.id,
        name: deckName,
        cards: parsedCards
    });
  };

  return (
    <div className="p-6 border border-[#9d4edd] bg-[#1a1a2e]/50 backdrop-blur-sm shadow-lg shadow-[#9d4edd]/20 rounded-lg animate-fade-in">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <h2 className="font-orbitron text-2xl text-center text-[#9d4edd]">{deckToEdit ? '// EDITING DATABANK //' : '// CREATING DATABANK //'}</h2>
        {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-md">
                <p className="font-bold font-orbitron">// TRANSMISSION ERROR //</p>
                <p>{error}</p>
            </div>
        )}
        <div>
            <label htmlFor="deck-name" className="block mb-2 font-bold uppercase tracking-wider text-[#00f3ff]">
              // Databank Name
            </label>
            <input
              id="deck-name"
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="e.g., Chapter 1 Verbs"
              className="w-full p-3 bg-[#0a0e27]/80 border-2 border-[#00f3ff] rounded-md focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e] text-white transition-all duration-300 shadow-inner shadow-[#00f3ff]/20"
            />
        </div>
        <div>
          <label htmlFor="vocab-input" className="block mb-2 font-bold uppercase tracking-wider text-[#00f3ff]">
            // Paste Vocabulary
          </label>
          <p className="text-xs text-gray-400 mb-2">// Format: German word, English translation (one per line)</p>
          <textarea
            id="vocab-input"
            value={vocabText}
            onChange={(e) => setVocabText(e.target.value)}
            rows={10}
            placeholder="das Verhängnis, fate&#10;die Seele, soul"
            className="w-full p-3 bg-[#0a0e27]/80 border-2 border-[#00f3ff] rounded-md focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e] text-white transition-all duration-300 shadow-inner shadow-[#00f3ff]/20"
          />
        </div>
        <div className="flex gap-4">
            <NeonButton type="button" onClick={onCancel} color="red" className="flex-1">
              Abort
            </NeonButton>
            <NeonButton type="submit" color="magenta" className="flex-1">
              Save Databank
            </NeonButton>
        </div>
      </form>
    </div>
  );
};

export default DeckEditor;