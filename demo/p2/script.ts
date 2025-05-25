import * as mat4 from "@/mat4"

window.addEventListener('load', () => {
  main();
})

const getCanvas = (): HTMLCanvasElement => {
  const c = document.getElementById('glcanvas') as HTMLCanvasElement | null;
  if (!c) {
    throw new Error(`canvas not found`);
  }
  return c;
}

const main = () => {
  const c = getCanvas();

  c.width = 500;
  c.height = 300;

  const gl: WebGLRenderingContext | null = c.getContext('webgl');
  if (!gl) {
    throw new Error(`webGL not supported`);
  }

  const vertexShaderSource = `
attribute vec3 position;
attribute vec4 color;
uniform   mat4 mvpMatrix;
varying   vec4 vColor;

void main(void){
    vColor = color;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
`

  const fragmentShaderSource = `
precision mediump float;

varying vec4 vColor;

void main(void){
    gl_FragColor = vColor;
}`

  const v_shader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const f_shader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

  // プログラムオブジェクトの生成とリンク
  const prg = createProgram(gl, v_shader, f_shader);

  // attributeLocationを配列に取得
  const attLocation = new Array(2);
  attLocation[0] = gl.getAttribLocation(prg, 'position');
  attLocation[1] = gl.getAttribLocation(prg, 'color');

  // attributeの要素数を配列に格納
  const attStride = new Array(2);
  attStride[0] = 3;
  attStride[1] = 4;

  const vertex_position = [
    0.0, 1.0, 0.0,
    1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    0.0, -1.0, 0.0
  ];

  const vertex_color = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0
  ];

  // VBOの生成
  const pos_vbo = createVbo(gl, vertex_position);
  const col_vbo = createVbo(gl, vertex_color);

  setAttribute(gl, [pos_vbo, col_vbo], attLocation, attStride);

  const iboSource = [0, 1, 2, 1, 2, 3];

  const ibo = createIbo(gl, iboSource);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

  requestAnimationFrame(() => {
    frame(gl, prg, c, 0, iboSource.length);
  })
}

/**
 * メインループ。
 * 引数の数が明らかに多すぎるが、これらは後々レンダラー自身が状態として管理できるようにする。
 */
const frame = (gl: WebGLRenderingContext, prg: WebGLProgram, c: HTMLCanvasElement, frameCount: number, iboSourceLength: number) => {

  // init
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const rad = (frameCount % 360) * Math.PI / 180;

  const identity = mat4.getIdentity();

  // 各種行列の生成と初期化
  let mMatrix = identity;
  let mvpMatrix = identity;

  const vMatrix = mat4.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0]);
  const pMatrix = mat4.getPerspectiveMatrix(45, c.width / c.height, 0.1, 100);

  mMatrix = mat4.multiply(mMatrix, mat4.translationMatrix(1.5, 0.0, 0.0));

  const vpMatrix = mat4.multiply(pMatrix, vMatrix);

  // uniformLocationの取得
  const uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

  // モデル座標変換行列の生成
  mMatrix = mat4.multiply(mat4.getIdentity(), mat4.rotateYMatrix(rad));
  mvpMatrix = mat4.multiply(vpMatrix, mMatrix);
  gl.uniformMatrix4fv(uniLocation, false, Float32Array.from(mvpMatrix.value));

  gl.drawElements(gl.TRIANGLES, iboSourceLength, gl.UNSIGNED_SHORT, 0);

  // コンテキストの再描画
  gl.flush();

  requestAnimationFrame(() => {
    frame(gl, prg, c, ++frameCount, iboSourceLength);
  })
}

/**
 * ソースをコンパイルしてシェーダを生成
 * @param source シェーダのソーステキスト
 * @param type gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
 * @returns コンパイルされたシェーダ
 */
const createShader = (gl: WebGLRenderingContext, source: string, type: 35632 | 35633): WebGLShader => {

  let shader: null | WebGLShader = null;
  switch (type) {
    case gl.VERTEX_SHADER:
      shader = gl.createShader(gl.VERTEX_SHADER);
      break
    case gl.FRAGMENT_SHADER:
      shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  if (!shader) {
    throw new Error(`shader not created`)
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`shader compile error: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

const createProgram = (gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram => {
  const program = gl.createProgram();

  // プログラムオブジェクトにシェーダを割り当てる
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);

  gl.linkProgram(program);

  // シェーダのリンクが正しく行なわれたかチェック
  if (!gl.getProgramParameter(program, gl.LINK_STATUS) as GLboolean) {

    throw new Error(`program link error: ${gl.getProgramInfoLog(program)}`);
  }

  gl.useProgram(program);
  return program;
}
/**
VBOを生成する関数
*/
const createVbo = (gl: WebGLRenderingContext, data: ArrayLike<number>) => {
  // バッファオブジェクトの生成
  const vbo = gl.createBuffer();

  // バッファをバインドする
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  // バッファにデータをセット
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  // バッファのバインドを無効化
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // 生成した VBO を返して終了
  return vbo;
}
/*
VBOをバインドし登録する関数
*/
const setAttribute = (gl: WebGLRenderingContext, vbo: WebGLBuffer[], attL: number[], attS: number[]) => {
  for (const [i] of vbo.entries()) {
    // バッファをバインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
    // attributeLocationを有効にする
    gl.enableVertexAttribArray(attL[i]);
    // attributeLocationを通知し登録する
    gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
  }
}
/**
IBOを生成する関数
*/
function createIbo(gl: WebGLRenderingContext, data: ArrayLike<number>): WebGLBuffer {

  const ibo = gl.createBuffer();

  // バッファをバインドする
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

  // バッファにデータをセット
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);

  // バッファのバインドを無効化
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // 生成したIBOを返して終了
  return ibo;
}