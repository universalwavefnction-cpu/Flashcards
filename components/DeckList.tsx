import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      className="card card-purple p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
    >
      <h2
        className="text-gradient-purple"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--font-size-3xl)',
          textAlign: 'center'
        }}
      >
        // SELECT DATABANK //
      </h2>
      {decks.length > 0 ? (
        <div
          className="grid grid-cols-1 grid-cols-sm-2 grid-cols-lg-3 gap-6"
          style={{
            maxHeight: '50vh',
            overflowY: 'auto',
            paddingRight: 'var(--space-2)'
          }}
        >
          {decks.map((deck, index) => (
            <motion.button
              key={deck.id}
              onClick={() => onSelectDeck(deck.id)}
              className="card card-cyan"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: 'var(--space-4)',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--font-size-xl)',
                  color: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: 'var(--space-2)'
                }}
              >
                {deck.name}
              </h3>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)'
                }}
              >
                {deck.cards.length} cards
              </p>
            </motion.button>
          ))}
        </div>
      ) : (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            padding: 'var(--space-8) 0',
            fontFamily: 'var(--font-display)'
          }}
        >
          // NO DATABANKS FOUND. CREATE ONE TO BEGIN. //
        </p>
      )}
      <NeonButton
        onClick={onCreateDeck}
        color="magenta"
        className="w-full flex flex-center gap-2"
        style={{ marginTop: 'var(--space-4)' }}
      >
        <PlusIcon /> Create New Databank
      </NeonButton>
    </motion.div>
  );
};

export default DeckList;
