import { describe, expect, it } from "vitest";
import {
  fromRowMajor,
  add,
  multiplyScalar,
  getIdentity,
  translationMatrix,
  rotateZMatrix,
  getPerspectiveMatrix,
  toRowMajorArray,
} from "@/mat4";

describe("mat4: 4x4 Matrix Tests", () => {
  it("creates a 4x4 matrix from row-major order", () => {
    const rowMajor = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
    ];
    const matrix = fromRowMajor(rowMajor);
    expect(matrix.value).toEqual(
      new Float64Array([1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]),
    );
  });

  it("throws an error if the input is not 4x4", () => {
    expect(() =>
      fromRowMajor([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]),
    ).toThrow("Input must be a 4x4 matrix");
  });

  it("adds two 4x4 matrices correctly", () => {
    const a = fromRowMajor([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
    ]);
    const b = fromRowMajor([
      [16, 15, 14, 13],
      [12, 11, 10, 9],
      [8, 7, 6, 5],
      [4, 3, 2, 1],
    ]);
    const result = add(a, b);
    expect(result.value).toEqual(
      new Float64Array([
        17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17,
      ]),
    );
  });

  it("multiplies a 4x4 matrix by a scalar", () => {
    const matrix = fromRowMajor([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
    ]);
    const result = multiplyScalar(matrix, 2);
    expect(toRowMajorArray(result)).toEqual([
      2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32,
    ]);
  });

  it("generates a 4x4 identity matrix", () => {
    const identity = getIdentity();
    expect(identity.value).toEqual(
      new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    );
  });

  it("creates a translation matrix", () => {
    const translation = translationMatrix(1, 2, 3);
    expect(translation.value).toEqual(
      new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]),
    );
  });

  it("creates a Z-axis rotation matrix", () => {
    const rotation = rotateZMatrix(Math.PI / 2);
    expect(rotation.value).toBeCloseMatrix(
      new Float64Array([0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    1e-16
    );
  });

  it("creates a perspective projection matrix", () => {
    const perspective = getPerspectiveMatrix(Math.PI / 4, 1, 0.1, 100);
    expect(perspective.value).toBeDefined();
  });
});
