// Small, dependency-free WebGL sculpture. Geometry is decorative; content stays in the DOM.
export function startSculpture(canvas, button) {
  const wrapper = canvas.parentElement;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = media.matches, visible = true, frame = 0, time = .4, previous = 0, lost = false;
  let gl;
  try { gl = canvas.getContext('webgl', {alpha: true, antialias: true, powerPreference: 'low-power'}); } catch {}
  const setLabel = () => { button.textContent = paused ? 'Ativar movimento ↻' : 'Pausar movimento Ⅱ'; button.setAttribute('aria-pressed', String(paused)); };
  setLabel();
  if (!gl) { button.hidden = true; return; }
  const vertexSource = `attribute vec3 aPosition; attribute vec3 aNormal; uniform float uTime; uniform float uAspect; uniform vec2 uPointer; varying vec3 vNormal; varying vec3 vPosition;
  void main(){float ay=uTime*.20+uPointer.x*.18;float ax=.43+uPointer.y*.14;mat3 ry=mat3(cos(ay),0.,-sin(ay),0.,1.,0.,sin(ay),0.,cos(ay));mat3 rx=mat3(1.,0.,0.,0.,cos(ax),sin(ax),0.,-sin(ax),cos(ax));mat3 rz=mat3(.90,.435,0.,-.435,.90,0.,0.,0.,1.);mat3 r=rz*rx*ry;vec3 p=r*aPosition;vNormal=r*aNormal;vPosition=p;float z=5.6-p.z;gl_Position=vec4(p.x*3.4/uAspect,p.y*3.4,((z-1.)/9.)*z,z);}`;
  const fragmentSource = `precision mediump float;varying vec3 vNormal;varying vec3 vPosition;void main(){vec3 n=normalize(vNormal);vec3 l=normalize(vec3(-.5,.8,1.));vec3 v=normalize(vec3(0.,0.,5.)-vPosition);float diffuse=max(dot(n,l),0.);float shine=pow(max(dot(n,normalize(l+v)),0.),46.);float rim=pow(1.-max(dot(n,v),0.),2.5);vec3 c=vec3(.075,.22,.18)+vec3(.38,.65,.51)*diffuse+vec3(.7,.95,.81)*shine*.85+vec3(.13,.34,.27)*rim;gl_FragColor=vec4(c,1.);}`;
  const compile = (type, source) => {const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader compilation failed');return shader;};
  let program;
  try {program=gl.createProgram();const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link failed');} catch {button.hidden=true;return;}
  gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>{const l=Math.hypot(...a);return a.map(x=>x/l);};
  const curve=t=>{const r=1.04+.34*Math.cos(3*t);return [r*Math.cos(2*t),r*Math.sin(2*t),.39*Math.sin(3*t)];};
  const positions=[], normals=[], indices=[], segments=200, sides=18;
  for(let i=0;i<=segments;i++){const t=i/segments*Math.PI*2,p=curve(t),next=curve(t+.001),tangent=norm(next.map((v,j)=>v-p[j])),n=norm(cross(tangent,[0,0,1])),b=norm(cross(tangent,n));for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,normal=n.map((v,k)=>v*Math.cos(a)+b[k]*Math.sin(a));positions.push(...p.map((v,k)=>v+normal[k]*.205));normals.push(...normal);if(i<segments&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}}}
  const attribute=(name,values)=>{const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);};
  attribute('aPosition',positions);attribute('aNormal',normals);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  const uniforms={time:gl.getUniformLocation(program,'uTime'),aspect:gl.getUniformLocation(program,'uAspect'),pointer:gl.getUniformLocation(program,'uPointer')};
  let pointer=[0,0],target=[0,0];
  const draw=()=>{if(lost)return;const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(uniforms.time,time);gl.uniform1f(uniforms.aspect,w/Math.max(h,1));gl.uniform2f(uniforms.pointer,...pointer);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);};
  const tick=now=>{frame=0;if(paused||!visible||document.hidden||lost)return;if(now-previous>30){time+=Math.min((now-previous)/1000,.05);previous=now;pointer=pointer.map((v,i)=>v+(target[i]-v)*.07);draw();}frame=requestAnimationFrame(tick);};
  const schedule=()=>{cancelAnimationFrame(frame);frame=0;previous=performance.now();if(!paused&&visible&&!document.hidden&&!lost)frame=requestAnimationFrame(tick);else draw();};
  button.addEventListener('click',()=>{paused=!paused;setLabel();schedule();});
  media.addEventListener('change',()=>{paused=media.matches;setLabel();schedule();});
  wrapper.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||paused)return;const r=wrapper.getBoundingClientRect();target=[(e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5];});
  wrapper.addEventListener('pointerleave',()=>{target=[0,0];});
  document.addEventListener('visibilitychange',schedule);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:0}).observe(canvas);
  new ResizeObserver(()=>draw()).observe(canvas);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);wrapper.classList.remove('webgl');button.hidden=true;});
  // A context loss keeps the lightweight static illustration rather than risking a restart loop.
  wrapper.classList.add('webgl');canvas.dataset.renderer='webgl';canvas.dataset.triangles=String(indices.length/3);draw();schedule();
}
