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

const is2dNumberArray = (value: unknown): value is number[][] => {
  if (!Array.isArray(value) || value.length <= 0) {
    return false;
  }
  return value.every(
    row => Array.isArray(row) && row.every(cell => typeof cell === "number"),
  );
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
 * 列優先行列から、f64Matのインスタンスを得る。
 * @param columnMajor 列の配列として表現された行列の内容
 */
export const fromColumnMajor = (
  columnMajor: ReadonlyArray<ReadonlyArray<number>>,
): f64Mat<number, number> => {
  if (!is2dNumberArray(columnMajor)) {
    throw new Error("Matrix must be a 2D array");
  }
  if (!columnMajor.every(col => col.length === columnMajor[0].length)) {
    throw new Error("All columns must have the same number of rows");
  }
  const rowCount = columnMajor[0].length;
  const colCount = columnMajor.length;
  const value = new Float64Array(columnMajor.flat());
  return { ...getEmpty(), value, rowCount, colCount };
};

/**
 * 行優先配列から、列優先行列である`f64Mat`のインスタンスを得る
 */
export const fromRowMajor = (rowMajor: number[][]): f64Mat<number, number> => {
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

  return {
    ...getEmpty(),
    value,
    rowCount,
    colCount,
  };
};

/**
 * 行列のディープコピーを返す
 * @param matrix コピーを手に入れたい行列
 * @returns deep copyされた行列
 */
export const getClone = <T, V>(matrix: f64Mat<T, V>): f64Mat<T, V> => {
  return { ...matrix, value: Float64Array.from(matrix.value) };
};

/**
  単位行列の生成
*/
export const getIdentity = <T extends number>(size: T): f64Mat<T, T> => {
  if (size <= 0) {
    throw new Error("Matrix size must be greater than 0");
  }

  const result = new Float64Array(size * size).fill(0);

  for (let i = 0; i < size; i++) {
    result[i * size + i] = 1;
  }

  return {
    ...getEmpty(),
    type: TYPE_NAME,
    rowCount: size,
    colCount: size,
    value: result,
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
 * const sameMatrix = new F32Mat(matrix.rowCount * matrix.colCount,param);
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
 * 空の`f64Mat`を返す\
 * このファイル内でのみ使用
 * @example
 * // 空のf64Matに必要な変更を加えて返す
 * return { ...getEmpty(), rowCount: 2, colCount: 2 };
 */
const getEmpty = (): f64Mat<number, number> => ({
  type: TYPE_NAME,
  value: new Float64Array(),
  rowCount: 0,
  colCount: 0,
  [Symbol.toPrimitive]: toPrimitive,
});

export const valueAt = (
  matrix: f64Mat<number, number>,
  rowIndex: number,
  columnIndex: number,
): number => {
  if (columnIndex < 0 || columnIndex >= matrix.colCount) {
    throw new RangeError(`columnIndex ${columnIndex} is out of bounds`);
  }
  if (rowIndex < 0 || rowIndex >= matrix.rowCount) {
    throw new RangeError(`rowIndex ${rowIndex} is out of bounds`);
  }
  return matrix.value[columnIndex * matrix.rowCount + rowIndex];
};

export const add = (
  a: f64Mat<number, number>,
  b: f64Mat<number, number>,
): f64Mat<number, number> => {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v + b.value[i]);
  return { ...a, value };
};

export const subtract = (
  a: f64Mat<number, number>,
  b: f64Mat<number, number>,
): f64Mat<number, number> => {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v - b.value[i]);
  return { ...a, value };
};

export const multiplyScalar = (
  matrix: f64Mat<number, number>,
  scalar: number,
): f64Mat<number, number> => {
  const value = matrix.value.map(v => v * scalar);
  return { ...matrix, value };
};

export const multiply = <M extends number, N extends number, P extends number>(
  a: f64Mat<M, N>,
  b: f64Mat<N, P>,
): f64Mat<M, P> => {
  if (a.colCount !== b.rowCount) {
    throw new Error("Matrix size mismatch");
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

  return {
    ...getEmpty(),
    value,
    rowCount: a.rowCount,
    colCount: b.colCount,
  };
};

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

const assertSameSize = (
  a: f64Mat<number, number>,
  b: f64Mat<number, number>,
): void => {
  if (!sameSize(a, b)) {
    throw new Error("Matrix size mismatch");
  }
};

/**
 * 行列の指定した2つの行をスワップする
 * @param matrix f64Mat型の行列
 * @param row1 スワップする1つ目の行インデックス
 * @param row2 スワップする2つ目の行インデックス
 *
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
 * @param matrix - 操作対象の行列。行列は `f64Mat<number, number>` 型で、`value` プロパティに値を格納します。
 * @param targetRowIndex - 減算先の行のインデックス
 * @param sourceRowIndex - 減算元の行のインデックス
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

/*
掃き出し法を用いて逆行列を求める
計算量 O(N^3) の素朴な実装
*/
export const inverse = <T extends number>(
  matrix: f64Mat<T, T>,
): f64Mat<T, T> => {
  const size = matrix.colCount;
  if (matrix.rowCount !== size) {
    throw new Error("Matrix must be square");
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
      throw new Error("Matrix is singular or nearly singular");
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
    throw new Error("Matrix must be square to compute determinant");
  }

  const size = matrix.rowCount;
  const m = getClone(matrix);
  let det = 1.0;

  for (let pivot = 0; pivot < size; pivot++) {
    let pivotValue = valueAt(m, pivot, pivot);

    // ピボットが (ほぼ) 0 の場合、行をスワップ
    // 無限ループする可能性がある?
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
        det *= -1; // 行をスワップすると符号が反転
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
行列をコンソール上で確認しやすいテキストに整形する
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
