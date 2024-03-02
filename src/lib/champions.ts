import { Champion, ChampionRow, ChampionFilters } from "@/types";

export function makeChampion(champion: ChampionRow) {
  return {
    ...champion,
    removed: false,
    disabled: false
  };
}

export function findChampionById(champions: Champion[], id: string) {
  return champions.find((champion) => champion.id === id);
}

export function filterChampions(
  champions: Champion[],
  filters?: Partial<ChampionFilters>
) {
  return champions.filter((champion) => {
    if (
      filters?.classId !== undefined &&
      champion.classId !== filters.classId
    ) {
      return false;
    } else if (
      filters?.removed !== undefined &&
      champion.removed !== filters.removed
    ) {
      return false;
    } else if (
      filters?.disabled !== undefined &&
      champion.disabled !== filters.disabled
    ) {
      return false;
    } else {
      return true;
    }
  });
}

export function sortChampionRows(champions: ChampionRow[]) {
  return [...champions].sort((champion1, champion2) => {
    if (champion1.classId === champion2.classId) {
      return champion1.name.localeCompare(champion2.name);
    } else {
      return champion1.classId.localeCompare(champion2.classId);
    }
  })
}
