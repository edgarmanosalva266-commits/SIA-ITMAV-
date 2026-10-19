import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const InstitutionalLogo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = true 
}) => {
  const sizeMap = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Andean Chakana with Upward Growth Graph */}
      <div className={`relative aspect-square ${sizeMap[size]} shrink-0 drop-shadow-md`}>
        <svg 
          viewBox="0 0 160 160" 
          className="w-full h-full"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary Red Gradient */}
            <linearGradient id="itmanRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="45%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>

            {/* Inner White/Silver Relief */}
            <linearGradient id="itmanSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            {/* Bevel Shadow */}
            <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Stepped Andean Chakana Cross Outer Red Body */}
          <g filter="url(#logoShadow)">
            <path 
              d="
                M 60 15 H 100 V 35 H 125 V 60 H 145 V 100 H 125 V 125 H 100 V 145 H 60 V 125 H 35 V 100 H 15 V 60 H 35 V 35 H 60 Z
              " 
              fill="url(#itmanRedGrad)"
              stroke="#991B1B"
              strokeWidth="2"
            />

            {/* Inner White / Silver Stepped Inset Border */}
            <path 
              d="
                M 65 24 H 95 V 42 H 118 V 65 H 136 V 95 H 118 V 118 H 95 V 136 H 65 V 118 H 42 V 95 H 24 V 65 H 42 V 42 H 65 Z
              " 
              fill="url(#itmanSilverGrad)"
              stroke="#94A3B8"
              strokeWidth="1.5"
            />

            {/* Inner Red Core */}
            <path 
              d="
                M 70 33 H 90 V 49 H 110 V 70 H 127 V 90 H 110 V 111 H 90 V 127 H 70 V 111 H 49 V 90 H 33 V 70 H 49 V 49 H 70 Z
              " 
              fill="url(#itmanRedGrad)"
            />

            {/* Dynamic Upward Trendline & Arrow across the Chakana */}
            {/* Arrow Base & Line */}
            <path 
              d="M 45 105 L 68 82 L 92 98 L 132 50" 
              stroke="#FFFFFF" 
              strokeWidth="9" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M 45 105 L 68 82 L 92 98 L 132 50" 
              stroke="#DC2626" 
              strokeWidth="4.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />

            {/* Data Trend Nodes */}
            <circle cx="45" cy="105" r="5" fill="#FFFFFF" stroke="#991B1B" strokeWidth="2.5" />
            <circle cx="68" cy="82" r="5" fill="#FFFFFF" stroke="#991B1B" strokeWidth="2.5" />
            <circle cx="92" cy="98" r="5" fill="#FFFFFF" stroke="#991B1B" strokeWidth="2.5" />

            {/* Arrowhead */}
            <polygon 
              points="115,48 138,44 134,67 126,58" 
              fill="#FFFFFF" 
            />
            <polygon 
              points="119,49 136,46 133,63 127,56" 
              fill="#DC2626" 
            />
          </g>
        </svg>
      </div>

      {/* Typography Unit */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white font-extrabold tracking-widest text-[10px] md:text-[11px] px-2 py-0.5 rounded shadow-sm uppercase">
            INSTITUTO
          </div>
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
            IESTP
          </span>
        </div>

        <div className="flex items-baseline gap-1 mt-0.5">
          <h1 className="font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900 flex items-center">
            <span className="text-red-700">ITMAN</span>
            <span className="text-slate-800 ml-0.5">V</span>
          </h1>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
            SIA 2026
          </span>
        </div>

        {showSubtitle && (
          <p className="text-[10.5px] font-medium text-slate-500 tracking-tight leading-none mt-0.5">
            Sistema Integrado Académico & Facturación SUNAT
          </p>
        )}
      </div>
    </div>
  );
};
