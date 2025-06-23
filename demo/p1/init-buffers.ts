export type buffers = ReturnType<typeof initBuffers>;

export const initBuffers = (gl: WebGLRenderingContext) => {
  const positionBuffer = initPositionBuffer(gl);
  const colorBuffer = initColorBuffer(gl);

  const indexBuffer = initIndexBuffer(gl);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
};

const initColorBuffer = (gl: WebGLRenderingContext) => {
  const faceColors = [
    [1.0, 1.0, 1.0, 1.0], // 前面: 白
    [1.0, 0.0, 0.0, 1.0], // 背面: 赤
    [0.0, 1.0, 0.0, 1.0], // 上面: 緑
    [0.0, 0.0, 1.0, 1.0], // 底面: 青
    [1.0, 1.0, 0.0, 1.0], // 右側面: 黄
    [1.0, 0.0, 1.0, 1.0], // 左側面: 紫
  ];

  // 色の配列をすべての頂点の表に変換する
  let colors: number[] = [];

  for (let j = 0; j < faceColors.length; j++) {
    const c = faceColors[j];
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return colorBuffer;
};

const initIndexBuffer = (gl: WebGLRenderingContext) => {
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // この配列はそれぞれの面を 2 つの三角形として定義しており、
  // 各三角形の位置を指定するために、頂点の配列を指し示す
  // インデックスを使用します。

  const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // 前面
    4,
    5,
    6,
    4,
    6,
    7, // 背面
    8,
    9,
    10,
    8,
    10,
    11, // 上面
    12,
    13,
    14,
    12,
    14,
    15, // 底面
    16,
    17,
    18,
    16,
    18,
    19, // 右側面
    20,
    21,
    22,
    20,
    22,
    23, // 左側面
  ];

  // 要素の配列を GL に渡す

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW,
  );

  return indexBuffer;
};

const initPositionBuffer = (gl: WebGLRenderingContext) => {
  // 正方形の位置を保存するためのバッファー
  const positionBuffer = gl.createBuffer();

  // positionBuffer をバッファー操作の適用対象として選択
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 正方形の頂点座標の配列
  const positions = [
    // 前面
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

    // 背面
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

    // 上面
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

    // 底面
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

    // 右側面
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

    // 左側面
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
  ];

  // 形を作るために頂点座標のリストを WebGL に渡す。
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
};
