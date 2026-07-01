"use client";
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'color';
}

export default function Logo({ 
  className = '', 
  showText = true, 
  size = 'md',
  variant = 'color' 
}: LogoProps) {
  // Size dimensions
  const dims = {
    sm: showText ? { width: 140, height: 40 } : { width: 32, height: 32 },
    md: showText ? { width: 180, height: 50 } : { width: 44, height: 44 },
    lg: showText ? { width: 240, height: 70 } : { width: 64, height: 64 },
    xl: showText ? { width: 320, height: 90 } : { width: 96, height: 96 },
  }[size];

  // Colors based on variant
  const textColorBlue = variant === 'dark' ? '#FFFFFF' : '#0D305F';
  const textColorTeal = variant === 'dark' ? '#38BDF8' : '#0D9488';
  const textColorMuted = variant === 'dark' ? '#94A3B8' : '#8C857B';

  return (
    <svg 
      width={dims.width} 
      height={dims.height} 
      viewBox={showText ? "0 0 320 80" : "0 0 100 100"} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D305F" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      
      {/* Shield Icon Group */}
      <g transform={showText ? "translate(0, 0) scale(0.8)" : "translate(0, 0)"}>
        {/* Shield Outline */}
        <path 
          d="M 22 35 C 14 39, 12 52, 12 63 C 12 80, 30 90, 50 96 C 70 90, 88 80, 88 63 C 88 52, 86 39, 78 35" 
          stroke="url(#logoShieldGrad)" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Left Building */}
        <path
          d="M 28 59 L 41 52 L 41 74 L 28 80 Z"
          fill="#0D305F"
        />
        {/* Left Building Windows (polygon points for perfect skew alignment) */}
        <polygon points="32,63 36,61 36,66 32,68" fill="#FFFFFF" opacity="0.8" />
        <polygon points="32,70 36,68 36,73 32,75" fill="#FFFFFF" opacity="0.8" />
        
        {/* Center Building */}
        <polygon
          points="41,30 57,37 57,73 41,68"
          fill="url(#logoShieldGrad)"
        />
        {/* Center Building Windows */}
        <polygon points="45,41 48,42 48,47 45,46" fill="#FFFFFF" opacity="0.8" />
        <polygon points="45,49 48,50 48,55 45,54" fill="#FFFFFF" opacity="0.8" />
        <polygon points="45,57 48,58 48,63 45,62" fill="#FFFFFF" opacity="0.8" />
        
        <polygon points="50,43 53,44 53,49 50,48" fill="#FFFFFF" opacity="0.8" />
        <polygon points="50,51 53,52 53,57 50,56" fill="#FFFFFF" opacity="0.8" />
        <polygon points="50,59 53,60 53,65 50,64" fill="#FFFFFF" opacity="0.8" />

        {/* Right Building */}
        <path
          d="M 57 44 L 72 50 L 72 78 L 57 73 Z"
          fill="#0D9488"
        />
        {/* Right Building Windows */}
        <polygon points="62,54 66,56 66,60 62,58" fill="#FFFFFF" opacity="0.8" />
        <polygon points="62,61 66,63 66,67 62,65" fill="#FFFFFF" opacity="0.8" />
        <polygon points="62,68 66,70 66,74 62,72" fill="#FFFFFF" opacity="0.8" />

        {/* Diagonal base V line to mimic the graphic floor */}
        <path
          d="M 28 80 L 50 91 L 72 80"
          fill="none"
          stroke="url(#logoShieldGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      
      {showText && (
        <>
          {/* Main Logo Text - RESIDENT */}
          <text 
            x="95" 
            y="33" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontSize="26" 
            fontWeight="800" 
            letterSpacing="-0.02em"
            fill={textColorBlue}
          >
            RESIDENT
          </text>
          
          {/* Main Logo Text - SMART */}
          <text 
            x="95" 
            y="56" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontSize="26" 
            fontWeight="800" 
            letterSpacing="-0.02em"
            fill={textColorTeal}
          >
            SMART
          </text>
          
          {/* Subtitle */}
          <text 
            x="96" 
            y="72" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontSize="7" 
            fontWeight="700" 
            letterSpacing="0.14em"
            fill={textColorMuted}
          >
            TU HOGAR, SIEMPRE BAJO CONTROL A UN CLIC
          </text>
        </>
      )}
    </svg>
  );
}
