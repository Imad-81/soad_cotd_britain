'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CharacterState, CharacterPreset } from '@/types/customizer';
import { 
  INITIAL_CHARACTER_STATE, 
  CUSTOMIZER_ITEMS, 
  COLOR_SWATCHES 
} from '@/lib/customizerData';
import { Header } from '@/components/Header';
import { Stage } from '@/components/Stage';
import { CustomizerPanel } from '@/components/CustomizerPanel';
import { ExportModal } from '@/components/ExportModal';

export default function Home() {
  const [state, setState] = useState<CharacterState>(INITIAL_CHARACTER_STATE);
  const [history, setHistory] = useState<CharacterState[]>([]);
  const [future, setFuture] = useState<CharacterState[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | undefined>('preset-bruce');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Update state with history tracking
  const updateState = useCallback((patch: Partial<CharacterState>) => {
    setState((curr) => {
      const next = { ...curr, ...patch };
      setHistory((prev) => [...prev.slice(-25), curr]);
      setFuture([]);
      return next;
    });
    setActivePresetId(undefined);
  }, []);

  // Undo action
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setFuture((prev) => [state, ...prev]);
    setState(previous);
  }, [history, state]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, state]);
    setState(next);
  }, [future, state]);

  // Randomize look
  const handleRandomize = useCallback(() => {
    const chars = CUSTOMIZER_ITEMS.filter((i) => i.category === 'characters');
    const wardrobes = CUSTOMIZER_ITEMS.filter((i) => i.category === 'wardrobe');
    const bgs = CUSTOMIZER_ITEMS.filter((i) => i.category === 'backgrounds');
    const accs = CUSTOMIZER_ITEMS.filter((i) => i.category === 'accessories');
    const lights = CUSTOMIZER_ITEMS.filter((i) => i.category === 'lighting');

    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    const randomWardrobe = wardrobes[Math.floor(Math.random() * wardrobes.length)];
    const randomBg = bgs[Math.floor(Math.random() * bgs.length)];
    const randomAcc = accs[Math.floor(Math.random() * accs.length)];
    const randomLight = lights[Math.floor(Math.random() * lights.length)];
    const randomColor = COLOR_SWATCHES[Math.floor(Math.random() * COLOR_SWATCHES.length)];

    updateState({
      characterId: randomChar.id,
      wardrobeId: randomWardrobe.id,
      backgroundId: randomBg.id,
      accessoryId: randomAcc.id,
      lightingId: randomLight.id,
      primaryColor: randomColor.hex,
    });
  }, [updateState]);

  // Reset to default
  const handleReset = useCallback(() => {
    setHistory((prev) => [...prev, state]);
    setFuture([]);
    setState(INITIAL_CHARACTER_STATE);
    setActivePresetId('preset-bruce');
  }, [state]);

  // Select Preset
  const handleSelectPreset = useCallback((preset: CharacterPreset) => {
    setHistory((prev) => [...prev, state]);
    setFuture([]);
    setState(preset.state);
    setActivePresetId(preset.id);
  }, [state]);

  // Keyboard shortcuts (Cmd+Z, Cmd+Y, Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* Top Navigation */}
      <Header
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onRandomize={handleRandomize}
        onReset={handleReset}
        onSelectPreset={handleSelectPreset}
        onOpenExport={() => setIsExportOpen(true)}
        activePresetId={activePresetId}
      />

      {/* Main Studio Viewport (Laptop Optimized Split Screen) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: 16:9 Interactive Character Canvas Stage */}
        <section className="flex-1 relative flex items-center justify-center bg-radial from-zinc-900/60 to-zinc-950 min-h-0">
          <Stage state={state} onChange={updateState} />
        </section>

        {/* Right Side: Snapchat Style Customization Closet Panel */}
        <aside className="w-full lg:w-[420px] xl:w-[480px] h-[45vh] lg:h-full flex-shrink-0 z-20">
          <CustomizerPanel state={state} onChange={updateState} />
        </aside>
      </main>

      {/* Export / Save Avatar Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={state}
      />
    </div>
  );
}
