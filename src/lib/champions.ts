import { Champion, ChampionRow, ChampionFilters } from "@/types";

export function filterChampions(champions: Champion[], filters?: Partial<ChampionFilters>) {
  return champions.filter((champion) => {
    if (filters?.classId !== undefined && champion.classId !== filters.classId) {
      return false;
    } else if (filters?.removed !== undefined && champion.removed !== filters.removed) {
      return false;
    } else if (filters?.disabled !== undefined && champion.disabled !== filters.disabled) {
      return false;
    } else {
      return true;
    }
  })
}

export function makeChampion(champion: ChampionRow) {
  return {
    ...champion,
    removed: false,
    disabled: false
  };
}
