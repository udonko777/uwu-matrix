import { describe, expect, it } from "vitest";
import { DynamicMatrix } from "../src/matrix";

describe("Matrix basics", () => {
  it("Matrix as a flat Array", () => {
    const a = new DynamicMatrix([
      [1, 3, 5],
      [2, 4, 6],
    ]);
    expect(a.getValue()).toEqual([1, 3, 5, 2, 4, 6]);
  });

  it("Matrix.getAt", () => {
    const a = new DynamicMatrix([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    expect(a.getAt(1, 0)).toEqual(4);
    expect(a.getAt(2, 1)).toEqual(8);
  });
});

describe("Matrix.add", () => {
  it("adds two 2x2 matrices correctly", () => {
    const a = new DynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const b = new DynamicMatrix([
      [5, 6],
      [7, 8],
    ]);
    a.add(b);
    expect(a.getValue()).toEqual([6, 8, 10, 12]); // column-major
  });

  it("throws error when sizes do not match", () => {
    const a = new DynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const b = new DynamicMatrix([[1, 2, 3]]);
    expect(() => a.add(b)).toThrow("Matrix size mismatch");
  });
});

describe("Matrix.subTract", () => {
  it("subtracts two 2x2 matrices correctly", () => {
    const a = new DynamicMatrix([
      [10, 10],
      [10, 10],
    ]);
    const b = new DynamicMatrix([
      [5, 6],
      [7, 8],
    ]);
    a.subTract(b);
    expect(a.getValue()).toEqual([5, 4, 3, 2]);
  });

  it("throws error when sizes do not match", () => {
    const a = new DynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const b = new DynamicMatrix([[1, 2, 3]]);
    expect(() => a.subTract(b)).toThrow("Matrix size mismatch");
  });
});

describe("Matrix.multiplyScalar", () => {
  it("multiplies a 2x2 matrix by a scalar correctly", () => {
    const a = new DynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    a.multiplyScalar(2);
    expect(a.getValue()).toEqual([2, 4, 6, 8]); // column-major
  });

  it("multiplies a 3x3 matrix by a scalar correctly", () => {
    const a = new DynamicMatrix([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    a.multiplyScalar(3);
    expect(a.getValue()).toEqual([3, 6, 9, 12, 15, 18, 21, 24, 27]); // column-major
  });
});

describe("Matrix.multiplyMatrix", () => {
  it("multiplies two 2x2 matrices correctly", () => {
    const a = new DynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const b = new DynamicMatrix([
      [5, 6],
      [7, 8],
    ]);
    const result = new DynamicMatrix([
      [23, 34],
      [31, 46],
    ]);
    a.multiplyMatrix(b);
    expect(a.getValue()).toEqual(result.getValue());
  });

  it("throws error when sizes do not match", () => {
    const a = new DynamicMatrix([
      [1, 2, 4],
      [3, 4, 4],
      [1, 1, 1],
    ]);
    const b = new DynamicMatrix([
      [1, 2],
      [4, 5],
    ]);
    expect(() => a.multiplyMatrix(b)).toThrow("Matrix size mismatch: cannot multiply matrices with incompatible sizes");
  });

  it("multiplies two 3x3 matrices correctly", () => {
    const a = new DynamicMatrix([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    const b = new DynamicMatrix([
      [9, 8, 7],
      [6, 5, 4],
      [3, 2, 1],
    ]);
    const result = new DynamicMatrix([
      [90, 114, 138],
      [54, 69, 84],
      [18, 24, 30],
    ]);
    a.multiplyMatrix(b);
    expect(a.getValue()).toEqual(result.getValue());
  });

  it("multiplies a 3x2 matrix with a 2x3 matrix correctly", () => {
    const a = new DynamicMatrix([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    const b = new DynamicMatrix([
      [7, 8],
      [9, 10],
      [11, 12],
    ]);
    const result = new DynamicMatrix([
      [39, 54, 69],
      [49, 68, 87],
      [59, 82, 105],
    ]);
    a.multiplyMatrix(b);
    expect(a.getValue()).toEqual(result.getValue());
  });

  it("multiplies a 1x4 matrix with a 4x1 matrix correctly", () => {
    const a = new DynamicMatrix([[1], [2], [3], [4]]);
    const b = new DynamicMatrix([[5, 7, 2, 1]]);
    const result = new DynamicMatrix([[29]]);
    a.multiplyMatrix(b);
    expect(a.getValue()).toEqual(result.getValue());
  });

  it("throws error when multiplying incompatible matrices", () => {
    const a = new DynamicMatrix([
      [1, 2],
      [3, 4],
    ]);
    const b = new DynamicMatrix([[1, 2, 3]]);
    expect(() => a.multiplyMatrix(b)).toThrow("Matrix size mismatch: cannot multiply matrices with incompatible sizes");
  });

  describe("Matrix.generateClone", () => {
    it("creates a deep clone of a 2x2 matrix", () => {
      const a = new DynamicMatrix([
        [1, 2],
        [3, 4],
      ]);
      const clone = a.generateClone();
      expect(clone.getValue()).toEqual(a.getValue());
      expect(clone).not.toBe(a);
    });

    it("creates a deep clone of a 3x3 matrix", () => {
      const a = new DynamicMatrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
      const clone = a.generateClone();
      expect(clone.getValue()).toEqual(a.getValue());
      expect(clone).not.toBe(a);
    });

    it("modifying the clone does not affect the original matrix", () => {
      const a = new DynamicMatrix([
        [1, 2],
        [3, 4],
      ]);
      const clone = a.generateClone();
      clone.multiplyScalar(2);
      expect(clone.getValue()).toEqual([2, 4, 6, 8]);
      expect(a.getValue()).toEqual([1, 2, 3, 4]);
    });
  });
});
