import { describe, it, expect } from 'vitest';
import {
  getCraftingMaterialById,
  getCraftingRecipeById,
  getRecipesByRarity,
  getRecipesByFacilityLevel,
  getMaterialsByRarity,
  canCraftRecipe,
  craftingMaterials,
  craftingRecipes,
} from '../../data/crafting';

describe('Crafting System', () => {
  describe('data integrity', () => {
    it('should have materials with all required properties', () => {
      craftingMaterials.forEach(material => {
        expect(material).toHaveProperty('id');
        expect(material).toHaveProperty('name');
        expect(material).toHaveProperty('rarity');
        expect(material).toHaveProperty('sources');

        expect(typeof material.id).toBe('string');
        expect(typeof material.name).toBe('string');
        expect(['common', 'uncommon', 'rare', 'epic', 'legendary']).toContain(material.rarity);
        expect(Array.isArray(material.sources)).toBe(true);
        expect(material.sources.length).toBeGreaterThan(0);
      });
    });

    it('should have recipes with all required properties', () => {
      craftingRecipes.forEach(recipe => {
        expect(recipe).toHaveProperty('id');
        expect(recipe).toHaveProperty('name');
        expect(recipe).toHaveProperty('result');
        expect(recipe).toHaveProperty('materials');
        expect(recipe).toHaveProperty('goldCost');
        expect(recipe).toHaveProperty('requiredFacilityLevel');

        expect(typeof recipe.id).toBe('string');
        expect(typeof recipe.name).toBe('string');
        expect(typeof recipe.goldCost).toBe('number');
        expect(typeof recipe.requiredFacilityLevel).toBe('number');
        expect(recipe.goldCost).toBeGreaterThan(0);
        expect(recipe.requiredFacilityLevel).toBeGreaterThanOrEqual(1);

        // Validate result item
        expect(recipe.result).toHaveProperty('id');
        expect(recipe.result).toHaveProperty('name');
        expect(recipe.result).toHaveProperty('type');
        expect(recipe.result).toHaveProperty('rarity');
        expect(recipe.result).toHaveProperty('stats');
        expect(recipe.result.crafted).toBe(true);

        // Validate materials object
        expect(Object.keys(recipe.materials).length).toBeGreaterThan(0);
        Object.values(recipe.materials).forEach(amount => {
          expect(typeof amount).toBe('number');
          expect(amount).toBeGreaterThan(0);
        });
      });
    });

    it('should have unique material IDs', () => {
      const materialIds = craftingMaterials.map(m => m.id);
      const uniqueIds = new Set(materialIds);

      expect(uniqueIds.size).toBe(materialIds.length);
    });

    it('should have unique recipe IDs', () => {
      const recipeIds = craftingRecipes.map(r => r.id);
      const uniqueIds = new Set(recipeIds);

      expect(uniqueIds.size).toBe(recipeIds.length);
    });

    it('should reference valid materials in recipes', () => {
      const materialIds = new Set(craftingMaterials.map(m => m.id));

      craftingRecipes.forEach(recipe => {
        Object.keys(recipe.materials).forEach(materialId => {
          expect(materialIds.has(materialId)).toBe(true);
        });
      });
    });
  });

  describe('getCraftingMaterialById', () => {
    it('should return material when ID exists', () => {
      const material = getCraftingMaterialById('iron_ore');

      expect(material).toBeDefined();
      expect(material?.id).toBe('iron_ore');
      expect(material?.name).toBe('Iron Ore');
      expect(material?.rarity).toBe('common');
    });

    it('should return undefined when ID does not exist', () => {
      const material = getCraftingMaterialById('nonexistent_material');

      expect(material).toBeUndefined();
    });
  });

  describe('getCraftingRecipeById', () => {
    it('should return recipe when ID exists', () => {
      const recipe = getCraftingRecipeById('iron_sword');

      expect(recipe).toBeDefined();
      expect(recipe?.id).toBe('iron_sword');
      expect(recipe?.name).toBe('Iron Sword');
    });

    it('should return undefined when ID does not exist', () => {
      const recipe = getCraftingRecipeById('nonexistent_recipe');

      expect(recipe).toBeUndefined();
    });
  });

  describe('getRecipesByRarity', () => {
    it('should return recipes of specified rarity', () => {
      const commonRecipes = getRecipesByRarity('common');
      const rareRecipes = getRecipesByRarity('rare');
      const legendaryRecipes = getRecipesByRarity('legendary');

      // Check that results match the rarity
      commonRecipes.forEach(recipe => {
        expect(recipe.result.rarity).toBe('common');
      });

      rareRecipes.forEach(recipe => {
        expect(recipe.result.rarity).toBe('rare');
      });

      legendaryRecipes.forEach(recipe => {
        expect(recipe.result.rarity).toBe('legendary');
      });

      // Should have some recipes of each rarity
      expect(rareRecipes.length).toBeGreaterThan(0);
      expect(legendaryRecipes.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent rarity', () => {
      const recipes = getRecipesByRarity('nonexistent' as 'common');

      expect(recipes).toHaveLength(0);
    });
  });

  describe('getRecipesByFacilityLevel', () => {
    it('should return recipes for specified facility level or lower', () => {
      const level1Recipes = getRecipesByFacilityLevel(1);
      const level3Recipes = getRecipesByFacilityLevel(3);
      const level5Recipes = getRecipesByFacilityLevel(5);

      // Level 1 should only have level 1 recipes
      level1Recipes.forEach(recipe => {
        expect(recipe.requiredFacilityLevel).toBeLessThanOrEqual(1);
      });

      // Level 3 should include level 1, 2, and 3 recipes
      level3Recipes.forEach(recipe => {
        expect(recipe.requiredFacilityLevel).toBeLessThanOrEqual(3);
      });

      // Level 5 should include all recipes
      level5Recipes.forEach(recipe => {
        expect(recipe.requiredFacilityLevel).toBeLessThanOrEqual(5);
      });

      // Higher levels should include more recipes
      expect(level3Recipes.length).toBeGreaterThanOrEqual(level1Recipes.length);
      expect(level5Recipes.length).toBeGreaterThanOrEqual(level3Recipes.length);
    });

    it('should return empty array for level 0', () => {
      const recipes = getRecipesByFacilityLevel(0);

      expect(recipes).toHaveLength(0);
    });
  });

  describe('getMaterialsByRarity', () => {
    it('should return materials of specified rarity', () => {
      const commonMaterials = getMaterialsByRarity('common');
      const rareMaterials = getMaterialsByRarity('rare');
      const legendaryMaterials = getMaterialsByRarity('legendary');

      commonMaterials.forEach(material => {
        expect(material.rarity).toBe('common');
      });

      rareMaterials.forEach(material => {
        expect(material.rarity).toBe('rare');
      });

      legendaryMaterials.forEach(material => {
        expect(material.rarity).toBe('legendary');
      });

      expect(commonMaterials.length).toBeGreaterThan(0);
      expect(rareMaterials.length).toBeGreaterThan(0);
      expect(legendaryMaterials.length).toBeGreaterThan(0);
    });
  });

  describe('canCraftRecipe', () => {
    const ironSwordRecipe = {
      id: 'iron_sword',
      name: 'Iron Sword',
      materials: { iron_ore: 3, wood_planks: 1 },
      goldCost: 100,
      requiredFacilityLevel: 1,
      result: {
        id: 'iron_sword',
        name: 'Iron Sword',
        type: 'weapon' as const,
        rarity: 'common' as const,
        stats: { strength: 5 },
      },
    };

    it('should return true when all requirements are met', () => {
      const availableMaterials = { iron_ore: 5, wood_planks: 2 };
      const availableGold = 200;
      const facilityLevel = 2;

      const result = canCraftRecipe(
        ironSwordRecipe,
        availableMaterials,
        availableGold,
        facilityLevel
      );

      expect(result.canCraft).toBe(true);
      expect(result.missingMaterials).toHaveLength(0);
      expect(result.reasonsBlocked).toHaveLength(0);
    });

    it('should return false when facility level is insufficient', () => {
      const availableMaterials = { iron_ore: 5, wood_planks: 2 };
      const availableGold = 200;
      const facilityLevel = 0;

      const result = canCraftRecipe(
        ironSwordRecipe,
        availableMaterials,
        availableGold,
        facilityLevel
      );

      expect(result.canCraft).toBe(false);
      expect(result.reasonsBlocked).toContain('Requires facility level 1 (current: 0)');
    });

    it('should return false when gold is insufficient', () => {
      const availableMaterials = { iron_ore: 5, wood_planks: 2 };
      const availableGold = 50;
      const facilityLevel = 2;

      const result = canCraftRecipe(
        ironSwordRecipe,
        availableMaterials,
        availableGold,
        facilityLevel
      );

      expect(result.canCraft).toBe(false);
      expect(result.reasonsBlocked).toContain('Not enough gold (need 100, have 50)');
    });

    it('should return false and list missing materials', () => {
      const availableMaterials = { iron_ore: 1 }; // Missing wood_planks, insufficient iron_ore
      const availableGold = 200;
      const facilityLevel = 2;

      const result = canCraftRecipe(
        ironSwordRecipe,
        availableMaterials,
        availableGold,
        facilityLevel
      );

      expect(result.canCraft).toBe(false);
      expect(result.missingMaterials).toHaveLength(2);
      expect(result.missingMaterials.some(m => m.includes('Iron Ore'))).toBe(true);
      expect(result.missingMaterials.some(m => m.includes('Hardwood Planks'))).toBe(true);
    });

    it('should handle missing materials gracefully', () => {
      const availableMaterials = {};
      const availableGold = 200;
      const facilityLevel = 2;

      const result = canCraftRecipe(
        ironSwordRecipe,
        availableMaterials,
        availableGold,
        facilityLevel
      );

      expect(result.canCraft).toBe(false);
      expect(result.missingMaterials).toHaveLength(2);
    });

    it('should combine multiple blocking reasons', () => {
      const availableMaterials = { iron_ore: 1 }; // Insufficient
      const availableGold = 50; // Insufficient
      const facilityLevel = 0; // Insufficient

      const result = canCraftRecipe(
        ironSwordRecipe,
        availableMaterials,
        availableGold,
        facilityLevel
      );

      expect(result.canCraft).toBe(false);
      expect(result.reasonsBlocked.length).toBeGreaterThan(1);
      expect(result.reasonsBlocked.some(r => r.includes('facility level'))).toBe(true);
      expect(result.reasonsBlocked.some(r => r.includes('gold'))).toBe(true);
      expect(result.reasonsBlocked.some(r => r.includes('Missing materials'))).toBe(true);
    });
  });

  describe('rarity distribution', () => {
    it('should have materials across all rarity levels', () => {
      const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

      rarities.forEach(rarity => {
        const materialsOfRarity = craftingMaterials.filter(m => m.rarity === rarity);
        expect(materialsOfRarity.length).toBeGreaterThan(0);
      });
    });

    it('should have recipes across multiple rarity levels', () => {
      const recipeRarities = new Set(craftingRecipes.map(r => r.result.rarity));

      expect(recipeRarities.size).toBeGreaterThan(2);
      expect(recipeRarities.has('uncommon')).toBe(true);
      expect(recipeRarities.has('legendary')).toBe(true);
    });

    it('should have higher cost for higher rarity recipes', () => {
      const uncommonRecipes = craftingRecipes.filter(r => r.result.rarity === 'uncommon');
      const legendaryRecipes = craftingRecipes.filter(r => r.result.rarity === 'legendary');

      const avgUncommonCost =
        uncommonRecipes.reduce((sum, r) => sum + r.goldCost, 0) / uncommonRecipes.length;
      const avgLegendaryCost =
        legendaryRecipes.reduce((sum, r) => sum + r.goldCost, 0) / legendaryRecipes.length;

      expect(avgLegendaryCost).toBeGreaterThan(avgUncommonCost);
    });
  });

  describe('equipment type coverage', () => {
    it('should have recipes for all equipment types', () => {
      const equipmentTypes = new Set(craftingRecipes.map(r => r.result.type));

      expect(equipmentTypes.has('weapon')).toBe(true);
      expect(equipmentTypes.has('armor')).toBe(true);
      expect(equipmentTypes.has('accessory')).toBe(true);
    });

    it('should have balanced stat distribution in crafted items', () => {
      const craftedItems = craftingRecipes.map(r => r.result);

      craftedItems.forEach(item => {
        const totalStats = Object.values(item.stats).reduce((sum, stat) => sum + (stat || 0), 0);
        expect(totalStats).toBeGreaterThan(0);
      });
    });
  });
});
