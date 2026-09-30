export type CategoryId = 'characters' | 'wardrobe' | 'backgrounds' | 'accessories' | 'lighting';

export interface CustomizerItem {
  id: string;
  name: string;
  category: CategoryId;
  subCategory: string;
  thumbnail: string;
  image?: string;
  tag?: string;
  accentColor?: string;
  description?: string;
  unlocked?: boolean;
}

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  border?: string;
}

export interface CharacterState {
  characterId: string;
  wardrobeId: string;
  backgroundId: string;
  accessoryId: string;
  lightingId: string;
  primaryColor: string;
  zoomMode: 'fit' | 'bust' | 'full';
  showVignette: boolean;
  backgroundBlur: number; // 0 to 10px
  ambientGlow: boolean;
  expression: 'neutral' | 'confident' | 'fierce' | 'chill';
}

export interface CharacterPreset {
  id: string;
  name: string;
  subtitle: string;
  state: CharacterState;
  previewImage: string;
}
