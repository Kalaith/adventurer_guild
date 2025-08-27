export interface Treasure {
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  effect: string;
}
