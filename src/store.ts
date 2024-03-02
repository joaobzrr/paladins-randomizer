import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { champions as championData } from "@/data/champions.json";
import {
  makeChampion,
  findChampionById,
  filterChampions,
  sortChampionRows
} from "@/lib/champions";
import { ChampionFilters } from "@/types";

const [appState, setAppState] = createStore({
  champions: sortChampionRows(championData).map((row) => makeChampion(row)),
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
    return () => filterChampions(appState.champions, filters);
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
      removed
    );
  },
  shiftChampionsByClassId: (classId: string, removed: boolean) => {
    setAppState(
      "champions",
      (champion) => champion.classId === classId,
      "removed",
      removed
    );
  },
  toggleChampionById: (championId: string, disabled: boolean) => {
    setAppState(
      "champions",
      (champion) => champion.id === championId,
      "disabled",
      disabled
    );
  },
  toggleChampionByClassId: (classId: string, disabled: boolean) => {
    setAppState(
      "champions",
      (champion) => champion.classId === classId,
      "disabled",
      disabled
    );
  }
};

export const StoreContext = createContext(store);
export const useAppStore = () => useContext(StoreContext);
