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
    received: ArrayLike<number>,
    expected: ArrayLike<number>,
    epsilon = 1e-6,
  ): ExpectationResult {
    const pass = areMatricesClose(received, expected, epsilon);
    const { isNot, utils } = this;

    return {
      pass,
      message: () => {
        const receivedStr = utils.printReceived(Array.from(received));
        const expectedStr = utils.printExpected(Array.from(expected));
        return pass
          ? isNot
            ? `Expected matrices not to be close (epsilon=${epsilon}), but they were.`
            : `Matrices are close (epsilon=${epsilon}).`
          : `Expected matrices to be close (epsilon=${epsilon}), but they are not.\n\nExpected:\n${expectedStr}\n\nReceived:\n${receivedStr}`;
      },
      actual: Array.from(received),
      expected: Array.from(expected),
    };
  },
});
