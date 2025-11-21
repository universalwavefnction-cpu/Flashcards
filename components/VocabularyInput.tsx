import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NeonButton from './NeonButton';
import type { Card, Deck } from '../types';

interface DeckEditorProps {
  onSaveDeck: (deckData: { id?: string; name: string; cards: Card[] }) => void;
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
    <motion.div
      className="card card-purple p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <h2
          className="text-gradient-purple"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-2xl)',
            textAlign: 'center'
          }}
        >
          {deckToEdit ? '// EDITING DATABANK //' : '// CREATING DATABANK //'}
        </h2>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 'var(--space-3)',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid var(--color-red)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-red-light)'
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 'bold',
                marginBottom: 'var(--space-1)'
              }}
            >
              // TRANSMISSION ERROR //
            </p>
            <p>{error}</p>
          </motion.div>
        )}
        <div>
          <label
            htmlFor="deck-name"
            style={{
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-display)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-cyan)'
            }}
          >
            // Databank Name
          </label>
          <input
            id="deck-name"
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="e.g., Chapter 1 Verbs"
            className="input"
          />
        </div>
        <div>
          <label
            htmlFor="vocab-input"
            style={{
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-display)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-cyan)'
            }}
          >
            // Paste Vocabulary
          </label>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-2)'
            }}
          >
            // Format: German word, English translation (one per line)
          </p>
          <textarea
            id="vocab-input"
            value={vocabText}
            onChange={(e) => setVocabText(e.target.value)}
            rows={10}
            placeholder="das Verhängnis, fate&#10;die Seele, soul"
            className="input"
          />
        </div>
        <div className="flex gap-4">
          <NeonButton type="button" onClick={onCancel} color="red" style={{ flex: 1 }}>
            Abort
          </NeonButton>
          <NeonButton type="submit" color="magenta" style={{ flex: 1 }}>
            Save Databank
          </NeonButton>
        </div>
      </form>
    </motion.div>
  );
};

export default DeckEditor;
