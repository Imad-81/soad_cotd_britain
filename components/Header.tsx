'use client';

import React from 'react';
import { PRESETS } from '@/lib/customizerData';
import { CharacterPreset } from '@/types/customizer';
import { 
  Sparkles, 
  RotateCcw, 
  RotateCw, 
  Dices, 
  Share2, 
  Download, 
  Layers,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onRandomize: () => void;
  onReset: () => void;
  onSelectPreset: (preset: CharacterPreset) => void;
  onOpenExport: () => void;
  activePresetId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onRandomize,
  onReset,
  onSelectPreset,
  onOpenExport,
  activePresetId,
}) => {
  const [presetDropdownOpen, setPresetDropdownOpen] = React.useState(false);

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Tag */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
            <span className="text-yellow-400 font-black text-lg tracking-tighter">⚡</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              AVATAR<span className="text-amber-400">STUDIO</span>
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              16:9 2D
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">Snapchat-Style Character Creator</p>
        </div>
      </div>

      {/* Center Controls: Presets Dropdown & Undo/Redo */}
      <div className="hidden md:flex items-center gap-2">
        {/* Preset Selector */}
        <div className="relative">
          <button
            onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 hover:text-white transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Style Presets</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {presetDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setPresetDropdownOpen(false)} 
              />
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Curated Looks
                </div>
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setPresetDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col gap-0.5 transition-colors ${
                      activePresetId === preset.id
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span className="font-semibold">{preset.name}</span>
                    <span className="text-[10px] text-zinc-400">{preset.subtitle}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Randomize Button */}
        <button
          onClick={onRandomize}
          title="Randomize Appearance"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-850 text-xs font-medium text-zinc-300 hover:text-amber-300 transition-all group"
        >
          <Dices className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
          <span>Surprise Me</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset to Default"
          className="p-1.5 text-zinc-400 hover:text-zinc-200 text-xs hover:bg-zinc-900 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Right Action: Save & Export */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenExport}
          className="relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Save & Export</span>
        </button>
      </div>
    </header>
  );
};
