// Original automation station, drawn from one compact mesh with no dependencies.
const CAMERA = 5.2, FOCAL = 2.85;
const normalize = a => { const length = Math.hypot(...a) || 1; return a.map(value => value / length); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const subtract = (a, b) => a.map((value, i) => value - b[i]);
const palette = {
  base: [.075, .115, .17, .03], edge: [.09, .22, .29, .05], panel: [.09, .14, .23, .07],
  violet: [.36, .15, .72, .20], cyan: [.02, .78, .86, .42], mint: [.04, .94, .65, .40],
  white: [.66, .84, .91, .22], trace: [.035, .39, .49, .22]
};

function makeGeometry() {
  const positions = [], normals = [], materials = [], indices = [], faces = [];
  let layer = 0;
  const face = (points, material, explicitNormal) => {
    const normal = explicitNormal || normalize(cross(subtract(points[1], points[0]), subtract(points[2], points[0])));
    const ids = points.map(point => {
      const id = positions.length / 3;
      positions.push(...point); normals.push(...normal); materials.push(...material); return id;
    });
    for (let i = 1; i < ids.length - 1; i++) indices.push(ids[0], ids[i], ids[i + 1]);
    faces.push({ ids, normal, material, layer, center: [0, 1, 2].map(axis => points.reduce((sum, point) => sum + point[axis], 0) / points.length) });
  };
  const box = (x, y, z, width, height, depth, material) => {
    const a = x - width / 2, b = x + width / 2, c = y - height / 2, d = y + height / 2, e = z - depth / 2, f = z + depth / 2;
    const p = [[a,c,e],[b,c,e],[b,d,e],[a,d,e],[a,c,f],[b,c,f],[b,d,f],[a,d,f]];
    for (const ids of [[4,5,6,7],[3,2,1,0],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]]) face(ids.map(i => p[i]), material);
  };
  const beveledBase = () => {
    const outline = [[-1.45,-.73], [1.45,-.73], [1.55,-.63], [1.55,.63], [1.45,.73], [-1.45,.73], [-1.55,.63], [-1.55,-.63]];
    const lower = outline.map(([x,y]) => [x,y,-.36]), outer = outline.map(([x,y]) => [x,y,-.22]);
    const inner = outline.map(([x,y]) => [x*.97,y*.92,-.17]);
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      face([lower[i], lower[j], outer[j], outer[i]], palette.base);
      face([outer[i], outer[j], inner[j], inner[i]], palette.edge);
      face([[0,0,-.17],inner[i],inner[j]], palette.base, [0,0,1]);
      face([[0,0,-.36],lower[j],lower[i]], palette.base, [0,0,-1]);
    }
  };
  const tube = (from, to, radius, material) => {
    const axis = normalize(subtract(to, from)), u = normalize(cross(axis, [0,0,1])), v = normalize(cross(axis, u));
    const rings = [from, to].map(center => Array.from({length:8}, (_, i) => {
      const angle = i / 8 * Math.PI * 2;
      return center.map((value, k) => value + radius * (u[k] * Math.cos(angle) + v[k] * Math.sin(angle)));
    }));
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      const normal = normalize(subtract(rings[0][i].map((value, k) => (value + rings[0][j][k]) / 2), from));
      face([rings[0][i], rings[1][i], rings[1][j], rings[0][j]], material, normal);
    }
    face(rings[0].slice().reverse(), material, axis.map(value => -value));
    face(rings[1], material, axis);
  };
  const arrow = (x, y, z) => {
    face([[x-.075,y-.075,z],[x+.09,y,z],[x-.075,y+.075,z]], palette.white, [0,0,1]);
  };
  beveledBase();
  layer = 1;
  // Raised, solid signal paths connect the three stages from left to right.
  tube([-.76,.02,.015],[-.33,.02,.015],.048,palette.cyan);
  tube([.33,.02,.015],[.76,.02,.015],.048,palette.mint);
  arrow(-.55,.02,.069); arrow(.54,.02,.069);
  for (const x of [-.58,.58]) {
    box(x,-.35,-.155,.032,.41,.018,palette.trace);
    box(x*.62,-.54,-.155,.43,.024,.018,palette.trace);
  }
  // Input: three stacked data sheets, with raised rows and a status indicator.
  layer = 2;
  for (let i = 0; i < 3; i++) box(-1.02-i*.035,.08+i*.04,-.045+i*.072,.61,.82,.055,i===2?palette.panel:palette.violet);
  layer = 3;
  box(-1.09,.42,.147,.42,.06,.026,palette.violet);
  box(-1.24,.29,.148,.065,.065,.028,palette.cyan);
  for (const [y,width] of [[.16,.37],[.035,.29],[-.09,.35]]) box(-1.055,y,.145,width,.043,.027,palette.white);
  // Processing: a raised chip with visible pins, inset core and circuit traces.
  layer = 2;
  box(0,.02,-.015,.67,.64,.22,palette.edge);
  layer = 3;
  box(0,.02,.116,.52,.49,.065,palette.panel);
  layer = 4;
  box(0,.02,.16,.31,.28,.045,palette.cyan);
  layer = 2;
  for (const offset of [-.21,-.07,.07,.21]) {
    box(offset,.39,.005,.06,.15,.06,palette.white);
    box(offset,-.35,.005,.06,.15,.06,palette.white);
    box(-.405,offset+.02,.005,.15,.055,.06,palette.violet);
    box(.405,offset+.02,.005,.15,.055,.06,palette.mint);
  }
  layer = 5;
  box(-.055,.025,.191,.025,.16,.019,palette.white);
  box(.005,-.043,.191,.145,.025,.019,palette.white);
  box(.065,.00,.191,.025,.10,.019,palette.white);
  box(-.055,.10,.191,.048,.048,.024,palette.mint);
  // Output: a volumetric dashboard with three distinct bar heights.
  layer = 2;
  box(1.035,.085,-.005,.64,.86,.14,palette.panel);
  layer = 3;
  box(1.035,.415,.081,.45,.047,.03,palette.cyan);
  box(1.035,-.245,.082,.45,.025,.032,palette.white);
  for (const [x,height,material] of [[.865,.19,palette.violet],[1.035,.32,palette.cyan],[1.205,.45,palette.mint]]) {
    box(x,-.20+height/2,.111,.09,height,.085,material);
  }
  // Front-edge indicators and corner mounts make the floating platform tangible.
  layer = 1;
  for (const x of [-1.30,-1.17,-1.04]) box(x,-.64,-.154,.058,.03,.023,palette.mint);
  for (const x of [-1.42,1.42]) for (const y of [-.58,.58]) box(x,y,-.142,.058,.058,.052,palette.edge);
  return {positions,normals,materials,indices,faces};
}

function rotationFor(time, pointer) {
  const ay = .22 + Math.sin(time * .35) * .22 + pointer[0] * .24;
  const ax = .48 + Math.sin(time * .27) * .055 + pointer[1] * .18;
  const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax), cz = Math.cos(-.10), sz = Math.sin(-.10);
  return vector => {
    const x = cy*vector[0]+sy*vector[2], z = -sy*vector[0]+cy*vector[2], y = cx*vector[1]-sx*z;
    return [cz*x-sz*y,sz*x+cz*y,sx*vector[1]+cx*z];
  };
}
const keyLight = normalize([-.65,.85,1.1]), fillLight = normalize([.85,-.25,.35]), rimLight = normalize([.7,.3,-.3]);
function shade(normal, point, material) {
  const n = normalize(normal), view = normalize([-point[0],-point[1],CAMERA-point[2]]);
  const diffuse = Math.max(dot(n,keyLight),0), side = Math.pow(Math.max(dot(n,fillLight),0),3)*(1-diffuse*.7);
  const reflected = Math.max(dot(n,normalize(keyLight.map((value,i)=>value+view[i]))),0);
  const shine = Math.pow(reflected,74)*.72, sheen = Math.pow(reflected,12)*(.15+material[3]);
  const rim = Math.pow(1-Math.max(dot(n,view),0),3)*(.35+.65*Math.max(dot(n,rimLight),0))*.35;
  const depth = .77+.23*Math.max(0,Math.min(1,(point[2]+1.3)/2.6));
  const intensity = .12+diffuse*.72+material[3];
  const color = material.slice(0,3).map((value,i)=>value*intensity+[.17,.018,.32][i]*side*.55+[.04,.20,.18][i]*sheen+[.70,1,.97][i]*shine+[.04,.72,.84][i]*rim);
  return `rgb(${color.map(value=>Math.round(255*Math.pow(Math.min(1,value*depth),.88))).join(',')})`;
}
function projectMesh(geometry,time,pointer,width,height) {
  const rotate = rotationFor(time,pointer), projected = [];
  for(let i=0;i<geometry.positions.length;i+=3) {
    const point=rotate(geometry.positions.slice(i,i+3)), scale=Math.min(width,height)*.5*FOCAL/(CAMERA-point[2]);
    projected.push([width*.5+point[0]*scale,height*.5-point[1]*scale]);
  }
  const faces=[];
  for(const face of geometry.faces) {
    const point=rotate(face.center), normal=rotate(face.normal);
    if(dot(normal,[-point[0],-point[1],CAMERA-point[2]])<=0) continue;
    faces.push({ids:face.ids,layer:face.layer,depth:point[2],color:shade(normal,point,face.material)});
  }
  // The platform, components and raised markings are disjoint surface layers.
  // Draw those in physical stack order, then depth-sort their individual faces.
  faces.sort((a,b)=>a.layer-b.layer||a.depth-b.depth);
  return {projected,faces};
}
function showFallback(wrapper,geometry,time,pointer) {
  const svg=wrapper.querySelector('svg.sculpture-fallback');
  if(!svg)return;
  const {projected,faces}=projectMesh(geometry,time,pointer,500,500);
  svg.setAttribute('viewBox','0 0 500 500');
  svg.innerHTML=faces.map(face=>`<polygon points="${face.ids.map(id=>projected[id].map(value=>value.toFixed(2)).join(',')).join(' ')}" fill="${face.color}" stroke="${face.color}" stroke-width=".45" stroke-linejoin="round"/>`).join('');
  svg.dataset.renderer='projected-mesh';
}

function createWebGLRenderer(canvas,geometry) {
  let gl;
  try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});}catch{}
  if(!gl)return null;
  const vertexSource=`
    attribute vec3 aPosition; attribute vec3 aNormal; attribute vec4 aMaterial;
    uniform float uTime; uniform float uAspect; uniform vec2 uPointer;
    varying vec3 vNormal; varying vec3 vPosition; varying vec4 vMaterial;
    void main(){
      float ay=.22+sin(uTime*.35)*.22+uPointer.x*.24;
      float ax=.48+sin(uTime*.27)*.055+uPointer.y*.18;
      mat3 ry=mat3(cos(ay),0.,-sin(ay),0.,1.,0.,sin(ay),0.,cos(ay));
      mat3 rx=mat3(1.,0.,0.,0.,cos(ax),sin(ax),0.,-sin(ax),cos(ax));
      mat3 rz=mat3(cos(-.10),sin(-.10),0.,-sin(-.10),cos(-.10),0.,0.,0.,1.);
      mat3 rotation=rz*rx*ry;vec3 p=rotation*aPosition;
      vNormal=rotation*aNormal;vPosition=p;vMaterial=aMaterial;
      float viewZ=${CAMERA}-p.z;
      float focal=${FOCAL}*min(1.,uAspect);
      gl_Position=vec4(p.x*focal/uAspect,p.y*focal,(20.1/19.9)*viewZ-(4./19.9),viewZ);
    }`;
  const fragmentSource=`
    precision mediump float; varying vec3 vNormal; varying vec3 vPosition; varying vec4 vMaterial;
    void main(){
      vec3 n=normalize(vNormal),key=normalize(vec3(-.65,.85,1.1)),view=normalize(vec3(0.,0.,${CAMERA})-vPosition);
      float diffuse=max(dot(n,key),0.);
      float side=pow(max(dot(n,normalize(vec3(.85,-.25,.35))),0.),3.)*(1.-diffuse*.7);
      float reflected=max(dot(n,normalize(key+view)),0.);
      float shine=pow(reflected,74.)*.72,sheen=pow(reflected,12.)*(.15+vMaterial.a);
      float rim=pow(1.-max(dot(n,view),0.),3.)*(.35+.65*max(dot(n,normalize(vec3(.7,.3,-.3))),0.))*.35;
      float depth=mix(.77,1.,clamp((vPosition.z+1.3)/2.6,0.,1.));
      vec3 color=vMaterial.rgb*(.12+diffuse*.72+vMaterial.a);
      color+=vec3(.17,.018,.32)*side*.55+vec3(.04,.20,.18)*sheen;
      color+=vec3(.70,1.,.97)*shine+vec3(.04,.72,.84)*rim;
      gl_FragColor=vec4(pow(clamp(color*depth,0.,1.),vec3(.88)),1.);
    }`;
  const compile=(type,source)=>{
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('Shader compilation failed');}return shader;
  };
  let program;const shaders=[];
  try{program=gl.createProgram();shaders.push(compile(gl.VERTEX_SHADER,vertexSource));shaders.push(compile(gl.FRAGMENT_SHADER,fragmentSource));shaders.forEach(shader=>gl.attachShader(program,shader));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link failed');}
  catch{if(program)gl.deleteProgram(program);return null;}
  finally{shaders.forEach(shader=>gl.deleteShader(shader));}
  gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  const attribute=(name,values,size=3)=>{
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);
    const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0);
  };
  attribute('aPosition',geometry.positions);attribute('aNormal',geometry.normals);attribute('aMaterial',geometry.materials,4);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(geometry.indices),gl.STATIC_DRAW);
  const uniforms={time:gl.getUniformLocation(program,'uTime'),aspect:gl.getUniformLocation(program,'uAspect'),pointer:gl.getUniformLocation(program,'uPointer')};
  return {surface:canvas,type:'webgl',interval:30,dpr:1.5,maxSize:Infinity,draw(time,pointer,width,height){
    gl.viewport(0,0,width,height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(uniforms.time,time);gl.uniform1f(uniforms.aspect,width/height);gl.uniform2f(uniforms.pointer,...pointer);
    gl.drawElements(gl.TRIANGLES,geometry.indices.length,gl.UNSIGNED_SHORT,0);
  }};
}
function createSoftwareRenderer(canvas,wrapper,geometry) {
  const surface=document.createElement('canvas');let context;
  try{context=surface.getContext('2d',{alpha:true});}catch{}
  if(!context)return null;
  surface.className='sculpture-fallback sculpture-software';surface.setAttribute('aria-hidden','true');surface.dataset.renderer='canvas2d';wrapper.insertBefore(surface,canvas);
  return {surface,type:'canvas2d',interval:62.5,dpr:1,maxSize:800,draw(time,pointer,width,height){
    const {projected,faces}=projectMesh(geometry,time,pointer,width,height);
    context.clearRect(0,0,width,height);context.lineWidth=.5;context.lineJoin='round';
    for(const face of faces){
      context.fillStyle=face.color;context.strokeStyle=face.color;context.beginPath();
      face.ids.forEach((id,i)=>{const p=projected[id];if(i===0)context.moveTo(...p);else context.lineTo(...p);});
      context.closePath();context.fill();context.stroke();
    }
    surface.dataset.faces=String(faces.length);
  }};
}

export function startSculpture(canvas,button) {
  const wrapper=canvas.parentElement,media=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=media.matches,visible=true,frame=0,time=.4,previous=0,pointer=[0,0],target=[0,0];
  const geometry=makeGeometry();
  const setLabel=()=>{button.textContent=paused?'Ativar movimento':'Pausar movimento';button.setAttribute('aria-pressed',String(paused));};
  wrapper.classList.add('sculpture-neon');
  let renderer=createWebGLRenderer(canvas,geometry)||createSoftwareRenderer(canvas,wrapper,geometry);
  const setRenderer=()=>{
    wrapper.classList.toggle('webgl',renderer?.type==='webgl');wrapper.classList.toggle('software3d',renderer?.type==='canvas2d');
    canvas.dataset.renderer=renderer?.type||'svg';canvas.dataset.triangles=String(geometry.indices.length/3);canvas.dataset.scene='automation-station';
    button.hidden=!renderer;if(!renderer)showFallback(wrapper,geometry,time,pointer);
  };
  setLabel();setRenderer();if(!renderer)return;
  const draw=()=>{
    if(!renderer||!visible||document.hidden)return;
    const surface=renderer.surface,rect=surface.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,renderer.dpr,renderer.maxSize/Math.max(rect.width,rect.height,1));
    const width=Math.round(rect.width*dpr),height=Math.round(rect.height*dpr);if(!width||!height)return;
    if(surface.width!==width||surface.height!==height){surface.width=width;surface.height=height;}
    renderer.draw(time,pointer,width,height);
    canvas.dataset.angle=surface.dataset.angle=(.22+Math.sin(time*.35)*.22+pointer[0]*.24).toFixed(4);
  };
  const tick=now=>{
    frame=0;if(paused||!visible||document.hidden||!renderer)return;
    if(now-previous>=renderer.interval){time+=Math.min((now-previous)/1000,.1);previous=now;pointer=pointer.map((value,i)=>value+(target[i]-value)*.11);draw();}
    frame=requestAnimationFrame(tick);
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=0;previous=performance.now();if(!paused&&visible&&!document.hidden&&renderer)frame=requestAnimationFrame(tick);else draw();};
  button.addEventListener('click',()=>{paused=!paused;setLabel();schedule();});
  media.addEventListener('change',()=>{paused=media.matches;setLabel();schedule();});
  wrapper.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||paused)return;const rect=wrapper.getBoundingClientRect();target=[(event.clientX-rect.left)/rect.width-.5,(event.clientY-rect.top)/rect.height-.5];});
  wrapper.addEventListener('pointerleave',()=>{target=[0,0];});
  document.addEventListener('visibilitychange',schedule);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:0}).observe(canvas);
  new ResizeObserver(draw).observe(wrapper);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(renderer?.type!=='webgl')return;cancelAnimationFrame(frame);renderer=createSoftwareRenderer(canvas,wrapper,geometry);setRenderer();draw();schedule();});
  draw();schedule();
}
