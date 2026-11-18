const canvas = document.getElementById('tunnel');
const frame = canvas.parentElement;
const intro = frame.parentElement;
const ctx = canvas.getContext('2d');
const counter = document.querySelector('.meter b');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const palette = ['#ff2e0f','#f8a16b','#19191e','#2354c9','#d7c8ff','#ffb1b1','#98c8cf','#f2da65'];
let width, height, scheduled = false, phase = 0, previous = 0, pointerX = 0, pointerY = 0;

function sizeCanvas() {
  width = frame.clientWidth;
  height = frame.clientHeight;
  const ratio = Math.min(devicePixelRatio, 1.6);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  schedule();
}
function schedule() {
  if (!scheduled) {scheduled = true; requestAnimationFrame(draw);}
}
function draw(time) {
  scheduled = false;
  const progress = Math.min(1, Math.max(0, scrollY / Math.max(1,intro.offsetHeight-height)));
  document.body.classList.toggle('in-intro', scrollY < intro.offsetHeight-height*.35);
  if (scrollY >= intro.offsetHeight || !ctx) {previous = 0; return;}
  if (previous && !reduced.matches) phase += Math.min(50,time-previous)*.00024;
  previous = time;
  ctx.clearRect(0,0,width,height);
  const midX = width*(.5+pointerX*.026), midY = height*(.5+pointerY*.026);
  ctx.fillStyle='#eeeef0';
  ctx.fillRect(0,0,width,height);
  // Project the four tiled walls onto nested rectangles, from back to front.
  const travel = phase + progress*12;
  for(let depth=13;depth>=0;depth--){
    const z = depth + 1 - travel%1;
    const layer = depth + Math.floor(travel);
    for(let side=0;side<4;side++){
      function vertex(t,d) {
        const span=height*.98/d;
        const corners=[[-1,-.9],[1,-.9],[1,.9],[-1,.9]];
        const a=corners[side], b=corners[(side+1)%4];
        return [midX+(a[0]+(b[0]-a[0])*t)*span,midY+(a[1]+(b[1]-a[1])*t)*span];
      }
      for(let panel=0;panel<4;panel++){
        const key=layer*71+side*17+panel*31;
        const vertices=[vertex(panel/4,z),vertex((panel+1)/4,z),vertex((panel+1)/4,z+1),vertex(panel/4,z+1)];
        ctx.beginPath();vertices.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
        ctx.fillStyle=(layer%2===0 && key%5<3)?palette[(key+layer*side)%palette.length]:'#eeeeef';
        ctx.fill();ctx.strokeStyle='#929298';ctx.lineWidth=Math.max(.5,2/z);ctx.stroke();
      }
    }
  }
  ctx.globalCompositeOperation='destination-in';
  ctx.font='900 100px Inter,Arial,sans-serif';
  const fontSize=Math.min(height*.62,100*width*.94/ctx.measureText('PARAM').width);
  ctx.font='900 '+fontSize+'px Inter,Arial,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';
  ctx.fillText('PARAM',width/2,height*.51);
  ctx.globalCompositeOperation='source-over';
  frame.classList.add('rendered');
  frame.style.setProperty('--progress',(progress*100)+'%');
  counter.textContent=String(Math.min(6,1+Math.floor(progress*6))).padStart(2,'0');
  if(!reduced.matches && !document.hidden) schedule();
}
if(ctx){
  new ResizeObserver(sizeCanvas).observe(frame);
  frame.addEventListener('pointermove',event=>{pointerX=event.clientX/width-.5;pointerY=event.clientY/height-.5;});
  window.addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('visibilitychange',schedule);
  document.fonts.ready.then(schedule);
  sizeCanvas();
}
const navLinks=[...document.querySelectorAll('nav a')];
const sectionsObserver = new IntersectionObserver(entries=>{
  for(const entry of entries) if(entry.isIntersecting){
    navLinks.forEach(link=>link.classList.toggle('current',link.hash==='#'+entry.target.id));
  }
},{rootMargin:'-15% 0px -55%'});
navLinks.forEach(link => sectionsObserver.observe(document.querySelector(link.hash)));
