import {
  onMount,
  onCleanup,
  createMemo,
  splitProps,
  For,
  Show,
  type Component
} from "solid-js";
import { Image, ImageProps } from "@/components/image";
import { Skeleton } from "@/components/skeleton";
import { filterChampions } from "@/lib/champions";
import { cn, makeAssetURL } from "@/lib/utils";
import { Champion, ChampionRow } from "@/types";
import { useAppStore, StoreProvider } from "./store";

function App() {
  const [appStoreState, appStoreActions] = useAppStore();

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Control": {
        appStoreActions.updateKeyboardState({ ctrl: true });
        break;
      }
      case "Shift": {
        appStoreActions.updateKeyboardState({ shift: true });
        break;
      }
    }
  };

  const handleKeyUpEvent = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Control": {
        appStoreActions.updateKeyboardState({ ctrl: false });
        break;
      }
      case "Shift": {
        appStoreActions.updateKeyboardState({ shift: false });
        break;
      }
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      appStoreActions.updateKeyboardState({ ctrl: false, shift: false });
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

  const includedChampions = createMemo(() => {
    return filterChampions(appStoreState.champions, { removed: false });
  });

  const excludedChampions = createMemo(() => {
    return filterChampions(appStoreState.champions, { removed: true });
  });

  return (
    <StoreProvider>
      <div class="flex h-full items-center justify-center overflow-auto">
        <div class="flex h-[832px] items-start gap-x-8">
          <ChampionList champions={excludedChampions()} title="Out" />
          <ChampionList champions={includedChampions()} title="Pool" />
          <div class="mb-4 rounded-md bg-primary/10 p-4">
            <div class="h-[--randomized-champion-image-width] w-[--randomized-champion-image-width]">
              <Show
                when={!!appStoreState.randomizedChampion()}
                fallback={
                  <Image
                    src={makeAssetURL("images", "Champion_Default_Icon.webp")}
                    fallback={<Skeleton class="h-full w-full rounded-md" />}
                    class="h-full w-full rounded-md"
                  />
                }
              >
                <ChampionImage
                  champion={appStoreState.randomizedChampion()!}
                  fallback={<Skeleton class="h-full w-full rounded-md" />}
                  class="h-full w-full"
                />
              </Show>
            </div>
            <button
              onClick={() => appStoreActions.randomizeChampion()}
              class="mt-4 h-11 w-full rounded-md bg-primary/60 px-8 text-lg font-medium"
            >
              Randomize
            </button>
          </div>
        </div>
      </div>
    </StoreProvider>
  );
}

type ChampionListProps = {
  champions: Champion[];
  title: string;
};

const ChampionList: Component<ChampionListProps> = (props) => {
  return (
    <div class="rounded-md bg-primary/10 ">
      <h2 class="p-4 font-bold">{props.title}</h2>
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
  const [appStoreState, appStoreActions] = useAppStore();

  const selected = createMemo(() => {
    return appStoreState.selectedChampions.includes(props.champion);
  });

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) return;

    if (appStoreState.keyboardState.ctrl) {
      if (appStoreState.keyboardState.shift) {
        appStoreActions.toggleChampionsByClassId(
          props.champion.classId,
          !props.champion.disabled
        );
      } else {
        appStoreActions.toggleChampionById(
          props.champion.id,
          !props.champion.disabled
        );
      }
    } else {
      if (appStoreState.keyboardState.shift) {
        appStoreActions.shiftChampionsByClassId(
          props.champion.classId,
          !props.champion.removed
        );
      } else {
        appStoreActions.shiftChampionById(
          props.champion.id,
          !props.champion.removed
        );
      }
    }
  };

  const handleMouseEnter = () => {
    appStoreActions.updateHoveredChampion(props.champion.id);
  };

  const handleMouseLeave = () => {
    appStoreActions.updateHoveredChampion(undefined);
  };

  return (
    <button
      class="h-full w-full p-[--grid-button-padding]"
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        class={cn(" rounded-md border-[length:--grid-button-border-width]", {
          "border-red-500": selected() && appStoreState.keyboardState.ctrl,
          "border-primary": selected() && !appStoreState.keyboardState.ctrl,
          "border-transparent": !selected()
        })}
      >
        <div class="h-[--grid-image-width] w-[--grid-image-width]">
          <ChampionImage
            champion={props.champion}
            fallback={<Skeleton class="h-full w-full rounded-md" />}
            class={cn("h-full w-full transition-[filter]", {
              grayscale: props.champion.disabled
            })}
          />
        </div>
      </div>
    </button>
  );
};

type ChampionImageProps = Omit<ImageProps, "src"> & {
  champion: ChampionRow;
};

const ChampionImage: Component<ChampionImageProps> = (props) => {
  const [custom, rest] = splitProps(props, ["champion", "class"]);
  return (
    <Image
      src={makeAssetURL("images", custom.champion.imagePath)}
      alt={custom.champion.name}
      class={cn(custom.class, "select-none rounded-md")}
      {...rest}
    />
  );
};

export default App;
