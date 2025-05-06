import { describe, expect, it } from "vitest";
import { determinant, fromRowMajor, generateIdentity } from "../src/matrix";

describe("determinant", () => {
  it("should return 1 for an identity matrix", () => {
    const identityMatrix = generateIdentity(3);
    expect(determinant(identityMatrix)).toBe(1);
  });

  it("should return 0 for a singular matrix", () => {
    const singularMatrix = fromRowMajor([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    expect(determinant(singularMatrix)).toBe(0);
  });

  it("should calculate the determinant of a 2x2 matrix", () => {
    const matrix = fromRowMajor([
      [4, 6],
      [3, 8],
    ]);
    expect(determinant(matrix)).toBe(14);
  });

  it("should calculate the determinant of a 3x3 matrix", () => {
    const matrix = fromRowMajor([
      [6, 1, 1],
      [4, -2, 5],
      [2, 8, 7],
    ]);
    expect(determinant(matrix)).toBeCloseTo(-306, 4);
  });

  it("should handle a 1x1 matrix", () => {
    const matrix = fromRowMajor([[5]]);
    expect(determinant(matrix)).toBe(5);
  });

  it("should throw an error for non-square matrices", () => {
    const nonSquareMatrix = fromRowMajor([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    expect(() => determinant(nonSquareMatrix)).toThrowError(
      "Matrix must be square to compute determinant",
    );
  });
});
