import { champions } from "@/data/champions.json";

export type ChampionRow = typeof champions[number];

export type Champion = ChampionRow & {
  removed: boolean;
  disabled: boolean;
}

export type ChampionFilters = {
  classId: string;
  removed: boolean;
  disabled: boolean;
}
