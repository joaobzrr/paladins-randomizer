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
    if (filters?.class !== undefined && champion.class !== filters.class) {
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
    if (champion1.class === champion2.class) {
      return champion1.name.localeCompare(champion2.name);
    } else {
      const classes = ["Damage", "Flank", "Frontline", "Support"];

      const index1 = classes.indexOf(champion1.class);
      if (index1 === -1) {
        throw new Error("Unexpected error");
      }

      const index2 = classes.indexOf(champion2.class);
      if (index1 === -1) {
        throw new Error("Unexpected error");
      }

      return index1 - index2;
    }
  });
}
