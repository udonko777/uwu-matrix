import { is2dNumberArray } from "@/common";
import { SingularMatrixError, ValidationError } from "./errors";

const TYPE_NAME = "f64Mat";

/**
 * サイズが可変である実数の行列\
 * webGLの仕様に合わせ、列優先でデータを持つ
 */
export type f64Mat<R, C> = {
  type: typeof TYPE_NAME;
  /** column-major order */
  value: Float64Array;
  /** 行の量 */
  rowCount: R extends number ? R : never;
  /** 列の量 */
  colCount: C extends number ? C : never;
  [Symbol.toPrimitive]?: (hint: string) => string | null;
};

/**
 * 引数が`f64Mat<number,number>`型を満たしており、論理的に構造が破綻していないか確かめる
 * @summary 実用的には、この関数を利用せずとも`type`の値が`"f64Mat"`であれば`f64Mat<number,number>`としてよい
 */
export const isf64Mat = (value: unknown): value is f64Mat<number, number> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const matrix = value as Partial<f64Mat<number, number>>;
  return (
    matrix.type === TYPE_NAME &&
    matrix.value instanceof Float64Array &&
    typeof matrix.rowCount === "number" &&
    typeof matrix.colCount === "number" &&
    matrix.rowCount > 0 &&
    matrix.colCount > 0
  );
};

/**
 * 列優先2次元配列から `f64Mat` のインスタンスを得る
 * @param columnMajor 列優先2次元配列
 * @returns 行列のインスタンス
 * @throws ValidationError 引数が不正
 */
export const fromColumnMajor = (
  columnMajor: ReadonlyArray<ReadonlyArray<number>>,
): f64Mat<number, number> => {
  if (!is2dNumberArray(columnMajor)) {
    throw new ValidationError(
      "Invalid matrix format: The input must be a 2D array where all elements are numbers.",
      { cause: { reason: "not2dNumberArray", value: columnMajor } },
    );
  }
  if (!columnMajor.every(col => col.length === columnMajor[0].length)) {
    throw new ValidationError(
      "All columns must have the same number of rows.",
      {
        cause: { reason: "columnsHaveDifferentRowCounts", value: columnMajor },
      },
    );
  }
  const rowCount = columnMajor[0].length;
  const colCount = columnMajor.length;
  const value = new Float64Array(columnMajor.flat());
  return init(value, rowCount, colCount);
};

/**
 * 行優先2次元配列から `f64Mat` のインスタンスを得る
 * @param rowMajor 行優先2次元配列
 * @returns 行列のインスタンス
 * @throws ValidationError 引数が不正
 */
export const fromRowMajor = (rowMajor: number[][]): f64Mat<number, number> => {
  if (!is2dNumberArray(rowMajor)) {
    throw new ValidationError(
      "Invalid matrix format: The input must be a 2D array where all elements are numbers.",
      { cause: { reason: "not2dNumberArray", value: rowMajor } },
    );
  }
  if (!rowMajor.every(row => row.length === rowMajor[0].length)) {
    throw new ValidationError("All rows must have the same number of columns", {
      cause: { reason: "columnsHaveDifferentRowCounts", value: rowMajor },
    });
  }
  const rowCount = rowMajor.length;
  const colCount = rowMajor[0].length;
  const value = new Float64Array(rowCount * colCount);

  for (let col = 0; col < colCount; col++) {
    for (let row = 0; row < rowCount; row++) {
      value[col * rowCount + row] = rowMajor[row][col];
    }
  }

  return init(value, rowCount, colCount);
};

/**
 * 行列のディープコピーを返す
 * @param matrix コピーを手に入れたい行列
 * @returns 行列のディープコピー
 */
export const getClone = <T, V>(matrix: f64Mat<T, V>): f64Mat<T, V> => {
  return { ...matrix, value: Float64Array.from(matrix.value) };
};

/**
 * 単位行列を作成
 * @param size 行列のサイズ
 * @returns size * size の単位行列
 */
export const getIdentity = <T extends number>(size: T): f64Mat<T, T> => {
  if (size <= 0) {
    throw new ValidationError("Matrix size must be greater than 0", {
      cause: { reason: "invalidSize", value: size },
    });
  }

  const result = new Float64Array(size * size).fill(0);

  for (let i = 0; i < size; i++) {
    result[i * size + i] = 1;
  }

  return {
    ...init(result, size, size),
    type: TYPE_NAME,
  } as f64Mat<T, T>;
};

/**
 * f64Matのvalueをrow-majorな一次元配列として取得する。実装時点ではテスト用
 * @param matrix f64Mat型の行列
 * @returns row-majorな一次元配列
 */
export const toRowMajorArray = (matrix: f64Mat<number, number>): number[] => {
  const result: number[] = [];
  for (let row = 0; row < matrix.rowCount; row++) {
    for (let col = 0; col < matrix.colCount; col++) {
      result.push(matrix.value[col * matrix.rowCount + row]);
    }
  }
  return result;
};

/**
 * f64MatのValueを行優先の二次元配列として取得する。主にテストケースの作成に使用することを想定
 * @param matrix
 * @example
 * //TODO このサンプルのテスト
 * const val = matrix.value;
 * const param = toRowMajor2dArray(val);
 * const sameMatrix = fromRowMajor(matrix.rowCount * matrix.colCount,param);
 */
export const toRowMajor2dArray = (
  matrix: f64Mat<number, number>,
): number[][] => {
  const result: number[][] = [];
  for (let row = 0; row < matrix.rowCount; row++) {
    const rowArray: number[] = [];
    for (let col = 0; col < matrix.colCount; col++) {
      rowArray.push(matrix.value[col * matrix.rowCount + row]);
    }
    result.push(rowArray);
  }
  return result;
};

/**
 * [Symbol.toPrimitive] の実装
 * @param this 
 * @param hint 
 * @returns プリミティブ値
 */
const toPrimitive = function (
  this: f64Mat<number, number>,
  hint: string,
): string | null {
  if (hint === "string") {
    // 例: [object f64Mat 3x4]
    return `[object ${this.type}: ${this.rowCount}x${this.colCount}]`;
  }
  return null;
};

/**
 * 列優先の値配列から新しい f64Mat 行列インスタンスを生成
 *
 * @param value 行列の値を格納した配列（列優先）
 * @param rowCount 行数
 * @param colCount 列数
 * @returns 新しい f64Mat インスタンス
 *
 * @remarks
 * - この関数は値やサイズの妥当性チェックを行わない。呼び出し側で整合性を保証すること
 * - value は列優先（column-major）である必要がある
 */
export const init = <R extends number, C extends number>(
  value: ArrayLike<number> = [],
  rowCount: R,
  colCount: C,
): f64Mat<R, C> =>
  ({
    type: TYPE_NAME,
    value: new Float64Array(value),
    rowCount,
    colCount,
    [Symbol.toPrimitive]: toPrimitive,
  }) as f64Mat<R, C>;

/**
 * インデックス指定で行列から値を取得する
 * @param matrix 対象の行列
 * @param rowIndex 行のインデックス、0 ベース。
 * @param columnIndex 列のインデックス、0 ベース。
 * @returns 
 * @throws ValidationError 指定されたインデックスが対象の行列の範囲外
 */
export const valueAt = (
  matrix: Readonly<f64Mat<number, number>>,
  rowIndex: number,
  columnIndex: number,
): number => {
  if (columnIndex < 0 || columnIndex >= matrix.colCount) {
    throw new ValidationError(`columnIndex ${columnIndex} is out of bounds`, {
      cause: { reason: "outOfBounds", value: columnIndex },
    });
  }
  if (rowIndex < 0 || rowIndex >= matrix.rowCount) {
    throw new ValidationError(`rowIndex ${rowIndex} is out of bounds`, {
      cause: { reason: "outOfBounds", value: rowIndex },
    });
  }
  return matrix.value[columnIndex * matrix.rowCount + rowIndex];
};

/**
 * サイズ可変行列の加算
 * @param a 左辺値
 * @param b 右辺値
 * @returns 加算された新しい行列
 * @throws ValidationError 演算対象の行列のサイズが異なる場合
 */
export const add = <R extends number, C extends number>(
  a: f64Mat<R, C>,
  b: f64Mat<R, C>,
): f64Mat<R, C> => {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v + b.value[i]);
  return init(value, a.rowCount, a.colCount);
};

/**
 * サイズ可変行列の減算
 * @param a 左辺値
 * @param b 右辺値
 * @returns 減算された新しい行列
 * @throws ValidationError 演算対象の行列のサイズが異なる場合
 */
export const subtract = <R extends number, C extends number>(
  a: f64Mat<R, C>,
  b: f64Mat<R, C>,
): f64Mat<R, C> => {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v - b.value[i]);
  return init(value, a.rowCount, a.colCount);
};

/**
 * スカラー倍された行列を返す
 * @param matrix 左辺値
 * @param scalar 行列の全ての値に書けられる単一の値
 * @returns 
 */
export const multiplyScalar = <R extends number, C extends number>(
  matrix: f64Mat<R, C>,
  scalar: number,
): f64Mat<R, C> => {
  const value = matrix.value.map(v => v * scalar);
  return init(value, matrix.rowCount, matrix.colCount);
};

/**
 * 可変サイズ行列同士の演算。`Mat4.multiply()`等が使えるならそちらを優先する
 * @param a 左辺値
 * @param b 右辺値
 * @returns 
 * @throws ValidationError 左辺値の行の数と、右辺値の列の数が合わない
 */
export const multiply = <M extends number, N extends number, P extends number>(
  a: f64Mat<M, N>,
  b: f64Mat<N, P>,
): f64Mat<M, P> => {
  if (a.colCount !== b.rowCount) {
    throw new ValidationError(`Matrix size mismatch`, {
      cause: { reason: "sizeMismatch", value: [a, b] },
    });
  }

  const value = new Float64Array(a.rowCount * b.colCount).fill(0);

  for (let row = 0; row < a.rowCount; row++) {
    for (let col = 0; col < b.colCount; col++) {
      let sum = 0;
      for (let k = 0; k < a.colCount; k++) {
        sum += a.value[k * a.rowCount + row] * b.value[col * b.rowCount + k];
      }
      value[col * a.rowCount + row] = sum;
    }
  }

  return init(value, a.rowCount, b.colCount);
};

/**
 * 2つの行列の対応する値の差が、全て与えられた許容範囲内であるかを返す
 * @param a 比較対象の1つ目の行列
 * @param b 比較対象の2つ目の行列
 * @param precisionExponent 許容する誤差の指数（デフォルトは `Infinity` ）
 * @returns すべての要素が許容誤差内で一致しているか
 *
 * @beta 厳密等価使用時の `precisionExponent` がどうあるべきか検討中
 */
export const equals = (
  a: f64Mat<number, number>,
  b: f64Mat<number, number>,
  precisionExponent = Infinity,
): boolean => {
  if (a.rowCount !== b.rowCount || a.colCount !== b.colCount) {
    return false;
  }

  // precisionExponentがInfinityの場合、完全一致比較を行う
  if (precisionExponent === Infinity) {
    return a.value.every((v, i) => v === b.value[i]);
  }

  const epsilon = Math.pow(10, -precisionExponent);

  return a.value.every((v, i) => Math.abs(v - b.value[i]) < epsilon);
};

export const sameSize = (
  a: f64Mat<number, number>,
  b: f64Mat<number, number>,
): boolean => {
  return a.rowCount === b.rowCount && a.colCount === b.colCount;
};

/**
 * @internal
 */
const assertSameSize = (
  a: f64Mat<number, number>,
  b: f64Mat<number, number>,
): void => {
  if (!sameSize(a, b)) {
    throw new ValidationError("Matrix size mismatch", {
      cause: { reason: "sizeMismatch", value: [a, b] },
    });
  }
};

/**
 * 行列の指定した2つの行をスワップする
 * @param matrix f64Mat型の行列
 * @param row1 スワップする1つ目の行の 0 ベースインデックス
 * @param row2 スワップする2つ目の行の 0 ベースインデックス
 * 
 * @internal
 */
const swapRows = (
  matrix: f64Mat<number, number>,
  row1: number,
  row2: number,
): void => {
  if (row1 === row2) return;
  for (let col = 0; col < matrix.colCount; col++) {
    const temp = matrix.value[col * matrix.rowCount + row1];
    matrix.value[col * matrix.rowCount + row1] =
      matrix.value[col * matrix.rowCount + row2];
    matrix.value[col * matrix.rowCount + row2] = temp;
  }
};

/**
 * 指定された行にスカラー倍された別の行を減算する
 *
 * @param matrix - 操作対象の行列
 * @param targetRowIndex - 減算先の行の 0 ベースインデックス
 * @param sourceRowIndex - 減算元の行の 0 ベースインデックス
 * @param scalar - 減算元の行に掛けるスカラー値
 *
 * @example
 * ```ts
 * const matrix = {
 *   value: [1, 2, 3, 4, 5, 6],
 *   rowCount: 2,
 *   colCount: 3
 * };
 * subtractScaledRow(matrix, 0, 1, 2);
 * // 結果: matrix.value :  [-3, 2, -5, 4, -7, 6]
 * // valueは列優先配列なので、行列表記では [[-3,-5,-7],[2,4,6]] になる。
 * ```
 * @internal
 */
export const subtractScaledRow = (
  matrix: f64Mat<number, number>,
  targetRowIndex: number,
  sourceRowIndex: number,
  scalar: number,
) => {
  for (let col = 0; col < matrix.colCount; col++) {
    const idxTarget = col * matrix.rowCount + targetRowIndex;
    const idxSource = col * matrix.rowCount + sourceRowIndex;
    matrix.value[idxTarget] -= matrix.value[idxSource] * scalar;
  }
};

/**
 * 行列の指定した行をスカラー倍する
 * @param matrix f64Mat型の行列
 * @param row スカラー倍する行インデックス
 * @param scalar スカラー値
 *
 * @internal
 */
const scaleRow = (
  matrix: f64Mat<number, number>,
  row: number,
  scalar: number,
): void => {
  for (let col = 0; col < matrix.colCount; col++) {
    matrix.value[col * matrix.rowCount + row] *= scalar;
  }
};

/**
 * 掃き出し法を用いて逆行列を求める
 * 計算量 O(N^3) の素朴な実装
 * @param matrix 正則行列
 * @returns
 */
export const inverse = <T extends number>(
  matrix: f64Mat<T, T>,
): f64Mat<T, T> => {
  const size = matrix.colCount;
  if (matrix.rowCount !== size) {
    throw new ValidationError("Matrix must be square", {
      cause: { reason: "notSquare", value: matrix },
    });
  }

  const m = getClone(matrix);
  const inv = getIdentity(size);

  for (let pivot = 0; pivot < size; pivot++) {
    let pivotValue = valueAt(m, pivot, pivot);

    // 最大の絶対値を持つ行を探す
    let maxRow = pivot;
    let maxAbs = Math.abs(valueAt(m, pivot, pivot));
    for (let i = pivot + 1; i < size; i++) {
      const val = Math.abs(valueAt(m, i, pivot));
      if (val > maxAbs) {
        maxAbs = val;
        maxRow = i;
      }
    }

    // 特異行列チェック
    if (maxAbs < 1e-6) {
      throw new SingularMatrixError({ cause: { value: matrix } });
    }

    if (maxRow !== pivot) {
      swapRows(m, pivot, maxRow);
      swapRows(inv, pivot, maxRow);
    }

    pivotValue = valueAt(m, pivot, pivot);

    scaleRow(m, pivot, 1 / pivotValue);
    scaleRow(inv, pivot, 1 / pivotValue);

    for (let row = 0; row < size; row++) {
      if (row === pivot) continue;
      const factor = valueAt(m, row, pivot);
      if (Math.abs(factor) < 1e-8) continue;
      subtractScaledRow(m, row, pivot, factor);
      subtractScaledRow(inv, row, pivot, factor);
    }
  }

  return inv;
};

/**
 * 行列式を求める素朴な実装
 * @param matrix
 */
export const determinant = <T extends number>(matrix: f64Mat<T, T>): number => {
  if (matrix.rowCount !== matrix.colCount) {
    throw new ValidationError("Matrix must be square to compute determinant", {
      cause: { reason: "notSquare", value: matrix },
    });
  }

  const size = matrix.rowCount;
  const m = getClone(matrix);
  let det = 1.0;

  for (let pivot = 0; pivot < size; pivot++) {
    let pivotValue = valueAt(m, pivot, pivot);

    // ピボットが (ほぼ) 0 の場合、行をスワップ
    if (Math.abs(pivotValue) < 1e-5) {
      let maxRow = pivot;
      let maxAbs = Math.abs(valueAt(m, pivot, pivot));
      for (let i = pivot + 1; i < size; i++) {
        const val = Math.abs(valueAt(m, i, pivot));
        if (val > maxAbs) {
          maxAbs = val;
          maxRow = i;
        }
      }
      if (maxAbs === 0) {
        return 0;
      }
      if (maxRow !== pivot) {
        swapRows(m, pivot, maxRow);
        det *= -1;
      }
      pivotValue = valueAt(m, pivot, pivot);
    }

    det *= pivotValue;
    scaleRow(m, pivot, 1 / pivotValue);

    for (let row = pivot + 1; row < size; row++) {
      const factor = valueAt(m, row, pivot);
      if (Math.abs(factor) < 1e-8) continue;
      subtractScaledRow(m, row, pivot, factor);
    }
  }

  return det;
};

/**
 * 行列をコンソール上で確認しやすいテキストに整形する\
 * @remarks 今のところ未使用。
 * @param matrix
 * @returns
 */
export const toString = (matrix: f64Mat<unknown, unknown>): string => {
  const rows: string[] = [];
  for (let row = 0; row < matrix.rowCount; row++) {
    const rowValues: number[] = [];
    for (let col = 0; col < matrix.colCount; col++) {
      rowValues.push(matrix.value[col * matrix.rowCount + row]);
    }
    rows.push(rowValues.join("\t"));
  }
  return rows.join("\n");
};
