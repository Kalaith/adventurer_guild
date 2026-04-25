import React from 'react';
import type { Adventurer, Equipment, EquipmentItem } from '../types/game';
import { useGuildStore } from '../stores/gameStore';

interface AdventurersProps {
  adventurers: Adventurer[];
}

const slotLabels: Record<keyof Equipment, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  accessory: 'Accessory',
};

const formatStats = (item: EquipmentItem): string => {
  const parts = Object.entries(item.stats)
    .filter(([, value]) => typeof value === 'number' && value !== 0)
    .map(([key, value]) => `${key.slice(0, 3).toUpperCase()} +${value}`);

  return parts.join(' • ');
};

const getStatusTone = (status: Adventurer['status']): string => {
  switch (status) {
    case 'available':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'on quest':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'injured':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'retired':
      return 'text-slate-700 bg-slate-100 border-slate-200';
    default:
      return 'text-slate-700 bg-slate-100 border-slate-200';
  }
};

const Adventurers: React.FC<AdventurersProps> = ({ adventurers }) => {
  const equipmentInventory = useGuildStore(state => state.equipmentInventory);
  const equipInventoryItem = useGuildStore(state => state.equipInventoryItem);
  const unequipInventoryItem = useGuildStore(state => state.unequipInventoryItem);
  const retireAdventurer = useGuildStore(state => state.retireAdventurer);
  const isHydrating = useGuildStore(state => state.isHydrating);

  const availableInventoryByType = React.useMemo(() => {
    return equipmentInventory.reduce<Record<EquipmentItem['type'], EquipmentItem[]>>(
      (carry, item) => {
        if (!item.equippedBy) {
          carry[item.type].push(item);
        }
        return carry;
      },
      { weapon: [], armor: [], accessory: [] }
    );
  }, [equipmentInventory]);

  if (adventurers.length === 0) {
    return (
      <section className="mx-auto w-[min(1100px,calc(100%-2rem))] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Guild Roster</h2>
        <p className="mt-2 text-sm text-slate-600">
          No adventurers are on the roster yet. Hire new recruits before assigning equipment.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-[min(1100px,calc(100%-2rem))] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Guild Roster</h2>
          <p className="mt-2 text-sm text-slate-600">
            Equipment assignment is now backend-controlled. This screen only renders the current guild inventory and each adventurer&apos;s assigned gear.
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>{equipmentInventory.length} items in guild inventory</div>
          <div>{equipmentInventory.filter(item => !item.equippedBy).length} items available to assign</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {adventurers.map(adventurer => {
          const canManageEquipment = adventurer.status === 'available' && !isHydrating;

          return (
            <article key={adventurer.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{adventurer.name}</h3>
                  <p className="text-sm text-slate-600">
                    Level {adventurer.level} {adventurer.class} • {adventurer.rank}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusTone(adventurer.status)}`}>
                    {adventurer.status}
                  </span>
                  {adventurer.retirementEligible ? (
                    <button
                      type="button"
                      onClick={() => void retireAdventurer(adventurer.id)}
                      disabled={!canManageEquipment}
                      className="rounded-md border border-amber-300 bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Retire to Service
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Strength</div>
                  <div className="mt-1 font-semibold">{adventurer.stats.strength}</div>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Intelligence</div>
                  <div className="mt-1 font-semibold">{adventurer.stats.intelligence}</div>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Dexterity</div>
                  <div className="mt-1 font-semibold">{adventurer.stats.dexterity}</div>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Vitality</div>
                  <div className="mt-1 font-semibold">{adventurer.stats.vitality}</div>
                </div>
              </div>

              {adventurer.retirementEligible ? (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                  This adventurer is eligible for retirement. The backend will choose the best guild role and snapshot their current build into the retired-adventurer tables.
                </div>
              ) : null}

              <div className="mt-5 space-y-4">
                {(Object.keys(slotLabels) as Array<keyof Equipment>).map(slotType => {
                  const equippedItem = adventurer.equipment[slotType];
                  const assignableItems = availableInventoryByType[slotType];

                  return (
                    <div key={`${adventurer.id}-${slotType}`} className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{slotLabels[slotType]}</div>
                          <div className="text-xs text-slate-500">
                            {equippedItem ? `${equippedItem.name} (${equippedItem.rarity})` : 'No item equipped'}
                          </div>
                        </div>
                        {equippedItem ? (
                          <button
                            type="button"
                            onClick={() => void unequipInventoryItem(adventurer.id, slotType)}
                            disabled={!canManageEquipment}
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Unequip
                          </button>
                        ) : null}
                      </div>

                      {equippedItem ? (
                        <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          <div>{formatStats(equippedItem) || 'No stat modifiers'}</div>
                          <div className="mt-1">
                            Source: {equippedItem.sourceType}
                            {equippedItem.sourceRef ? ` (${equippedItem.sourceRef})` : ''}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-3 space-y-2">
                        {assignableItems.length > 0 ? (
                          assignableItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-slate-900">{item.name}</div>
                                <div className="text-xs text-slate-500">
                                  {item.rarity} • {formatStats(item) || 'No stat modifiers'}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => void equipInventoryItem(adventurer.id, item.id)}
                                disabled={!canManageEquipment}
                                className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-amber-50 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Equip
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
                            No {slotLabels[slotType].toLowerCase()} items are currently available in guild inventory.
                          </div>
                        )}
                      </div>

                      {!canManageEquipment ? (
                        <div className="mt-3 text-xs text-amber-700">
                          Equipment changes are only allowed while the adventurer is available in the guild hall.
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Adventurers;
