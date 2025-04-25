export const sum = (a: number, b: number) => a + b;

interface Matrix<T> {
  add: (other: T) => Matrix<T>;
}

export class Mat3 implements Matrix<Mat3> {
  value: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];

  constructor(value: typeof Mat3.prototype.value) {
    if (value.length !== 9) {
      throw new Error("Mat3 must be initialized with 9 values");
    }
    this.value = value;
  }

  add(other: Mat3): Mat3 {
    return new Mat3([
      this.value[0] + other.value[0],
      this.value[1] + other.value[1],
      this.value[2] + other.value[2],
      this.value[3] + other.value[3],
      this.value[4] + other.value[4],
      this.value[5] + other.value[5],
      this.value[6] + other.value[6],
      this.value[7] + other.value[7],
      this.value[8] + other.value[8],
    ]);
  }
}
