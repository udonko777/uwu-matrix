// three.jsを参考にした
// @see https://threejs.org/docs/#api/en/core/BufferAttribute
export type Attribute = {
  value: ArrayLike<number>;
  stride: number;
  //type: number;
  //normalized: boolean;
}

export const init = (value: ArrayLike<number>, stride: number): Attribute => {
  return { value, stride }
}