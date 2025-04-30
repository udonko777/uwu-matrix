export type buffers = {
  position: WebGLBuffer;
};

export const initBuffers = (gl: WebGLRenderingContext): buffers => {
  const positionBuffer = initPositionBuffer(gl);

  return {
    position: positionBuffer,
  };
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
