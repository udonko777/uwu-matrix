import { expect } from "vitest";

interface ExpectationResult {
  pass: boolean;
  message: () => string;
  actual?: unknown;
  expected?: unknown;
}

const areMatricesClose = (
  a: ArrayLike<number>,
  b: ArrayLike<number>,
  epsilon = 1e-6,
): boolean => {
  if (a.length !== b.length) return false;
  return Array.from(a).every((val, i) => Math.abs(val - b[i]) <= epsilon);
};

expect.extend({
  toBeCloseMatrix(
    received: Float32Array,
    expected: Float32Array,
    epsilon = 1e-6,
  ): ExpectationResult {
    const pass = areMatricesClose(received, expected, epsilon);
    const { isNot } = this;
    return {
      pass,
      message: () =>
        pass
          ? isNot
            ? `Expected matrices to not be close, but they are (epsilon=${epsilon}).`
            : `Expected matrices to be close, and they are (epsilon=${epsilon}).`
          : isNot
            ? `Expected matrices to not be close, and they are not (epsilon=${epsilon}).`
            : `Expected matrices to be close, but they are not (epsilon=${epsilon}).\n\n`,
      actual: received,
      expected,
    };
  },
});
