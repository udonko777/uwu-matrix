export type DynamicMatrix = {
  type: "DynamicMatrix";
  value: number[]; // column-major order
  rowCount: number;
  colCount: number;
};

const is2dNumberArray = (value: unknown): value is number[][] => {
  return Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row) && row.every(cell => typeof cell === "number"));
};

const TYPE_NAME = "DynamicMatrix";

export function createDynamicMatrix(columnMajor: ReadonlyArray<ReadonlyArray<number>>): DynamicMatrix {
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
}

export function getAt(matrix: DynamicMatrix, columnIndex: number, rowIndex: number): number {
  if (columnIndex < 0 || columnIndex >= matrix.colCount) {
    throw new RangeError(`columnIndex ${columnIndex} is out of bounds`);
  }
  if (rowIndex < 0 || rowIndex >= matrix.rowCount) {
    throw new RangeError(`rowIndex ${rowIndex} is out of bounds`);
  }
  return matrix.value[columnIndex * matrix.rowCount + rowIndex];
}

export function addMatrix(a: DynamicMatrix, b: DynamicMatrix): DynamicMatrix {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v + b.value[i]);
  return { ...a, value };
}

export function subtractMatrix(a: DynamicMatrix, b: DynamicMatrix): DynamicMatrix {
  assertSameSize(a, b);
  const value = a.value.map((v, i) => v - b.value[i]);
  return { ...a, value };
}

export function multiplyScalar(matrix: DynamicMatrix, scalar: number): DynamicMatrix {
  const value = matrix.value.map(v => v * scalar);
  return { ...matrix, value };
}

export function multiplyMatrix(a: DynamicMatrix, b: DynamicMatrix): DynamicMatrix {
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
}

export function cloneMatrix(matrix: DynamicMatrix): DynamicMatrix {
  return { ...matrix, value: [...matrix.value] };
}

export function equalsMatrix(a: DynamicMatrix, b: DynamicMatrix): boolean {
  if (a.rowCount !== b.rowCount && a.colCount !== b.colCount) {
    return false;
  }
  return a.value.every((v, i) => v === b.value[i]);
}

export function sameSize(a: DynamicMatrix, b: DynamicMatrix): boolean {
  return a.rowCount === b.rowCount && a.colCount === b.colCount;
}

function assertSameSize(a: DynamicMatrix, b: DynamicMatrix): void {
  if (!sameSize(a, b)) {
    throw new Error("Matrix size mismatch");
  }
}

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
