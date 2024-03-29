import {
  onMount,
  onCleanup,
  createMemo,
  splitProps,
  Show,
  For,
  Switch,
  Match,
  type Component
} from "solid-js";
import { AiOutlineInfoCircle, AiFillGithub } from "solid-icons/ai";
import { Image, ImageProps } from "@/components/image";
import { Skeleton } from "@/components/skeleton";
import { filterChampions } from "@/lib/champions";
import { cn, makeAssetURL } from "@/lib/utils";
import { Champion } from "@/types";
import { useAppStore, StoreProvider } from "./store";

import DamageIcon from "@/assets/svg/ChampionClass_Damage_Icon.svg?component-solid";
import FlankIcon from "@/assets/svg/ChampionClass_Flank_Icon.svg?component-solid";
import FrontlineIcon from "@/assets/svg/ChampionClass_Frontline_Icon.svg?component-solid";
import SupportIcon from "@/assets/svg/ChampionClass_Support_Icon.svg?component-solid";

function App() {
  const [appStoreState, appStoreActions] = useAppStore();

  const includedChampions = createMemo(() => {
    return filterChampions(appStoreState.champions, { removed: false });
  });

  const excludedChampions = createMemo(() => {
    return filterChampions(appStoreState.champions, { removed: true });
  });

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

  let reelRef: HTMLDivElement;

  const onClickRandomizeButton = () => {
    if (!appStoreState.canRandomize()) {
      return;
    }

    appStoreActions.randomizeChampion();

    reelRef.classList.remove("reel-up");
    reelRef.offsetWidth;
    reelRef.classList.add("reel-up");
  };

  return (
    <StoreProvider>
      <div class="flex h-full items-center justify-center overflow-auto">
        <div class="flex h-[832px] items-start gap-x-8">
          <ChampionList champions={excludedChampions()} title="Out" />
          <ChampionList champions={includedChampions()} title="Pool" />
          <div>
            <div class="mb-4 rounded-md bg-primary/10 p-4">
              <div class="mb-2 flex w-full items-center justify-between">
                <h2 class="text-2xl font-bold">
                  {appStoreState.randomizedChampion()?.name ?? "None"}
                </h2>
                <Switch>
                  <Match
                    when={
                      appStoreState.randomizedChampion()?.class === "Damage"
                    }
                  >
                    <DamageIcon class="h-7 w-7 fill-current" />
                  </Match>
                  <Match
                    when={appStoreState.randomizedChampion()?.class === "Flank"}
                  >
                    <FlankIcon class="h-7 w-7 fill-current" />
                  </Match>
                  <Match
                    when={
                      appStoreState.randomizedChampion()?.class === "Frontline"
                    }
                  >
                    <FrontlineIcon class="h-7 w-7 fill-current" />
                  </Match>
                  <Match
                    when={
                      appStoreState.randomizedChampion()?.class === "Support"
                    }
                  >
                    <SupportIcon class="h-7 w-7 fill-current" />
                  </Match>
                </Switch>
              </div>
              <div class="h-[--randomized-champion-image-width] w-[--randomized-champion-image-width] overflow-hidden rounded-md">
                <div
                  class="flex -translate-y-[--randomized-champion-image-width] flex-col"
                  ref={reelRef!}
                >
                  <RandomizedChampionImage
                    champion={appStoreState.previousChampion()}
                  />
                  <RandomizedChampionImage
                    champion={appStoreState.randomizedChampion()}
                  />
                </div>
              </div>
              <button
                onClick={onClickRandomizeButton}
                disabled={!appStoreState.canRandomize()}
                class="mt-4 h-16 w-full rounded-md bg-primary/60 px-8 text-lg font-medium transition-colors disabled:cursor-not-allowed disabled:bg-gray-500"
              >
                Randomize
              </button>
            </div>
            <div>
              <p class="mb-2 min-w-full max-w-min text-sm leading-8">
                <AiOutlineInfoCircle class="inline-block h-5 w-5" /> Hold{" "}
                <span class="rounded-md bg-gray-700 px-2 py-1 text-sm text-xs font-bold">
                  Ctrl
                </span>{" "}
                to enter enable/disable mode and/or hold{" "}
                <span class="rounded-md bg-gray-700 px-2 py-1 text-sm text-xs font-bold">
                  Shift
                </span>{" "}
                to select champions by class.
              </p>
              <p>
                <AiFillGithub class="mr-1 inline-block h-5 w-5" />
                <a
                  href="https://github.com/joaobzrr/paladins-randomizer"
                  class="mb-4 min-w-full max-w-min text-sm text-primary hover:underline"
                >
                  joaobzrr/paladins-randomizer
                </a>
              </p>
            </div>
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
  const {
    toggleChampionById,
    toggleChampionsByClass,
    shiftChampionById,
    shiftChampionsByClass,
    updateHoveredChampion
  } = appStoreActions;

  const selected = createMemo(() => {
    return appStoreState.selectedChampions.includes(props.champion);
  });

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) return;

    const { keyboardState } = appStoreState;
    // eslint-disable-next-line solid/reactivity
    const { champion } = props;

    if (keyboardState.ctrl) {
      if (keyboardState.shift) {
        toggleChampionsByClass(champion.class, !champion.disabled);
      } else {
        toggleChampionById(champion.id, !champion.disabled);
      }
    } else {
      if (appStoreState.keyboardState.shift) {
        shiftChampionsByClass(champion.class, !champion.removed);
      } else {
        shiftChampionById(champion.id, !champion.removed);
      }
      // @Note Prevent invalid selection
      updateHoveredChampion(undefined);
    }
  };

  const handleMouseEnter = () => {
    updateHoveredChampion(props.champion.id);
  };

  const handleMouseLeave = () => {
    updateHoveredChampion(undefined);
  };

  return (
    <button
      class="h-full w-full p-[--grid-button-padding]"
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        class={cn("rounded-md border-[length:--grid-button-border-width]", {
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

type RandomizedChampionImageProps = {
  champion?: Champion;
};

const RandomizedChampionImage: Component<RandomizedChampionImageProps> = (
  props
) => {
  return (
    <div class="h-[--randomized-champion-image-width] w-[--randomized-champion-image-width]">
      <Show
        when={props.champion}
        fallback={
          <Image
            src={makeAssetURL("images", "Champion_Default_Icon.webp")}
            alt="No Champion Randomized"
            fallback={<Skeleton class="h-full w-full rounded-md" />}
            class="h-full w-full rounded-md"
          />
        }
      >
        <ChampionImage
          champion={props.champion!}
          fallback={<Skeleton class="h-full w-full rounded-md" />}
          class="h-full w-full rounded-md"
        />
      </Show>
    </div>
  );
};

type ChampionImageProps = Omit<ImageProps, "src"> & {
  champion: Champion;
};

const ChampionImage: Component<ChampionImageProps> = (props) => {
  const [custom, rest] = splitProps(props, ["champion", "class"]);
  return (
    <Image
      src={makeAssetURL("images", custom.champion.imagePath)}
      alt={custom.champion.name}
      class={cn("select-none rounded-md", custom.class)}
      {...rest}
    />
  );
};

export default App;
