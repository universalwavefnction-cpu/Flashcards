
import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  strokeWidth: 2,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
};

export const ShuffleIcon: React.FC = () => (
  <svg {...iconProps}>
    <polyline points="16 3 21 3 21 8"></polyline>
    <line x1="4" y1="20" x2="21" y2="3"></line>
    <polyline points="16 16 21 16 21 21"></polyline>
    <line x1="15" y1="15" x2="21" y2="21"></line>
    <line x1="4" y1="4" x2="11" y2="11"></line>
  </svg>
);

export const ResetIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    <polyline points="22 12 12 12 12 2"></polyline>
  </svg>
);

export const CheckIcon: React.FC = () => (
    <svg {...iconProps}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export const XIcon: React.FC = () => (
    <svg {...iconProps}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export const ArrowLeftIcon: React.FC = () => (
    <svg {...iconProps}>
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

export const ArrowRightIcon: React.FC = () => (
    <svg {...iconProps}>
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

export const PlusIcon: React.FC = () => (
    <svg {...iconProps}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export const EditIcon: React.FC = () => (
    <svg {...iconProps}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

export const TrashIcon: React.FC = () => (
    <svg {...iconProps}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

export const SparklesIcon: React.FC = () => (
    <svg {...iconProps}>
        <path d="m12 3-1.9 4.8-4.8 1.9 4.8 1.9L12 21l1.9-4.8 4.8-1.9-4.8-1.9L12 3z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
    </svg>
);
