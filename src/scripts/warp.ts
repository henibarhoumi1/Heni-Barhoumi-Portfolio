/**
 * Draws the large print on the Work strip as a photograph held in the hand:
 * the paper curls a little around its vertical axis, leans a few degrees,
 * and flexes as the row moves. Each print has its own lean (its seed), so no
 * two sit the same way. A finely divided mesh, a perspective divide and the
 * image as a texture; nothing else. Throws when WebGL is not available.
 */

export interface Print {
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
  /** How much of the large print this is, 0 to 1. Small prints lie flat. */
  g: number;
  seed: [number, number, number];
  ratio: number;
}

export interface Warp {
  /** True once the image has a texture. */
  ready(img: HTMLImageElement): boolean;
  draw(prints: Print[], width: number, height: number, flex: number): void;
  resize(): void;
}

const VERT = `
attribute vec2 a_uv;
uniform vec4 u_rect;
uniform vec2 u_view;
uniform vec4 u_bend;
varying vec2 v_uv;
void main() {
  vec2 c = u_rect.xy + u_rect.zw * 0.5;
  float w = u_rect.z;
  vec3 p = vec3((a_uv - 0.5) * u_rect.zw, 0.0);
  float u = a_uv.x * 2.0 - 1.0;
  float v = a_uv.y * 2.0 - 1.0;
  // Curl around the vertical axis, a softer one along the other, and the flex of movement.
  p.z += u_bend.z * w * (u * u - 0.33);
  p.z += u_bend.z * 0.35 * w * (v * v - 0.33) * sign(u_bend.z);
  p.z += u_bend.w * w * sin(a_uv.x * 3.14159 + a_uv.y * 0.8);
  float cy = cos(u_bend.x), sy = sin(u_bend.x);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cx = cos(u_bend.y), sx = sin(u_bend.y);
  p = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);
  float d = u_view.y * 1.6;
  vec2 s = c + p.xy * (d / (d - p.z));
  gl_Position = vec4(s.x / u_view.x * 2.0 - 1.0, 1.0 - s.y / u_view.y * 2.0, 0.0, 1.0);
  v_uv = a_uv;
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec4 u_cover;
varying vec2 v_uv;
void main() {
  gl_FragColor = texture2D(u_tex, v_uv * u_cover.xy + u_cover.zw);
}`;

const GRID = 28;

export function createWarp(stage: HTMLElement, onTexture: () => void): Warp {
  const canvas = document.createElement('canvas');
  canvas.className = 'stage__gl';
  canvas.setAttribute('aria-hidden', 'true');
  const opts: WebGLContextAttributes = { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' };
  const gl2 = canvas.getContext('webgl2', opts);
  const gl = (gl2 ?? canvas.getContext('webgl', opts)) as WebGLRenderingContext | null;
  if (!gl) throw new Error('no webgl');

  const shader = (type: number, src: string) => {
    const s = gl.createShader(type) as WebGLShader;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link');
  gl.useProgram(program);

  // A grid of points across the print, and the triangles between them.
  const uv: number[] = [];
  for (let y = 0; y <= GRID; y++) for (let x = 0; x <= GRID; x++) uv.push(x / GRID, y / GRID);
  const index: number[] = [];
  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++) {
      const a = y * (GRID + 1) + x;
      index.push(a, a + 1, a + GRID + 1, a + 1, a + GRID + 2, a + GRID + 1);
    }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'a_uv');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const uRect = u('u_rect');
  const uView = u('u_view');
  const uBend = u('u_bend');
  const uCover = u('u_cover');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const textures = new Map<HTMLImageElement, { tex: WebGLTexture; src: string }>();
  const upload = (img: HTMLImageElement) => {
    if (!img.complete || img.naturalWidth === 0) return false;
    const have = textures.get(img);
    if (have && have.src === img.currentSrc) return true;
    const tex = have?.tex ?? (gl.createTexture() as WebGLTexture);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    } catch {
      return false;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (gl2) {
      gl2.generateMipmap(gl2.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    textures.set(img, { tex, src: img.currentSrc });
    return true;
  };
  const watched = new WeakSet<HTMLImageElement>();
  const watch = (img: HTMLImageElement) => {
    if (watched.has(img)) return;
    watched.add(img);
    // A sharper file arriving replaces the texture.
    img.addEventListener('load', () => onTexture());
  };

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(stage.clientWidth * dpr);
    canvas.height = Math.round(stage.clientHeight * dpr);
  };
  resize();
  stage.append(canvas);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stage.classList.remove('is-gl');
  });

  return {
    ready(img) {
      watch(img);
      return upload(img);
    },
    draw(prints, width, height, flex) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uView, width, height);
      for (const p of prints) {
        const t = textures.get(p.img);
        if (!t) continue;
        const [a, b, c] = p.seed;
        const g = p.g;
        const lean = (a - 0.5) * 0.24 * g;
        const tilt = (b - 0.5) * 0.12 * g;
        const curl = (c > 0.5 ? 1 : -1) * (0.035 + Math.abs(c - 0.5) * 0.06) * g;
        gl.uniform4f(uRect, p.x, p.y, p.w, p.h);
        gl.uniform4f(uBend, lean, tilt, curl, flex * g);
        // Object-fit: cover, so a print changing shape never stretches.
        const rect = p.w / p.h;
        const img = p.ratio;
        if (img > rect) gl.uniform4f(uCover, rect / img, 1, (1 - rect / img) / 2, 0);
        else gl.uniform4f(uCover, 1, img / rect, 0, (1 - img / rect) / 2);
        gl.bindTexture(gl.TEXTURE_2D, t.tex);
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
      }
    },
    resize,
  };
}
