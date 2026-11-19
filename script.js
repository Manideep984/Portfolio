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
