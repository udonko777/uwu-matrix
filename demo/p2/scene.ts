import { RenderableObject } from "./script";

export type Scene = {
  children: Set<RenderableObject>;
  type: "Scene";
}