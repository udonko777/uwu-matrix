import * as texture from "./texture"

export type Material = {
  textures: Array<texture.Texture> | null;
}