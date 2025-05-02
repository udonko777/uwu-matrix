/* eslint-disable */
import "vitest";

interface CustomMatchers<T = unknown> {
  toBeCloseMatrix(expected: Float32Array, epsilon?: number): T;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
