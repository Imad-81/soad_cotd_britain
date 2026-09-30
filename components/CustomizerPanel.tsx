'use client';

import React, { useState } from 'react';
import { 
  CategoryId, 
  CharacterState, 
  CustomizerItem 
} from '@/types/customizer';
import { 
  CATEGORIES, 
  CUSTOMIZER_ITEMS, 
  COLOR_SWATCHES 
} from '@/lib/customizerData';
import { 
  Shirt, 
  User, 
  Image as ImageIcon, 
  Glasses, 
  Sparkles, 
  Check, 
  Palette,
  SlidersHorizontal,
  Flame
} from 'lucide-react';

interface CustomizerPanelProps {
  state: CharacterState;
  onChange: (patch: Partial<CharacterState>) => void;
}

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({ state, onChange }) => {
  const [activeTab, setActiveTab] = useState<CategoryId>('wardrobe');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('All');

  // Filter items based on activeTab
  const categoryItems = CUSTOMIZER_ITEMS.filter((item) => item.category === activeTab);

  // Extract unique subcategories
  const subCategories = ['All', ...Array.from(new Set(categoryItems.map((i) => i.subCategory)))];

  // Filter by subcategory if selected
  const displayedItems = activeSubCategory === 'All' 
    ? categoryItems 
    : categoryItems.filter((i) => i.subCategory === activeSubCategory);

  // Helper to determine if an item is active
  const isItemActive = (item: CustomizerItem) => {
    switch (item.category) {
      case 'characters':
        return state.characterId === item.id;
      case 'wardrobe':
        return state.wardrobeId === item.id;
      case 'backgrounds':
        return state.backgroundId === item.id;
      case 'accessories':
        return state.accessoryId === item.id;
      case 'lighting':
        return state.lightingId === item.id;
      default:
        return false;
    }
  };

  // Handle item selection
  const handleSelectItem = (item: CustomizerItem) => {
    switch (item.category) {
      case 'characters':
        onChange({ characterId: item.id });
        break;
      case 'wardrobe':
        onChange({ wardrobeId: item.id });
        break;
      case 'backgrounds':
        onChange({ backgroundId: item.id });
        break;
      case 'accessories':
        onChange({ accessoryId: item.id });
        break;
      case 'lighting':
        onChange({ lightingId: item.id });
        break;
    }
  };

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'wardrobe':
        return <Shirt className="w-4 h-4" />;
      case 'characters':
        return <User className="w-4 h-4" />;
      case 'backgrounds':
        return <ImageIcon className="w-4 h-4" />;
      case 'accessories':
        return <Glasses className="w-4 h-4" />;
      case 'lighting':
        return <Sparkles className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950/70 backdrop-blur-2xl border-l border-zinc-800/80 overflow-hidden">
      {/* Category Navigation Bar (Snapchat Style Icons) */}
      <div className="border-b border-zinc-800/80 p-2 bg-zinc-900/60">
        <div className="grid grid-cols-5 gap-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id as CategoryId);
                  setActiveSubCategory('All');
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <div className="mb-1">{getCategoryIcon(cat.id as CategoryId)}</div>
                <span className="text-[10px] tracking-tight leading-none truncate max-w-full">
                  {cat.name}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-2 h-1 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Pills & Color Swatches Header */}
      <div className="px-4 py-3 border-b border-zinc-800/60 flex flex-col gap-2.5 bg-zinc-950/40">
        {/* Subcategories */}
        {subCategories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {subCategories.map((sub) => {
              const isSelected = activeSubCategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setActiveSubCategory(sub)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-zinc-200 text-zinc-950 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/60'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}

        {/* Accent Color Swatches (Snapchat color bar) */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-zinc-300 text-[11px] uppercase tracking-wider">
              Aura & Accent Tone
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {COLOR_SWATCHES.map((swatch) => {
              const isCurrent = state.primaryColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.id}
                  onClick={() => onChange({ primaryColor: swatch.hex })}
                  title={swatch.name}
                  className={`w-5 h-5 rounded-full transition-transform relative ${
                    isCurrent ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: swatch.hex,
                    border: swatch.border ? `1px solid ${swatch.border}` : undefined,
                  }}
                >
                  {isCurrent && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Item Grid (Closet) */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3 pb-8">
          {displayedItems.map((item) => {
            const active = isItemActive(item);

            return (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={`group relative rounded-2xl p-2.5 cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                  active
                    ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Active Checkmark Pill */}
                {active && (
                  <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-md animate-in zoom-in-75 duration-150">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Badge Tag */}
                {item.tag && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-zinc-950/80 text-zinc-300 border border-zinc-800 backdrop-blur-md">
                      {item.tag}
                    </span>
                  </div>
                )}

                {/* Card Thumbnail / Preview */}
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950/80 border border-zinc-800/50 mb-2 relative flex items-center justify-center">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : item.category === 'accessories' ? (
                    <div className="flex flex-col items-center justify-center text-zinc-500 group-hover:text-amber-400 transition-colors">
                      <Glasses className="w-8 h-8 stroke-[1.5]" />
                      <span className="text-[10px] mt-1 font-mono">ACCESSORY</span>
                    </div>
                  ) : item.category === 'lighting' ? (
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center"
                      style={{
                        background: item.accentColor 
                          ? `radial-gradient(circle at center, ${item.accentColor}44 0%, #09090b 80%)`
                          : '#18181b'
                      }}
                    >
                      <Sparkles className="w-8 h-8" style={{ color: item.accentColor || '#f59e0b' }} />
                      <span className="text-[10px] mt-1 font-mono text-zinc-300">LIGHTING</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                      <Flame className="w-6 h-6" />
                    </div>
                  )}

                  {/* Hover subtle glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Item Details */}
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    {item.name}
                  </h4>
                  {item.description && (
                    <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
