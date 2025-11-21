
import React from 'react';

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
      className="w-full aspect-[3/2] [perspective:1000px] cursor-pointer group"
      onClick={handleInteraction}
      onTouchEnd={handleInteraction}
    >
      <div
        className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700 ease-in-out ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Front Face */}
        <div className="absolute w-full h-full [backface-visibility:hidden] p-4 flex items-center justify-center text-center bg-[#1a1a2e]/50 backdrop-blur-sm border-2 border-[#00f3ff] rounded-lg shadow-lg shadow-[#00f3ff]/30">
          <p className="font-orbitron text-2xl md:text-4xl text-white break-words">{frontText}</p>
        </div>
        
        {/* Back Face */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-4 flex items-center justify-center text-center bg-[#1a1a2e]/50 backdrop-blur-sm border-2 border-[#ff006e] rounded-lg shadow-lg shadow-[#ff006e]/30">
          <p className="font-orbitron text-2xl md:text-4xl text-white break-words">{backText}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
