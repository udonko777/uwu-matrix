/* eslint-disable */
import "vitest";

interface CustomMatchers<T = unknown> {
  toBeCloseMatrix(expected: ArrayLike<number>, epsilon?: number): T;
}

declare module "vitest" {
  interface Assertion<T = any> {
    toBeCloseMatrix(expected: ArrayLike<number>, epsilon?: number): T;
  }

  interface AsymmetricMatchersContaining {
    toBeCloseMatrix(expected: ArrayLike<number>, epsilon?: number): unknown;
  }
}
