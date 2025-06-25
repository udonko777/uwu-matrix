// viteに依存関係を示す
const images = import.meta.glob('../resource/*.png', { query: '?url',import: `default` });

import { Texture } from "../texture";

export async function loadTextureBitmap(name: string): Promise<Texture> {
  const matched = Object.entries(images).find(([path]) => path.endsWith(name));
  if (!matched) {
    throw new Error(`Image not found: ${name}`);
  }

  const url = await matched[1]();
  if (typeof url !== 'string') {
    throw new Error('Loaded URL is not a string');
  }
  const res = await fetch(url);
  const blob = await res.blob();
  const texture = {
    image: await createImageBitmap(blob),
    map: null,
  };
  return texture;
}