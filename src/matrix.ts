const is2dNumberArray = (value: unknown): value is number[][] => {
  return Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row) && row.every(cell => typeof cell === "number"));
};

/**
 * 任意のサイズのmutableな行列
 * 一旦、3*3より小さな行列のみ対応とする
 */
export class Matrix {
  private value: number[];

  /** 行(横向き)の長さ */
  private rowLength: number;
  /** 列(縦向き)の長さ */
  private columnLength: number;

  /**
   * @param columnMajor Column-major order(webGLに合わせ、列の配列を渡して初期化)
   */
  constructor(columnMajor: ReadonlyArray<ReadonlyArray<number>> | ReadonlyArray<number>) {
    if (!is2dNumberArray(columnMajor)) {
      throw new Error("Matrix must be a 2D array");
    }
    this.rowLength = columnMajor.length;
    this.columnLength = columnMajor[0].length;
    this.value = columnMajor.flat();
  }

  public add(other: Matrix): void {
    if (!Matrix.sameSize(this, other)) {
      throw new Error("Matrix size mismatch: cannot add matrices of different sizes");
    }
    this.value = this.value.map((value, index) => value + other.value[index]);
  }

  public subTract(other: Matrix): void {
    if (!Matrix.sameSize(this, other)) {
      throw new Error("Matrix size mismatch: cannot add matrices of different sizes");
    }
    this.value = this.value.map((value, index) => value - other.value[index]);
  }

  public getValue(): number[] {
    return this.value;
  }

  public static sameSize(a: Matrix, b: Matrix): boolean {
    return a.rowLength === b.rowLength && a.columnLength === b.columnLength;
  }

  // TODO: multiplyScalar(scalar: number) — スカラー倍

  // TODO: multiplyMatrix(other: Matrix) — 行列同士の積（サイズ検証あり）

  // TODO: transpose() — 転置行列を返す

  // TODO: toRowMajorArray() — 行優先形式での配列を取得（デバッグや他API用途）

  // TODO: clone() — Matrixのディープコピーを返す

  // TODO: equals(other: Matrix) — 数値の厳密一致で比較する（テスト用途）

  // TODO: static identity(size: number) — 単位行列の生成

  // TODO: static fromRowMajor(rowMajor: number[][]) — 行優先形式からの生成

  // TODO: inverse() — 逆行列（2x2, 3x3などサイズ固定なら可）

  // TODO: determinant() — 行列式の計算（サイズ限定で）

  // TODO: toString() — 表形式で行列を文字列に変換（デバッグ用）
}
