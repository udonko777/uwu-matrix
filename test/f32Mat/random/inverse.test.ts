import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  fromRowMajor,
  getIdentity,
  inverse,
  multiply,
  determinant,
  toRowMajor2dArray,
  subtractScaledRow,
} from "@/f32Mat";

import { EPSILON_F32_ANY as EPSILON } from "../../epsilon";

/** @see https://fast-check.dev/docs/core-blocks/arbitraries/primitives/number/ */

const intRegularMatrix = fc.integer({ min: 2, max: 5 }).chain(size => {
  return fc
    .array(
      fc.tuple(
        fc.constantFrom<"swap" | "scale" | "add">("swap", "scale", "add"),
        fc.integer({ min: 0, max: size - 1 }),
        fc.integer({ min: 0, max: size - 1 }),
        fc.integer({ min: -5, max: 5 }),
      ),
      { minLength: size, maxLength: size * 3 },
    )
    .map(operations => {
      const mat = toRowMajor2dArray(getIdentity(size));
      // 単位行列にランダムな行基本変形を施す
      for (const [op, i, j, k] of operations) {
        if (op === "swap" && i !== j) {
          [mat[i], mat[j]] = [mat[j], mat[i]];
        } else if (op === "scale" && k !== 0) {
          mat[i] = mat[i].map((x: number) => x * k);
        } else if (op === "add" && i !== j && k !== 0) {
          mat[i] = mat[i].map((x: number, idx: number) => x + mat[j][idx] * k);
        }
      }
      return { size, rows: mat };
    });
});

const randomizedRegularMatrix = fc.integer({ min: 2, max: 5 }).map(size => {
  const mat = getIdentity(size);
  // ランダムに行の入れ替え・スカラー倍・行の加算などを行う
  for (let i = 0; i < size; i++) {
    const factor = Math.random() * 10 - 5;
    const j = Math.floor(Math.random() * size);
    if (i !== j) {
      subtractScaledRow(mat, i, j, factor);
    }
  }
  return { size, rows: toRowMajor2dArray(mat) };
});

describe("Matrix.inverse (randomized tests)", () => {

  it("整数で構成されたランダムなサイズの正則行列の逆行列を求める", () => {
    fc.assert(
      fc.property(intRegularMatrix, ({ size, rows }) => {
        const matrix = fromRowMajor(rows);

        if (Math.abs(determinant(matrix)) < EPSILON) {
          fc.pre(false);
        }

        const inv = inverse(matrix);
        const identity = multiply(matrix, inv);
        const expected = getIdentity(size).value;

        expect(identity.value).toBeCloseMatrix(expected, EPSILON);
      }),
    );
  });

  it("float32で生成されたランダムなサイズの正則行列の逆行列を求める", () => {
    fc.assert(
      fc.property(randomizedRegularMatrix, ({ size, rows }) => {
        const matrix = fromRowMajor(rows);

        if (Math.abs(determinant(matrix)) < EPSILON) {
          fc.pre(false);
        }

        const inv = inverse(matrix);
        const identity = multiply(matrix, inv);
        const expected = getIdentity(size).value;

        /*
        console.log("Original Matrix:", matrix.value);
        console.log("Inverse Matrix:", inv.value);
        console.log("Resulting Identity:", identity.value);
        console.log("Expected Identity:", expected);
        */
        expect(identity.value).toBeCloseMatrix(expected, EPSILON);
      }),
    );
  });
});
