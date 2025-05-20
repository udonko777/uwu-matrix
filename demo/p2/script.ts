const getCanvas = (): HTMLCanvasElement => {
  const c = document.getElementById('canvas') as HTMLCanvasElement | null;
  if (!c) {
    throw new Error(`canvas not found`)
  }
  return c;
}

const c = getCanvas()

c.width = 500;
c.height = 300;

const gl: WebGLRenderingContext | null = c.getContext('webgl');
if (!gl) {
  throw new Error(`webGL not supported`)
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);