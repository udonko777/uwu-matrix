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
};

const is2dNumberArray = (value: unknown): value is number[][] => {
  if (!Array.isArray(value) || value.length <= 0) {
    return false;
  }
  return value.every(row => Array.isArray(row) && row.every(cell => typeof cell === "number"));
};

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

export const createDynamicMatrix = (columnMajor: ReadonlyArray<ReadonlyArray<number>>): DynamicMatrix => {
  if (!is2dNumberArray(columnMajor)) {
    throw new Error("Matrix must be a 2D array");
  }
  if (!columnMajor.every(col => col.length === columnMajor[0].length)) {
    throw new Error("All columns must have the same number of rows");
  }
  const type = TYPE_NAME;
  const rowCount = columnMajor[0].length;
  const colCount = columnMajor.length;
  const value = columnMajor.flat();
  return { type, value, rowCount, colCount };
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

  const type = TYPE_NAME;
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

  return { type, value, rowCount: a.rowCount, colCount: b.colCount };
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
   * TODO 単位行列の生成

  public static identity(size: number) {
    const result: number[] = new Array(Math.pow(size, 2)).fill(0);

  for (let col = 0; col < size; col++) {
    for (let row = 0; row < size; row++) {
      if (col === row) {
        result[col * size + row] = 1;
      } else {
        result[col * size + row] = 0;
      }
    }
  }

    return result;
  } */

// TODO: static fromRowMajor(rowMajor: number[][]) — 行優先形式からの生成

// TODO: inverse() — 逆行列（2x2, 3x3などサイズ固定なら可）

// TODO: determinant() — 行列式の計算（サイズ限定で）

// TODO: toString() — 表形式で行列を文字列に変換（デバッグ用）
