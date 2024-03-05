import {
  createMemo,
  createContext,
  useContext,
  type Component,
  type JSX
} from "solid-js";
import { createStore } from "solid-js/store";
import {
  makeChampion,
  findChampionById,
  sortChampionRows
} from "@/lib/champions";
import { filterChampions } from "@/lib/champions";
import { champions as championData } from "@/data/champions.json";
import { Champion } from "@/types";
import { choose } from "./lib/utils";

// eslint-disable-next-line prefer-const
let randomizedChampion: () => Champion | undefined;
// eslint-disable-next-line prefer-const
let previousChampion: () => Champion | undefined;
// eslint-disable-next-line prefer-const
let selectedChampions: () => Champion[];

const [appStoreState, setAppStoreState] = createStore({
  champions: sortChampionRows(championData).map((row) => makeChampion(row)),
  randomizedChampionId: undefined as string | undefined,
  previousChampionId: undefined as string | undefined,
  hoveredChampionId: undefined as string | undefined,
  keyboardState: { ctrl: false, shift: false },
  get randomizedChampion() {
    return randomizedChampion;
  },
  get previousChampion() {
    return previousChampion;
  },
  get selectedChampions() {
    return selectedChampions();
  }
});

// eslint-disable-next-line solid/reactivity
randomizedChampion = createMemo(() => {
  return appStoreState.champions.find(
    (champion) => champion.id === appStoreState.randomizedChampionId
  );
});

// eslint-disable-next-line solid/reactivity
previousChampion = createMemo(() => {
  return appStoreState.champions.find(
    (champion) => champion.id === appStoreState.previousChampionId
  );
});

// eslint-disable-next-line solid/reactivity
selectedChampions = createMemo(() => {
  if (!appStoreState.hoveredChampionId) {
    return [];
  }

  const hoveredChampion = findChampionById(
    appStoreState.champions,
    appStoreState.hoveredChampionId
  );
  if (!hoveredChampion) {
    throw new Error("Unexpected error");
  }

  if (appStoreState.keyboardState.shift) {
    return filterChampions(appStoreState.champions, {
      classId: hoveredChampion.classId,
      ...(!appStoreState.keyboardState.ctrl && {
        removed: hoveredChampion.removed
      })
    });
  }

  return [hoveredChampion];
});

const appStoreActions = {
  randomizeChampion: () => {
    const choices = filterChampions(appStoreState.champions, {
      removed: false,
      disabled: false
    });
    const pickedChampion = choose(choices);
    const previousChampionId = appStoreState.randomizedChampionId;
    const randomizedChampionId = pickedChampion?.id;
    setAppStoreState({ previousChampionId, randomizedChampionId });
  },
  shiftChampionById: (championId: string, removed: boolean) => {
    setAppStoreState(
      "champions",
      (c) => c.id === championId,
      "removed",
      removed
    );
  },
  shiftChampionsByClassId: (classId: string, removed: boolean) => {
    setAppStoreState(
      "champions",
      (c) => c.classId === classId,
      "removed",
      removed
    );
  },
  toggleChampionById: (championId: string, disabled: boolean) => {
    setAppStoreState(
      "champions",
      (c) => c.id === championId,
      "disabled",
      disabled
    );
  },
  toggleChampionsByClassId: (classId: string, disabled: boolean) => {
    setAppStoreState(
      "champions",
      (c) => c.classId === classId,
      "disabled",
      disabled
    );
  },
  updateHoveredChampion: (championId: string | undefined) => {
    setAppStoreState("hoveredChampionId", championId);
  },
  updateKeyboardState: (
    partial: Partial<(typeof appStoreState)["keyboardState"]>
  ) => {
    setAppStoreState("keyboardState", partial);
  }
};

// @Note Why do we have to use this type?
const store: [typeof appStoreState, typeof appStoreActions] = [
  appStoreState,
  appStoreActions
];

export const StoreContext = createContext(store);

export const StoreProvider: Component<{ children?: JSX.Element }> = (props) => {
  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
};

export const useAppStore = () => useContext(StoreContext);
