import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { champions as championData } from "@/data/champions.json";
import {
  makeChampion,
  findChampionById,
  filterChampions
} from "@/lib/champions";
import { ChampionFilters } from "@/types";

const [appState, setAppState] = createStore({
  champions: championData.map((row) => makeChampion(row)),
  hoveredChampionId: undefined as string | undefined,
  keyboardState: {
    ctrl: false,
    shift: false
  }
});

const store = {
  get selectedChampions() {
    if (!appState.hoveredChampionId) {
      return [];
    }

    const selectionSourceChampion = findChampionById(
      appState.champions,
      appState.hoveredChampionId
    );
    if (!selectionSourceChampion) {
      throw new Error("Unexpected error");
    }

    if (appState.keyboardState.shift) {
      return filterChampions(appState.champions, {
        classId: selectionSourceChampion.classId
      });
    }
    return [selectionSourceChampion];
  },
  get keyboardState() {
    return appState.keyboardState;
  },
  champions: (filters?: Partial<ChampionFilters>) => {
    return filterChampions(appState.champions, filters);
  },
  setSelectionSourceChampionId: (championId: string) => {
    setAppState("hoveredChampionId", championId);
  },
  clearSelectionSource: () => {
    setAppState("hoveredChampionId", undefined);
  },
  setKeyboardState(partial: Partial<(typeof appState)["keyboardState"]>) {
    setAppState("keyboardState", partial);
  },
  shiftChampionById: (championId: string, removed: boolean) => {
    setAppState(
      "champions",
      (champion) => champion.id === championId,
      "removed",
      () => removed
    );
  }
};

export const StoreContext = createContext(store);
export const useAppStore = () => useContext(StoreContext);
