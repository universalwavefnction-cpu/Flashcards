import React, { useMemo } from 'react';

interface CategoryDisplayProps {
  cardProgress: Map<number, number>;
}

const CategoryDisplay: React.FC<CategoryDisplayProps> = ({ cardProgress }) => {
  const categoryCounts = useMemo(() => {
    const counts = {
      learning: 0,
      onceRight: 0,
      twiceRight: 0,
      mastered: 0,
    };

    cardProgress.forEach(progress => {
        switch(progress) {
            case 0: counts.learning++; break;
            case 1: counts.onceRight++; break;
            case 2: counts.twiceRight++; break;
            case 3: counts.mastered++; break;
        }
    });
    return counts;

  }, [cardProgress]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-center font-orbitron">
      <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
        <p className="text-xl font-bold text-red-400">{categoryCounts.learning}</p>
        <p className="text-xs uppercase tracking-wider">Learning</p>
      </div>
      <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded">
        <p className="text-xl font-bold text-cyan-400">{categoryCounts.onceRight}</p>
        <p className="text-xs uppercase tracking-wider">Once Right</p>
      </div>
       <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded">
        <p className="text-xl font-bold text-purple-400">{categoryCounts.twiceRight}</p>
        <p className="text-xs uppercase tracking-wider">Twice Right</p>
      </div>
       <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
        <p className="text-xl font-bold text-green-400">{categoryCounts.mastered}</p>
        <p className="text-xs uppercase tracking-wider">Mastered</p>
      </div>
    </div>
  );
};
export default CategoryDisplay;