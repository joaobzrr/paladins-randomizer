import {
  createResource,
  createMemo,
  mergeProps,
  splitProps,
  Suspense,
  Component,
  type JSX,
  type ComponentProps
} from "solid-js";
import { makeCache } from "@solid-primitives/resource";

export type ImageProps = Omit<ComponentProps<"img">, "src"> & {
  src: string | string[];
  fallback?: JSX.Element;
};

const ImageComponent: Component<ImageProps> = (props) => {
  const mergedProps = mergeProps({ src: [] }, props);
  const [custom, rest] = splitProps(mergedProps, ["src", "fallback"]);

  const imageResource = createMemo(() => createImage(custom.src));

  return (
    <Suspense fallback={custom.fallback}>
      <img src={imageResource()()?.src} {...rest} />
    </Suspense>
  );
};

export { ImageComponent as Image };

export const createImage = (srcList: string | string[]) => {
  const srcArray = Array.isArray(srcList) ? srcList : [srcList];
  const [fetchImages] = makeCache(loadImages);
  const [imageResource] = createResource(srcArray, fetchImages);
  return imageResource;
};

const loadImages = async (srcList: string[]): Promise<HTMLImageElement> => {
  const errors = [];
  for (const src of srcList) {
    try {
      return await loadImage(src);
    } catch (error) {
      errors.push(error);
    }
  }
  return Promise.reject(errors[0]);
};

const loadImage = async (src: string) => {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
};
