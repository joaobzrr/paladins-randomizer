import { Component, type JSX } from "solid-js";
import { cn } from "@/lib/utils";

export const Skeleton: Component<{
  class?: string;
  classList?: Record<string, boolean | undefined>;
  style?: JSX.CSSProperties;
}> = (props) => {
  return (
    <div
      class={cn(
        "h-full w-full animate-pulse rounded-md bg-gray-700/60",
        props.class
      )}
      {...props}
    />
  );
};
