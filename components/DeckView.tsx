import React from 'react';
import { motion } from 'framer-motion';
import type { Card, Deck } from '../types';
import NeonButton from './NeonButton';
import { EditIcon, TrashIcon, ArrowLeftIcon } from './Icons';

interface DeckViewProps {
  deck: Deck;
  onStartSession: (cards: Card[]) => void;
  onEditDeck: () => void;
  onDeleteDeck: () => void;
  onBack: () => void;
}

const DeckView: React.FC<DeckViewProps> = ({ deck, onStartSession, onEditDeck, onDeleteDeck, onBack }) => {
  const handleStart = () => {
    onStartSession(deck.cards);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the databank "${deck.name}"? This action cannot be undone.`)) {
      onDeleteDeck();
    }
  };

  return (
    <motion.div
      className="card card-purple p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        alignItems: 'center'
      }}
    >
      <div
        className="w-full flex flex-between gap-4"
        style={{ alignItems: 'center' }}
      >
        <NeonButton onClick={onBack} color="purple" className="btn-icon">
          <ArrowLeftIcon />
        </NeonButton>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-3xl)',
            textAlign: 'center',
            color: 'white',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {deck.name}
        </h2>
        <div className="flex gap-2">
          <NeonButton onClick={onEditDeck} color="cyan" className="btn-icon">
            <EditIcon />
          </NeonButton>
          <NeonButton onClick={handleDelete} color="red" className="btn-icon">
            <TrashIcon />
          </NeonButton>
        </div>
      </div>

      <motion.p
        className="text-gradient-cyan"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--font-size-xl)'
        }}
      >
        {deck.cards.length} Total Cards
      </motion.p>

      <motion.div
        className="card card-cyan p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}
      >
        <h3
          className="text-gradient-cyan"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-xl)'
          }}
        >
          // INITIATE SESSION //
        </h3>
        <NeonButton onClick={handleStart} color="magenta" disabled={deck.cards.length === 0}>
          Begin Transmission
        </NeonButton>
      </motion.div>
    </motion.div>
  );
};

export default DeckView;
