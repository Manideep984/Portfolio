(function(){
/* ---------- animated background (home only): quick pops of rings, pluses and x patches ---------- */
var plain=document.body.classList.contains('plain');
if(false){
var c=document.createElement('canvas');c.id='bg';c.setAttribute('aria-hidden','true');document.body.insertBefore(c,document.body.firstChild);
var ctx=c.getContext('2d'),W=0,H=0,GAP=72,DOT=5,ACC='255,90,31';
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function size(){var d=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;c.width=W*d;c.height=H*d;c.style.width=W+'px';c.style.height=H+'px';ctx.setTransform(d,0,0,d,0,0)}
size();addEventListener('resize',size);
function rnd(a,b){return a+Math.random()*(b-a)}
function snapx(v){return Math.round((v-GAP/2)/GAP)*GAP+GAP/2}
var live=[],nextAt=0,patchSide=0;
function spawn(t){
 var r=Math.random();
 if(r<.62)live.push({k:'ring',x:snapx(rnd(60,W-60)),y:snapx(rnd(60,H-60)),r:rnd(20,28),lw:rnd(5,6.5),t0:t,dur:rnd(650,1100),dir:Math.random()<.5?-1:1});
 else if(r<.84)live.push({k:'plus',x:snapx(rnd(60,W-60)),y:snapx(rnd(60,H-60)),t0:t,dur:rnd(600,900)});
 else{patchSide^=1;var px=patchSide?W*.76:W*.11,py=patchSide?H*.7:H*.16;live.push({k:'x',x:px,y:py,t0:t,dur:rnd(1000,1500)})}
}
function env(p){return Math.max(0,Math.min(1,Math.min(p/.2,(1-p)/.25)))}
function draw(t){
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#dcdcd6';
 for(var y=GAP/2;y<H+GAP;y+=GAP)for(var x=GAP/2;x<W+GAP;x+=GAP)ctx.fillRect(x-DOT/2,y-DOT/2,DOT,DOT);
 if(!reduce){
  if(t>=nextAt&&live.length<3){spawn(t);nextAt=t+rnd(420,900)}
  live=live.filter(function(o){return t-o.t0<o.dur});
  live.forEach(function(o){var p=(t-o.t0)/o.dur,a=env(p);
   if(o.k==='ring'){var sweep=.25+Math.sin(p*Math.PI)*4.4,rot=o.dir*p*12;ctx.strokeStyle='rgba('+ACC+','+a+')';ctx.lineWidth=o.lw;ctx.lineCap='round';ctx.beginPath();ctx.arc(o.x,o.y,o.r,rot,rot+sweep);ctx.stroke()}
   else if(o.k==='plus'){ctx.strokeStyle='rgba('+ACC+','+a+')';ctx.lineWidth=4;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(o.x-7,o.y);ctx.lineTo(o.x+7,o.y);ctx.moveTo(o.x,o.y-7);ctx.lineTo(o.x,o.y+7);ctx.stroke()}
   else{ctx.strokeStyle='rgba(120,120,112,'+a*.6+')';ctx.lineWidth=1.3;ctx.beginPath();for(var r=0;r<9;r++)for(var q=0;q<11;q++){var px=o.x+q*28,py=o.y+r*28;ctx.moveTo(px-3,py-3);ctx.lineTo(px+3,py+3);ctx.moveTo(px+3,py-3);ctx.lineTo(px-3,py+3)}ctx.stroke()}
  })}
}
if(reduce)draw(0);else(function loop(t){draw(t);requestAnimationFrame(loop)})(0);
}

/* ---------- scroll progress ---------- */
if(!plain){var bar=document.createElement('div');bar.className='progress';document.body.appendChild(bar);
addEventListener('scroll',function(){var h=document.documentElement;bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight||1)*100)+'%'},{passive:true});}

/* ---------- reveal ---------- */
var items=document.querySelectorAll('.reveal');
if(!('IntersectionObserver' in window)){items.forEach(function(i){i.classList.add('in')})}
else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.08});items.forEach(function(i){io.observe(i)})}

/* ---------- missing image fallbacks ---------- */
document.querySelectorAll('.shot img').forEach(function(img){function m(){img.parentElement.classList.add('missing')}if(img.complete&&img.naturalWidth===0)m();img.addEventListener('error',m)});
document.querySelectorAll('.pcard .pic img,.pc .pic img').forEach(function(img){var box=img.parentElement;function m(){box.classList.add('empty');img.remove()}img.addEventListener('error',m);if(img.complete&&img.naturalWidth===0)m()});

/* ---------- boards: photos fallback + drag ---------- */
document.querySelectorAll('.board').forEach(function(b){
 b.querySelectorAll('.pin.photo').forEach(function(p){var im=p.querySelector('img');if(!im)return;function ph(){var d=document.createElement('div');d.className='ph';p.replaceChild(d,im)}im.addEventListener('error',ph);if(im.complete&&im.naturalWidth===0)ph()});
 var z=10;b.querySelectorAll('.pin').forEach(function(p){var sx,sy,ox,oy,on=false;
  p.addEventListener('pointerdown',function(e){on=true;p.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;ox=parseFloat(p.dataset.x||0);oy=parseFloat(p.dataset.y||0);p.classList.add('drag');p.style.zIndex=++z});
  p.addEventListener('pointermove',function(e){if(!on)return;var x=ox+e.clientX-sx,y=oy+e.clientY-sy;p.dataset.x=x;p.dataset.y=y;p.style.setProperty('--dx',x+'px');p.style.setProperty('--dy',y+'px')});
  var mv=0;p.addEventListener('pointermove',function(e){if(on)mv=Math.max(mv,Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy))});
  function up(){var go=on&&mv<6&&p.dataset.href;on=false;p.classList.remove('drag');mv=0;if(go)location.href=p.dataset.href}p.addEventListener('pointerup',up);p.addEventListener('pointercancel',function(){on=false;p.classList.remove('drag')});
  if(p.dataset.href)p.addEventListener('keydown',function(e){if(e.key==='Enter')location.href=p.dataset.href})})});

/* ---------- click to enlarge ---------- */
var ov=document.createElement('div');ov.id='zoomov';ov.innerHTML='<button type="button" aria-label="Close">Close</button><img alt="">';document.body.appendChild(ov);
var oi=ov.querySelector('img');
function closez(){ov.classList.remove('on');document.body.style.overflow=''}
document.querySelectorAll('figure.zoom').forEach(function(f){f.tabIndex=0;f.setAttribute('role','button');
 function open(){var im=f.querySelector('img');oi.src=im.currentSrc||im.src;oi.alt=im.alt;ov.classList.add('on');ov.scrollTop=0;document.body.style.overflow='hidden'}
 f.addEventListener('click',open);f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});
ov.addEventListener('click',function(e){if(e.target===oi)return;closez()});
addEventListener('keydown',function(e){if(e.key==='Escape')closez()});
})();

/* workbench dot grid: dots swell and a soft glow follows the cursor, except over the intro text.
   The loop runs only while things ease in or out. */
(function(){var h=document.querySelector('.hero'),cv=h&&h.querySelector('canvas.dots');if(!cv)return;var x=cv.getContext('2d'),gl=document.createElement('canvas'),G=28,R=160,mx=-999,my=-999,inf=0,run=false,w=0,hh=0,tr=null,still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function rect(){var t=h.querySelector('.wrap>div'),b=h.getBoundingClientRect();if(!t){tr=null;return}var r=t.getBoundingClientRect(),p=18;tr={l:r.left-b.left-p,t:r.top-b.top-p,r:r.right-b.left+p,b:r.bottom-b.top+p}}
function inT(i,j){return tr&&i>tr.l&&i<tr.r&&j>tr.t&&j<tr.b}
function size(){var d=Math.min(window.devicePixelRatio||1,2);w=h.clientWidth;hh=h.clientHeight;cv.width=w*d;cv.height=hh*d;gl.width=cv.width;gl.height=cv.height;x.setTransform(d,0,0,d,0,0);rect();draw()}
function draw(){x.clearRect(0,0,w,hh);
 if(inf>0.01&&mx>-900){var gc=gl.getContext('2d');gc.setTransform(1,0,0,1,0,0);gc.clearRect(0,0,gl.width,gl.height);gc.setTransform(cv.width/w,0,0,cv.height/hh,0,0);
  var g=gc.createRadialGradient(mx,my,0,mx,my,R*1.5);g.addColorStop(0,'rgba(255,214,102,'+(.34*inf)+')');g.addColorStop(.5,'rgba(255,170,150,'+(.14*inf)+')');g.addColorStop(1,'rgba(150,190,255,0)');gc.fillStyle=g;gc.fillRect(mx-R*1.5,my-R*1.5,R*3,R*3);
  if(tr){gc.globalCompositeOperation='destination-out';gc.filter='blur(14px)';gc.fillStyle='#000';gc.fillRect(tr.l,tr.t,tr.r-tr.l,tr.b-tr.t);gc.filter='none';gc.globalCompositeOperation='source-over'}
  x.save();x.setTransform(1,0,0,1,0,0);x.drawImage(gl,0,0);x.restore()}
 for(var j=G/2;j<hh;j+=G)for(var i=G/2;i<w;i+=G){var r=1.25,a=.34;if(inT(i,j))a=.12;else if(inf>0){var dx=i-mx,dy=j-my,dd=Math.sqrt(dx*dx+dy*dy);if(dd<R){var k=1-dd/R;r+=3.4*k*k*inf;a+=.2*k*inf}}x.fillStyle='rgba(70,58,44,'+a+')';x.beginPath();x.arc(i,j,r,0,6.2832);x.fill()}}
function tick(){if(mx>-900||inf>0.01){inf+=((mx>-900?1:0)-inf)*0.14;draw();requestAnimationFrame(tick)}else{inf=0;run=false;draw()}}
function kick(){if(!run&&!still){run=true;requestAnimationFrame(tick)}}
window.addEventListener('pointermove',function(e){var b=h.getBoundingClientRect();if(e.clientY<b.top||e.clientY>b.bottom){mx=-999;kick();return}mx=e.clientX-b.left;my=e.clientY-b.top;kick()},{passive:true});
document.addEventListener('pointerleave',function(){mx=-999;kick()});
window.addEventListener('resize',size);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(size);size()})();

/* pull cord next to the name: drag it down, let go, it springs back and takes you to the top */
(function(){var c=document.querySelector('.cord'),b=document.querySelector('.brand');if(!c||!b)return;
function place(){c.style.left=(b.offsetLeft+b.offsetWidth+18)+'px'}place();window.addEventListener('resize',place);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);
var sy=0,on=false,dy=0;
function top(){window.scrollTo({top:0,behavior:'smooth'})}
c.addEventListener('pointerdown',function(e){on=true;sy=e.clientY;dy=0;c.setPointerCapture(e.pointerId);c.classList.add('pull');e.preventDefault()});
c.addEventListener('pointermove',function(e){if(!on)return;dy=Math.max(0,Math.min(72,(e.clientY-sy)*.85));c.style.setProperty('--pull',dy+'px')});
function end(){if(!on)return;on=false;c.classList.remove('pull');var go=dy>30;dy=0;c.style.setProperty('--pull','0px');if(go)top()}
c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();c.classList.remove('pull');c.style.setProperty('--pull','40px');setTimeout(function(){c.style.setProperty('--pull','0px')},120);top()}})})();
