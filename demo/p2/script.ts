import * as mat4 from "@/mat4"

// three.jsを参考に設定した簡易的なMesh
type Mesh = {
  attributes: {
    position: Array<number>;
    normal: Array<number>;
    color: Array<number>;
    iboSource: Array<number>;
  };

  vboMap: Map<string, WebGLBuffer>;
  ibo?: WebGLBuffer;

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
      attributes: {
        position: torusData[0],
        normal: torusData[1],
        color: torusData[2],
        iboSource: torusData[3],
      },
      ibo: createIbo(this.gl, torusData[3]),
      vboMap: new Map(),
      vertexCount: torusData[0].length / 3,
      drawMode: this.gl.TRIANGLES,
    }

    const sphereData = getSphere(64, 64, 2.0, [0.25, 0.25, 0.75, 1.0]);

    const sphere: Mesh = {
      attributes: {
        position: sphereData.p,
        normal: sphereData.n,
        color: sphereData.c,
        iboSource: sphereData.i,
      },
      ibo: createIbo(this.gl, sphereData.i),
      vboMap: new Map(),
      vertexCount: sphereData.p.length / 3,
      drawMode: this.gl.TRIANGLES,
    }

    torus.vboMap.set('position', createVbo(this.gl, torus.attributes.position));
    torus.vboMap.set('normal', createVbo(this.gl, torus.attributes.normal!));
    torus.vboMap.set('color', createVbo(this.gl, torus.attributes.color!));

    sphere.vboMap.set('position', createVbo(this.gl, sphere.attributes.position));
    sphere.vboMap.set('normal', createVbo(this.gl, sphere.attributes.normal!));
    sphere.vboMap.set('color', createVbo(this.gl, sphere.attributes.color!));

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.meshes.push(torus);
    this.meshes.push(sphere);

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

    const vMatrix = mat4.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0]);
    const pMatrix = mat4.getPerspectiveMatrix(45, this.canvas.width / this.canvas.height, 0.1, 100);

    const lightPosition = [0.0, 0.0, 0.0];
    const eyeDirection = [0.0, 0.0, 20.0];
    const ambientColor = [0.1, 0.1, 0.1, 1.0]

    mMatrix = mat4.multiply(mMatrix, mat4.translationMatrix(1.5, 0.0, 0.0));

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
    const attStride = new Array(2);
    attStride[0] = 3;
    attStride[1] = 3;
    attStride[2] = 4;

    // 球体について
    setAttribute(this.gl, Array.from(this.meshes[1].vboMap.values()), attLocation, attStride);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.meshes[1].ibo!);
    // モデル座標変換行列の生成
    mMatrix = mat4.multiply(mat4.getIdentity(), mat4.translationMatrix(tx, -ty, -tz));
    mvpMatrix = mat4.multiply(vpMatrix, mMatrix);

    const invMatrix = mat4.inverse(mMatrix);

    this.gl.uniformMatrix4fv(uniLocation[0], false, Float32Array.from(mvpMatrix.value));
    this.gl.uniformMatrix4fv(uniLocation[1], false, Float32Array.from(mMatrix.value));
    this.gl.uniformMatrix4fv(uniLocation[2], false, Float32Array.from(invMatrix.value));
    this.gl.uniform3fv(uniLocation[3], lightPosition);
    this.gl.uniform3fv(uniLocation[4], eyeDirection);
    this.gl.uniform4fv(uniLocation[5], ambientColor);

    // 描画
    const iboSourceLength = this.meshes[1].attributes.iboSource.length;
    this.gl.drawElements(this.gl.TRIANGLES, iboSourceLength, this.gl.UNSIGNED_SHORT, 0);

    // トーラスについて
    setAttribute(this.gl, Array.from(this.meshes[0].vboMap.values()), attLocation, attStride);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.meshes[0].ibo!);
    // モデル座標変換行列の生成
    mMatrix = mat4.multiply(mat4.getIdentity(), mat4.translationMatrix(-tx, ty, tz));
    mMatrix = mat4.multiply(mMatrix, mat4.rotateYMatrix(-rad));
    mMatrix = mat4.multiply(mMatrix, mat4.rotateZMatrix(-rad));
    mvpMatrix = mat4.multiply(vpMatrix, mMatrix);

    const t_invMatrix = mat4.inverse(mMatrix);

    this.gl.uniformMatrix4fv(uniLocation[0], false, Float32Array.from(mvpMatrix.value));
    this.gl.uniformMatrix4fv(uniLocation[1], false, Float32Array.from(mMatrix.value));
    this.gl.uniformMatrix4fv(uniLocation[2], false, Float32Array.from(t_invMatrix.value));

    // 描画
    const t_iboSourceLength = this.meshes[0].attributes.iboSource.length;
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
 * @param irad 生成されるパイプそのものの半径
 * @param orad 原点からパイプの中心までの距離
 * @returns [頂点座標配列,法線情報, 頂点カラー配列, インデックス配列]
 */
const getTorus = (row: number, column: number, irad: number, orad: number, color?: [number, number, number, number]): [number[], number[], number[], number[]] => {
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