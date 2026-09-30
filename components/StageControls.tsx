'use client';

import React from 'react';
import { CharacterState } from '@/types/customizer';
import { 
  Maximize2, 
  ZoomIn, 
  Sliders, 
  Sun, 
  Eye, 
  Sparkles,
  Focus
} from 'lucide-react';

interface StageControlsProps {
  state: CharacterState;
  onChange: (patch: Partial<CharacterState>) => void;
}

export const StageControls: React.FC<StageControlsProps> = ({ state, onChange }) => {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-800/80 shadow-2xl">
      {/* Zoom Mode Toggle: Full vs Bust / Portrait Focus */}
      <div className="flex items-center p-0.5 bg-zinc-900/90 rounded-xl">
        <button
          onClick={() => onChange({ zoomMode: 'fit' })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            state.zoomMode === 'fit'
              ? 'bg-amber-400 text-zinc-950 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Full 16:9 View"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Stage</span>
        </button>

        <button
          onClick={() => onChange({ zoomMode: 'bust' })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            state.zoomMode === 'bust'
              ? 'bg-amber-400 text-zinc-950 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Portrait / Wardrobe Focus"
        >
          <Focus className="w-3 h-3" />
          <span>Portrait</span>
        </button>
      </div>

      <div className="h-4 w-px bg-zinc-800 mx-0.5" />

      {/* Vignette Toggle */}
      <button
        onClick={() => onChange({ showVignette: !state.showVignette })}
        className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-all ${
          state.showVignette
            ? 'bg-zinc-800 text-amber-300 border border-amber-500/30'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
        }`}
        title="Toggle Cinematic Vignette"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="text-[11px] hidden sm:inline">Vignette</span>
      </button>

      {/* Ambient Aura Glow Toggle */}
      <button
        onClick={() => onChange({ ambientGlow: !state.ambientGlow })}
        className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-all ${
          state.ambientGlow
            ? 'bg-zinc-800 text-amber-300 border border-amber-500/30'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
        }`}
        title="Toggle Character Rim Glow"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span className="text-[11px] hidden sm:inline">Glow</span>
      </button>

      {/* Blur Background Cycle */}
      <button
        onClick={() => {
          const nextBlur = state.backgroundBlur === 0 ? 4 : state.backgroundBlur === 4 ? 8 : 0;
          onChange({ backgroundBlur: nextBlur });
        }}
        className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-all ${
          state.backgroundBlur > 0
            ? 'bg-zinc-800 text-amber-300 border border-amber-500/30'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
        }`}
        title="Cycle Backdrop Depth Blur"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span className="text-[11px] hidden sm:inline">
          Blur {state.backgroundBlur > 0 ? `${state.backgroundBlur}px` : 'Off'}
        </span>
      </button>
    </div>
  );
};
