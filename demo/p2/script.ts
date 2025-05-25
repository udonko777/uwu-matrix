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

  const gl: WebGLRenderingContext | null = getCanvas().getContext('webgl');
  if (!gl) {
    throw new Error(`webGL not supported`);
  }

  // canvasを初期化する色を設定する
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // canvasを初期化する際の深度を設定する
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const vertexShaderSource = `
attribute vec3 position;
uniform   mat4 mvpMatrix;

void main(void){
  gl_Position = mvpMatrix * vec4(position, 1.0);
}
`

  const fragmentShaderSource = `
void main(void){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`

  const v_shader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const f_shader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

  // プログラムオブジェクトの生成とリンク
  const prg = createProgram(gl, v_shader, f_shader);

  const attLocation = gl.getAttribLocation(prg, 'position');

  // attributeの要素数(この場合は xyz の3要素)
  const attStride = 3;

  // モデルデータ
  const vertex_position = [
    0.0, 1.0, 0.0,
    1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0
  ];

  // VBOの生成とバインド
  const vbo = createVbo(gl, vertex_position);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  // attribute属性の有効化と登録
  gl.enableVertexAttribArray(attLocation);
  gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);

  const identity = mat4.getIdentity();

  // 各種行列の生成と初期化
  const mMatrix = identity;

  // ビュー座標変換行列
  const vMatrix = mat4.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0]);

  // プロジェクション座標変換行列
  const pMatrix = mat4.getPerspectiveMatrix(90, c.width / c.height, 0.1, 100);

  // 各行列を掛け合わせ座標変換行列を完成させる
  let mvpMatrix = mat4.multiply(pMatrix, vMatrix);
  mvpMatrix = mat4.multiply(mvpMatrix, mMatrix);

  // uniformLocationの取得
  const uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

  // uniformLocationへ座標変換行列を登録
  gl.uniformMatrix4fv(uniLocation, false, Float32Array.from(mvpMatrix.value));

  // モデルの描画
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // コンテキストの再描画
  gl.flush();
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