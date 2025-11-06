
import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: 'cyan' | 'magenta' | 'purple' | 'green' | 'red';
}

const colorClasses = {
  cyan: 'border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff]/10 shadow-[#00f3ff]/40 hover:shadow-[#00f3ff]/60',
  magenta: 'border-[#ff006e] text-[#ff006e] hover:bg-[#ff006e]/10 shadow-[#ff006e]/40 hover:shadow-[#ff006e]/60',
  purple: 'border-[#9d4edd] text-[#9d4edd] hover:bg-[#9d4edd]/10 shadow-[#9d4edd]/40 hover:shadow-[#9d4edd]/60',
  green: 'border-green-400 text-green-400 hover:bg-green-400/10 shadow-green-400/40 hover:shadow-green-400/60',
  red: 'border-red-500 text-red-500 hover:bg-red-500/10 shadow-red-500/40 hover:shadow-red-500/60'
};

const NeonButton: React.FC<NeonButtonProps> = ({ children, color = 'cyan', className = '', ...props }) => {
  const selectedColor = colorClasses[color];

  return (
    <button
      className={`px-4 py-2 border-2 rounded-md font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 focus:outline-none shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0e27] ${selectedColor} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default NeonButton;
