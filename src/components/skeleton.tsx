import { Component, type JSX } from "solid-js";
import { cn } from "@/lib/utils";

export const Skeleton: Component<{ class?: string, classList?: Record<string, boolean | undefined>, style?: JSX.CSSProperties }> = (props) => {
  return (
    <div class={cn("w-full h-full animate-pulse bg-gray-700/60 rounded-md", props.class)} {...props}>
    </div>
  );
}
