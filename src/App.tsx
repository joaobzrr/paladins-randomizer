import { onMount, onCleanup, splitProps, For, Show, type Component, type JSX } from "solid-js";
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
      } case "Shift": {
        store.setKeyboardState({ shift: true });
        break;
      }
    }
  }

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
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      store.setKeyboardState({ ctrl: false, shift: false });
    }
  }

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

  const includedChampions = store.champions({ removed: false });
  const excludedChampions = store.champions({ removed: true });

  return (
    <div class="flex h-full items-center justify-center overflow-auto">
      <div class="flex items-start gap-x-8 h-[832px]">
        <ChampionList
          champions={excludedChampions()}
          title="Out"
        />
        <ChampionList
          champions={includedChampions()}
          title="Pool"
        />
      </div>
    </div>
  );
}

type ChampionListProps = {
  champions: Champion[];
  title: string;
}

const ChampionList: Component<ChampionListProps> = (props) => {
  const store = useAppStore();

  return (
    <div class="rounded-md bg-primary/10 ">
      <h2 class="p-4">{props.title}</h2>
      <div class="px-4">
        <div class="w-[--grid-width] px-4"></div>
      </div>
      <Show when={props.champions.length > 0}>
        <div class="p-4 pt-0">
          <div
            class="grid grid-cols-[repeat(var(--grid-columns),var(--grid-button-width))] auto-rows-[--grid-button-width]"
          >
            <For each={props.champions}>{(champion) =>
              <div class="relative">
                <button
                  class="w-full h-full p-[--grid-button-padding]"
                  onMouseDown={(event) => {
                    if (event.button !== 0) return;
                    store.shiftChampionById(champion.id, !champion.removed);
                  }}
                  onMouseEnter={() => store.setSelectionSourceChampionId(champion.id)}
                  onMouseLeave={store.clearSelectionSource}
                >
                  <ChampionImage
                    champion={champion}
                  />
                </button>
                <div class="absolute w-full h-full left-0 top-0 p-[--grid-button-overlay-padding] pointer-events-none">
                  <div 
                    class="rounded-md h-full border-primary"
                    classList={{
                      "border-[length:--grid-button-border-width]": store.selectedChampions.includes(champion)
                    }}
                  >
                  </div>
                </div>
              </div>
            }</For>
          </div>
        </div>
      </Show>
    </div>
  );
}

type ChampionImageProps = {
  champion: ChampionRow;
  class?: string;
  classList?: Record<string, boolean | undefined>;
  style?: JSX.CSSProperties;
}

const ChampionImage: Component<ChampionImageProps> = (props) => {
  const [custom, rest] = splitProps(props, ["champion"]);
  const url = makeAssetURL("images", custom.champion.imagePath);
  return (
    <Image
      fallback={<Skeleton />}
      src={url}
      alt={custom.champion.name}
      class={cn("rounded-md", props.class)}
      {...rest}
    />
  );
}

export default App;
