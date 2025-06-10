import { describe, expect, it } from "vitest";
import {
  fromRowMajor,
  valueAt,
  add,
  subtract,
  multiplyScalar,
  getClone,
  getIdentity,
  toRowMajorArray,
  toRowMajor2dArray,
} from "@/matrix";
import { ValidationError } from "@/errors";

describe("Matrix basics", () => {
  it("Matrix.value", () => {
    const a = fromRowMajor([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    expect(a.value).toEqual(new Float64Array([1, 3, 5, 2, 4, 6]));
  });

  it("Matrix.valueAt", () => {
    const a = fromRowMajor([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);
    expect(valueAt(a, 0, 1)).toEqual(4);
    expect(valueAt(a, 1, 2)).toEqual(8);
  });
});

describe("Matrix.add", () => {
  it("adds two 2x2 matrices correctly", () => {
    const a = fromRowMajor([
      [1, 3],
      [2, 4],
    ]);
    const b = fromRowMajor([
      [5, 7],
      [6, 8],
    ]);
    const result = add(a, b);
    expect(result.value).toEqual(new Float64Array([6, 8, 10, 12]));
  });

  it("throws error when sizes do not match", () => {
    const a = fromRowMajor([
      [1, 3],
      [2, 4],
    ]);
    const b = fromRowMajor([[1], [2], [3]]);
    expect(() => add(a, b)).toThrow("Matrix size mismatch");
  });
});

describe("Matrix.subtract", () => {
  it("subtracts two 2x2 matrices correctly", () => {
    const a = fromRowMajor([
      [10, 10],
      [10, 10],
    ]);
    const b = fromRowMajor([
      [5, 7],
      [6, 8],
    ]);
    const result = subtract(a, b);
    expect(result.value).toEqual(new Float64Array([5, 4, 3, 2]));
  });

  it("throws error when sizes do not match", () => {
    const a = fromRowMajor([
      [1, 3],
      [2, 4],
    ]);
    const b = fromRowMajor([[1, 2, 3]]);
    expect(() => subtract(a, b)).toThrow("Matrix size mismatch");
  });
});

describe("Matrix.multiplyScalar", () => {
  it("multiplies a 2x2 matrix by a scalar correctly", () => {
    const a = fromRowMajor([
      [1, 3],
      [2, 4],
    ]);
    const result = multiplyScalar(a, 2);
    expect(result.value).toEqual(new Float64Array([2, 4, 6, 8]));
  });

  it("multiplies a 3x3 matrix by a scalar correctly", () => {
    const a = fromRowMajor([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);
    const result = multiplyScalar(a, 3);
    expect(result.value).toEqual(
      new Float64Array([3, 6, 9, 12, 15, 18, 21, 24, 27]),
    );
  });
});

describe("Matrix.getClone", () => {
  it("creates a deep clone of a 2x2 matrix", () => {
    const a = fromRowMajor([
      [1, 3],
      [2, 4],
    ]);
    const clone = getClone(a);
    expect(clone.value).toEqual(new Float64Array(a.value));
    expect(clone).not.toBe(a);
  });

  it("modifying the clone does not affect the original matrix", () => {
    const a = fromRowMajor([
      [1, 3],
      [2, 4],
    ]);
    const clone = getClone(a);
    const modifiedClone = multiplyScalar(clone, 2);
    expect(modifiedClone.value).toEqual(new Float64Array([2, 4, 6, 8]));
    expect(a.value).toEqual(new Float64Array([1, 2, 3, 4]));
  });
});

describe("Matrix.getIdentity", () => {
  it("generates a 2x2 identity matrix", () => {
    const identity = getIdentity(2);
    expect(identity.value).toEqual(new Float64Array([1, 0, 0, 1]));
    expect(identity.rowCount).toBe(2);
    expect(identity.colCount).toBe(2);
  });

  it("generates a 3x3 identity matrix", () => {
    const identity = getIdentity(3);
    expect(identity.value).toEqual(
      new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]),
    );
    expect(identity.rowCount).toBe(3);
    expect(identity.colCount).toBe(3);
  });

  it("generates a 4x4 identity matrix", () => {
    const identity = getIdentity(4);
    expect(identity.value).toEqual(
      new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    );
    expect(identity.rowCount).toBe(4);
    expect(identity.colCount).toBe(4);
  });

  it("throws an error for size 0", () => {
    expect(() => getIdentity(0)).toThrow("Matrix size must be greater than 0");
  });

  it("throws an error for negative sizes", () => {
    expect(() => getIdentity(-3)).toThrow("Matrix size must be greater than 0");
  });
});

describe("Matrix.fromRowMajor", () => {
  it("creates a 2x2 matrix from row-major order", () => {
    const rowMajor = [
      [1, 2],
      [3, 4],
    ];
    const matrix = fromRowMajor(rowMajor);
    expect(matrix.value).toEqual(new Float64Array([1, 3, 2, 4]));
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
    expect(matrix.value).toEqual(new Float64Array([1, 4, 7, 2, 5, 8, 3, 6, 9]));
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
      ValidationError
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
    const matrix = fromRowMajor([[]]);
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

  it("converts a 10x10 matrix to a row-major 2D array", () => {
    const matArray = [
      [
        0.70640616, 0.7339726, 0.36269696, 0.34364623, 0.89963481, 0.86850131,
        0.90467502, 0.84679504, 0.54817229, 0.13033882,
      ],
      [
        0.05486486, 0.07846652, 0.70578895, 0.35216711, 0.45108579, 0.63057693,
        0.28069226, 0.13632188, 0.73916536, 0.36824746,
      ],
      [
        0.13518727, 0.56746105, 0.73043147, 0.43646281, 0.32431077, 0.36597079,
        0.30425198, 0.82382021, 0.91532301, 0.32402725,
      ],
      [
        0.32837472, 0.16448795, 0.55250559, 0.86610502, 0.22159714, 0.89891942,
        0.60524733, 0.74696032, 0.01638889, 0.19332843,
      ],
      [
        0.38494904, 0.66652752, 0.53951242, 0.88482437, 0.18321965, 0.64679071,
        0.79755901, 0.75011928, 0.73083457, 0.8140642,
      ],
      [
        0.38194215, 0.16528207, 0.97190985, 0.22967736, 0.85807417, 0.12769117,
        0.39827418, 0.24501386, 0.85788431, 0.98014298,
      ],
      [
        0.41820807, 0.92749652, 0.17780964, 0.67148928, 0.74228637, 0.80855719,
        0.85585776, 0.57206011, 0.02150445, 0.10509701,
      ],
      [
        0.6350479, 0.07015936, 0.92574801, 0.83325694, 0.16731906, 0.21767483,
        0.72644383, 0.13238352, 0.01286205, 0.75224096,
      ],
      [
        0.63377093, 0.26816623, 0.90709677, 0.39087131, 0.98153103, 0.04930922,
        0.91566366, 0.45013529, 0.84427394, 0.92171579,
      ],
      [
        0.13034207, 0.87822205, 0.78485988, 0.53023558, 0.11634474, 0.5964392,
        0.04112328, 0.86115527, 0.70085139, 0.47221581,
      ],
    ];

    const matrix = fromRowMajor(matArray);
    const rowMajor2dArray = toRowMajor2dArray(matrix);
    rowMajor2dArray.forEach((row, i) => {
      row.forEach((value, j) => {
        expect(value).toBeCloseTo(matArray[i][j], 1e-6);
      });
    });
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
    const matrix = fromRowMajor([[]]);
    const rowMajor2dArray = toRowMajor2dArray(matrix);
    expect(rowMajor2dArray).toEqual([[]]);
  });
});
