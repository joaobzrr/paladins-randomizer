import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeAssetURL(dir: string, fileName: string) {
  return new URL(`../assets/${dir}/${fileName}`, import.meta.url).href;
}

export function randint(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function choose<T>(choices: T[]) {
  if (choices.length === 0) {
    return undefined;
  }

  const index = randint(0, choices.length);
  const result = choices[index];
  return result;
}
