import { describe, expect, it } from "vitest";
import { Matrix } from "../src/matrix";

describe("Matrix.add", () => {
  it("adds two 2x2 matrices correctly", () => {
    const a = new Matrix([
      [1, 2],
      [3, 4],
    ]);
    const b = new Matrix([
      [5, 6],
      [7, 8],
    ]);
    a.add(b);
    expect(a.getValue()).toEqual([6, 8, 10, 12]); // column-major
  });

  it("throws error when sizes do not match", () => {
    const a = new Matrix([
      [1, 2],
      [3, 4],
    ]);
    const b = new Matrix([[1, 2, 3]]);
    expect(() => a.add(b)).toThrow("Matrix size mismatch");
  });
});
