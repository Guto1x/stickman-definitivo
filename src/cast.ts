// Recurring characters. The hero is our channel's main character: IFOLOGY-style ink stickman
// in a gray quarter-zip (user's choice from 2026-11-08; was red), gold zip trim, charcoal pants.
import type { CastMember } from './types';

export const CAST: Record<string, CastMember> = {
  hero: {
    name: 'Hero',
    top: 'jacket',
    topColor: '#8b8f98',
    accent: '#c9a227',
    bottom: 'pants',
    bottomColor: '#2b2f3a',
    shoes: '#f4f1ea',
    hair: 'none',
  },
  // Supporting cast: IFOLOGY-style outfits with no gray tops, so the gray-jacket hero always stands out.
  bestie: { name: 'Best friend', top: 'jacket', topColor: '#3f9a5c', accent: '#f4ead6', bottom: 'pants', bottomColor: '#2d3550', shoes: '#f2b632', hat: 'cap', hatColor: '#f2b632' },
  sister: { name: 'Sister', top: 'hoodie', topColor: '#e8735a', accent: '#ffd2c2', bottom: 'pants', bottomColor: '#2c3e63', shoes: '#ffffff', hair: 'long', height: 0.82 },
  mom: { name: 'Mom', top: 'jacket', topColor: '#2f8f8a', accent: '#e9f4f2', bottom: 'skirt', bottomColor: '#3b4a6b', shoes: '#7a4a3a', hair: 'bun' },
  dad: { name: 'Dad', top: 'jacket', topColor: '#33476e', accent: '#d9e2f2', bottom: 'pants', bottomColor: '#4a4f5a', shoes: '#5a3e33', glasses: true, glassesColor: '#9fd3f2' },
  teacher: { name: 'Teacher', top: 'suit', topColor: '#6b5a48', accent: '#a3242c', bottom: 'pants', bottomColor: '#3a3430', shoes: '#2b2622', glasses: true, glassesColor: '#9fd3f2', hair: 'bob' },
  coach: { name: 'Coach', top: 'jacket', topColor: '#2b3a5c', accent: '#ffffff', bottom: 'pants', bottomColor: '#1f2433', shoes: '#ffffff', hat: 'cap', hatColor: '#1f2433' },
  rival: { name: 'Rival', top: 'jacket', topColor: '#6b4a35', accent: '#1b1b20', bottom: 'pants', bottomColor: '#1b1b20', shoes: '#e8e4da', hair: 'spiky' },
  scientist: { name: 'Scientist', top: 'coat', topColor: '#f3f1ea', accent: '#d9e6f2', bottom: 'pants', bottomColor: '#3a4256', shoes: '#2b2622', glasses: true, glassesColor: '#7fc3f0', hair: 'curly' },
  kid: { name: 'Kid', top: 'tee', topColor: '#f2b632', bottom: 'shorts', bottomColor: '#3d6fb6', shoes: '#ffffff', height: 0.66, hair: 'spiky' },
  extraA: { top: 'hoodie', topColor: '#3d6fb6', accent: '#cfe0f5', bottom: 'pants', bottomColor: '#2b2f3a', shoes: '#ffffff' },
  extraB: { top: 'jacket', topColor: '#e2b23f', accent: '#fff3d6', bottom: 'pants', bottomColor: '#3a3430', shoes: '#2b2622', hair: 'bun' },
  extraC: { top: 'tee', topColor: '#d77fc0', bottom: 'pants', bottomColor: '#2c3e63', shoes: '#ffffff', hair: 'ponytail' },
};
