import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  fromRowMajor,
  generateIdentity,
  inverse,
  multiplyMatrix,
} from "../../src/matrix";

const squareMatrixArbitrary = fc.integer({ min: 2, max: 5 }).chain(size =>
  fc
    .array(
      fc.array(fc.float({ min: -100, max: 100 }), {
        minLength: size,
        maxLength: size,
      }),
      { minLength: size, maxLength: size },
    )
    .map(rows => {
      return { size, rows };
    }),
);

describe("Matrix.inverse (randomized tests)", () => {
  it("calculates the inverse of random square matrices", () => {
    fc.assert(
      fc.property(squareMatrixArbitrary, ({ size, rows }) => {
        const matrix = fromRowMajor(rows);

        // 行列式が 0 に近ければスキップ（簡易版）
        if (Math.abs(determinant(matrix)) < 1e-6) {
          fc.pre(false);
          return;
        }

        const inv = inverse(matrix);
        const identity = multiplyMatrix(matrix, inv);

        expect(identity.value).toBeCloseMatrix(
          generateIdentity(size).value,
          1e-4,
        );
      }),
    );
  });
});
