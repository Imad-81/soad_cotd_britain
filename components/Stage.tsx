'use client';

import React from 'react';
import { CharacterState } from '@/types/customizer';
import { CUSTOMIZER_ITEMS } from '@/lib/customizerData';
import { StageControls } from './StageControls';
import { Sparkles, Eye, ShieldCheck, Zap } from 'lucide-react';

interface StageProps {
  state: CharacterState;
  onChange: (patch: Partial<CharacterState>) => void;
}

export const Stage: React.FC<StageProps> = ({ state, onChange }) => {
  const activeChar = CUSTOMIZER_ITEMS.find((i) => i.id === state.characterId) || CUSTOMIZER_ITEMS[0];
  const activeWardrobe = CUSTOMIZER_ITEMS.find((i) => i.id === state.wardrobeId) || CUSTOMIZER_ITEMS[3];
  const activeBg = CUSTOMIZER_ITEMS.find((i) => i.id === state.backgroundId) || CUSTOMIZER_ITEMS[9];
  const activeAccessory = CUSTOMIZER_ITEMS.find((i) => i.id === state.accessoryId);
  const activeLighting = CUSTOMIZER_ITEMS.find((i) => i.id === state.lightingId);

  // Background image source fallback
  const bgImageSrc = activeBg.image || activeBg.thumbnail;

  // Character image display priority: wardrobe image or character base image
  const charImageSrc = activeChar.image || activeChar.thumbnail;

  // Mood lighting overlay styling
  const getLightingGradient = () => {
    switch (state.lightingId) {
      case 'light-cyberpunk':
        return 'linear-gradient(125deg, rgba(236,72,153,0.32) 0%, transparent 40%, rgba(6,182,212,0.32) 100%)';
      case 'light-golden':
        return 'radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.4) 0%, rgba(217,119,6,0.15) 50%, transparent 80%)';
      case 'light-matrix':
        return 'radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.35) 0%, rgba(6,78,59,0.2) 60%, transparent 90%)';
      case 'light-clean':
        return 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.18) 0%, transparent 70%)';
      case 'light-cinematic':
      default:
        return 'linear-gradient(180deg, rgba(59,130,246,0.18) 0%, transparent 45%, rgba(15,23,42,0.6) 100%)';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 lg:p-6 overflow-hidden select-none">
      {/* 16:9 Canvas Stage Wrapper */}
      <div 
        className="relative w-full max-w-5xl aspect-video rounded-2xl lg:rounded-3xl overflow-hidden border border-zinc-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-zinc-950 flex items-center justify-center transition-all duration-500 group"
        style={{
          boxShadow: state.ambientGlow
            ? `0 20px 50px -10px ${state.primaryColor}22, 0 0 0 1px ${state.primaryColor}40`
            : undefined
        }}
      >
        {/* Layer 0: Background Scene (16:9) */}
        <div 
          className="absolute inset-0 w-full h-full transition-all duration-700 ease-out"
          style={{
            filter: state.backgroundBlur > 0 ? `blur(${state.backgroundBlur}px)` : 'none',
            transform: state.zoomMode === 'bust' ? 'scale(1.08)' : 'scale(1.0)',
          }}
        >
          {bgImageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bgImageSrc}
              alt={activeBg.name}
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
          )}
        </div>

        {/* Layer 1: Ambient Atmospheric Lighting Filter */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500 mix-blend-screen"
          style={{ background: getLightingGradient() }}
        />

        {/* Layer 2: Studio Depth Separation Gradient */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Layer 3: Character & Wardrobe Presentation (16:9 Framed) */}
        <div 
          className="relative z-10 w-full h-full flex items-center justify-center transition-all duration-500 ease-out"
          style={{
            transform: state.zoomMode === 'bust' 
              ? 'scale(1.4) translateY(6%)' 
              : 'scale(1.0) translateY(0%)',
          }}
        >
          {/* Character Main Visual */}
          <div className="relative max-h-full max-w-full flex items-center justify-center">
            {/* Ambient Aura Rim Light around character */}
            {state.ambientGlow && (
              <div 
                className="absolute inset-0 blur-3xl opacity-40 transition-all duration-700 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${state.primaryColor} 0%, transparent 70%)`,
                  transform: 'scale(1.2)'
                }}
              />
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={charImageSrc}
              alt={activeChar.name}
              className="max-h-[85vh] w-auto object-contain transition-all duration-500 pointer-events-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
              style={{
                filter: state.ambientGlow
                  ? `drop-shadow(0 0 25px ${state.primaryColor}55) drop-shadow(0 15px 30px rgba(0,0,0,0.9))`
                  : 'drop-shadow(0 15px 30px rgba(0,0,0,0.9))',
              }}
            />

            {/* Layer 4: Interactive Accessory Vector Overlays */}
            {state.accessoryId === 'acc-shades' && (
              <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-in fade-in zoom-in duration-300">
                <svg width="120" height="42" viewBox="0 0 120 42" fill="none" className="drop-shadow-lg">
                  {/* Left Lens */}
                  <path d="M12 8 C 24 6, 50 6, 54 10 C 58 14, 56 32, 44 36 C 30 40, 16 38, 10 26 C 6 18, 6 10, 12 8 Z" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
                  <path d="M16 12 C 24 10, 42 10, 46 14 C 44 24, 38 30, 24 30 C 16 30, 12 24, 16 12 Z" fill="#18181b" opacity="0.9" />
                  <line x1="20" y1="12" x2="35" y2="28" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                  {/* Bridge */}
                  <path d="M54 12 C 58 10, 62 10, 66 12" stroke="#d4d4d8" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Right Lens */}
                  <path d="M108 8 C 96 6, 70 6, 66 10 C 62 14, 64 32, 76 36 C 90 40, 104 38, 110 26 C 114 18, 114 10, 108 8 Z" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
                  <path d="M104 12 C 96 10, 78 10, 74 14 C 76 24, 82 30, 96 30 C 104 30, 108 24, 104 12 Z" fill="#18181b" opacity="0.9" />
                  <line x1="78" y1="12" x2="93" y2="28" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                </svg>
              </div>
            )}

            {state.accessoryId === 'acc-cyber-hud' && (
              <div className="absolute top-[26%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-in fade-in zoom-in duration-300">
                <div className="relative w-44 h-14 border border-cyan-400/80 rounded-lg bg-cyan-950/40 backdrop-blur-sm p-1.5 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                  <div className="flex justify-between items-center text-[8px] text-cyan-300 font-mono tracking-widest border-b border-cyan-500/40 pb-0.5">
                    <span>HUD // V.2.6</span>
                    <span className="animate-pulse">● SYNC</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[7px] text-cyan-400 font-mono">
                    <span>OPTIC: 98.4%</span>
                    <span>TGT: LOCKED</span>
                  </div>
                  <div className="absolute -bottom-1 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                </div>
              </div>
            )}

            {state.accessoryId === 'acc-gold-chain' && (
              <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-in fade-in zoom-in duration-300">
                <svg width="150" height="90" viewBox="0 0 150 90" fill="none" className="drop-shadow-[0_8px_16px_rgba(245,158,11,0.5)]">
                  <path 
                    d="M 25 10 C 35 60, 115 60, 125 10" 
                    stroke="url(#goldGradient)" 
                    strokeWidth="7" 
                    strokeLinecap="round" 
                    strokeDasharray="4 2" 
                  />
                  <circle cx="75" cy="52" r="10" fill="url(#goldGradient)" stroke="#78350f" strokeWidth="1.5" />
                  <path d="M 75 46 L 75 58 M 69 52 L 81 52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ca8a04" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}

            {state.accessoryId === 'acc-tactical-comms' && (
              <div className="absolute top-[28%] right-[22%] z-20 pointer-events-none animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-1 bg-zinc-900/90 border border-cyan-500/50 rounded-full px-2 py-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[9px] font-mono font-bold text-cyan-300">COMMS ON</span>
                </div>
              </div>
            )}

            {state.accessoryId === 'acc-stealth-mask' && (
              <div className="absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-in fade-in zoom-in duration-300">
                <svg width="100" height="60" viewBox="0 0 100 60" fill="none" className="drop-shadow-2xl">
                  <path d="M15 15 C 30 25, 70 25, 85 15 C 90 35, 75 55, 50 58 C 25 55, 10 35, 15 15 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                  <circle cx="35" cy="38" r="5" fill="#09090b" stroke="#52525b" strokeWidth="1" />
                  <circle cx="65" cy="38" r="5" fill="#09090b" stroke="#52525b" strokeWidth="1" />
                  <line x1="45" y1="32" x2="55" y2="32" stroke="#27272a" strokeWidth="2" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Layer 5: Studio Vignette */}
        {state.showVignette && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)'
            }}
          />
        )}

        {/* Dynamic Studio Status Stamp (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 shadow-lg flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full ring-2 ring-zinc-900 shadow-sm"
              style={{ backgroundColor: state.primaryColor }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
                {activeChar.name}
                <span className="text-[10px] text-zinc-400 font-normal">/ {activeWardrobe.name}</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[200px]">
                {activeBg.name}
              </span>
            </div>
          </div>
        </div>

        {/* Snapchat-Style Stage Controls (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 z-20">
          <StageControls state={state} onChange={onChange} />
        </div>
      </div>
    </div>
  );
};
