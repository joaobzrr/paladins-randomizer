import {
  createMemo,
  onMount,
  onCleanup,
  splitProps,
  For,
  Show,
  type Component,
  type JSX
} from "solid-js";
import { Image } from "@/components/image";
import { Skeleton } from "@/components/skeleton";
import { cn, makeAssetURL } from "@/lib/utils";
import { Champion, ChampionRow } from "@/types";
import { useAppStore, StoreContext } from "./store";

function App() {
  const store = useAppStore();

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Control": {
        store.setKeyboardState({ ctrl: true });
        break;
      }
      case "Shift": {
        store.setKeyboardState({ shift: true });
        break;
      }
    }
  };

  const handleKeyUpEvent = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Control": {
        store.setKeyboardState({ ctrl: false });
        break;
      }
      case "Shift": {
        store.setKeyboardState({ shift: false });
        break;
      }
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      store.setKeyboardState({ ctrl: false, shift: false });
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDownEvent);
    window.addEventListener("keyup", handleKeyUpEvent);
    window.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDownEvent);
    window.removeEventListener("keyup", handleKeyUpEvent);
    window.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  return (
    <StoreContext.Provider value={store}>
      <Randomizer />
    </StoreContext.Provider>
  );
}

function Randomizer() {
  const store = useAppStore();
  const includedChampions = store.createChampions({ removed: false });
  const excludedChampions = store.createChampions({ removed: true });

  return (
    <div class="flex h-full items-center justify-center overflow-auto">
      <div class="flex h-[832px] items-start gap-x-8">
        <ChampionList champions={excludedChampions()} title="Out" />
        <ChampionList champions={includedChampions()} title="Pool" />
      </div>
    </div>
  );
}

type ChampionListProps = {
  champions: Champion[];
  title: string;
};

const ChampionList: Component<ChampionListProps> = (props) => {
  return (
    <div class="rounded-md bg-primary/10 ">
      <h2 class="p-4">{props.title}</h2>
      <div class="px-4">
        <div class="w-[--grid-width] px-4" />
      </div>
      <Show when={props.champions.length > 0}>
        <div class="p-4 pt-0">
          <div class="grid auto-rows-[--grid-button-width] grid-cols-[repeat(var(--grid-columns),var(--grid-button-width))]">
            <For each={props.champions}>
              {(champion) => <ChampionButton champion={champion} />}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
};

const ChampionButton: Component<{ champion: Champion }> = (props) => {
  const store = useAppStore();

  const isChampionSelected = createMemo(() =>
    store.selectedChampions.includes(props.champion)
  );

  const onMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) return;

    if (store.keyboardState.ctrl) {
      if (store.keyboardState.shift) {
        store.toggleChampionByClassId(
          props.champion.classId,
          !props.champion.disabled
        );
      } else {
        store.toggleChampionById(props.champion.id, !props.champion.disabled);
      }
    } else {
      if (store.keyboardState.shift) {
        store.shiftChampionsByClassId(
          props.champion.classId,
          !props.champion.removed
        );
      } else {
        store.shiftChampionById(props.champion.id, !props.champion.removed);
      }
    }
  };

  const onMouseEnter = () => {
    store.setSelectionSourceChampionId(props.champion.id);
  };

  const onMouseLeave = () => {
    store.clearSelectionSource();
  };

  return (
    <button
      class="relative h-full w-full p-[--grid-button-padding]"
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        class={cn("rounded-md border-[length:--grid-button-border-width]", {
          "border-red-500": isChampionSelected() && store.keyboardState.ctrl,
          "border-primary": isChampionSelected() && !store.keyboardState.ctrl,
          "border-transparent": !isChampionSelected()
        })}
      >
        <ChampionImage
          champion={props.champion}
          class={cn("rounded-md transition-[filter]", {
            grayscale: props.champion.disabled
          })}
        />
      </div>
    </button>
  );
};

type ChampionImageProps = {
  champion: ChampionRow;
  class?: string;
  classList?: Record<string, boolean | undefined>;
  style?: JSX.CSSProperties;
};

const ChampionImage: Component<ChampionImageProps> = (props) => {
  const [custom, rest] = splitProps(props, ["champion"]);
  return (
    <Image
      fallback={<Skeleton />}
      src={makeAssetURL("images", custom.champion.imagePath)}
      alt={custom.champion.name}
      class={cn("rounded-md", props.class)}
      {...rest}
    />
  );
};

export default App;
