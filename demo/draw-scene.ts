import * as Matrix from "../src/matrix";
import { programInfo } from "./webgl-demo";
import { buffers } from "./init-buffers";

// これらの行列演算は、本来はライブラリ側で実装されているべきだが
// 一旦、デモを動作させる為アプリケーションで実装することにした
export const translationMatrix = (x: number, y: number, z: number): Matrix.F32Mat<number, number> => {
  const mat = Matrix.generateIdentity(4);
  mat.value[12] = x;
  mat.value[13] = y;
  mat.value[14] = z;
  return mat;
};

// Z軸回転行列 (4x4)
export const rotateZMatrix = (rad: number): Matrix.F32Mat<number, number> => {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return Matrix.fromRowMajor([
    [cos, -sin, 0, 0],
    [sin, cos, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
};

/**
 * 透視射影行列を生成する
 * @param fovY 垂直方向の視野角（ラジアン）
 * @param aspect アスペクト比（横 / 縦）
 * @param near 最近接距離（0 より大きい）
 * @param far 最遠距離（near より大きい）
 */
export const getPerspectiveMatrix = (fovY: number, aspect: number, near: number, far: number): Matrix.F32Mat<number, number> => {
  const f = 1.0 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);

  // 列優先で並べる
  const columnMajor = [
    [f / aspect, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, (far + near) * nf, -1],
    [0, 0, 2 * far * near * nf, 0],
  ];

  return Matrix.fromColumnMajor(columnMajor);
};

const setColorAttribute = (gl: WebGLRenderingContext, buffers: buffers, programInfo: programInfo) => {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
};

// WebGL に、位置バッファーから位置を
// vertexPosition 属性に引き出す方法を指示する。
const setPositionAttribute = (gl: WebGLRenderingContext, buffers: buffers, programInfo: programInfo) => {
  const numComponents = 2; // 反復処理ごとに 2 つの値を取り出す
  const type = gl.FLOAT; // バッファ内のデータは 32 ビット浮動小数点数
  const normalize = false; // 正規化なし
  const stride = 0; // 一組の値から次の値まで何バイトで移動するか
  // 0 = 上記の type と numComponents を使用
  const offset = 0; // バッファー内の何バイト目から開始するか
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
};

export const drawScene = (gl: WebGLRenderingContext, programInfo: programInfo, buffers: buffers, squareRotation: number) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // 黒でクリア、完全に不透明
  gl.clearDepth(1.0); // 全てをクリア
  gl.enable(gl.DEPTH_TEST); // 深度テストを有効化
  gl.depthFunc(gl.LEQUAL); // 奥にあるものは隠れるようにする

  // 描写を行う前にキャンバスをクリアする

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // カメラで遠近感を再現するために使用される特殊な行列、
  // 視点マトリクスを作成する。
  // 視野角は 45 度、幅と高さの比率はキャンバスの
  // 表示サイズに合わせる。
  // カメラから 0.1 単位から 100 単位までのオブジェクトのみを
  // 表示するようにする。

  const fieldOfView = (45 * Math.PI) / 180; // ラジアンにする
  const glCanvas = gl.canvas as HTMLCanvasElement;
  const aspect = glCanvas.clientWidth / glCanvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  let projectionMatrix = Matrix.generateIdentity(4) as Matrix.F32Mat<number, number>; //FIX ME
  const perspectiveMatrix = getPerspectiveMatrix(fieldOfView, aspect, zNear, zFar);

  // 受け取り先を取る
  //mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  projectionMatrix = Matrix.multiplyMatrix(projectionMatrix, perspectiveMatrix);

  // 描写位置をシーンの中央である "identity" ポイントにセットする
  let modelViewMatrix = Matrix.generateIdentity(4) as Matrix.F32Mat<number, number>; //FIX ME

  // そして描写位置を正方形を描写し始めたい位置に少しだけ動かす
  //mat4.translate(modelViewMatrix, modelViewMatrix,[-0.0, 0.0, -6.0],);
  modelViewMatrix = Matrix.multiplyMatrix(modelViewMatrix, translationMatrix(-0.0, 0.0, -6.0));
  modelViewMatrix = Matrix.multiplyMatrix(modelViewMatrix, rotateZMatrix(squareRotation));

  // WebGL にどのように座標バッファーから座標を
  // vertexPosition 属性に引き出すか伝える。
  setPositionAttribute(gl, buffers, programInfo);
  setColorAttribute(gl, buffers, programInfo);

  // WebGL に、描画にこのプログラムを使用するよう伝える
  gl.useProgram(programInfo.program);

  console.log(projectionMatrix.value);
  console.log(modelViewMatrix.value);

  // シェーダーユニフォームを設定
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix.value);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix.value);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
};
