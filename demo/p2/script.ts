import * as mat4 from "@/mat4"

import * as attribute from "./attribute"

// three.jsを参考に設定した簡易的なMesh
type Mesh = {
  geometry: {
    attributes: Map<string, attribute.Attribute>;
    iboSource: attribute.Attribute;
  }
  // `Mesh`は外部から見た時の抽象なので,本当なら`WebGLBuffer`をここで持つべきではない
  vboMap: Map<string, WebGLBuffer>;
  ibo: WebGLBuffer;

  vertexCount: number;

  drawMode: number;
};

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

  requestAnimationFrame(() => {
    const renderer = new Renderer(c);
    frame(0, renderer);
  })

}

/**
 * Rendererと呼ぶには余りにも沢山の関心を持っているが、現状のまま動作させることを優先した
 */
class Renderer {
  private readonly canvas: HTMLCanvasElement;

  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;

  private readonly meshes: Array<Mesh> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.gl = this.canvas.getContext('webgl')!;//fix
    if (!this.gl) {
      throw new Error(`webGL not supported`);
    }

    const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform   mat4 mvpMatrix;
uniform   mat4 mMatrix;
varying   vec3 vPosition;
varying   vec3 vNormal;
varying   vec4 vColor;

void main(void){
    vPosition   = (mMatrix * vec4(position, 1.0)).xyz;
    vNormal     = normal;
    vColor      = color;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
`

    const fragmentShaderSource = `
precision mediump float;

uniform mat4 invMatrix;
uniform vec3 lightPosition;
uniform vec3 eyeDirection;
uniform vec4 ambientColor;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;

void main(void){
    vec3  lightVec  = lightPosition - vPosition;
    vec3  invLight  = normalize(invMatrix * vec4(lightVec, 0.0)).xyz;
    vec3  invEye    = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;
    vec3  halfLE    = normalize(invLight + invEye);
    float diffuse   = clamp(dot(vNormal, invLight), 0.0, 1.0) + 0.2;
    float specular  = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 50.0);
    vec4  destColor = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0) + ambientColor;
    gl_FragColor    = destColor;
}
`

    const v_shader = createShader(this.gl, vertexShaderSource, this.gl.VERTEX_SHADER);
    const f_shader = createShader(this.gl, fragmentShaderSource, this.gl.FRAGMENT_SHADER);

    // プログラムオブジェクトの生成とリンク
    this.program = createProgram(this.gl, v_shader, f_shader);

    // トーラスの頂点データを生成
    const torusData = getTorus(64, 64, 0.5, 1.5, [0.75, 0.25, 0.25, 1.0]);

    const torus: Mesh = {
      geometry: {
        attributes: new Map([
          ["position", attribute.init(torusData[0], 3)],
          ["normal", attribute.init(torusData[1], 3)],
          ["color", attribute.init(torusData[2], 4)],
        ]),
        iboSource: attribute.init(torusData[3], torusData[3].length),
      },
      ibo: createIbo(this.gl, torusData[3]),
      vboMap: new Map(),
      vertexCount: torusData[0].length / 3,
      drawMode: this.gl.TRIANGLES,
    }

    const sphereData = getSphere(64, 64, 2.0, [0.25, 0.25, 0.75, 1.0]);

    const sphere: Mesh = {
      geometry: {
        attributes: new Map([
          ["position", attribute.init(sphereData.p, 3)],
          ["normal", attribute.init(sphereData.n, 3)],
          ["color", attribute.init(sphereData.c, 4)],
        ]),
        iboSource: attribute.init(sphereData.i, sphereData.i.length),
      },
      ibo: createIbo(this.gl, sphereData.i),
      vboMap: new Map(),
      vertexCount: sphereData.p.length / 3,
      drawMode: this.gl.TRIANGLES,
    }

    //VBOの初期化
    const meshes = [torus, sphere];
    for (const mesh of meshes) {
      for (const key of mesh.geometry.attributes.keys()) {
        mesh.vboMap.set(key, createVbo(this.gl, mesh.geometry.attributes.get(key)!.value));
      }
    }
    this.meshes = meshes;

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, torus.ibo!);

  }

  rendering(frameCount: number) {
    // init
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const rad = (frameCount % 360) * Math.PI / 180;
    const tx = Math.cos(rad) * 3.5;
    const ty = Math.sin(rad) * 3.5;
    const tz = Math.sin(rad) * 3.5;

    // 各種行列の生成と初期化
    const identity = mat4.getIdentity();

    let mMatrix = identity;
    let mvpMatrix = identity;

    const vMatrix = mat4.getLookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0]);
    const pMatrix = mat4.getPerspective(45, this.canvas.width / this.canvas.height, 0.1, 100);

    const lightPosition = [0.0, 0.0, 0.0];
    const eyeDirection = [0.0, 0.0, 20.0];
    const ambientColor = [0.1, 0.1, 0.1, 1.0]

    mMatrix = mat4.multiply(mMatrix, mat4.getTranslation(1.5, 0.0, 0.0));

    const vpMatrix = mat4.multiply(pMatrix, vMatrix);

    // uniformLocationの取得
    const uniLocation: WebGLUniformLocation[] = [];
    uniLocation[0] = this.gl.getUniformLocation(this.program, 'mvpMatrix')!;
    uniLocation[1] = this.gl.getUniformLocation(this.program, 'mMatrix')!;
    uniLocation[2] = this.gl.getUniformLocation(this.program, 'invMatrix')!;
    uniLocation[3] = this.gl.getUniformLocation(this.program, 'lightPosition')!;
    uniLocation[4] = this.gl.getUniformLocation(this.program, 'eyeDirection')!;
    uniLocation[5] = this.gl.getUniformLocation(this.program, 'ambientColor')!;

    // attributeLocationを配列に取得
    const attLocation = new Array(3);
    attLocation[0] = this.gl.getAttribLocation(this.program, 'position');
    attLocation[1] = this.gl.getAttribLocation(this.program, 'normal');
    attLocation[2] = this.gl.getAttribLocation(this.program, 'color');

    // attributeの要素数を配列に格納
    const attStride = new Array(3);
    attStride[0] = 3;
    attStride[1] = 3;
    attStride[2] = 4;

    // 球体について
    setAttribute(this.gl, Array.from(this.meshes[1].vboMap.values()), attLocation, attStride);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.meshes[1].ibo!);
    // モデル座標変換行列の生成
    mMatrix = mat4.multiply(mat4.getIdentity(), mat4.getTranslation(tx, -ty, -tz));
    mvpMatrix = mat4.multiply(vpMatrix, mMatrix);

    const invMatrix = mat4.inverse(mMatrix);

    this.gl.uniformMatrix4fv(uniLocation[0], false, Float32Array.from(mvpMatrix.value));
    this.gl.uniformMatrix4fv(uniLocation[1], false, Float32Array.from(mMatrix.value));
    this.gl.uniformMatrix4fv(uniLocation[2], false, Float32Array.from(invMatrix.value));
    this.gl.uniform3fv(uniLocation[3], lightPosition);
    this.gl.uniform3fv(uniLocation[4], eyeDirection);
    this.gl.uniform4fv(uniLocation[5], ambientColor);

    // 描画
    const iboSourceLength = this.meshes[1].geometry.iboSource.stride;
    this.gl.drawElements(this.gl.TRIANGLES, iboSourceLength, this.gl.UNSIGNED_SHORT, 0);

    // トーラスについて
    setAttribute(this.gl, Array.from(this.meshes[0].vboMap.values()), attLocation, attStride);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.meshes[0].ibo!);
    // モデル座標変換行列の生成
    mMatrix = mat4.multiply(mat4.getIdentity(), mat4.getTranslation(-tx, ty, tz));
    mMatrix = mat4.multiply(mMatrix, mat4.getRotateY(-rad));
    mMatrix = mat4.multiply(mMatrix, mat4.getRotateZ(-rad));
    mvpMatrix = mat4.multiply(vpMatrix, mMatrix);

    const t_invMatrix = mat4.inverse(mMatrix);

    this.gl.uniformMatrix4fv(uniLocation[0], false, Float32Array.from(mvpMatrix.value));
    this.gl.uniformMatrix4fv(uniLocation[1], false, Float32Array.from(mMatrix.value));
    this.gl.uniformMatrix4fv(uniLocation[2], false, Float32Array.from(t_invMatrix.value));

    // 描画
    const t_iboSourceLength = this.meshes[0].geometry.iboSource.stride;
    this.gl.drawElements(this.gl.TRIANGLES, t_iboSourceLength, this.gl.UNSIGNED_SHORT, 0);

    // コンテキストの再描画
    this.gl.flush();
  }
}

/**
 * メインループ。
 */
const frame = (frameCount: number, renderer: Renderer) => {

  renderer.rendering(frameCount)

  requestAnimationFrame(() => {
    frame(++frameCount, renderer);
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
 * @param innerRadius 生成されるパイプそのものの半径
 * @param outerRadius 原点からパイプの中心までの距離
 * @returns [頂点座標配列,法線情報, 頂点カラー配列, インデックス配列]
 */
const getTorus = (row: number, column: number, innerRadius: number, outerRadius: number, color?: [number, number, number, number]): [number[], number[], number[], number[]] => {
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
        tc = hsva(360 / row * i, 1, 1, 1);
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
  return [pos, nor, col, idx];
}

/** 
 * 球体を生成する関数
 * @param row 球体を形成する膜状のポリゴンの板の縦の分割数
 * @param column 横の分割数
 * @param rad 球体の半径
 * @param color
 * @returns
 */
const getSphere = (row: number, column: number, rad: number, color: [number, number, number, number]) => {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const nor: number[] = [];
  for (let i = 0; i <= row; i++) {
    const r = Math.PI / row * i;
    const ry = Math.cos(r);
    const rr = Math.sin(r);
    for (let ii = 0; ii <= column; ii++) {
      const tr = Math.PI * 2 / column * ii;
      const tx = rr * rad * Math.cos(tr);
      const ty = ry * rad;
      const tz = rr * rad * Math.sin(tr);
      const rx = rr * Math.cos(tr);
      const rz = rr * Math.sin(tr);
      let tc;
      if (color) {
        tc = color;
      } else {
        tc = hsva(360 / row * i, 1, 1, 1);
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
  return { p: pos, n: nor, c: col, i: idx };
}