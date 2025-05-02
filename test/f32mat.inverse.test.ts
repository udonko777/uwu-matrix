import { describe, expect, it } from "vitest";
import { fromRowMajor, generateIdentity, inverse, multiplyMatrix } from "../src/matrix";
import { areMatricesClose } from "./util";

describe("Matrix.inverse", () => {
  it("calculates the inverse of a 2x2 matrix", () => {
    const matrix = fromRowMajor([
      [4, 7],
      [2, 6],
    ]);
    const expectedInverse = fromRowMajor([
      [0.6, -0.7],
      [-0.2, 0.4],
    ]);
    const result = inverse(matrix);

    expect(result.value).toEqual(expectedInverse.value);
  });

  it("calculates the inverse of a 3x3 matrix", () => {
    const matrix = fromRowMajor([
      [3, 0, 2],
      [2, 0, -2],
      [0, 1, 1],
    ]);
    const expectedInverse = fromRowMajor([
      [0.2, 0.2, 0],
      [-0.2, 0.3, 1],
      [0.2, -0.3, 0],
    ]);
    const result = inverse(matrix);

    expect(areMatricesClose(result.value, expectedInverse.value)).toBe(true);
  });

  it("returns the identity matrix when the inverse is multiplied by the original matrix", () => {
    const matrix = fromRowMajor([
      [4, 7],
      [2, 6],
    ]);
    const identity = generateIdentity(2);
    const result = multiplyMatrix(matrix, inverse(matrix));

    expect(areMatricesClose(result.value, identity.value)).toBe(true);
  });

  it("throws an error for non-square matrices", () => {
    const nonSquareMatrix = fromRowMajor([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    expect(() => inverse(nonSquareMatrix)).toThrow("Matrix size mismatch");
  });

  it("throws an error for singular matrices", () => {
    const singularMatrix = fromRowMajor([
      [1, 2],
      [2, 4],
    ]);

    expect(() => inverse(singularMatrix)).toThrow(`Matrix is singular: ${singularMatrix}`);
  });
});
