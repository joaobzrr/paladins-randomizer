import {
  createMemo,
  createContext,
  useContext,
  type Component,
  type JSX
} from "solid-js";
import { createStore } from "solid-js/store";
import { choose } from "@/lib/utils";
import { champions as championData } from "@/data/champions.json";
import { Champion } from "@/types";
import {
  getFromLocalStorage,
  saveToLocalStorage,
  saveChampionState,
  filterChampions,
  sortChampions,
  findChampionById,
  makeChampion
} from "./utils";

// eslint-disable-next-line prefer-const
let randomizedChampion: () => Champion | undefined;
// eslint-disable-next-line prefer-const
let previousChampion: () => Champion | undefined;
// eslint-disable-next-line prefer-const
let canRandomize: () => boolean;
// eslint-disable-next-line prefer-const
let selectedChampions: () => Champion[];

const createInitialStoreState = () => {
  let champions = championData.map((row) => makeChampion(row));
  const savedChampionState = getFromLocalStorage("championState");
  if (savedChampionState) {
    champions = champions.map((champion) => {
      const state = savedChampionState.find(({ id }) => id === champion.id);
      return { ...champion, ...state };
    });
  }
  champions = sortChampions(champions);

  const randomizedChampionId = getFromLocalStorage("randomizedChampionId");
  const previousChampionId = undefined as string | undefined;
  const hoveredChampionId = undefined as string | undefined;
  const keyboardState = { ctrl: false, shift: false };

  return {
    champions,
    randomizedChampionId,
    previousChampionId,
    hoveredChampionId,
    keyboardState
  };
};

const [appStoreState, setAppStoreState] = createStore({
  ...createInitialStoreState(),
  get randomizedChampion() {
    return randomizedChampion;
  },
  get previousChampion() {
    return previousChampion;
  },
  get canRandomize() {
    return canRandomize;
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
canRandomize = createMemo(() => {
  const choices = filterChampions(appStoreState.champions, {
    removed: false,
    disabled: false
  });
  return choices.length > 0;
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
      class: hoveredChampion.class,
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
    saveToLocalStorage("randomizedChampionId", randomizedChampionId);
  },
  shiftChampionById: (championId: string, removed: boolean) => {
    setAppStoreState(
      "champions",
      (c) => c.id === championId,
      "removed",
      removed
    );
    saveChampionState(appStoreState.champions);
  },
  shiftChampionsByClass: (championClass: string, removed: boolean) => {
    setAppStoreState(
      "champions",
      (c) => c.class === championClass,
      "removed",
      removed
    );
    saveChampionState(appStoreState.champions);
  },
  toggleChampionById: (championId: string, disabled: boolean) => {
    setAppStoreState(
      "champions",
      (c) => c.id === championId,
      "disabled",
      disabled
    );
    saveChampionState(appStoreState.champions);
  },
  toggleChampionsByClass: (championClass: string, disabled: boolean) => {
    setAppStoreState(
      "champions",
      (c) => c.class === championClass,
      "disabled",
      disabled
    );
    saveChampionState(appStoreState.champions);
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
