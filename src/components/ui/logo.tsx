import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%" className={className}>
      {/* Background */}
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D3748" />
          <stop offset="100%" stopColor="#1A202C" />
        </linearGradient>
        <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4299E1" />
          <stop offset="100%" stopColor="#805AD5" />
        </linearGradient>
      </defs>
      
      {/* Main circle background */}
      <circle cx="256" cy="256" r="240" fill="url(#bg-gradient)" />
      <circle cx="256" cy="256" r="220" fill="none" stroke="#2D3748" strokeWidth="2" />
      
      {/* Connection nodes representing social media platforms */}
      <circle cx="200" cy="150" r="25" fill="#4299E1" />
      <circle cx="320" cy="130" r="20" fill="#805AD5" />
      <circle cx="370" cy="220" r="22" fill="#F56565" />
      <circle cx="340" cy="330" r="28" fill="#48BB78" />
      <circle cx="210" cy="350" r="24" fill="#ECC94B" />
      <circle cx="130" cy="270" r="26" fill="#ED8936" />
      
      {/* Connection lines */}
      <g stroke="url(#accent-gradient)" strokeWidth="3" fill="none" opacity="0.8">
        <path d="M200,150 L320,130 L370,220 L340,330 L210,350 L130,270 Z" />
        <path d="M200,150 L340,330" />
        <path d="M320,130 L210,350" />
        <path d="M370,220 L130,270" />
      </g>
      
      {/* Automation gear */}
      <g transform="translate(256, 256)">
        <circle cx="0" cy="0" r="60" fill="#1A202C" stroke="url(#accent-gradient)" strokeWidth="4" />
        
        {/* Gear teeth */}
        <g fill="url(#accent-gradient)">
          <rect x="-5" y="-70" width="10" height="20" rx="2" />
          <rect x="-5" y="50" width="10" height="20" rx="2" />
          <rect x="50" y="-5" width="20" height="10" rx="2" />
          <rect x="-70" y="-5" width="20" height="10" rx="2" />
          
          {/* Diagonal teeth */}
          <g transform="rotate(45)">
            <rect x="-5" y="-70" width="10" height="20" rx="2" />
            <rect x="-5" y="50" width="10" height="20" rx="2" />
            <rect x="50" y="-5" width="20" height="10" rx="2" />
            <rect x="-70" y="-5" width="20" height="10" rx="2" />
          </g>
        </g>
        
        {/* "S" letter in the center */}
        <path d="M-15,-15 C-15,-25 -5,-30 5,-30 C15,-30 25,-25 25,-15 C25,-5 15,0 5,0 C-5,0 -15,5 -15,15 C-15,25 -5,30 5,30 C15,30 25,25 25,15" 
              fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
      </g>
      
      {/* Animated pulse for automation effect (works in some SVG viewers) */}
      <circle cx="256" cy="256" r="240" fill="none" stroke="url(#accent-gradient)" strokeWidth="3" opacity="0.3">
        <animate attributeName="r" values="240;245;240" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
} 