import React from 'react';
import { motion } from 'framer-motion';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: 'cyan' | 'magenta' | 'purple' | 'green' | 'red' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  color = 'cyan',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const colorClass = `btn-${color}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';

  return (
    <motion.button
      className={`btn ${colorClass} ${sizeClass} ${className}`}
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default NeonButton;
