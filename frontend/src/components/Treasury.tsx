import React, { useEffect, useMemo, useState } from 'react';
import { useGuildStore } from '../stores/gameStore';

const Treasury: React.FC = () => {
  const {
    gold,
    reputation,
    level,
    formatNumber,
    saveSlot,
    loadSlot,
    saveSlots,
    isSaving,
    isHydrating,
    error,
    lastSave,
    factions,
    facilities,
    worldEvents,
    territories,
    activeVotes,
    retiredAdventurers,
    materials,
    materialCatalog,
    availableRecipes,
    recipeCatalog,
    equipmentInventory,
    upgradeFacility,
    craftRecipe,
  } = useGuildStore();
  const [slotNumber, setSlotNumber] = useState(1);
  const [slotName, setSlotName] = useState('Primary Save');

  const goldDisplay = useMemo(() => formatNumber(gold), [formatNumber, gold]);
  const reputationDisplay = useMemo(() => formatNumber(reputation), [formatNumber, reputation]);
  const lastSaveDisplay = useMemo(() => {
    if (!lastSave) {
      return 'No save recorded';
    }

    return new Date(lastSave).toLocaleString();
  }, [lastSave]);

  const selectedSlot = useMemo(
    () => saveSlots.find(entry => entry.slotNumber === slotNumber) ?? null,
    [saveSlots, slotNumber]
  );

  const forgeLevel = useMemo(
    () => facilities.find(facility => facility.id === 'forge')?.level ?? 0,
    [facilities]
  );

  const unlockedRecipes = useMemo(
    () => recipeCatalog.filter(recipe => availableRecipes.includes(recipe.id)),
    [availableRecipes, recipeCatalog]
  );

  useEffect(() => {
    if (selectedSlot?.slotName) {
      setSlotName(selectedSlot.slotName);
      return;
    }

    setSlotName(`Save Slot ${slotNumber}`);
  }, [selectedSlot, slotNumber]);

  const handleSave = async () => {
    await saveSlot(slotNumber, slotName.trim() || `Save Slot ${slotNumber}`);
  };

  const handleLoad = async () => {
    await loadSlot(slotNumber);
  };

  return (
    <section role="region" aria-label="Treasury" className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Treasury</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Gold</span>
            <span aria-hidden="true">Gold</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{goldDisplay}</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Reputation</span>
            <span aria-hidden="true">Star</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{reputationDisplay}</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Guild Level</span>
            <span aria-hidden="true">Keep</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{`Level ${level}`}</div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Save Slots</h3>
            <p className="text-sm text-slate-600">Persist or restore the current guild snapshot from the database.</p>
          </div>
          <div className="text-sm text-slate-600">Last save: {lastSaveDisplay}</div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)_auto_auto] sm:items-end">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Slot
            <select
              aria-label="Slot"
              value={slotNumber}
              onChange={event => setSlotNumber(Number(event.target.value))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              {Array.from({ length: 9 }, (_, index) => index + 1).map(value => (
                <option key={value} value={value}>
                  {saveSlots.find(entry => entry.slotNumber === value)?.slotName ?? `Slot ${value}`}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Save Name
            <input
              aria-label="Save Name"
              type="text"
              value={slotName}
              onChange={event => setSlotName(event.target.value)}
              placeholder="Primary Save"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || isHydrating}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? 'Saving...' : 'Save Slot'}
          </button>

          <button
            type="button"
            onClick={() => void handleLoad()}
            disabled={isSaving || isHydrating}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {isHydrating ? 'Loading...' : 'Load Slot'}
          </button>
        </div>

        {selectedSlot ? (
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">{selectedSlot.slotName}</div>
            <div>Updated: {selectedSlot.updatedAt ? new Date(selectedSlot.updatedAt).toLocaleString() : 'Unknown'}</div>
            <div>Version: {selectedSlot.version}</div>
            <div>
              Snapshot: {selectedSlot.metadata.adventurerCount ?? 0} adventurers, {selectedSlot.metadata.activeQuestCount ?? 0} active quests, {selectedSlot.metadata.completedQuestCount ?? 0} completed quests
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            This slot has no saved snapshot yet.
          </div>
        )}

        {saveSlots.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {saveSlots.map(slot => (
              <button
                key={slot.slotNumber}
                type="button"
                onClick={() => setSlotNumber(slot.slotNumber)}
                className={`rounded-md border px-3 py-3 text-left text-sm transition ${slot.slotNumber === slotNumber ? 'border-slate-900 bg-slate-900 text-amber-50' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`}
              >
                <div className="font-semibold">{slot.slotName}</div>
                <div>Slot {slot.slotNumber}</div>
                <div>{slot.updatedAt ? new Date(slot.updatedAt).toLocaleString() : 'Unknown time'}</div>
              </button>
            ))}
          </div>
        ) : null}

        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-slate-900">Guild Systems</h3>
          <p className="text-sm text-slate-600">Backend-controlled facilities, world state, and crafting.</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-900">Facilities</div>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              {facilities.map(facility => (
                <div key={facility.id} className="flex items-center justify-between gap-3">
                  <div>
                    <div>{facility.name}</div>
                    <div className="text-xs text-slate-500">Level {facility.level}/{facility.maxLevel}</div>
                  </div>
                  <button
                    type="button"
                    disabled={isHydrating || facility.level >= facility.maxLevel}
                    onClick={() => void upgradeFacility(facility.id)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Upgrade
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-900">Faction Standing</div>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              {factions.slice(0, 5).map(faction => (
                <div key={faction.id}>
                  <div>{faction.name}</div>
                  <div className="text-xs text-slate-500">{faction.standingLabel ?? 'Unknown'} · {formatNumber(faction.reputation)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-900">World Events</div>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              {worldEvents.filter(event => event.active).length === 0 ? (
                <div className="text-xs text-slate-500">No active world events.</div>
              ) : (
                worldEvents
                  .filter(event => event.active)
                  .map(event => (
                    <div key={event.id}>
                      <div>{event.name}</div>
                      <div className="text-xs text-slate-500">
                        {event.endsAt ? `Ends ${new Date(event.endsAt).toLocaleString()}` : `${event.duration} day event`}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-900">Territories</div>
            <div className="mt-2 text-sm text-slate-700">
              <div>{territories.filter(territory => territory.controlled).length} controlled</div>
              <div className="text-xs text-slate-500">{territories.length} tracked regions</div>
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-900">Guild Politics</div>
            <div className="mt-2 text-sm text-slate-700">
              <div>{activeVotes.length} active votes</div>
              <div className="text-xs text-slate-500">{retiredAdventurers.length} retired adventurers in legacy service</div>
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-900">Crafting</div>
            <div className="mt-2 text-sm text-slate-700">
              <div>{availableRecipes.length} unlocked recipes</div>
              <div className="text-xs text-slate-500">
                {materialCatalog.filter(material => (materials[material.id] ?? 0) > 0).length} stocked materials · {recipeCatalog.length} total recipes
              </div>
              <div className="text-xs text-slate-500">{equipmentInventory.length} crafted items in guild inventory</div>
              <div className="mt-3 space-y-2">
                {unlockedRecipes.slice(0, 4).map(recipe => {
                  const blockedReasons: string[] = [];
                  if (forgeLevel < recipe.requiredFacilityLevel) {
                    blockedReasons.push(`Forge ${recipe.requiredFacilityLevel}`);
                  }
                  if (gold < recipe.goldCost) {
                    blockedReasons.push(`${recipe.goldCost} gold`);
                  }
                  Object.entries(recipe.materials).forEach(([materialId, requiredAmount]) => {
                    if ((materials[materialId] ?? 0) < requiredAmount) {
                      blockedReasons.push(`${materialId} x${requiredAmount}`);
                    }
                  });

                  const canCraft = blockedReasons.length === 0;

                  return (
                    <div key={recipe.id} className="rounded-md border border-slate-200 bg-white p-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-900">{recipe.name}</div>
                          <div className="text-xs text-slate-500">
                            Cost {recipe.goldCost} gold · Forge {recipe.requiredFacilityLevel}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isHydrating || !canCraft}
                          onClick={() => void craftRecipe(recipe.id)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          Craft
                        </button>
                      </div>
                      {!canCraft ? <div className="mt-1 text-xs text-amber-700">Blocked: {blockedReasons.join(', ')}</div> : null}
                    </div>
                  );
                })}
              </div>
              {equipmentInventory.length > 0 ? (
                <div className="mt-3 rounded-md border border-slate-200 bg-white p-2">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Inventory</div>
                  <div className="space-y-2">
                    {equipmentInventory.slice(0, 4).map(item => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <div className="font-medium text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.rarity} {item.type}</div>
                        </div>
                        <div className="text-xs text-slate-500">{item.equippedBy ? `Equipped by ${item.equippedBy}` : 'Unequipped'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Treasury;
