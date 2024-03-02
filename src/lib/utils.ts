import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function makeAssetURL(dir: string, fileName: string) {
  return new URL(`../assets/${dir}/${fileName}`, import.meta.url).href;
}
