import { champions } from "@/data/champions.json";

export type ChampionRow = (typeof champions)[number];

export type Champion = ChampionRow & {
  removed: boolean;
  disabled: boolean;
};

export type ChampionFilters = {
  class: string;
  removed: boolean;
  disabled: boolean;
};

export type ChampionState = Pick<Champion, "id" | "removed" | "disabled">;

export type LocalStorageState = {
  randomizedChampionId?: string;
  championState: ChampionState[];
};
