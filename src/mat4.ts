import { is2dNumberArray } from "@/common";
import * as fMat from "./matrix";

type mat4 = fMat.f64Mat<4, 4>;

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
export const fromRowMajor = (rowMajor: number[][]): mat4 => {
  if (!is2dNumberArray(rowMajor)) {
    throw new Error("Input must be a 2D array");
  }
  if (!rowMajor.every(row => row.length === rowMajor[0].length)) {
    throw new Error("All rows must have the same number of columns");
  }
  const rowCount = rowMajor.length;
  const colCount = rowMajor[0].length;
  const value = new Float64Array(rowCount * colCount);

  for (let col = 0; col < colCount; col++) {
    for (let row = 0; row < rowCount; row++) {
      value[col * rowCount + row] = rowMajor[row][col];
    }
  }
  return fMat.init(value, 4, 4);
};

export const getClone = (matrix: mat4): mat4 => {
  return { ...matrix, value: Float64Array.from(matrix.value) };
};

export const getIdentity = (): mat4 => {
  const value = new Float64Array(16);
  value[0] = 1;
  value[5] = 1;
  value[10] = 1;
  value[15] = 1;
  return fMat.init(value, 4, 4);
};

export const toRowMajorArray = (matrix: mat4): number[] => {
  const result = new Array(16).fill(0);

  for (let row = 0; row < matrix.rowCount; row++) {
    for (let col = 0; col < matrix.colCount; col++) {
      result[row * 4 + col] = matrix.value[col * matrix.rowCount + row];
    }
  }
  return result;
};

export const toRowMajor2dArray = (matrix: mat4): number[][] => {
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
  matrix: mat4,
  rowIndex: number,
  columnIndex: number,
): number => {
  return fMat.valueAt(matrix, rowIndex, columnIndex);
};

export const add = (a: mat4, b: mat4): mat4 => {
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

export const subtract = (a: mat4, b: mat4): mat4 => {
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

export const multiplyScalar = (matrix: mat4, scalar: number): mat4 => {
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

export const multiply = (a: mat4, b: mat4): mat4 => {
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
  a: mat4,
  b: mat4,
  precisionExponent = Infinity,
): boolean => {
  return fMat.equals(a, b, precisionExponent);
};

export const sameSize = (a: mat4, b: mat4): boolean => {
  return fMat.sameSize(a, b);
};

/**
 * 逆行列を返す。TODO
 * @param matrix
export const inverse = (matrix: mat4): mat4 => {
  const det = determinant(matrix);
  if (det === 0) {
    throw new Error("Matrix is not invertible");
  }

  const result = new Float64Array(16);
  const m = matrix.value;

  //????

  for (let i = 0; i < 16; i++) {
    result[i] /= det;
  }

  return fMat.init(result, 4, 4);
}; */

/**
 * 行列式を求める TODO
 * @param matrix 
export const determinant = (matrix: mat4): number => {
}; */

/**
 * 行列をコンソール上で確認しやすいテキストに整形する TODO
export const toString = (matrix: mat4): string => {
}; */

export const translationMatrix = (x: number, y: number, z: number): mat4 => {
  const mat = fMat.getIdentity(4);
  mat.value[12] = x;
  mat.value[13] = y;
  mat.value[14] = z;
  return mat;
};

// Z軸回転行列 (4x4)
export const rotateZMatrix = (rad: number): mat4 => {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return fromRowMajor([
    [cos, -sin, 0, 0],
    [sin, cos, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
};

/**
 * 透視射影行列を生成する
 * @param fovY 垂直方向の視野角（ラジアン）
 * @param aspect アスペクト比（横 / 縦）
 * @param near 最近接距離（0 より大きい）
 * @param far 最遠距離（near より大きい）
 */
export const getPerspectiveMatrix = (
  fovY: number,
  aspect: number,
  near: number,
  far: number,
): mat4 => {
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
