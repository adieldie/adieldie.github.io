// One dependency-free mesh and one draw call. Page content stays in the DOM.
const CAMERA = 4.9;
const FOCAL = 2.9;
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalize = a => { const length = Math.hypot(...a) || 1; return a.map(value => value / length); };
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const curve = t => {
  const radius = 1.04 + .34 * Math.cos(3 * t);
  return [radius * Math.cos(2 * t), radius * Math.sin(2 * t), .62 * Math.sin(3 * t)];
};
function makeGeometry(segments = 200, sides = 18) {
  const positions = [], normals = [], indices = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments * Math.PI * 2, point = curve(t), next = curve(t + .001);
    const tangent = normalize(next.map((value, j) => value - point[j]));
    const normal = normalize(cross(tangent, [0, 0, 1])), binormal = normalize(cross(tangent, normal));
    for (let j = 0; j <= sides; j++) {
      const angle = j / sides * Math.PI * 2;
      const faceNormal = normal.map((value, k) => value * Math.cos(angle) + binormal[k] * Math.sin(angle));
      positions.push(...point.map((value, k) => value + faceNormal[k] * .23));
      normals.push(...faceNormal);
      if (i < segments && j < sides) {
        const k = i * (sides + 1) + j;
        indices.push(k, k + sides + 1, k + 1, k + 1, k + sides + 1, k + sides + 2);
      }
    }
  }
  return { positions, normals, indices, segments, sides };
}

// Static, depth-sorted SVG uses the same volume when a GPU is unavailable.
// It is generated only on fallback, never on an animation frame.
function showFallback(wrapper, geometry, time, pointer) {
  const svg = wrapper.querySelector('.sculpture-fallback');
  if (!svg) return;
  const rotate = vector => {
    const ay = .5 + time * .18 + pointer[0] * .24, ax = .54 + pointer[1] * .18;
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    const cz = Math.cos(.32), sz = Math.sin(.32);
    const x = cy * vector[0] + sy * vector[2], z = -sy * vector[0] + cy * vector[2];
    const y = cx * vector[1] - sx * z, depth = sx * vector[1] + cx * z;
    return [cz * x - sz * y, sz * x + cz * y, depth];
  };
  const positions = [], normals = [];
  for (let i = 0; i < geometry.positions.length; i += 3) {
    positions.push(rotate(geometry.positions.slice(i, i + 3)));
    normals.push(rotate(geometry.normals.slice(i, i + 3)));
  }
  const key = normalize([-.65, .85, 1.1]), fill = normalize([.8, -.35, .55]);
  const shade = (normal, point) => {
    const n = normalize(normal), view = normalize([-point[0], -point[1], CAMERA - point[2]]);
    const diffuse = Math.max(dot(n, key), 0), side = Math.max(dot(n, fill), 0);
    const half = normalize(key.map((value, i) => value + view[i]));
    const reflected = Math.max(dot(n, half), 0);
    const shine = Math.pow(reflected, 74), sheen = Math.pow(reflected, 12);
    const rim = Math.pow(1 - Math.max(dot(n, view), 0), 3);
    const edge = .35 + .65 * Math.max(dot(n, normalize([.7, .3, -.3])), 0);
    const depth = .69 + .31 * Math.max(0, Math.min(1, (point[2] + 1.3) / 2.6));
    const base = [.014, .06, .041], body = [.075, .53, .285], fillColor = [.014, .15, .135];
    const highlight = [.72, 1, .85], broad = [.05, .18, .115], glow = [.12, 1, .64];
    return base.map((value, i) => Math.round(255 * Math.pow(Math.min(1,
      (value + body[i] * diffuse + fillColor[i] * side + broad[i] * sheen + highlight[i] * shine * .9 + glow[i] * rim * edge * .8) * depth
    ), .88)));
  };
  const faces = [], gradients = [], stride = geometry.sides + 1;
  const project = point => {
    const scale = 250 * FOCAL / (CAMERA - point[2]);
    return [250 + point[0] * scale, 250 - point[1] * scale];
  };
  const average = (values, ids) => [0, 1, 2].map(axis => ids.reduce((sum, id) => sum + values[id][axis], 0) / ids.length);
  const rgb = (normal, point) => `rgb(${shade(normal, point).join(',')})`;
  // Skip alternate longitudinal rings, keeping just the visible half of ~1,800 quads.
  for (let i = 0; i < geometry.segments; i += 2) {
    for (let j = 0; j < geometry.sides; j++) {
      const k = i * stride + j, ids = [k, k + 2 * stride, k + 2 * stride + 1, k + 1];
      const point = average(positions, ids), normal = average(normals, ids);
      if (dot(normal, [-point[0], -point[1], CAMERA - point[2]]) <= 0) continue;
      const points = ids.map(id => project(positions[id]).map(value => value.toFixed(2)).join(',')).join(' ');
      const startIds = ids.slice(0, 2), endIds = ids.slice(2);
      const start = average(positions, startIds), end = average(positions, endIds);
      const [x1, y1] = project(start), [x2, y2] = project(end), id = `sculpture-face-${faces.length}`;
      // Interpolating the radial light avoids a flat, visibly faceted fallback tube.
      gradients.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"><stop stop-color="${rgb(average(normals, startIds), start)}"/><stop offset=".5" stop-color="${rgb(normal, point)}"/><stop offset="1" stop-color="${rgb(average(normals, endIds), end)}"/></linearGradient>`);
      faces.push({ depth: point[2], markup: `<polygon points="${points}" fill="url(#${id})" stroke="url(#${id})" stroke-width=".5" stroke-linejoin="round"/>` });
    }
  }
  faces.sort((a, b) => a.depth - b.depth);
  svg.setAttribute('viewBox', '0 0 500 500');
  svg.innerHTML = `<defs>${gradients.join('')}</defs>${faces.map(face => face.markup).join('')}`;
  svg.dataset.renderer = 'projected-mesh';
}

function createWebGLRenderer(canvas, geometry) {
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' }); } catch {}
  if (!gl) return null;
  const vertexSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform float uTime;
    uniform float uAspect;
    uniform vec2 uPointer;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      float ay = .5 + uTime * .18 + uPointer.x * .24;
      float ax = .54 + uPointer.y * .18;
      mat3 ry = mat3(cos(ay), 0., -sin(ay), 0., 1., 0., sin(ay), 0., cos(ay));
      mat3 rx = mat3(1., 0., 0., 0., cos(ax), sin(ax), 0., -sin(ax), cos(ax));
      mat3 rz = mat3(cos(.32), sin(.32), 0., -sin(.32), cos(.32), 0., 0., 0., 1.);
      mat3 rotation = rz * rx * ry;
      vec3 p = rotation * aPosition;
      vNormal = rotation * aNormal;
      vPosition = p;
      float viewZ = ${CAMERA} - p.z;
      // Perspective with near/far planes .1 / 20; depth testing resolves every crossing.
      gl_Position = vec4(p.x * ${FOCAL} / uAspect, p.y * ${FOCAL}, (20.1 / 19.9) * viewZ - (4. / 19.9), viewZ);
    }`;
  const fragmentSource = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 n = normalize(vNormal);
      vec3 key = normalize(vec3(-.65, .85, 1.1));
      vec3 view = normalize(vec3(0., 0., ${CAMERA}) - vPosition);
      float diffuse = max(dot(n, key), 0.);
      float side = max(dot(n, normalize(vec3(.8, -.35, .55))), 0.);
      float reflected = max(dot(n, normalize(key + view)), 0.);
      float shine = pow(reflected, 74.);
      float sheen = pow(reflected, 12.);
      float rim = pow(1. - max(dot(n, view), 0.), 3.);
      float edge = .35 + .65 * max(dot(n, normalize(vec3(.7, .3, -.3))), 0.);
      float depth = mix(.69, 1., clamp((vPosition.z + 1.3) / 2.6, 0., 1.));
      vec3 color = vec3(.014, .06, .041) + vec3(.075, .53, .285) * diffuse;
      color += vec3(.014, .15, .135) * side + vec3(.05, .18, .115) * sheen;
      color += vec3(.72, 1., .85) * shine * .9;
      color += vec3(.12, 1., .64) * rim * edge * .8;
      gl_FragColor = vec4(pow(clamp(color * depth, 0., 1.), vec3(.88)), 1.);
    }`;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw Error('Shader compilation failed'); }
    return shader;
  };
  let program;
  const shaders = [];
  try {
    program = gl.createProgram();
    shaders.push(compile(gl.VERTEX_SHADER, vertexSource));
    shaders.push(compile(gl.FRAGMENT_SHADER, fragmentSource));
    shaders.forEach(shader => gl.attachShader(program, shader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Shader link failed');
  } catch {
    if (program) gl.deleteProgram(program);
    return null;
  } finally {
    shaders.forEach(shader => gl.deleteShader(shader));
  }
  gl.useProgram(program); gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
  const attribute = (name, values) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
  };
  attribute('aPosition', geometry.positions); attribute('aNormal', geometry.normals);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
  const uniforms = {
    time: gl.getUniformLocation(program, 'uTime'), aspect: gl.getUniformLocation(program, 'uAspect'), pointer: gl.getUniformLocation(program, 'uPointer')
  };
  return {
    surface: canvas, type: 'webgl', interval: 30, dpr: 1.5, maxSize: Infinity,
    draw(time, pointer, width, height) {
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(uniforms.time, time); gl.uniform1f(uniforms.aspect, width / height);
      gl.uniform2f(uniforms.pointer, ...pointer);
      gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
    }
  };
}

// The CPU fallback is real rotating geometry, not a rotated image. Its smaller
// mesh, 16 fps ceiling, DPR 1 and bounded drawing buffer keep the work modest.
function createSoftwareRenderer(canvas, wrapper) {
  const surface = document.createElement('canvas');
  let context;
  try { context = surface.getContext('2d', { alpha: true }); } catch {}
  if (!context) return null;
  surface.className = 'sculpture-fallback sculpture-software';
  surface.setAttribute('aria-hidden', 'true');
  surface.dataset.renderer = 'canvas2d';
  wrapper.insertBefore(surface, canvas);
  const mesh = makeGeometry(80, 16), stride = mesh.sides + 1;
  const positions = new Float32Array(mesh.positions.length), normals = new Float32Array(mesh.normals.length);
  const projected = new Float32Array(mesh.positions.length / 3 * 2);
  const faces = [], visibleFaces = [];
  for (let i = 0; i < mesh.segments; i++) {
    for (let j = 0; j < mesh.sides; j++) {
      const k = i * stride + j;
      faces.push({ ids: [k, k + stride, k + stride + 1, k + 1], depth: 0, point: [0, 0, 0], normal: [0, 0, 0] });
    }
  }
  const key = normalize([-.65, .85, 1.1]), fill = normalize([.8, -.35, .55]), rimLight = normalize([.7, .3, -.3]);
  const shade = (normal, point) => {
    const n = normalize(normal), view = normalize([-point[0], -point[1], CAMERA - point[2]]);
    const diffuse = Math.max(dot(n, key), 0), side = Math.max(dot(n, fill), 0);
    const reflected = Math.max(dot(n, normalize([key[0] + view[0], key[1] + view[1], key[2] + view[2]])), 0);
    const shine = Math.pow(reflected, 74) * .9, sheen = Math.pow(reflected, 12);
    const rim = Math.pow(1 - Math.max(dot(n, view), 0), 3) * (.35 + .65 * Math.max(dot(n, rimLight), 0)) * .8;
    const depth = .69 + .31 * Math.max(0, Math.min(1, (point[2] + 1.3) / 2.6));
    const channel = value => Math.round(255 * Math.pow(Math.min(1, value * depth), .88));
    return `rgb(${channel(.014 + .075 * diffuse + .014 * side + .05 * sheen + .72 * shine + .12 * rim)},${channel(.06 + .53 * diffuse + .15 * side + .18 * sheen + shine + rim)},${channel(.041 + .285 * diffuse + .135 * side + .115 * sheen + .85 * shine + .64 * rim)})`;
  };
  const average = (values, a, b) => [
    (values[a * 3] + values[b * 3]) / 2,
    (values[a * 3 + 1] + values[b * 3 + 1]) / 2,
    (values[a * 3 + 2] + values[b * 3 + 2]) / 2
  ];
  return {
    surface, type: 'canvas2d', interval: 62.5, dpr: 1, maxSize: 800,
    draw(time, pointer, width, height) {
      const ay = .5 + time * .18 + pointer[0] * .24, ax = .54 + pointer[1] * .18;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      const cz = Math.cos(.32), sz = Math.sin(.32);
      const rotate = (source, destination) => {
        for (let i = 0; i < source.length; i += 3) {
          const x = cy * source[i] + sy * source[i + 2], z = -sy * source[i] + cy * source[i + 2];
          const y = cx * source[i + 1] - sx * z;
          destination[i] = cz * x - sz * y;
          destination[i + 1] = sz * x + cz * y;
          destination[i + 2] = sx * source[i + 1] + cx * z;
        }
      };
      rotate(mesh.positions, positions); rotate(mesh.normals, normals);
      for (let i = 0, p = 0; i < positions.length; i += 3, p += 2) {
        const scale = height * .5 * FOCAL / (CAMERA - positions[i + 2]);
        projected[p] = width * .5 + positions[i] * scale;
        projected[p + 1] = height * .5 - positions[i + 1] * scale;
      }
      visibleFaces.length = 0;
      for (const face of faces) {
        const [a, b, c, d] = face.ids;
        for (let axis = 0; axis < 3; axis++) {
          face.point[axis] = (positions[a * 3 + axis] + positions[b * 3 + axis] + positions[c * 3 + axis] + positions[d * 3 + axis]) * .25;
          face.normal[axis] = (normals[a * 3 + axis] + normals[b * 3 + axis] + normals[c * 3 + axis] + normals[d * 3 + axis]) * .25;
        }
        if (-face.normal[0] * face.point[0] - face.normal[1] * face.point[1] + face.normal[2] * (CAMERA - face.point[2]) <= 0) continue;
        face.depth = face.point[2]; visibleFaces.push(face);
      }
      visibleFaces.sort((a, b) => a.depth - b.depth);
      context.clearRect(0, 0, width, height);
      context.lineWidth = .55; context.lineJoin = 'round';
      for (const face of visibleFaces) {
        const [a, b, c, d] = face.ids;
        const gradient = context.createLinearGradient(
          (projected[a * 2] + projected[b * 2]) * .5, (projected[a * 2 + 1] + projected[b * 2 + 1]) * .5,
          (projected[c * 2] + projected[d * 2]) * .5, (projected[c * 2 + 1] + projected[d * 2 + 1]) * .5
        );
        gradient.addColorStop(0, shade(average(normals, a, b), average(positions, a, b)));
        gradient.addColorStop(.5, shade(face.normal, face.point));
        gradient.addColorStop(1, shade(average(normals, c, d), average(positions, c, d)));
        context.fillStyle = gradient; context.strokeStyle = gradient;
        context.beginPath(); context.moveTo(projected[a * 2], projected[a * 2 + 1]);
        context.lineTo(projected[b * 2], projected[b * 2 + 1]); context.lineTo(projected[c * 2], projected[c * 2 + 1]);
        context.lineTo(projected[d * 2], projected[d * 2 + 1]); context.closePath(); context.fill(); context.stroke();
      }
      surface.dataset.faces = String(visibleFaces.length);
    }
  };
}

export function startSculpture(canvas, button) {
  const wrapper = canvas.parentElement, media = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = media.matches, visible = true, frame = 0, time = .4, previous = 0;
  let pointer = [0, 0], target = [0, 0];
  const geometry = makeGeometry();
  const setLabel = () => {
    button.textContent = paused ? 'Ativar movimento' : 'Pausar movimento';
    button.setAttribute('aria-pressed', String(paused));
  };
  wrapper.classList.add('sculpture-neon');
  let renderer = createWebGLRenderer(canvas, geometry) || createSoftwareRenderer(canvas, wrapper);
  const setRenderer = () => {
    wrapper.classList.toggle('webgl', renderer?.type === 'webgl');
    wrapper.classList.toggle('software3d', renderer?.type === 'canvas2d');
    canvas.dataset.renderer = renderer?.type || 'svg';
    canvas.dataset.triangles = String(renderer?.type === 'webgl' ? geometry.indices.length / 3 : 2560);
    button.hidden = !renderer;
    if (!renderer) showFallback(wrapper, geometry, time, pointer);
  };
  setLabel(); setRenderer();
  if (!renderer) return;
  const draw = () => {
    if (!renderer || !visible || document.hidden) return;
    const surface = renderer.surface, rect = surface.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, renderer.dpr, renderer.maxSize / Math.max(rect.width, rect.height, 1));
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (!width || !height) return;
    if (surface.width !== width || surface.height !== height) { surface.width = width; surface.height = height; }
    renderer.draw(time, pointer, width, height);
    canvas.dataset.angle = surface.dataset.angle = (.5 + time * .18 + pointer[0] * .24).toFixed(4);
  };
  const tick = now => {
    frame = 0;
    if (paused || !visible || document.hidden || !renderer) return;
    if (now - previous >= renderer.interval) {
      time += Math.min((now - previous) / 1000, .1); previous = now;
      pointer = pointer.map((value, i) => value + (target[i] - value) * .11);
      draw();
    }
    frame = requestAnimationFrame(tick);
  };
  const schedule = () => {
    cancelAnimationFrame(frame); frame = 0; previous = performance.now();
    if (!paused && visible && !document.hidden && renderer) frame = requestAnimationFrame(tick);
    else draw();
  };
  button.addEventListener('click', () => { paused = !paused; setLabel(); schedule(); });
  media.addEventListener('change', () => { paused = media.matches; setLabel(); schedule(); });
  wrapper.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || paused) return;
    const rect = wrapper.getBoundingClientRect();
    target = [(event.clientX - rect.left) / rect.width - .5, (event.clientY - rect.top) / rect.height - .5];
  });
  wrapper.addEventListener('pointerleave', () => { target = [0, 0]; });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: 0 }).observe(canvas);
  new ResizeObserver(draw).observe(wrapper);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    if (renderer?.type !== 'webgl') return;
    cancelAnimationFrame(frame);
    renderer = createSoftwareRenderer(canvas, wrapper);
    setRenderer(); draw(); schedule();
  });
  draw(); schedule();
}
