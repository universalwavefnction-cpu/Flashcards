
import React, { useState } from 'react';
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
                <NeonButton onClick={handleStart} color="magenta" disabled={deck.cards.length === 0}>
                    Begin Transmission
                </NeonButton>
            </div>
        </div>
    );
};

export default DeckView;
