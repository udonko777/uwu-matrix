const TYPE_NAME = "DynamicMatrix";

/**
 * サイズが可変である実数の行列\
 * webGLの使用に合わせ、列優先でデータを持つ
 */
export type DynamicMatrix = {
  type: typeof TYPE_NAME;
  /** column-major order */
  value: number[] | Float32Array;
  /** 行の量 */
  rowCount: number;
  /** 列の量 */
  colCount: number;
  [Symbol.toPrimitive]: typeof toString;
};

const is2dNumberArray = (value: unknown): value is number[][] => {
  if (!Array.isArray(value) || value.length <= 0) {
    return false;
  }
  return value.every(row => Array.isArray(row) && row.every(cell => typeof cell === "number"));
};

/**
 * 引数がDynamicMatrixの型を満たしており、論理的に構造が破綻していないか確かめる
 * @summary 実用的には、この関数を利用せずとも`type`の値が`"DynamicMatrix"`であれば`DynamicMatrix`としてよい
 */
export const isDynamicMatrix = (value: unknown): value is DynamicMatrix => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const matrix = value as Partial<DynamicMatrix>;
  return (
    matrix.type === TYPE_NAME &&
    (Array.isArray(matrix.value) || matrix.value instanceof Float32Array) &&
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
export const createDynamicMatrix = (columnMajor: ReadonlyArray<ReadonlyArray<number>>): DynamicMatrix => {
  if (!is2dNumberArray(columnMajor)) {
    throw new Error("Matrix must be a 2D array");
  }
  if (!columnMajor.every(col => col.length === columnMajor[0].length)) {
    throw new Error("All columns must have the same number of rows");
  }
  const rowCount = columnMajor[0].length;
  const colCount = columnMajor.length;
  const value = columnMajor.flat();
  return { ...getEmpty(), value, rowCount, colCount };
};

/**
 * 空のDynamicMatrixを返す\
 * このファイル内でのみ使用
 * @example
 * // ファイル内部で
 * return { ...getEmpty(), rowCount: 2, colCount: 2 };
 */
const getEmpty = (): DynamicMatrix => {
  return {
    type: TYPE_NAME,
    value: [],
    rowCount: 0,
    colCount: 0,
    [Symbol.toPrimitive]: toString,
  } as DynamicMatrix;
};

export const getAt = (matrix: DynamicMatrix, columnIndex: number, rowIndex: number): number => {
  if (columnIndex < 0 || columnIndex >= matrix.colCount) {
    throw new RangeError(`columnIndex ${columnIndex} is out of bounds`);
  }
  if (rowIndex < 0 || rowIndex >= matrix.rowCount) {
    throw new RangeError(`rowIndex ${rowIndex} is out of bounds`);
  }
  return matrix.value[columnIndex * matrix.rowCount + rowIndex];
};

export const addMatrix = (a: DynamicMatrix, b: DynamicMatrix): DynamicMatrix => {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v + b.value[i]);
  return { ...a, value };
};

export const subtractMatrix = (a: DynamicMatrix, b: DynamicMatrix): DynamicMatrix => {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v - b.value[i]);
  return { ...a, value };
};

export const multiplyScalar = (matrix: DynamicMatrix, scalar: number): DynamicMatrix => {
  const value = matrix.value.map(v => v * scalar);
  return { ...matrix, value };
};

export const multiplyMatrix = (a: DynamicMatrix, b: DynamicMatrix): DynamicMatrix => {
  if (a.colCount !== b.rowCount) {
    throw new Error("Matrix size mismatch");
  }

  const value: number[] = new Array(a.rowCount * b.colCount).fill(0);

  for (let row = 0; row < a.rowCount; row++) {
    for (let col = 0; col < b.colCount; col++) {
      let sum = 0;
      for (let k = 0; k < a.colCount; k++) {
        sum += a.value[k * a.rowCount + row] * b.value[col * b.rowCount + k];
      }
      value[col * a.rowCount + row] = sum;
    }
  }

  return { ...getEmpty(), rowCount: a.rowCount, colCount: b.colCount };
};

export const cloneMatrix = (matrix: DynamicMatrix): DynamicMatrix => {
  return { ...matrix, value: [...matrix.value] };
};

export const equalsMatrix = (a: DynamicMatrix, b: DynamicMatrix): boolean => {
  if (a.rowCount !== b.rowCount && a.colCount !== b.colCount) {
    return false;
  }
  return a.value.every((v, i) => v === b.value[i]);
};

export const sameSize = (a: DynamicMatrix, b: DynamicMatrix): boolean => {
  return a.rowCount === b.rowCount && a.colCount === b.colCount;
};

const assertSameSize = (a: DynamicMatrix, b: DynamicMatrix): void => {
  if (!sameSize(a, b)) {
    throw new Error("Matrix size mismatch");
  }
};

/**
  単位行列の生成
*/
export const generateIdentity = (size: number): DynamicMatrix => {
  if (size < 0) {
    throw new Error("Matrix size must be greater than 0");
  }

  const result: number[] = new Array(size * size).fill(0);

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
  };
};

// TODO: static fromRowMajor(rowMajor: number[][]) — 行優先形式からの生成

// TODO: inverse() — 逆行列（2x2, 3x3などサイズ固定なら可）

// TODO: determinant() — 行列式の計算（サイズ限定で）

/**
デバッグ用
*/
const toString = (matrix: DynamicMatrix): string => {
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
