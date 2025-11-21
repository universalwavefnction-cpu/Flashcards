import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

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
      switch (progress) {
        case 0:
          counts.learning++;
          break;
        case 1:
          counts.onceRight++;
          break;
        case 2:
          counts.twiceRight++;
          break;
        case 3:
          counts.mastered++;
          break;
      }
    });
    return counts;
  }, [cardProgress]);

  const categories = [
    {
      count: categoryCounts.learning,
      label: 'Learning',
      color: 'var(--color-red)',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.3)'
    },
    {
      count: categoryCounts.onceRight,
      label: 'Once Right',
      color: 'var(--color-cyan)',
      bgColor: 'rgba(0, 243, 255, 0.1)',
      borderColor: 'rgba(0, 243, 255, 0.3)'
    },
    {
      count: categoryCounts.twiceRight,
      label: 'Twice Right',
      color: 'var(--color-purple)',
      bgColor: 'rgba(157, 78, 221, 0.1)',
      borderColor: 'rgba(157, 78, 221, 0.3)'
    },
    {
      count: categoryCounts.mastered,
      label: 'Mastered',
      color: 'var(--color-green)',
      bgColor: 'rgba(74, 222, 128, 0.1)',
      borderColor: 'rgba(74, 222, 128, 0.3)'
    }
  ];

  return (
    <div
      className="grid grid-cols-2 grid-cols-lg-4 gap-2"
      style={{
        textAlign: 'center',
        fontFamily: 'var(--font-display)'
      }}
    >
      {categories.map((category, index) => (
        <motion.div
          key={category.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          style={{
            padding: 'var(--space-2)',
            background: category.bgColor,
            border: `1px solid ${category.borderColor}`,
            borderRadius: 'var(--radius-md)',
            backdropFilter: 'blur(var(--blur-sm))'
          }}
        >
          <p
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'bold',
              color: category.color,
              marginBottom: 'var(--space-1)'
            }}
          >
            {category.count}
          </p>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-secondary)'
            }}
          >
            {category.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default CategoryDisplay;
