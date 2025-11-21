import React from 'react';
import { motion } from 'framer-motion';

interface NeonToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const NeonToggle: React.FC<NeonToggleProps> = ({ label, checked, onChange }) => {
  return (
    <label
      className="flex flex-center gap-3"
      style={{ cursor: 'pointer', height: '100%', width: '100%', justifyContent: 'center' }}
    >
      <div className="toggle">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ position: 'absolute', opacity: 0 }}
        />
        <motion.div
          className="toggle-slider"
          animate={{
            backgroundColor: checked ? '#ff006e' : '#00f3ff',
            boxShadow: checked
              ? '0 0 20px rgba(255, 0, 110, 0.5)'
              : '0 0 20px rgba(0, 243, 255, 0.5)'
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <motion.div
        style={{
          color: 'white',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: 'var(--font-size-sm)'
        }}
        animate={{ color: checked ? '#ff006e' : '#00f3ff' }}
        transition={{ duration: 0.3 }}
      >
        {label}
      </motion.div>
    </label>
  );
};

export default NeonToggle;
