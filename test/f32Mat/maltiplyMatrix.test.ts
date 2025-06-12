import { describe, expect, it } from "vitest";
import { fromRowMajor, multiply } from "@/f32Mat";

describe("multiplyMatrix", () => {
  it("should multiply two 2x2 matrices correctly", () => {
    const a = fromRowMajor([
      [1, 2],
      [3, 4],
    ]);
    const b = fromRowMajor([
      [5, 6],
      [7, 8],
    ]);

    const result = multiply(a, b);

    expect(result.rowCount).toBe(2);
    expect(result.colCount).toBe(2);
    // Column-major order: [19, 43, 22, 50]
    expect(Array.from(result.value)).toEqual([19, 43, 22, 50]);
  });

  it("should multiply a 2x3 matrix with a 3x2 matrix", () => {
    const a = fromRowMajor([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    const b = fromRowMajor([
      [7, 8],
      [9, 10],
      [11, 12],
    ]);

    const result = multiply(a, b);

    expect(result.rowCount).toBe(2);
    expect(result.colCount).toBe(2);
    expect(Array.from(result.value)).toEqual([58, 139, 64, 154]);
  });

  it("should multiply a 3x2 matrix with a 2x3 matrix", () => {
    const a = fromRowMajor([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    const b = fromRowMajor([
      [7, 8, 9],
      [10, 11, 12],
    ]);

    const result = multiply(a, b);

    expect(result.rowCount).toBe(3);
    expect(result.colCount).toBe(3);
    expect(Array.from(result.value)).toEqual([
      27, 61, 95, 30, 68, 106, 33, 75, 117,
    ]);
  });

  it("should throw an error if matrix dimensions are incompatible", () => {
    const a = fromRowMajor([
      [1, 2],
      [3, 4],
    ]);
    const b = fromRowMajor([[5, 6, 7]]);

    expect(() => multiply(a, b)).toThrow("Matrix size mismatch");
  });
});
