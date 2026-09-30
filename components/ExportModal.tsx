'use client';

import React, { useEffect } from 'react';
import { CharacterState } from '@/types/customizer';
import { CUSTOMIZER_ITEMS } from '@/lib/customizerData';
import confetti from 'canvas-confetti';
import { 
  X, 
  Download, 
  Share2, 
  Check, 
  Sparkles, 
  QrCode,
  Shield,
  Copy
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CharacterState;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, state }) => {
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const activeChar = CUSTOMIZER_ITEMS.find((i) => i.id === state.characterId) || CUSTOMIZER_ITEMS[0];
  const activeWardrobe = CUSTOMIZER_ITEMS.find((i) => i.id === state.wardrobeId) || CUSTOMIZER_ITEMS[3];
  const activeBg = CUSTOMIZER_ITEMS.find((i) => i.id === state.backgroundId) || CUSTOMIZER_ITEMS[9];
  const activeAccessory = CUSTOMIZER_ITEMS.find((i) => i.id === state.accessoryId);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#06b6d4', '#ec4899', '#ffffff'],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    // Simulate high-res image download
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = activeChar.image || activeChar.thumbnail;
      link.download = `${activeChar.name.replace(/\s+/g, '_')}_custom_avatar_16x9.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: `0 0 50px -10px ${state.primaryColor}33, 0 20px 40px rgba(0,0,0,0.8)`
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-black text-sm">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Avatar Passport</h3>
              <p className="text-[11px] text-zinc-400">1920x1080 16:9 Customizer Spec</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Card Preview (16:9 format) */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl bg-zinc-900 group">
            {/* Background */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeBg.image || activeBg.thumbnail}
              alt={activeBg.name}
              className="w-full h-full object-cover"
              style={{
                filter: state.backgroundBlur > 0 ? `blur(${state.backgroundBlur}px)` : 'none',
              }}
            />

            {/* Character */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeChar.image || activeChar.thumbnail}
                alt={activeChar.name}
                className="max-h-full w-auto object-contain"
                style={{
                  filter: state.ambientGlow
                    ? `drop-shadow(0 0 20px ${state.primaryColor}66)`
                    : 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))',
                }}
              />
            </div>

            {/* Vignette */}
            {state.showVignette && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)'
                }}
              />
            )}

            {/* Card Badge */}
            <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-lg px-2 py-1 flex items-center gap-1.5">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: state.primaryColor }}
              />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                {activeChar.name}
              </span>
            </div>

            <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-300">
              1920 × 1080 • 16:9
            </div>
          </div>

          {/* Stats & Specification Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                Wardrobe Fashion
              </span>
              <span className="text-zinc-200 font-bold mt-0.5 block truncate">
                {activeWardrobe.name}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                Backdrop Scene
              </span>
              <span className="text-zinc-200 font-bold mt-0.5 block truncate">
                {activeBg.name}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                Accessory
              </span>
              <span className="text-zinc-200 font-bold mt-0.5 block truncate">
                {activeAccessory ? activeAccessory.name : 'None (Clean)'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                  Aura Tone
                </span>
                <span className="text-zinc-200 font-bold mt-0.5 block font-mono">
                  {state.primaryColor}
                </span>
              </div>
              <div 
                className="w-5 h-5 rounded-full border border-zinc-700 shadow-sm"
                style={{ backgroundColor: state.primaryColor }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Copy Look Link'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{downloading ? 'Exporting HD...' : 'Download 16:9 HD'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
