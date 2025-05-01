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
  [Symbol.toPrimitive]: typeof toString;
};

const is2dNumberArray = (value: unknown): value is number[][] => {
  if (!Array.isArray(value) || value.length <= 0) {
    return false;
  }
  return value.every(row => Array.isArray(row) && row.every(cell => typeof cell === "number"));
};

/**
 * 引数が`f32Matrix`型を満たしており、論理的に構造が破綻していないか確かめる
 * @summary 実用的には、この関数を利用せずとも`type`の値が`"f32Matrix"`であれば`f32Matrix`としてよい
 */
export const isDynamicMatrix = (value: unknown): value is F32Mat<number, number> => {
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
 * サイズ可変な行列を得る
 * @param columnMajor 列の配列として表現された行列の内容
 */
export const createDynamicMatrix = (columnMajor: ReadonlyArray<ReadonlyArray<number>>): F32Mat<number, number> => {
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
 * 空の`f32Matrix`を返す\
 * このファイル内でのみ使用
 * @example
 * // 空のf32Matrixに必要な変更を加えて返す
 * return { ...getEmpty(), rowCount: 2, colCount: 2 };
 */
const getEmpty = (): F32Mat<number, number> => {
  return {
    type: TYPE_NAME,
    value: new Float32Array(),
    rowCount: 0,
    colCount: 0,
    [Symbol.toPrimitive]: toString,
  } as F32Mat<number, number>;
};

export const getAt = (matrix: F32Mat<number, number>, columnIndex: number, rowIndex: number): number => {
  if (columnIndex < 0 || columnIndex >= matrix.colCount) {
    throw new RangeError(`columnIndex ${columnIndex} is out of bounds`);
  }
  if (rowIndex < 0 || rowIndex >= matrix.rowCount) {
    throw new RangeError(`rowIndex ${rowIndex} is out of bounds`);
  }
  return matrix.value[columnIndex * matrix.rowCount + rowIndex];
};

export const addMatrix = (a: F32Mat<number, number>, b: F32Mat<number, number>): F32Mat<number, number> => {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v + b.value[i]);
  return { ...a, value };
};

export const subtractMatrix = (a: F32Mat<number, number>, b: F32Mat<number, number>): F32Mat<number, number> => {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v - b.value[i]);
  return { ...a, value };
};

export const multiplyScalar = (matrix: F32Mat<number, number>, scalar: number): F32Mat<number, number> => {
  const value = matrix.value.map(v => v * scalar);
  return { ...matrix, value };
};

export const multiplyMatrix = <M extends number, N extends number, P extends number>(a: F32Mat<M, N>, b: F32Mat<N, P>): F32Mat<M, P> => {
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

  return { ...getEmpty(), value, rowCount: a.rowCount, colCount: b.colCount };
};

/**
 * 行列のディープコピーを返す
 * @param matrix コピーを手に入れたい行列
 * @returns deep copyされた行列
 */
export const cloneMatrix = <T, V>(matrix: F32Mat<T, V>): F32Mat<T, V> => {
  return { ...matrix, value: Float32Array.from(matrix.value) };
};

export const equalsMatrix = (a: F32Mat<number, number>, b: F32Mat<number, number>): boolean => {
  if (a.rowCount !== b.rowCount || a.colCount !== b.colCount) {
    return false;
  }
  return a.value.every((v, i) => v === b.value[i]);
};

export const sameSize = (a: F32Mat<number, number>, b: F32Mat<number, number>): boolean => {
  return a.rowCount === b.rowCount && a.colCount === b.colCount;
};

const assertSameSize = (a: F32Mat<number, number>, b: F32Mat<number, number>): void => {
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

  for (let col = 0; col < size; col++) {
    for (let row = 0; row < size; row++) {
      if (col === row) {
        result[col * size + row] = 1;
      } else {
        result[col * size + row] = 0;
      }
    }
  }

  return {
    ...getEmpty(),
    type: TYPE_NAME,
    rowCount: size,
    colCount: size,
    value: result,
  } as F32Mat<T, T>;
};

// TODO: inverse() — 逆行列（2x2, 3x3などサイズ固定なら可）

// TODO: determinant() — 行列式の計算（サイズ限定で）

/**
デバッグ用
*/
const toString = (matrix: F32Mat<unknown, unknown>): string => {
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
