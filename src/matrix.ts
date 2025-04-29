const is2dNumberArray = (value: unknown): value is number[][] => {
  return Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row) && row.every(cell => typeof cell === "number"));
};

/**
 * 任意のサイズのmutableな行列
 * 一旦、3*3より小さな行列のみ対応とする
 */
export class DynamicMatrix {
  /** column-major order */
  private value: number[];

  /** 行の数(横に並んだ数字が縦にいくつあるか) */
  private rowCount: number;
  /** 列の数(縦に並んだ数字が横にいくつあるか) */
  private colCount: number;

  /**
   * @param columnMajor Column-major order(webGLに合わせ、列の配列を渡して初期化)
   */
  constructor(columnMajor: ReadonlyArray<ReadonlyArray<number>>) {
    if (!is2dNumberArray(columnMajor)) {
      throw new Error("Matrix must be a 2D array");
    }
    this.rowCount = columnMajor[0].length;
    this.colCount = columnMajor.length;
    this.value = columnMajor.flat();
  }

  public add(other: DynamicMatrix): void {
    if (!DynamicMatrix.sameSize(this, other)) {
      throw new Error("Matrix size mismatch: cannot subtract matrices of different sizes");
    }
    this.value = this.value.map((value, index) => value + other.value[index]);
  }

  public subTract(other: DynamicMatrix): void {
    if (!DynamicMatrix.sameSize(this, other)) {
      throw new Error("Matrix size mismatch: cannot add matrices of different sizes");
    }
    this.value = this.value.map((value, index) => value - other.value[index]);
  }

  public multiplyScalar(scalar: number) {
    this.value = this.value.map(value => value * scalar);
  }

  public multiplyMatrix(other: DynamicMatrix) {
    if (this.colCount !== other.rowCount) {
      throw new Error("Matrix size mismatch: cannot multiply matrices with incompatible sizes");
    }

    const result: number[] = new Array(this.rowCount * other.colCount).fill(0);

    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < other.colCount; col++) {
        let sum = 0;
        for (let k = 0; k < this.colCount; k++) {
          sum += this.getAt(k, row) * other.getAt(col, k);
        }
        result[col * this.rowCount + row] = sum;
      }
    }

    this.value = result;
    this.colCount = other.colCount;
  }

  /**
   * 0ベースで列と行を指定して値を得る。 WebGLの為に***列番号を先に指定する設計になっています***
   * @param columnIndex 何列目の値が必要か
   * @param rowIndex 何行目の値が必要か
   */
  public getAt(columnIndex: number, rowIndex: number) {
    if (columnIndex < 0 || columnIndex >= this.colCount) {
      throw new RangeError(`columnIndex ${columnIndex} is out of bounds (0-${this.colCount - 1})`);
    }
    if (rowIndex < 0 || rowIndex >= this.rowCount) {
      throw new RangeError(`rowIndex ${rowIndex} is out of bounds (0-${this.rowCount - 1})`);
    }
    return this.value[columnIndex * this.rowCount + rowIndex];
  }

  public getValue(): number[] {
    return this.value;
  }

  public static sameSize(a: DynamicMatrix, b: DynamicMatrix): boolean {
    return a.rowCount === b.rowCount && a.colCount === b.colCount;
  }

  // TODO: transpose() — 転置行列を返す

  // TODO: toRowMajorArray() — 行優先形式での配列を取得（デバッグや他API用途）

  /**
   * インスタンスのDeepCopyを得る。実直な実装のため計算量多い。
   * @returns インスタンスのDeepCopy
   */
  public generateClone(): DynamicMatrix {
    const initValue: Array<Array<number>> = [[]];

    for (let col = 0; col < this.colCount; col++) {
      const rowValue = [];
      for (let row = 0; row < this.rowCount; row++) {
        rowValue.push(this.getAt(col, row));
      }
      initValue.push(rowValue);
    }

    return new DynamicMatrix(initValue);
  }
  // TODO: equals(other: Matrix) — 数値の厳密一致で比較する（テスト用途）
  public equals(other: DynamicMatrix) {
    return this.value.every((val, index) => val === other.value[index]);
  }

  /**
   * TODO 単位行列の生成
   
  public static identity(size: number) {
    const result: number[] = new Array(Math.pow(size, 2)).fill(0);

    for (let col = 0; col < size; col++) {
      for (let row = 0; row < size; row++) {
        if (col === row) {
          result[col * size + row] = 1;
        } else {
          result[col * size + row] = 0;
        }
      }
    }

    return result;
  } */

  // TODO: static fromRowMajor(rowMajor: number[][]) — 行優先形式からの生成

  // TODO: inverse() — 逆行列（2x2, 3x3などサイズ固定なら可）

  // TODO: determinant() — 行列式の計算（サイズ限定で）

  // TODO: toString() — 表形式で行列を文字列に変換（デバッグ用）
}
