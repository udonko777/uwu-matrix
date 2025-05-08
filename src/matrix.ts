const TYPE_NAME = "f32Matrix";

/**
 * サイズが可変である実数の行列\
 * webGLの仕様に合わせ、列優先でデータを持つ
 */
export type F32Mat<R, C> = {
  type: typeof TYPE_NAME;
  /** column-major order */
  value: Float32Array;
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
 * 引数が`F32Mat<number,number>`型を満たしており、論理的に構造が破綻していないか確かめる
 * @summary 実用的には、この関数を利用せずとも`type`の値が`"f32Matrix"`であれば`F32Mat<number,number>`としてよい
 */
export const isF32Mat = (value: unknown): value is F32Mat<number, number> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const matrix = value as Partial<F32Mat<number, number>>;
  return (
    matrix.type === TYPE_NAME &&
    matrix.value instanceof Float32Array &&
    typeof matrix.rowCount === "number" &&
    typeof matrix.colCount === "number" &&
    matrix.rowCount > 0 &&
    matrix.colCount > 0 &&
    matrix.value.length === matrix.rowCount * matrix.colCount
  );
};

/**
 * 列優先行列から、f32Matrixのインスタンスを得る。
 * @param columnMajor 列の配列として表現された行列の内容
 */
export const fromColumnMajor = (
  columnMajor: ReadonlyArray<ReadonlyArray<number>>,
): F32Mat<number, number> => {
  if (!is2dNumberArray(columnMajor)) {
    throw new Error("Matrix must be a 2D array");
  }
  if (!columnMajor.every(col => col.length === columnMajor[0].length)) {
    throw new Error("All columns must have the same number of rows");
  }
  const rowCount = columnMajor[0].length;
  const colCount = columnMajor.length;
  const value = new Float32Array(columnMajor.flat());
  return { ...getEmpty(), value, rowCount, colCount };
};

/**
 * 行優先配列から、列優先行列である`f32Matrix`のインスタンスを得る
 */
export const fromRowMajor = (rowMajor: number[][]): F32Mat<number, number> => {
  if (!is2dNumberArray(rowMajor)) {
    throw new Error("Input must be a 2D array");
  }
  if (!rowMajor.every(row => row.length === rowMajor[0].length)) {
    throw new Error("All rows must have the same number of columns");
  }
  const rowCount = rowMajor.length;
  const colCount = rowMajor[0].length;
  const value = new Float32Array(rowCount * colCount);

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
 * F32Matのvalueをrow-majorな一次元配列として取得する。実装時点ではテスト用
 * @param matrix F32Mat型の行列
 * @returns row-majorな一次元配列
 */
export const toRowMajorArray = (matrix: F32Mat<number, number>): number[] => {
  const result: number[] = [];
  for (let row = 0; row < matrix.rowCount; row++) {
    for (let col = 0; col < matrix.colCount; col++) {
      result.push(matrix.value[col * matrix.rowCount + row]);
    }
  }
  return result;
};

/**
 * F32MatのValueを行優先の二次元配列として取得する。主にテストケースの作成に使用することを想定
 * @param matrix
 * @example
 * //TODO このサンプルのテスト
 * const val = matrix.value;
 * const param = toRowMajor2dArray(val);
 * const sameMatrix = new F32Mat(matrix.rowCount * matrix.colCount,param);
 */
export const toRowMajor2dArray = (
  matrix: F32Mat<number, number>,
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
 * 空の`f32Matrix`を返す\
 * このファイル内でのみ使用
 * @example
 * // 空のf32Matrixに必要な変更を加えて返す
 * return { ...getEmpty(), rowCount: 2, colCount: 2 };
 */
const getEmpty = (): F32Mat<number, number> => ({
  type: TYPE_NAME,
  value: new Float32Array(),
  rowCount: 0,
  colCount: 0,
  [Symbol.toPrimitive]: toPrimitive,
});

export const getAt = (
  matrix: F32Mat<number, number>,
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

export const addMatrix = (
  a: F32Mat<number, number>,
  b: F32Mat<number, number>,
): F32Mat<number, number> => {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v + b.value[i]);
  return { ...a, value };
};

export const subtractMatrix = (
  a: F32Mat<number, number>,
  b: F32Mat<number, number>,
): F32Mat<number, number> => {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v - b.value[i]);
  return { ...a, value };
};

export const multiplyScalar = (
  matrix: F32Mat<number, number>,
  scalar: number,
): F32Mat<number, number> => {
  const value = matrix.value.map(v => v * scalar);
  return { ...matrix, value };
};

export const multiplyMatrix = <
  M extends number,
  N extends number,
  P extends number,
>(
  a: F32Mat<M, N>,
  b: F32Mat<N, P>,
): F32Mat<M, P> => {
  if (a.colCount !== b.rowCount) {
    throw new Error("Matrix size mismatch");
  }

  const value = new Float32Array(a.rowCount * b.colCount).fill(0);

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

/**
 * 行列のディープコピーを返す
 * @param matrix コピーを手に入れたい行列
 * @returns deep copyされた行列
 */
export const cloneMatrix = <T, V>(matrix: F32Mat<T, V>): F32Mat<T, V> => {
  return { ...matrix, value: Float32Array.from(matrix.value) };
};

export const equalsMatrix = (
  a: F32Mat<number, number>,
  b: F32Mat<number, number>,
): boolean => {
  if (a.rowCount !== b.rowCount || a.colCount !== b.colCount) {
    return false;
  }
  return a.value.every((v, i) => v === b.value[i]);
};

export const sameSize = (
  a: F32Mat<number, number>,
  b: F32Mat<number, number>,
): boolean => {
  return a.rowCount === b.rowCount && a.colCount === b.colCount;
};

const assertSameSize = (
  a: F32Mat<number, number>,
  b: F32Mat<number, number>,
): void => {
  if (!sameSize(a, b)) {
    throw new Error("Matrix size mismatch");
  }
};

/**
  単位行列の生成
*/
export const generateIdentity = <T extends number>(size: T): F32Mat<T, T> => {
  if (size <= 0) {
    throw new Error("Matrix size must be greater than 0");
  }

  const result = new Float32Array(size * size).fill(0);

  for (let i = 0; i < size; i++) {
    result[i * size + i] = 1;
  }

  return {
    ...getEmpty(),
    type: TYPE_NAME,
    rowCount: size,
    colCount: size,
    value: result,
  } as F32Mat<T, T>;
};

/**
 * 行列の指定した2つの行をスワップする
 * @param matrix F32Mat型の行列
 * @param row1 スワップする1つ目の行インデックス
 * @param row2 スワップする2つ目の行インデックス
 *
 */
const swapRows = (
  matrix: F32Mat<number, number>,
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
 * @param matrix - 操作対象の行列。行列は `F32Mat<number, number>` 型で、`value` プロパティに値を格納します。
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
 * // 結果: matrix.value :  [-7, -8, -9, 4, 5, 6]
 * ```
 */
const subtractScaledRow = (
  matrix: F32Mat<number, number>,
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
 * @param matrix F32Mat型の行列
 * @param row スカラー倍する行インデックス
 * @param scalar スカラー値
 */
const scaleRow = (
  matrix: F32Mat<number, number>,
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
  matrix: F32Mat<T, T>,
): F32Mat<T, T> => {
  const size = matrix.colCount;
  if (matrix.rowCount !== size) {
    throw new Error("Matrix must be square");
  }

  const m = cloneMatrix(matrix);
  const inv = generateIdentity(size);

  for (let pivot = 0; pivot < size; pivot++) {
    let pivotValue = getAt(m, pivot, pivot);

    // 最大の絶対値を持つ行を探す
    let maxRow = pivot;
    let maxAbs = Math.abs(getAt(m, pivot, pivot));
    for (let i = pivot + 1; i < size; i++) {
      const val = Math.abs(getAt(m, i, pivot));
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

    pivotValue = getAt(m, pivot, pivot);

    scaleRow(m, pivot, 1 / pivotValue);
    scaleRow(inv, pivot, 1 / pivotValue);

    for (let row = 0; row < size; row++) {
      if (row === pivot) continue;
      const factor = getAt(m, row, pivot);
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
export const determinant = <T extends number>(matrix: F32Mat<T, T>): number => {
  if (matrix.rowCount !== matrix.colCount) {
    throw new Error("Matrix must be square to compute determinant");
  }

  const size = matrix.rowCount;
  const m = cloneMatrix(matrix);
  let det = 1.0;

  for (let pivot = 0; pivot < size; pivot++) {
    let pivotValue = getAt(m, pivot, pivot);

    // ピボットが (ほぼ) 0 の場合、行をスワップ
    // 無限ループする可能性がある?
    if (Math.abs(pivotValue) < 1e-5) {
      let maxRow = pivot;
      let maxAbs = Math.abs(getAt(m, pivot, pivot));
      for (let i = pivot + 1; i < size; i++) {
        const val = Math.abs(getAt(m, i, pivot));
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
      pivotValue = getAt(m, pivot, pivot);
    }

    det *= pivotValue;
    scaleRow(m, pivot, 1 / pivotValue);

    for (let row = pivot + 1; row < size; row++) {
      const factor = getAt(m, row, pivot);
      if (Math.abs(factor) < 1e-8) continue;
      subtractScaledRow(m, row, pivot, factor);
    }
  }

  return det;
};

/**
行列をコンソール上で確認しやすいテキストに整形する
*/
export const toString = (matrix: F32Mat<unknown, unknown>): string => {
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

const toPrimitive = (hint: string): string | null => {
  if (hint === "string") {
    return "[object F32Mat]";
  }
  return null;
};
