import * as f64M from "./f64Mat";

export type { F64Mat } from "./f64Mat";
export type { F32Mat } from "./f32Mat";

export const f64Mat = {
  isF64Mat: f64M.isF64Mat,
  fromColumnMajor: f64M.fromColumnMajor,
  fromRowMajor: f64M.fromRowMajor,
  getClone: f64M.getClone,
  getIdentity: f64M.getIdentity,
  init: f64M.init,
  valueAt: f64M.valueAt,
  add: f64M.add,
  subtract: f64M.subtract,
  multiply: f64M.multiply,
  equals: f64M.equals,
  sameSize: f64M.sameSize,
  inverse: f64M.inverse,
  determinant: f64M.determinant,
  toString: f64M.toString,
}

import * as f32 from "./f32Mat";

export const f32Mat ={
  isF32Mat: f32.isF32Mat,
  fromColumnMajor: f32.fromColumnMajor,
  fromRowMajor: f32.fromRowMajor,
  getClone: f32.getClone,
  getIdentity: f32.getIdentity,
  init: f32.init,
  valueAt: f32.valueAt,
  add: f32.add,
  subtract: f32.subtract,
  multiply: f32.multiply,
  equals: f32.equals,
  sameSize: f32.sameSize,
  inverse: f32.inverse,
  determinant: f32.determinant,
  toString: f32.toString,
}
