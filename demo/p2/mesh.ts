import * as attribute from "./attribute";
// three.jsを参考に設定した簡易的なMesh
export type Mesh = {
  geometry: {
    attributes: Map<string, attribute.Attribute>;
    iboSource: attribute.Attribute;
  };
  // `Mesh`は外部から見た時の抽象なので,本当なら`WebGLBuffer`をここで持つべきではない
  vboMap?: Map<string, WebGLBuffer>;
  ibo?: WebGLBuffer;

  vertexCount?: number;

  drawMode?: number;
};

const initMesh = (data: { p: number[], n: number[], c: number[], i: number[] }): Mesh => {
  return {
    geometry: {
      attributes: new Map([
        ["position", attribute.init(data.p, 3)],
        ["normal", attribute.init(data.n, 3)],
        ["color", attribute.init(data.c, 4)],
      ]),
      iboSource: attribute.init(data.i, data.i.length),
    },
    vboMap: new Map(),
  }
}

const hsva = (
  h: number,
  s: number,
  v: number,
  a: number,
): [number, number, number, number] => {
  if (s > 1 || v > 1 || a > 1) {
    throw new Error("hsvaに渡された値が不正です。");
  }
  const th = h % 360;
  const i = Math.floor(th / 60);
  const f = th / 60 - i;
  const m = v * (1 - s);
  const n = v * (1 - s * f);
  const k = v * (1 - s * (1 - f));

  if (!(s > 0) && !(s < 0)) {
    return [v, v, v, a];
  }
  const r = [v, n, m, m, k, v];
  const g = [k, v, v, n, m, m];
  const b = [m, m, k, v, v, n];

  return [r[i], g[i], b[i], a];
};

/**
 * トーラスの頂点データ、色データ、インデックスデータを生成します。
 * @param row パイプを形成する円をいくつの頂点で表現するのか
 * @param column パイプをどれくらい分割するのか
 * @param innerRadius 生成されるパイプそのものの半径
 * @param outerRadius 原点からパイプの中心までの距離
 * @returns [頂点座標配列,法線情報, 頂点カラー配列, インデックス配列]
 */
export const getTorus = (
  row: number,
  column: number,
  innerRadius: number,
  outerRadius: number,
  color?: [number, number, number, number],
) => {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const nor: number[] = [];

  for (let i = 0; i <= row; i++) {
    const r = ((Math.PI * 2) / row) * i;
    const rr = Math.cos(r);
    const ry = Math.sin(r);

    for (let ii = 0; ii <= column; ii++) {
      const tr = ((Math.PI * 2) / column) * ii;
      const tx = (rr * innerRadius + outerRadius) * Math.cos(tr);
      const ty = ry * innerRadius;
      const tz = (rr * innerRadius + outerRadius) * Math.sin(tr);
      const rx = rr * Math.cos(tr);
      const rz = rr * Math.sin(tr);

      pos.push(tx, ty, tz);
      nor.push(rx, ry, rz);

      let tc;
      if (color) {
        tc = color;
      } else {
        tc = hsva((360 / row) * i, 1, 1, 1);
      }
      col.push(tc[0], tc[1], tc[2], tc[3]);
    }
  }

  for (let i = 0; i < row; i++) {
    for (let ii = 0; ii < column; ii++) {
      const r = (column + 1) * i + ii;
      idx.push(r, r + column + 1, r + 1);
      idx.push(r + column + 1, r + column + 2, r + 1);
    }
  }
  return initMesh({ p: pos, n: nor, c: col, i: idx });
};

/**
 * 球体を生成する関数
 * @param row 球体を形成する膜状のポリゴンの板の縦の分割数
 * @param column 横の分割数
 * @param rad 球体の半径
 * @param color
 * @returns
 */
export const getSphere = (
  row: number,
  column: number,
  rad: number,
  color: [number, number, number, number],
) => {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const nor: number[] = [];
  for (let i = 0; i <= row; i++) {
    const r = (Math.PI / row) * i;
    const ry = Math.cos(r);
    const rr = Math.sin(r);
    for (let ii = 0; ii <= column; ii++) {
      const tr = ((Math.PI * 2) / column) * ii;
      const tx = rr * rad * Math.cos(tr);
      const ty = ry * rad;
      const tz = rr * rad * Math.sin(tr);
      const rx = rr * Math.cos(tr);
      const rz = rr * Math.sin(tr);
      let tc;
      if (color) {
        tc = color;
      } else {
        tc = hsva((360 / row) * i, 1, 1, 1);
      }
      pos.push(tx, ty, tz);
      nor.push(rx, ry, rz);
      col.push(tc[0], tc[1], tc[2], tc[3]);
    }
  }
  let r = 0;
  for (let i = 0; i < row; i++) {
    for (let ii = 0; ii < column; ii++) {
      r = (column + 1) * i + ii;
      idx.push(r, r + 1, r + column + 2);
      idx.push(r, r + column + 2, r + column + 1);
    }
  }
  return initMesh({ p: pos, n: nor, c: col, i: idx });
};
