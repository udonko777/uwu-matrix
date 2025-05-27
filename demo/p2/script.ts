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
attribute vec3 normal;
attribute vec4 color;
uniform   mat4 mvpMatrix;
uniform   mat4 invMatrix;
uniform   vec3 lightDirection;
uniform   vec3 eyeDirection;
uniform   vec4 ambientColor;
varying   vec4 vColor;

void main(void){
    vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    vec3  invEye   = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;
    vec3  halfLE   = normalize(invLight + invEye);
    float diffuse  = clamp(dot(normal, invLight), 0.0, 1.0);
    float specular = pow(clamp(dot(normal, halfLE), 0.0, 1.0), 50.0);
    vec4  light    = color * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);
    vColor         = light + ambientColor;
    gl_Position    = mvpMatrix * vec4(position, 1.0);
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
  attLocation[1] = gl.getAttribLocation(prg, 'normal');
  attLocation[2] = gl.getAttribLocation(prg, 'color');

  // attributeの要素数を配列に格納
  const attStride = new Array(2);
  attStride[0] = 3;
  attStride[1] = 3;
  attStride[2] = 4;

  // トーラスの頂点データを生成
  const torusData = torus(32, 32, 1.0, 2.0);
  const position = torusData[0];
  const normal = torusData[1];
  const color = torusData[2];
  const iboSource = torusData[3];

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // VBOの生成
  const pos_vbo = createVbo(gl, position);
  const nor_vbo = createVbo(gl, normal);
  const col_vbo = createVbo(gl, color);

  setAttribute(gl, [pos_vbo, nor_vbo, col_vbo], attLocation, attStride);

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

  const vMatrix = mat4.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0]);
  const pMatrix = mat4.getPerspectiveMatrix(45, c.width / c.height, 0.1, 100);

  const lightDirection = [-0.5, 0.5, 0.5];
  const eyeDirection = [0.0, 0.0, 20.0];
  const ambientColor = [0.1, 0.1, 0.1, 1.0]

  mMatrix = mat4.multiply(mMatrix, mat4.translationMatrix(1.5, 0.0, 0.0));

  const vpMatrix = mat4.multiply(pMatrix, vMatrix);

  // uniformLocationの取得
  const uniLocation: WebGLUniformLocation[] = [];
  uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix')!;
  uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix')!;
  uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection')!;
  uniLocation[3] = gl.getUniformLocation(prg, 'eyeDirection')!;
  uniLocation[4] = gl.getUniformLocation(prg, 'ambientColor')!;

  // モデル座標変換行列の生成
  mMatrix = mat4.multiply(mat4.getIdentity(), mat4.rotateYMatrix(rad));
  mMatrix = mat4.multiply(mMatrix, mat4.rotateZMatrix(rad));
  mvpMatrix = mat4.multiply(vpMatrix, mMatrix);

  const invMatrix = mat4.inverse(mMatrix);

  gl.uniformMatrix4fv(uniLocation[0], false, Float32Array.from(mvpMatrix.value));
  gl.uniformMatrix4fv(uniLocation[1], false, Float32Array.from(invMatrix.value));
  gl.uniform3fv(uniLocation[2], lightDirection);
  gl.uniform3fv(uniLocation[3], eyeDirection);
  gl.uniform4fv(uniLocation[4], ambientColor);

  // 描画

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

const hsva = (h: number, s: number, v: number, a: number): [number, number, number, number] => {
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
    return [v, v, v, a]
  }
  const r = [v, n, m, m, k, v];
  const g = [k, v, v, n, m, m];
  const b = [m, m, k, v, v, n];

  return [r[i], g[i], b[i], a];
}

/**
 * トーラスの頂点データ、色データ、インデックスデータを生成します。
 * @param row パイプを形成する円をいくつの頂点で表現するのか
 * @param column パイプをどれくらい分割するのか
 * @param irad 生成されるパイプそのものの半径
 * @param orad 原点からパイプの中心までの距離
 * @returns [頂点座標配列,法線情報, 頂点カラー配列, インデックス配列]
 */
const torus = (row: number, column: number, irad: number, orad: number): [number[], number[], number[], number[]] => {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const nor: number[] = [];

  for (let i = 0; i <= row; i++) {
    const r = Math.PI * 2 / row * i;
    const rr = Math.cos(r);
    const ry = Math.sin(r);

    for (let ii = 0; ii <= column; ii++) {
      const tr = Math.PI * 2 / column * ii;
      const tx = (rr * irad + orad) * Math.cos(tr);
      const ty = ry * irad;
      const tz = (rr * irad + orad) * Math.sin(tr);
      const rx = rr * Math.cos(tr);
      const rz = rr * Math.sin(tr);

      pos.push(tx, ty, tz);
      nor.push(rx, ry, rz);

      const tc = hsva(360 / column * ii, 1, 1, 1);
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
  return [pos, nor, col, idx];
}