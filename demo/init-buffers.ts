export type buffers = ReturnType<typeof initBuffers>;

export const initBuffers = (gl: WebGLRenderingContext) => {
  const positionBuffer = initPositionBuffer(gl);
  const colorBuffer = initColorBuffer(gl);

  return {
    position: positionBuffer,
    color: colorBuffer,
  };
};

const initColorBuffer = (gl: WebGLRenderingContext) => {
  const colors = [
    1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    1.0,
  ];

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return colorBuffer;
};

const initPositionBuffer = (gl: WebGLRenderingContext) => {
  // 正方形の位置を保存するためのバッファー
  const positionBuffer = gl.createBuffer();

  // positionBuffer をバッファー操作の適用対象として選択
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 正方形の頂点座標の配列
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

  // 形を作るために頂点座標のリストを WebGL に渡す。
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
};
