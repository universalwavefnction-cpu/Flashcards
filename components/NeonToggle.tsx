
import React from 'react';

interface NeonToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const NeonToggle: React.FC<NeonToggleProps> = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center justify-center cursor-pointer h-full w-full">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${checked ? 'bg-[#ff006e]/50' : 'bg-[#00f3ff]/50'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${checked ? 'transform translate-x-full' : ''}`}></div>
      </div>
      <div className="ml-3 text-white font-bold uppercase">{label}</div>
    </label>
  );
};

export default NeonToggle;
