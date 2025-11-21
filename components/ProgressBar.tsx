
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full h-4 bg-[#0a0e27] border-2 border-[#9d4edd]/50 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#00f3ff] rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_#00f3ff]"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
