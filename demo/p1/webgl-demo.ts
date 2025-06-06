/**
 * MDN記載のWebGLデモを参考に、TypeScriptでの実装と独自のライブラリへの依存の書き換えを行った
@see https://developer.mozilla.org/ja/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
*/

import { initBuffers } from "./init-buffers";
import { drawScene } from "./draw-scene";

let cubeRotation = 0.0;
let deltaTime: number = 0;

// 頂点シェーダーのプログラム
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

const fsSource = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;

export type programInfo = {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number;
    vertexColor: number;
  };
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation | null;
    modelViewMatrix: WebGLUniformLocation | null;
  };
};

const main = () => {
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  // GL コンテキストを初期化
  const gl = canvas!.getContext("webgl") as WebGLRenderingContext;

  if (gl == null) {
    alert("WebGL を初期化できませんでした。");
    return;
  }

  // クリアカラーを黒に設定し、完全に不透明する
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 指定されたクリアカラーでカラーバッファーをクリアする
  gl.clear(gl.COLOR_BUFFER_BIT);

  // シェーダープログラムを初期化
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  if (shaderProgram == null) {
    throw new Error(`shaderProgram を初期化できませんでした。`);
  }

  // シェーダープログラムを使用するために必要な情報をすべて収集する。
  // シェーダープログラムが aVertexPosition に使用している属性を調べ、ユニフォームの位置を調べる。
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix",
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    },
  };

  // ここでは、これから描画するすべてのオブジェクトを
  // 構築するルーチンを呼び出す
  const buffers = initBuffers(gl);

  let then = 0;

  // 繰り返しシーンを描画
  const render = (now: number) => {
    now *= 0.001; // 秒に変換
    deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, cubeRotation);
    cubeRotation += deltaTime;

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
};

window.addEventListener("load", () => main());

/**
シェーダープログラムを初期化し、WebGL にデータの描画方法を教える
*/
const initShaderProgram = (
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string,
) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // シェーダープログラムの作成

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `シェーダープログラムを初期化できません: ${gl.getProgramInfoLog(shaderProgram)}`,
    );
    return null;
  }

  return shaderProgram;
};

/**
指定された種類のシェーダーを作成し、ソースをアップロードしてコンパイルする
*/
function loadShader(gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type);
  if (shader == null) {
    throw new Error("shader を作成できませんでした");
  }

  // シェーダーオブジェクトにソースを送信
  gl.shaderSource(shader, source);

  // シェーダープログラムをコンパイル
  gl.compileShader(shader);

  // コンパイルが成功したか確認する
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error(
      `シェーダーのコンパイル時にエラーが発生しました: ${gl.getShaderInfoLog(shader)}`,
    );
  }

  return shader;
}
