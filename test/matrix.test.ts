import { describe, expect, it } from "vitest";
import {
  fromColumnMajor as createDynamicMatrix,
  fromRowMajor,
  getAt,
  addMatrix,
  subtractMatrix,
  multiplyScalar,
  cloneMatrix,
  generateIdentity,
  toRowMajorArray,
  toRowMajor2dArray,
} from "../src/matrix";

describe("Matrix basics", () => {
  it("Matrix as a flat Array", () => {
    const a = createDynamicMatrix([
      [1, 3, 5],
      [2, 4, 6],
    ]);
    expect(a.value).toEqual(new Float32Array([1, 3, 5, 2, 4, 6]));
  });

  it("Matrix.getAt", () => {
    const a = createDynamicMatrix([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    expect(getAt(a, 0, 1)).toEqual(4);
    expect(getAt(a, 1, 2)).toEqual(8);
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
    expect(result.value).toEqual(new Float32Array([6, 8, 10, 12]));
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
    expect(result.value).toEqual(new Float32Array([5, 4, 3, 2]));
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
    expect(result.value).toEqual(new Float32Array([2, 4, 6, 8]));
  });

  it("multiplies a 3x3 matrix by a scalar correctly", () => {
    const a = createDynamicMatrix([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    const result = multiplyScalar(a, 3);
    expect(result.value).toEqual(
      new Float32Array([3, 6, 9, 12, 15, 18, 21, 24, 27]),
    );
  });
});

describe("Matrix.cloneMatrix", () => {
  it("creates a deep clone of a 2x2 matrix", () => {
    const a = createDynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const clone = cloneMatrix(a);
    expect(clone.value).toEqual(new Float32Array(a.value));
    expect(clone).not.toBe(a);
  });

  it("modifying the clone does not affect the original matrix", () => {
    const a = createDynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const clone = cloneMatrix(a);
    const modifiedClone = multiplyScalar(clone, 2);
    expect(modifiedClone.value).toEqual(new Float32Array([2, 4, 6, 8]));
    expect(a.value).toEqual(new Float32Array([1, 2, 3, 4]));
  });
});

describe("Matrix.generateIdentity", () => {
  it("generates a 2x2 identity matrix", () => {
    const identity = generateIdentity(2);
    expect(identity.value).toEqual(new Float32Array([1, 0, 0, 1]));
    expect(identity.rowCount).toBe(2);
    expect(identity.colCount).toBe(2);
  });

  it("generates a 3x3 identity matrix", () => {
    const identity = generateIdentity(3);
    expect(identity.value).toEqual(
      new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]),
    );
    expect(identity.rowCount).toBe(3);
    expect(identity.colCount).toBe(3);
  });

  it("generates a 4x4 identity matrix", () => {
    const identity = generateIdentity(4);
    expect(identity.value).toEqual(
      new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    );
    expect(identity.rowCount).toBe(4);
    expect(identity.colCount).toBe(4);
  });

  it("throws an error for size 0", () => {
    expect(() => generateIdentity(0)).toThrow(
      "Matrix size must be greater than 0",
    );
  });

  it("throws an error for negative sizes", () => {
    expect(() => generateIdentity(-3)).toThrow(
      "Matrix size must be greater than 0",
    );
  });
});

describe("Matrix.fromRowMajor", () => {
  it("creates a 2x2 matrix from row-major order", () => {
    const rowMajor = [
      [1, 2],
      [3, 4],
    ];
    const matrix = fromRowMajor(rowMajor);
    expect(matrix.value).toEqual(new Float32Array([1, 3, 2, 4]));
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
    expect(matrix.value).toEqual(new Float32Array([1, 4, 7, 2, 5, 8, 3, 6, 9]));
    expect(matrix.rowCount).toBe(3);
    expect(matrix.colCount).toBe(3);
  });

  it("throws an error if rows have inconsistent lengths", () => {
    const rowMajor = [
      [1, 2],
      [3, 4, 5],
    ];
    expect(() => fromRowMajor(rowMajor)).toThrow(
      "All rows must have the same number of columns",
    );
  });

  it("throws an error if input is not a 2D array", () => {
    const invalidInput = [1, 2, 3] as unknown as number[][];
    expect(() => fromRowMajor(invalidInput)).toThrow(
      "Input must be a 2D array",
    );
  });
});

describe("Matrix.toRowMajorArray", () => {
  it("converts a 2x2 matrix to a row-major array", () => {
    const matrix = fromRowMajor([
      [1, 2],
      [3, 4],
    ]);
    const rowMajorArray = toRowMajorArray(matrix);
    expect(rowMajorArray).toEqual([1, 2, 3, 4]);
  });

  it("converts a 3x3 matrix to a row-major array", () => {
    const matrix = fromRowMajor([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    const rowMajorArray = toRowMajorArray(matrix);
    expect(rowMajorArray).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("handles a 1x3 matrix correctly", () => {
    const matrix = fromRowMajor([[1, 2, 3]]);
    const rowMajorArray = toRowMajorArray(matrix);
    expect(rowMajorArray).toEqual([1, 2, 3]);
  });

  it("handles a 3x1 matrix correctly", () => {
    const matrix = fromRowMajor([[1], [2], [3]]);
    const rowMajorArray = toRowMajorArray(matrix);
    expect(rowMajorArray).toEqual([1, 2, 3]);
  });

  it("returns an empty array for an empty matrix", () => {
    const matrix = fromRowMajor([]);
    const rowMajorArray = toRowMajorArray(matrix);
    expect(rowMajorArray).toEqual([]);
  });
});

describe("Matrix.toRowMajor2dArray", () => {
  it("converts a 2x2 matrix to a row-major 2D array", () => {
    const matrix = fromRowMajor([
      [1, 2],
      [3, 4],
    ]);
    const rowMajor2dArray = toRowMajor2dArray(matrix);
    expect(rowMajor2dArray).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("converts a 3x3 matrix to a row-major 2D array", () => {
    const matrix = fromRowMajor([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    const rowMajor2dArray = toRowMajor2dArray(matrix);
    expect(rowMajor2dArray).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });

  it("handles a 1x3 matrix correctly", () => {
    const matrix = fromRowMajor([[1, 2, 3]]);
    const rowMajor2dArray = toRowMajor2dArray(matrix);
    expect(rowMajor2dArray).toEqual([[1, 2, 3]]);
  });

  it("handles a 3x1 matrix correctly", () => {
    const matrix = fromRowMajor([[1], [2], [3]]);
    const rowMajor2dArray = toRowMajor2dArray(matrix);
    expect(rowMajor2dArray).toEqual([[1], [2], [3]]);
  });

  it("returns an empty 2D array for an empty matrix", () => {
    const matrix = fromRowMajor([]);
    const rowMajor2dArray = toRowMajor2dArray(matrix);
    expect(rowMajor2dArray).toEqual([]);
  });
});
