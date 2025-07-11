import { is2dNumberArray } from "@/common";
import * as fMat from "./f32Mat";
import { ValidationError } from "./errors";

export type Mat4 = fMat.F32Mat<4, 4>;

/*
// TODO
export const isMat4 = (value: unknown): value is mat4 => {
};

// TODO
export const fromColumnMajor = (
  columnMajor: ReadonlyArray<ReadonlyArray<number>>,
): mat4 => {
};
*/

/**
 * 行優先配列から、列優先行列である`f64Mat`のインスタンスを得る
 */
export const fromRowMajor = (rowMajor: number[][]): Mat4 => {
  if (!is2dNumberArray(rowMajor)) {
    throw new ValidationError(
      "Invalid matrix format: The input must be a 2D array where all elements are numbers.",
      { cause: { reason: "not2dNumberArray", value: rowMajor } },
    );
  }
  if (!rowMajor.every(row => row.length === rowMajor[0].length)) {
    throw new ValidationError(
      "All rows must have the same number of columns",
      { cause: { reason: "columnsHaveDifferentRowCounts", value: rowMajor }, }
    );
  }
  const rowCount = rowMajor.length;
  const colCount = rowMajor[0].length;

  if (rowCount !== 4 || colCount !== 4) {
    throw new ValidationError(
      "Input must be a 4x4 matrix",
      { cause: { reason: "sizeMismatch", value: rowMajor } }
    );
  }
  const value = new Float64Array(rowCount * colCount);

  for (let col = 0; col < colCount; col++) {
    for (let row = 0; row < rowCount; row++) {
      value[col * rowCount + row] = rowMajor[row][col];
    }
  }
  return fMat.init(value, 4, 4);
};

export const getClone = (matrix: Mat4): Mat4 => {
  return { ...matrix, value: Float32Array.from(matrix.value) };
};

export const getIdentity = (): Mat4 => {
  const value = new Float32Array(16);
  value[0] = 1;
  value[5] = 1;
  value[10] = 1;
  value[15] = 1;
  return fMat.init(value, 4, 4);
};

export const toRowMajorArray = (matrix: Mat4): number[] => {
  const result = new Array(16).fill(0);

  for (let row = 0; row < matrix.rowCount; row++) {
    for (let col = 0; col < matrix.colCount; col++) {
      result[row * 4 + col] = matrix.value[col * matrix.rowCount + row];
    }
  }
  return result;
};

export const toRowMajor2dArray = (matrix: Mat4): number[][] => {
  const v = matrix.value;
  const result: number[][] = [
    [v[0], v[4], v[8], v[12]],
    [v[1], v[5], v[9], v[13]],
    [v[2], v[6], v[10], v[14]],
    [v[3], v[7], v[11], v[15]],
  ];
  return result;
};

export const valueAt = (
  matrix: Mat4,
  rowIndex: number,
  columnIndex: number,
): number => {
  return fMat.valueAt(matrix, rowIndex, columnIndex);
};

export const add = (a: Mat4, b: Mat4): Mat4 => {
  const x = a.value;
  const y = b.value;
  return fMat.init(
    [
      x[0] + y[0],
      x[1] + y[1],
      x[2] + y[2],
      x[3] + y[3],
      x[4] + y[4],
      x[5] + y[5],
      x[6] + y[6],
      x[7] + y[7],
      x[8] + y[8],
      x[9] + y[9],
      x[10] + y[10],
      x[11] + y[11],
      x[12] + y[12],
      x[13] + y[13],
      x[14] + y[14],
      x[15] + y[15],
    ],
    4,
    4,
  );
};

export const subtract = (a: Mat4, b: Mat4): Mat4 => {
  const x = a.value;
  const y = b.value;
  return fMat.init(
    [
      x[0] - y[0],
      x[1] - y[1],
      x[2] - y[2],
      x[3] - y[3],
      x[4] - y[4],
      x[5] - y[5],
      x[6] - y[6],
      x[7] - y[7],
      x[8] - y[8],
      x[9] - y[9],
      x[10] - y[10],
      x[11] - y[11],
      x[12] - y[12],
      x[13] - y[13],
      x[14] - y[14],
      x[15] - y[15],
    ],
    4,
    4,
  );
};

export const multiplyScalar = (matrix: Mat4, scalar: number): Mat4 => {
  const x = matrix.value;
  return fMat.init(
    [
      x[0] * scalar,
      x[1] * scalar,
      x[2] * scalar,
      x[3] * scalar,
      x[4] * scalar,
      x[5] * scalar,
      x[6] * scalar,
      x[7] * scalar,
      x[8] * scalar,
      x[9] * scalar,
      x[10] * scalar,
      x[11] * scalar,
      x[12] * scalar,
      x[13] * scalar,
      x[14] * scalar,
      x[15] * scalar,
    ],
    4,
    4,
  );
};

export const multiply = (a: Mat4, b: Mat4): Mat4 => {
  const x = a.value;
  const y = b.value;
  const result = new Float64Array(16);

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += x[row + k * 4] * y[k + col * 4];
      }
      result[row + col * 4] = sum;
    }
  }

  return fMat.init(result, 4, 4);
};

export const equals = (
  a: Mat4,
  b: Mat4,
  precisionExponent = Infinity,
): boolean => {
  return fMat.equals(a, b, precisionExponent);
};

export const sameSize = (a: Mat4, b: Mat4): boolean => {
  return fMat.sameSize(a, b);
};

/**
 * 逆行列を返す。 FIX ME
 * @param matrix
 */
export const inverse = (matrix: Mat4): Mat4 => {
  // FIX ME 一応動作するが、明らかに最適化可能
  return fMat.inverse(matrix);
};

/**
 * 行列式を求める TODO
 * @param matrix 
export const determinant = (matrix: mat4): number => {
}; */

export const toString = (matrix: Mat4): string => {
  return toRowMajor2dArray(matrix)
    .map(row => row.map(n => n.toFixed(3)).join("\t"))
    .join("\n");
};

// 平行移動行列 (4x4)
export const getTranslation = (x: number, y: number, z: number): Mat4 => {
  return fMat.init([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1], 4, 4);
};

// X軸回転行列 (4x4)
export const getRotateX = (rad: number): Mat4 => {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return fMat.init(
    [1, 0, 0, 0, 0, cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1],
    4,
    4,
  );
};

// Y軸回転行列 (4x4)
export const getRotateY = (rad: number): Mat4 => {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return fMat.init(
    [cos, 0, sin, 0, 0, 1, 0, 0, -sin, 0, cos, 0, 0, 0, 0, 1],
    4,
    4,
  );
};

// Z軸回転行列 (4x4)
export const getRotateZ = (rad: number): Mat4 => {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return fromRowMajor([
    [cos, -sin, 0, 0],
    [sin, cos, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
};

export const getRotate = (
  rad: number,
  axis: [number, number, number],
): Mat4 => {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const x = axis[0];
  const y = axis[1];
  const z = axis[2];
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const xy = x * y;
  const yz = y * z;
  const zx = z * x;
  const oneMinusCos = 1 - cos;

  return fMat.init(
    [
      xx * oneMinusCos + cos,
      xy * oneMinusCos + z * sin,
      zx * oneMinusCos - y * sin,
      0,
      xy * oneMinusCos - z * sin,
      yy * oneMinusCos + cos,
      yz * oneMinusCos + x * sin,
      0,
      zx * oneMinusCos + y * sin,
      yz * oneMinusCos - x * sin,
      zz * oneMinusCos + cos,
      0,
      0,
    ],
    4,
    4,
  );
};

export const getScale = (x: number, y: number, z: number): Mat4 => {
  return fMat.init([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1], 4, 4);
};

/**
 * 視点変換行列を作成する。 \
 * upがzと平行であるか、ゼロベクトルだとxがNaNになる
 * @param eye
 * @param target
 * @param up
 * @returns
 */
export const getLookAt = (
  eye: [number, number, number],
  target: [number, number, number],
  up: [number, number, number],
): Mat4 => {
  const z = [eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]];
  const zLen = Math.sqrt(z[0] * z[0] + z[1] * z[1] + z[2] * z[2]);
  z[0] /= zLen;
  z[1] /= zLen;
  z[2] /= zLen;

  const x = [
    up[1] * z[2] - up[2] * z[1],
    up[2] * z[0] - up[0] * z[2],
    up[0] * z[1] - up[1] * z[0],
  ];
  const xLen = Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]);
  x[0] /= xLen;
  x[1] /= xLen;
  x[2] /= xLen;

  const y = [
    z[1] * x[2] - z[2] * x[1],
    z[2] * x[0] - z[0] * x[2],
    z[0] * x[1] - z[1] * x[0],
  ];

  // 列優先で並べる
  return fMat.init(
    [
      x[0],
      y[0],
      z[0],
      0,
      x[1],
      y[1],
      z[1],
      0,
      x[2],
      y[2],
      z[2],
      0,
      -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
      -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
      -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
      1,
    ],
    4,
    4,
  );
};

/**
 * 透視射影行列を生成する
 * @param fovY 垂直方向の視野角（ラジアン）
 * @param aspect アスペクト比（横 / 縦）
 * @param near 最近接距離（0 より大きい）
 * @param far 最遠距離（near より大きい）
 */
export const getPerspective = (
  fovY: number,
  aspect: number,
  near: number,
  far: number,
): Mat4 => {
  const f = 1.0 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);

  // 列優先で並べる
  return fMat.init(
    [
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) * nf,
      -1,
      0,
      0,
      2 * far * near * nf,
      0,
    ],
    4,
    4,
  );
};
