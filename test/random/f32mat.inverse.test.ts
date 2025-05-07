import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  fromRowMajor,
  generateIdentity,
  inverse,
  multiplyMatrix,
  determinant,
  toRowMajor2dArray,
} from "../../src/matrix";

/** @see https://fast-check.dev/docs/core-blocks/arbitraries/primitives/number/ */

const intRegularMatrix = fc.integer({ min: 2, max: 5 }).chain(size =>
  fc
    .tuple(
      fc.array(
        fc.array(fc.integer({ max: 2000, min: -3000 }), {
          minLength: size,
          maxLength: size,
        }),
        {
          minLength: size,
          maxLength: size,
        },
      ),
      fc.array(
        fc.array(fc.integer({ max: 2000, min: -3000 }), {
          minLength: size,
          maxLength: size,
        }),
        {
          minLength: size,
          maxLength: size,
        },
      ),
    )
    .map(([a, b]) => {
      const m1 = fromRowMajor(a);
      const m2 = fromRowMajor(b);
      const product = multiplyMatrix(m1, m2);
      return { size, rows: toRowMajor2dArray(product) };
    }),
);

const f32regularMatrix = fc.integer({ min: 2, max: 5 }).chain(size =>
  fc
    .tuple(
      fc.array(
        fc.array(
          fc.float({ min: -10, max: 10, noNaN: true, noDefaultInfinity: true }),
          { minLength: size, maxLength: size },
        ),
        { minLength: size, maxLength: size },
      ),
      fc.array(
        fc.array(
          fc.float({ min: -10, max: 10, noNaN: true, noDefaultInfinity: true }),
          { minLength: size, maxLength: size },
        ),
        { minLength: size, maxLength: size },
      ),
    )
    .map(([a, b]) => {
      const m1 = fromRowMajor(a);
      const m2 = fromRowMajor(b);
      const product = multiplyMatrix(m1, m2);
      return { size, rows: toRowMajor2dArray(product) };
    }),
);

describe("Matrix.inverse (randomized tests)", () => {
  it("整数で構成されたランダムなサイズの正則行列の逆行列を求める", () => {
    fc.assert(
      fc.property(intRegularMatrix, ({ size, rows }) => {
        const matrix = fromRowMajor(rows);

        if (Math.abs(determinant(matrix)) < 1e-6) {
          fc.pre(false);
        }

        const inv = inverse(matrix);
        const identity = multiplyMatrix(matrix, inv);
        const expected = generateIdentity(size).value;

        console.log("Original Matrix:", matrix.value);
        console.log("Inverse Matrix:", inv.value);
        console.log("Resulting Identity:", identity.value);
        console.log("Expected Identity:", expected);

        expect(identity.value).toBeCloseMatrix(expected, 1e-3);
      }),
    );
  });
  it("float32で生成されたランダムなサイズの生息行列の逆行列を求める", () => {
    fc.assert(
      fc.property(f32regularMatrix, ({ size, rows }) => {
        const matrix = fromRowMajor(rows);

        if (Math.abs(determinant(matrix)) < 1e-4) {
          fc.pre(false);
        }

        const inv = inverse(matrix);
        const identity = multiplyMatrix(matrix, inv);
        const expected = generateIdentity(size).value;

        expect(identity.value).toBeCloseMatrix(expected, 1e-3);
      }),
    );
  });
});
