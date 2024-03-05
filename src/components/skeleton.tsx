import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "@/lib/utils";

export const Skeleton: Component<{
  class?: string;
  style?: JSX.CSSProperties;
}> = (props) => {
  const [custom, rest] = splitProps(props, ["class"]);

  return (
    <div
      class={cn("animate-pulse rounded-md bg-gray-700/60", custom.class)}
      {...rest}
    />
  );
};
