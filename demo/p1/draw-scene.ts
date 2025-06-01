import * as Matrix from "../../src/matrix";
import * as mat4 from "@/mat4"
import { programInfo } from "./webgl-demo";
import { buffers } from "./init-buffers";

const setColorAttribute = (
  gl: WebGLRenderingContext,
  buffers: buffers,
  programInfo: programInfo,
) => {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
};

/**
 *WebGL に、位置バッファーから位置をvertexPosition 属性に引き出す方法を指示する。
 */
const setPositionAttribute = (
  gl: WebGLRenderingContext,
  buffers: buffers,
  programInfo: programInfo,
) => {
  const numComponents = 3; // 反復処理ごとに 2 つの値を取り出す
  const type = gl.FLOAT; // バッファ内のデータは 32 ビット浮動小数点数
  const normalize = false; // 正規化なし
  const stride = 0; // 一組の値から次の値まで何バイトで移動するか
  // 0 = 上記の type と numComponents を使用
  const offset = 0; // バッファー内の何バイト目から開始するか
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
};

export const drawScene = (
  gl: WebGLRenderingContext,
  programInfo: programInfo,
  buffers: buffers,
  cubeRotation: number,
) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // 黒でクリア、完全に不透明
  gl.clearDepth(1.0); // 全てをクリア
  gl.enable(gl.DEPTH_TEST); // 深度テストを有効化
  gl.depthFunc(gl.LEQUAL); // 奥にあるものは隠れるようにする

  // 描写を行う前にキャンバスをクリアする

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // カメラで遠近感を再現するために使用される特殊な行列、視点マトリクスを作成する。
  // 視野角は 45 度、幅と高さの比率はキャンバスの表示サイズに合わせる。
  const fieldOfView = (45 * Math.PI) / 180; // ラジアンにする
  const glCanvas = gl.canvas as HTMLCanvasElement;
  const aspect = glCanvas.clientWidth / glCanvas.clientHeight;
  // カメラから 0.1 単位から 100 単位までのオブジェクトのみを表示するようにする。
  const zNear = 0.1;
  const zFar = 100.0;
  let projectionMatrix = Matrix.getIdentity(4);
  const perspectiveMatrix = mat4.getPerspective(
    fieldOfView,
    aspect,
    zNear,
    zFar,
  );

  // 受け取り先を取る
  projectionMatrix = Matrix.multiply(projectionMatrix, perspectiveMatrix);

  // 描写位置をシーンの中央である "identity" ポイントにセットする
  let modelViewMatrix = mat4.getIdentity();

  // そして描写位置を正方形を描写し始めたい位置に少しだけ動かす
  modelViewMatrix = mat4.multiply(
    modelViewMatrix,
    mat4.getTranslation(-0.0, 0.0, -6.0)
  );
  modelViewMatrix = mat4.multiply(
    modelViewMatrix,
    mat4.rotateZMatrix(cubeRotation),
  );
  modelViewMatrix = mat4.multiply(
    modelViewMatrix,
    mat4.rotateYMatrix(cubeRotation * 0.7)
  )
  modelViewMatrix = mat4.multiply(
    modelViewMatrix,
    mat4.rotateXMatrix(cubeRotation * 0.3)
  )

  // WebGL にどのように座標バッファーから座標を
  // vertexPosition 属性に引き出すか伝える。
  setPositionAttribute(gl, buffers, programInfo);
  setColorAttribute(gl, buffers, programInfo);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // WebGL に、描画にこのプログラムを使用するよう伝える
  gl.useProgram(programInfo.program);

  console.debug(modelViewMatrix.value);

  // シェーダーユニフォームを設定
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    new Float32Array(projectionMatrix.value),
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    new Float32Array(modelViewMatrix.value),
  );

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

};
