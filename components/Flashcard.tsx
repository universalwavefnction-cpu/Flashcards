import React from 'react';
import { motion } from 'framer-motion';

interface FlashcardProps {
  frontText: string;
  backText: string;
  isFlipped: boolean;
  onClick: (event?: React.MouseEvent | React.TouchEvent) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ frontText, backText, isFlipped, onClick }) => {
  const handleInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    onClick(event);
  };

  return (
    <div
      className="flashcard-container"
      onClick={handleInteraction}
      onTouchEnd={handleInteraction}
      style={{ cursor: 'pointer' }}
    >
      <motion.div
        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Front Face */}
        <motion.div
          className="flashcard-face flashcard-front"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <p className="flashcard-text">{frontText}</p>
        </motion.div>

        {/* Back Face */}
        <motion.div
          className="flashcard-face flashcard-back"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <p className="flashcard-text">{backText}</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Flashcard;
