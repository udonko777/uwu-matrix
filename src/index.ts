/* eslint-disable */
import * as f64 from "./f64Mat";

export namespace f64Mat {
  export const isf64Mat = f64.isf64Mat;
  export const fromColumnMajor = f64.fromColumnMajor;
  export const fromRowMajor = f64.fromRowMajor;
  export const getClone = f64.getClone;
  export const getIdentity = f64.getIdentity;
  export const init = f64.init;
  export const valueAt = f64.valueAt;
  export const add = f64.add;
  export const subtract = f64.subtract;
  export const multiply = f64.multiply;
  export const equals = f64.equals;
  export const sameSize = f64.sameSize;
  export const inverse = f64.inverse;
  export const determinant = f64.determinant;
  export const toString = f64.toString;
}

import * as f32 from "./f32Mat";

export namespace f32Mat {
  export const isf32Mat = f32.isf32Mat;
  export const fromColumnMajor = f32.fromColumnMajor;
  export const fromRowMajor = f32.fromRowMajor;
  export const getClone = f32.getClone;
  export const getIdentity = f32.getIdentity;
  export const init = f32.init;
  export const valueAt = f32.valueAt;
  export const add = f32.add;
  export const subtract = f32.subtract;
  export const multiply = f32.multiply;
  export const equals = f32.equals;
  export const sameSize = f32.sameSize;
  export const inverse = f32.inverse;
  export const determinant = f32.determinant;
  export const toString = f32.toString;
}
