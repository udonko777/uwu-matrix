import { describe, expect, it } from "vitest";
import {
  createDynamicMatrix,
  fromRowMajor,
  getAt,
  addMatrix,
  subtractMatrix,
  multiplyScalar,
  multiplyMatrix,
  cloneMatrix,
  generateIdentity,
} from "../src/matrix";

describe("Matrix basics", () => {
  it("Matrix as a flat Array", () => {
    const a = createDynamicMatrix([
      [1, 3, 5],
      [2, 4, 6],
    ]);
    expect(a.value).toEqual([1, 3, 5, 2, 4, 6]);
  });

  it("Matrix.getAt", () => {
    const a = createDynamicMatrix([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    expect(getAt(a, 1, 0)).toEqual(4);
    expect(getAt(a, 2, 1)).toEqual(8);
  });
});

describe("Matrix.add", () => {
  it("adds two 2x2 matrices correctly", () => {
    const a = createDynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const b = createDynamicMatrix([
      [5, 6],
      [7, 8],
    ]);
    const result = addMatrix(a, b);
    expect(result.value).toEqual([6, 8, 10, 12]);
  });

  it("throws error when sizes do not match", () => {
    const a = createDynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const b = createDynamicMatrix([[1, 2, 3]]);
    expect(() => addMatrix(a, b)).toThrow("Matrix size mismatch");
  });
});

describe("Matrix.subtract", () => {
  it("subtracts two 2x2 matrices correctly", () => {
    const a = createDynamicMatrix([
      [10, 10],
      [10, 10],
    ]);
    const b = createDynamicMatrix([
      [5, 6],
      [7, 8],
    ]);
    const result = subtractMatrix(a, b);
    expect(result.value).toEqual([5, 4, 3, 2]);
  });

  it("throws error when sizes do not match", () => {
    const a = createDynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const b = createDynamicMatrix([[1, 2, 3]]);
    expect(() => subtractMatrix(a, b)).toThrow("Matrix size mismatch");
  });
});

describe("Matrix.multiplyScalar", () => {
  it("multiplies a 2x2 matrix by a scalar correctly", () => {
    const a = createDynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const result = multiplyScalar(a, 2);
    expect(result.value).toEqual([2, 4, 6, 8]);
  });

  it("multiplies a 3x3 matrix by a scalar correctly", () => {
    const a = createDynamicMatrix([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    const result = multiplyScalar(a, 3);
    expect(result.value).toEqual([3, 6, 9, 12, 15, 18, 21, 24, 27]);
  });
});

describe("Matrix.multiplyMatrix", () => {
  it("multiplies two 2x2 matrices correctly", () => {
    const a = createDynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const b = createDynamicMatrix([
      [5, 6],
      [7, 8],
    ]);
    const result = multiplyMatrix(a, b);
    expect(result.value).toEqual([23, 34, 31, 46]);
  });

  it("throws error when sizes do not match", () => {
    const a = createDynamicMatrix([
      [1, 2, 4],
      [3, 4, 4],
      [1, 1, 1],
    ]);
    const b = createDynamicMatrix([
      [1, 2],
      [4, 5],
    ]);
    expect(() => multiplyMatrix(a, b)).toThrow("Matrix size mismatch");
  });

  it("multiplies two 3x3 matrices correctly", () => {
    const a = createDynamicMatrix([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    const b = createDynamicMatrix([
      [9, 8, 7],
      [6, 5, 4],
      [3, 2, 1],
    ]);
    const result = multiplyMatrix(a, b);
    expect(result.value).toEqual([90, 114, 138, 54, 69, 84, 18, 24, 30]);
  });
});

describe("Matrix.cloneMatrix", () => {
  it("creates a deep clone of a 2x2 matrix", () => {
    const a = createDynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const clone = cloneMatrix(a);
    expect(clone.value).toEqual(a.value);
    expect(clone).not.toBe(a);
  });

  it("modifying the clone does not affect the original matrix", () => {
    const a = createDynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const clone = cloneMatrix(a);
    const modifiedClone = multiplyScalar(clone, 2);
    expect(modifiedClone.value).toEqual([2, 4, 6, 8]);
    expect(a.value).toEqual([1, 2, 3, 4]);
  });
});

describe("Matrix.generateIdentity", () => {
  it("generates a 2x2 identity matrix", () => {
    const identity = generateIdentity(2);
    expect(identity.value).toEqual([1, 0, 0, 1]);
    expect(identity.rowCount).toBe(2);
    expect(identity.colCount).toBe(2);
  });

  it("generates a 3x3 identity matrix", () => {
    const identity = generateIdentity(3);
    expect(identity.value).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    expect(identity.rowCount).toBe(3);
    expect(identity.colCount).toBe(3);
  });

  it("generates a 4x4 identity matrix", () => {
    const identity = generateIdentity(4);
    expect(identity.value).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(identity.rowCount).toBe(4);
    expect(identity.colCount).toBe(4);
  });

  it("throws an error for size 0", () => {
    expect(() => generateIdentity(0)).toThrow("Matrix size must be greater than 0");
  });

  it("throws an error for negative sizes", () => {
    expect(() => generateIdentity(-3)).toThrow("Matrix size must be greater than 0");
  });
});

describe("Matrix.fromRowMajor", () => {
  it("creates a 2x2 matrix from row-major order", () => {
    const rowMajor = [
      [1, 2],
      [3, 4],
    ];
    const matrix = fromRowMajor(rowMajor);
    expect(matrix.value).toEqual([1, 3, 2, 4]);
    expect(matrix.rowCount).toBe(2);
    expect(matrix.colCount).toBe(2);
  });

  it("creates a 3x3 matrix from row-major order", () => {
    const rowMajor = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const matrix = fromRowMajor(rowMajor);
    expect(matrix.value).toEqual([1, 4, 7, 2, 5, 8, 3, 6, 9]);
    expect(matrix.rowCount).toBe(3);
    expect(matrix.colCount).toBe(3);
  });

  it("throws an error if rows have inconsistent lengths", () => {
    const rowMajor = [
      [1, 2],
      [3, 4, 5],
    ];
    expect(() => fromRowMajor(rowMajor)).toThrow("All rows must have the same number of columns");
  });

  it("throws an error if input is not a 2D array", () => {
    const invalidInput = [1, 2, 3] as unknown as number[][];
    expect(() => fromRowMajor(invalidInput)).toThrow("Input must be a 2D array");
  });
});
