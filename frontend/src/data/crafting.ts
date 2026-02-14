import { CraftingMaterial, CraftingRecipe } from '../types/game';

export const craftingMaterials: CraftingMaterial[] = [
  // Common Materials
  {
    id: 'iron_ore',
    name: 'Iron Ore',
    rarity: 'common',
    sources: ['mining', 'forest_patrol', 'bandit_cleanup'],
  },
  {
    id: 'leather_scraps',
    name: 'Leather Scraps',
    rarity: 'common',
    sources: ['monster_hunt', 'wilderness_scout', 'beast_tracking'],
  },
  {
    id: 'magic_essence',
    name: 'Magic Essence',
    rarity: 'common',
    sources: ['magical_research', 'spell_component_gathering', 'mana_collection'],
  },
  {
    id: 'wood_planks',
    name: 'Hardwood Planks',
    rarity: 'common',
    sources: ['forest_patrol', 'lumber_gathering', 'tree_guardian'],
  },

  // Uncommon Materials
  {
    id: 'silver_ingot',
    name: 'Silver Ingot',
    rarity: 'uncommon',
    sources: ['mine_security', 'treasure_hunt', 'merchant_escort'],
  },
  {
    id: 'crystal_shard',
    name: 'Crystal Shard',
    rarity: 'uncommon',
    sources: ['crystal_harvesting', 'cave_mapping', 'underground_exploration'],
  },
  {
    id: 'enchanted_cloth',
    name: 'Enchanted Cloth',
    rarity: 'uncommon',
    sources: ['magical_anomaly', 'arcane_research', 'spell_weaving'],
  },
  {
    id: 'blessed_water',
    name: 'Blessed Water',
    rarity: 'uncommon',
    sources: ['temple_blessing', 'holy_ritual', 'divine_quest'],
  },

  // Rare Materials
  {
    id: 'mithril_ore',
    name: 'Mithril Ore',
    rarity: 'rare',
    sources: ['deep_mining', 'dragon_lair', 'ancient_ruins'],
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    rarity: 'rare',
    sources: ['legendary_beast_hunt', 'elemental_plane', 'fire_trial'],
  },
  {
    id: 'moonstone',
    name: 'Moonstone',
    rarity: 'rare',
    sources: ['lunar_ritual', 'night_quest', 'celestial_event'],
  },
  {
    id: 'shadow_silk',
    name: 'Shadow Silk',
    rarity: 'rare',
    sources: ['stealth_mission', 'assassin_guild', 'dark_ritual'],
  },

  // Epic Materials
  {
    id: 'adamantine',
    name: 'Adamantine',
    rarity: 'epic',
    sources: ['planar_expedition', 'god_touched_mine', 'legendary_quest'],
  },
  {
    id: 'dragon_scale',
    name: 'Dragon Scale',
    rarity: 'epic',
    sources: ['dragon_slaying', 'ancient_dragon', 'dragonlord_quest'],
  },
  {
    id: 'star_fragment',
    name: 'Star Fragment',
    rarity: 'epic',
    sources: ['cosmic_event', 'meteor_recovery', 'celestial_battle'],
  },
  {
    id: 'void_essence',
    name: 'Void Essence',
    rarity: 'epic',
    sources: ['planar_rift', 'void_creature_hunt', 'reality_anchor'],
  },

  // Legendary Materials
  {
    id: 'divine_metal',
    name: 'Divine Metal',
    rarity: 'legendary',
    sources: ['god_quest', 'divine_intervention', 'celestial_forge'],
  },
  {
    id: 'primordial_crystal',
    name: 'Primordial Crystal',
    rarity: 'legendary',
    sources: ['creation_myth_quest', 'world_origin', 'time_itself'],
  },
  {
    id: 'essence_of_eternity',
    name: 'Essence of Eternity',
    rarity: 'legendary',
    sources: ['immortal_quest', 'time_manipulation', 'eternal_guardian'],
  },
];

export const craftingRecipes: CraftingRecipe[] = [
  // Weapon Recipes
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    result: {
      id: 'crafted_iron_sword',
      name: 'Masterwork Iron Sword',
      type: 'weapon',
      rarity: 'uncommon',
      stats: { strength: 12, vitality: 5 },
      crafted: true,
      materials: ['iron_ore', 'wood_planks'],
    },
    materials: { iron_ore: 3, wood_planks: 1 },
    goldCost: 100,
    requiredFacilityLevel: 1,
  },
  {
    id: 'silver_blade',
    name: 'Silver Blade',
    result: {
      id: 'crafted_silver_blade',
      name: 'Gleaming Silver Blade',
      type: 'weapon',
      rarity: 'rare',
      stats: { strength: 18, intelligence: 8, dexterity: 5 },
      crafted: true,
      materials: ['silver_ingot', 'crystal_shard', 'magic_essence'],
    },
    materials: { silver_ingot: 2, crystal_shard: 1, magic_essence: 2 },
    goldCost: 300,
    requiredFacilityLevel: 2,
  },
  {
    id: 'mithril_sword',
    name: 'Mithril Sword',
    result: {
      id: 'crafted_mithril_sword',
      name: 'Legendary Mithril Blade',
      type: 'weapon',
      rarity: 'epic',
      stats: { strength: 25, intelligence: 12, dexterity: 10, vitality: 8 },
      crafted: true,
      materials: ['mithril_ore', 'moonstone', 'blessed_water'],
    },
    materials: { mithril_ore: 2, moonstone: 1, blessed_water: 2 },
    goldCost: 800,
    requiredFacilityLevel: 3,
  },

  // Armor Recipes
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    result: {
      id: 'crafted_leather_armor',
      name: 'Reinforced Leather Armor',
      type: 'armor',
      rarity: 'uncommon',
      stats: { dexterity: 10, vitality: 8 },
      crafted: true,
      materials: ['leather_scraps'],
    },
    materials: { leather_scraps: 4 },
    goldCost: 80,
    requiredFacilityLevel: 1,
  },
  {
    id: 'enchanted_robes',
    name: 'Enchanted Robes',
    result: {
      id: 'crafted_enchanted_robes',
      name: 'Robes of Arcane Power',
      type: 'armor',
      rarity: 'rare',
      stats: { intelligence: 20, dexterity: 8, vitality: 5 },
      crafted: true,
      materials: ['enchanted_cloth', 'magic_essence', 'crystal_shard'],
    },
    materials: { enchanted_cloth: 3, magic_essence: 3, crystal_shard: 1 },
    goldCost: 400,
    requiredFacilityLevel: 2,
  },
  {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    result: {
      id: 'crafted_shadow_cloak',
      name: 'Cloak of Eternal Shadows',
      type: 'armor',
      rarity: 'epic',
      stats: { dexterity: 22, intelligence: 15, vitality: 12 },
      crafted: true,
      materials: ['shadow_silk', 'void_essence', 'moonstone'],
    },
    materials: { shadow_silk: 3, void_essence: 1, moonstone: 2 },
    goldCost: 1000,
    requiredFacilityLevel: 4,
  },

  // Accessory Recipes
  {
    id: 'crystal_pendant',
    name: 'Crystal Pendant',
    result: {
      id: 'crafted_crystal_pendant',
      name: 'Pendant of Crystal Clarity',
      type: 'accessory',
      rarity: 'rare',
      stats: { intelligence: 15, dexterity: 8, vitality: 5 },
      crafted: true,
      materials: ['crystal_shard', 'silver_ingot', 'magic_essence'],
    },
    materials: { crystal_shard: 2, silver_ingot: 1, magic_essence: 2 },
    goldCost: 250,
    requiredFacilityLevel: 2,
  },
  {
    id: 'phoenix_amulet',
    name: 'Phoenix Amulet',
    result: {
      id: 'crafted_phoenix_amulet',
      name: 'Amulet of Phoenix Fire',
      type: 'accessory',
      rarity: 'epic',
      stats: { intelligence: 20, strength: 15, vitality: 18 },
      crafted: true,
      materials: ['phoenix_feather', 'star_fragment', 'blessed_water'],
    },
    materials: { phoenix_feather: 1, star_fragment: 1, blessed_water: 3 },
    goldCost: 1200,
    requiredFacilityLevel: 3,
  },

  // Legendary Recipes
  {
    id: 'divine_blade',
    name: 'Divine Blade',
    result: {
      id: 'crafted_divine_blade',
      name: 'Blade of Divine Justice',
      type: 'weapon',
      rarity: 'legendary',
      stats: { strength: 40, intelligence: 25, dexterity: 20, vitality: 30 },
      crafted: true,
      materials: ['divine_metal', 'essence_of_eternity', 'primordial_crystal'],
    },
    materials: { divine_metal: 3, essence_of_eternity: 1, primordial_crystal: 1 },
    goldCost: 5000,
    requiredFacilityLevel: 5,
  },
  {
    id: 'eternal_armor',
    name: 'Eternal Armor',
    result: {
      id: 'crafted_eternal_armor',
      name: 'Armor of Eternal Protection',
      type: 'armor',
      rarity: 'legendary',
      stats: { vitality: 50, strength: 20, intelligence: 20, dexterity: 15 },
      crafted: true,
      materials: ['divine_metal', 'dragon_scale', 'adamantine'],
    },
    materials: { divine_metal: 2, dragon_scale: 2, adamantine: 2 },
    goldCost: 6000,
    requiredFacilityLevel: 5,
  },
  {
    id: 'crown_of_legends',
    name: 'Crown of Legends',
    result: {
      id: 'crafted_crown_of_legends',
      name: 'Crown of Legendary Heroes',
      type: 'accessory',
      rarity: 'legendary',
      stats: { intelligence: 35, strength: 25, dexterity: 25, vitality: 35 },
      crafted: true,
      materials: ['primordial_crystal', 'essence_of_eternity', 'star_fragment'],
    },
    materials: { primordial_crystal: 2, essence_of_eternity: 1, star_fragment: 2 },
    goldCost: 8000,
    requiredFacilityLevel: 5,
  },
];

export function getCraftingMaterialById(id: string): CraftingMaterial | undefined {
  return craftingMaterials.find(material => material.id === id);
}

export function getCraftingRecipeById(id: string): CraftingRecipe | undefined {
  return craftingRecipes.find(recipe => recipe.id === id);
}

export function getRecipesByRarity(
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
): CraftingRecipe[] {
  return craftingRecipes.filter(recipe => recipe.result.rarity === rarity);
}

export function getRecipesByFacilityLevel(facilityLevel: number): CraftingRecipe[] {
  return craftingRecipes.filter(recipe => recipe.requiredFacilityLevel <= facilityLevel);
}

export function getMaterialsByRarity(rarity: CraftingMaterial['rarity']): CraftingMaterial[] {
  return craftingMaterials.find(material => material.rarity === rarity)
    ? craftingMaterials.filter(material => material.rarity === rarity)
    : [];
}

export function canCraftRecipe(
  recipe: CraftingRecipe,
  availableMaterials: { [materialId: string]: number },
  availableGold: number,
  facilityLevel: number
): { canCraft: boolean; missingMaterials: string[]; reasonsBlocked: string[] } {
  const reasons: string[] = [];
  const missing: string[] = [];

  // Check facility level
  if (facilityLevel < recipe.requiredFacilityLevel) {
    reasons.push(
      `Requires facility level ${recipe.requiredFacilityLevel} (current: ${facilityLevel})`
    );
  }

  // Check gold cost
  if (availableGold < recipe.goldCost) {
    reasons.push(`Not enough gold (need ${recipe.goldCost}, have ${availableGold})`);
  }

  // Check materials
  Object.entries(recipe.materials).forEach(([materialId, requiredAmount]) => {
    const availableAmount = availableMaterials[materialId] || 0;
    if (availableAmount < requiredAmount) {
      const material = getCraftingMaterialById(materialId);
      const materialName = material ? material.name : materialId;
      missing.push(`${materialName} (need ${requiredAmount}, have ${availableAmount})`);
    }
  });

  if (missing.length > 0) {
    reasons.push(`Missing materials: ${missing.join(', ')}`);
  }

  return {
    canCraft: reasons.length === 0,
    missingMaterials: missing,
    reasonsBlocked: reasons,
  };
}
