import * as mat4 from "@/mat4";
import * as mesh from "./mesh";

import * as scene from "./scene";

import { loadTextureBitmap } from "./common/loadImageBitmap"

// object3dに近い
export type RenderableObject = {
  mesh: mesh.Mesh;
  modelMatrix: mat4.Mat4;
}
// GPUにバインド済みのRenderableObject
type RenderObject = {
  mesh: GpuMesh;
  modelMatrix: mat4.Mat4;
}

type GpuMesh = Omit<mesh.Mesh, "type"> & {
  ibo: WebGLBuffer;
  vboMap: Map<string, WebGLBuffer>;
  vertexCount: number;
  drawMode: number;
  type: "GpuMesh";
};

window.addEventListener("load", () => {
  main();
});

const getCanvas = (): HTMLCanvasElement => {
  const c = document.getElementById("glcanvas") as HTMLCanvasElement | null;
  if (!c) {
    throw new Error(`canvas not found`);
  }
  return c;
};

const main = () => {
  const c = getCanvas();

  // 各種行列の生成と初期化
  const scene: scene.Scene = {
    children: new Set<RenderableObject>(),
    type: "Scene",
  };

  const control = [
    {
      mesh: mesh.getTetragon(),
      modelMatrix: mat4.getIdentity(),
    }
  ]

  const renderer = new Renderer(c);
  Promise.all(
    [loadTextureBitmap("demo.png")],
  )
    .then((textures) => {
      for (let i = 0; i < control.length; i++) {
        control[i].mesh.material.texture = textures[i];
      };
    })
    .then(() => {
      for (const obj of control) {
        scene.children.add(obj);
      }
      requestAnimationFrame(() => {
        frame(control, scene, 0, renderer);
      });
    })

};

/**
 * メインループ。
 */
const frame = (objectControl: RenderableObject[], scene: scene.Scene, frameCount: number, renderer: Renderer) => {

  const rad = ((frameCount % 360) * Math.PI) / 180;

  objectControl[0].modelMatrix = [
    mat4.getIdentity(),
    mat4.getRotateY(-rad),
  ].reduce((a, b) => {
    return mat4.multiply(a, b);
  });
  renderer.rendering(scene);

  requestAnimationFrame(() => {
    frame(objectControl, scene, ++frameCount, renderer);
  });
};

/**
 * Rendererと呼ぶには余りにも沢山の関心を持っているが、現状のまま動作させることを優先した
 */
class Renderer {
  private readonly canvas: HTMLCanvasElement;

  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;

  // ECMA 2023が必要
  private readonly meshes: WeakMap<symbol, GpuMesh> | Map<symbol, GpuMesh> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.gl = this.canvas.getContext("webgl")!; //fix
    if (!this.gl) {
      throw new Error(`webGL not supported`);
    }

    const vertexShaderSource = `
attribute vec3 position;
attribute vec4 color;
attribute vec2 textureCoord;
uniform   mat4 mvpMatrix;
varying   vec4 vColor;
varying   vec2 vTextureCoord;

void main(void){
    vColor        = color;
    vTextureCoord = textureCoord;
    gl_Position   = mvpMatrix * vec4(position, 1.0);
}
`;

    const fragmentShaderSource = `
precision mediump float;

uniform sampler2D texture;
varying vec4      vColor;
varying vec2      vTextureCoord;

void main(void){
    vec4 smpColor = texture2D(texture, vTextureCoord);
    gl_FragColor  = vColor * smpColor;
}
`;

    const v_shader = createShader(
      this.gl,
      vertexShaderSource,
      this.gl.VERTEX_SHADER,
    );
    const f_shader = createShader(
      this.gl,
      fragmentShaderSource,
      this.gl.FRAGMENT_SHADER,
    );

    // プログラムオブジェクトの生成とリンク
    this.program = createProgram(this.gl, v_shader, f_shader);

    //this.gl.enable(this.gl.CULL_FACE);
    //this.gl.enable(this.gl.DEPTH_TEST);
    //this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  private createGpuMesh(
    mesh: mesh.Mesh
  ): GpuMesh {
    return {
      ...mesh,
      ibo: createIbo(this.gl, mesh.geometry.iboSource.value),
      vboMap: new Map(),
      vertexCount: mesh.geometry.attributes.get("position")!.
        value.length / mesh.geometry.attributes.get("position")!.stride,
      drawMode: this.gl.TRIANGLES,
      type: "GpuMesh",
    }
  }

  private drawObject(
    RenderableObject: RenderObject,
    vpMatrix: mat4.Mat4,
    uniLocation: WebGLUniformLocation[],
  ) {

    const mesh = RenderableObject.mesh;
    const mMatrix = RenderableObject.modelMatrix;

    const mvpMatrix = mat4.multiply(vpMatrix, mMatrix);

    const attributeNames = Array.from(mesh.geometry.attributes.keys());

    if (mesh.material.texture) {
      if (mesh.material.texture.map == null) {
        console.debug("texture already created");
        const texture = createTexture(this.gl, mesh.material.texture.image);
        mesh.material.texture.map = texture;
        // テクスチャをバインドする
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // uniform変数にテクスチャを登録
        this.gl.uniform1i(uniLocation[1], 0);
      }
    }

    // attributeLocationを配列に取得
    const attLocation = attributeNames.map(name =>
      this.gl.getAttribLocation(this.program, name),
    );

    // attributeの要素数を配列に格納
    const attStride = attributeNames.map(
      name => mesh.geometry.attributes.get(name)!.stride,
    );

    setAttribute(this.gl, Array.from(mesh.vboMap.values()), attLocation, attStride);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);

    this.gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix.value);

    this.gl.drawElements(
      this.gl.TRIANGLES,
      mesh.geometry.iboSource.stride,
      this.gl.UNSIGNED_SHORT,
      0
    );
  }

  rendering(scene: scene.Scene) {

    const vboUninitialized: Array<GpuMesh> = [];

    // バッファが未登録のものは新規でVBOを生成する
    for (const obj of scene.children) {
      let gpuMesh = this.meshes.get(obj.mesh.id);
      if (gpuMesh != null) {
        continue;
      }
      gpuMesh = this.createGpuMesh(obj.mesh);
      vboUninitialized.push(gpuMesh);
      this.meshes.set(obj.mesh.id, gpuMesh);
    }
    // VBOの初期化
    for (const mesh of vboUninitialized) {
      for (const key of mesh.geometry.attributes.keys()) {
        mesh.vboMap.set(
          key,
          createVbo(this.gl, mesh.geometry.attributes.get(key)!.value),
        );
      }
    }

    // init
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const vMatrix = mat4.getLookAt([0.0, 2.0, 5.0], [0, 0, 0], [0, 1, 0]);
    const pMatrix = mat4.getPerspective(
      45,
      this.canvas.width / this.canvas.height,
      0.1,
      100,
    );

    const vpMatrix = mat4.multiply(pMatrix, vMatrix);

    // uniformLocationの取得
    const uniLocation: WebGLUniformLocation[] = [];
    uniLocation[0] = this.gl.getUniformLocation(this.program, "mvpMatrix")!;
    uniLocation[1] = this.gl.getUniformLocation(this.program, 'texture')!;

    for (const obj of scene.children) {
      const renderObject: RenderObject = {
        mesh: this.meshes.get(obj.mesh.id)!,
        modelMatrix: obj.modelMatrix,
      };
      this.drawObject(renderObject, vpMatrix, uniLocation)
    }

    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR) {
      console.error("WebGL error:", error);
    }

    // コンテキストの再描画
    this.gl.flush();
  }
}

/**
 * ソースをコンパイルしてシェーダを生成
 * @param source シェーダのソーステキスト
 * @param type gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
 * @returns コンパイルされたシェーダ
 */
const createShader = (
  gl: WebGLRenderingContext,
  source: string,
  type: 35632 | 35633,
): WebGLShader => {
  let shader: null | WebGLShader = null;
  switch (type) {
    case gl.VERTEX_SHADER:
      shader = gl.createShader(gl.VERTEX_SHADER);
      break;
    case gl.FRAGMENT_SHADER:
      shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  if (!shader) {
    throw new Error(`shader not created`);
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`shader compile error: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
};

const createProgram = (
  gl: WebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram => {
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
};

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
};

/*
VBOをバインドし登録する関数
*/
const setAttribute = (
  gl: WebGLRenderingContext,
  vbo: WebGLBuffer[],
  attL: number[],
  attS: number[],
) => {
  for (const [i] of vbo.entries()) {
    // バッファをバインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
    // attributeLocationを有効にする
    gl.enableVertexAttribArray(attL[i]);
    // attributeLocationを通知し登録する
    gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
  }
};

/**
IBOを生成する関数
*/
function createIbo(
  gl: WebGLRenderingContext,
  data: ArrayLike<number>,
): WebGLBuffer {
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

function createTexture(
  gl: WebGLRenderingContext,
  image: ImageBitmap | HTMLImageElement,
): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error("texture not created");
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image,
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return texture;
}