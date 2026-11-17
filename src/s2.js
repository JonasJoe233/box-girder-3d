// ===== s2: 箱梁、钢筋笼、预应力、模板、布料机、养护棚 =====
const BL=31.6;
const OUT=[[-6,3],[6,3],[6,2.72],[3.25,2.45],[2.75,0],[-2.75,0],[-3.25,2.45],[-6,2.72]];
const HOLE=[[-2.45,2.62],[2.45,2.62],[2.05,.32],[-2.05,.32]];
function sectionShape(){const s=new THREE.Shape();OUT.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();
 const h=new THREE.Path();HOLE.forEach((p,i)=>i?h.lineTo(p[0],p[1]):h.moveTo(p[0],p[1]));h.closePath();s.holes.push(h);return s;}
function beamGeo(steps){const g=new THREE.ExtrudeGeometry(sectionShape(),{depth:BL,steps:steps||1,bevelEnabled:false});
 g.rotateY(Math.PI/2);g.translate(-BL/2,0,0);g.computeVertexNormals();return g;}
function makeBeam(m,steps){const o=new THREE.Mesh(beamGeo(steps),m);o.castShadow=o.receiveShadow=true;return o;}
// 已架好的梁和存梁区里的梁
const OLDGEO=beamGeo(1);
function oldBeam(x,y,z){const o=new THREE.Mesh(OLDGEO,MAT.old);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);tag(o,'oldbeam');return o;}
oldBeam(BC(0),BEAMY,0);oldBeam(BC(1),BEAMY,0);
oldBeam(-15,.8,12);oldBeam(20,.8,12);
[-14.6,14.6].forEach(dx=>tag(box(2,.6,7,MAT.bed,20+dx,.8+3+.3,12),'store'));oldBeam(20,.8+3+.6,12);

// ---- 主角：这一孔梁 ----
const beamG=grp(-60,.5,0);
const beamMat=mat(0xd8d4cc,{transparent:true,opacity:1});
const beam=makeBeam(beamMat,24);beamG.add(beam);tag(beam,'beam');
const BASE=beam.geometry.attributes.position.array.slice();
function setCamber(c){const a=beam.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){const u=BASE[i]/(BL/2);a[i+1]=BASE[i+1]+c*(1-u*u);}
 beam.geometry.attributes.position.needsUpdate=true;beam.geometry.computeBoundingSphere();}
// 预应力管道走向：腹板里是抛物线，底板里是直线
function tendonCurves(){const C=[];
 [-1,1].forEach(s=>[0,.32].forEach(o=>{const pts=[];for(let i=0;i<=16;i++){const x=-BL/2+.2+i*(BL-.4)/16,u=x/(BL/2);const y=.45+o+(1.7-o)*u*u;pts.push(new THREE.Vector3(x,y,s*(2.5+.22*y/2.6)));}C.push(new THREE.CatmullRomCurve3(pts));}));
 [-1.6,-.8,.8,1.6].forEach(z=>C.push(new THREE.LineCurve3(new THREE.Vector3(-BL/2+.2,.17,z),new THREE.Vector3(BL/2-.2,.17,z))));return C;}
const TC=tendonCurves();
const tendonMat=new THREE.MeshBasicMaterial({color:0x8a8a8a});
const tendons=grp(0,0,0,beamG);TC.forEach(c=>tendons.add(new THREE.Mesh(new THREE.TubeGeometry(c,40,.07,6,false),tendonMat)));
// 千斤顶：张拉时挂在梁端
const jacks=grp(0,0,0,beamG);
[-1,1].forEach(e=>[-1,1].forEach(s=>{const j=cyl(.32,1.3,MAT.orange,e*(BL/2+.65),2.0,s*2.62,jacks,'x');j.userData.e=e;cyl(.12,.9,MAT.steel,e*(BL/2+1.55),2.0,s*2.62,jacks,'x');}));
tag(jacks,'jack');

// ---- 钢筋笼（线框）+ 管道 ----
function cageGeo(){const v=[];const sh=(p,k)=>[p[0]*k,1.5+(p[1]-1.5)*k];
 const rings=[OUT.map(p=>sh(p,.94)),HOLE.map(p=>sh(p,1.08))];
 const longi=[];rings.forEach(r=>r.forEach((p,i)=>{const q=r[(i+1)%r.length];for(let k=0;k<3;k++){const t=k/3;longi.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}));
 longi.forEach(p=>v.push(-BL/2,p[1],p[0],BL/2,p[1],p[0]));
 const nL=v.length/3;
 for(let x=-BL/2;x<=BL/2+1e-6;x+=.5)rings.forEach(r=>r.forEach((p,i)=>{const q=r[(i+1)%r.length];v.push(x,p[1],p[0],x,q[1],q[0]);}));
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.userData.nL=nL;return g;}
const cageG=grp(-60,.55,12);
const cage=new THREE.LineSegments(cageGeo(),new THREE.LineBasicMaterial({color:0x5a4a3c}));cageG.add(cage);
const ductMat=new THREE.MeshBasicMaterial({color:0xff7a1a});
const ducts=grp(0,0,0,cageG);TC.forEach(c=>ducts.add(new THREE.Mesh(new THREE.TubeGeometry(c,40,.09,6,false),ductMat)));
// 点选用的透明包围盒
const cageHit=new THREE.Mesh(new THREE.BoxGeometry(BL,3,12),new THREE.MeshBasicMaterial({visible:false}));cageHit.position.y=1.5;cageG.add(cageHit);cageHit.userData.key='cage';PICK.push(cageHit);
function setCageGrow(t){const n=cage.geometry.attributes.position.count,nL=cage.geometry.userData.nL;cage.geometry.setDrawRange(0,Math.floor(nL+(n-nL)*t));}

// ---- 钢筋绑扎胎具 ----
const jig=grp(-60,0,12);box(33,.5,7.5,MAT.bed,0,.25,0,jig);
for(let x=-15;x<=15;x+=3){[-1,1].forEach(s=>{const w=box(.25,2.7,.25,MAT.jig,x,1.85,s*3.3,jig);w.rotation.x=s*.2;});box(.25,.25,6,MAT.jig,x,.6,0,jig);}
[-1,1].forEach(s=>box(31,.25,.25,MAT.jig,0,3.1,s*3.6,jig));tag(jig,'jig');

// ---- 模板 ----
const formG=grp(-60,.5,0);
[-1,1].forEach(s=>{const w=box(BL+.6,2.65,.3,MAT.form,0,1.25,s*3.15,formG);w.rotation.x=-s*Math.atan(.5/2.45);
 box(BL+.6,.25,3.1,MAT.form,0,2.45,s*4.65,formG);
 for(let x=-15;x<=15;x+=3.75){box(.3,2.6,.3,MAT.form,x,1.15,s*6.1,formG);const d=box(.25,.25,2.9,MAT.form,x,1.2,s*4.6,formG);d.rotation.x=s*.75;}});
tag(formG,'form');
const innerG=grp(0,.5,0,scene);const inner=box(BL,2.1,4.0,MAT.inner,0,1.45,0,innerG);tag(innerG,'inner');
for(let x=-14;x<=14;x+=4)box(.15,1.9,3.6,MAT.steel,x,1.45,0,innerG);
const endF=grp(-60,.5,0);[-1,1].forEach(e=>box(.25,3.1,12.2,MAT.endform,e*(BL/2+.15),1.5,0,endF));tag(endF,'form');

// ---- 布料机 ----
const boomG=grp(-60,0,-9);cyl(.55,10,MAT.white,0,5,0,boomG);box(2.4,.6,2.4,MAT.dark,0,.3,0,boomG);
const arm=grp(0,10,0,boomG);box(10,.6,.7,MAT.white,4.8,0,0,arm);box(.4,.4,.4,MAT.orange,0,.5,0,arm);
const hose=box(.28,1,.28,MAT.dark,9.5,-3.5,0,arm);hose.scale.y=7;tag(boomG,'boom');

// ---- 养护棚 + 蒸汽 ----
const shedMat=new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.38,side:THREE.DoubleSide,roughness:.9,depthWrite:false});
const shedGeo=new THREE.CylinderGeometry(8,8,35,24,1,true,0,Math.PI);shedGeo.rotateZ(Math.PI/2);
const shed=new THREE.Mesh(shedGeo,shedMat);shed.position.set(-60,.5,0);scene.add(shed);
const NST=320,stPos=new Float32Array(NST*3),stSeed=[];
for(let i=0;i<NST;i++){stSeed.push([(Math.random()-.5)*32,Math.random(),(Math.random()-.5)*12]);}
const stGeo=new THREE.BufferGeometry();stGeo.setAttribute('position',new THREE.BufferAttribute(stPos,3));
const steam=new THREE.Points(stGeo,new THREE.PointsMaterial({color:0xffffff,size:.9,transparent:true,opacity:.75,depthWrite:false}));scene.add(steam);
function updSteam(time,on){steam.visible=on;if(!on)return;for(let i=0;i<NST;i++){const s=stSeed[i];const f=(s[1]+time*.12)%1;stPos[i*3]=-60+s[0];stPos[i*3+1]=1+f*6.5;stPos[i*3+2]=s[2]*(1-f*.3);}stGeo.attributes.position.needsUpdate=true;}
