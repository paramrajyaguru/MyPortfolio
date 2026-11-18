const still = matchMedia('(prefers-reduced-motion: reduce)');
const surface = document.querySelector('.lights');
const brush = surface.getContext('2d');
let visible = false;
let animation = 0;

function paintJourney(now) {
  animation = 0;
  if (!brush || !visible || document.hidden) return;
  const w = surface.clientWidth, h = surface.clientHeight;
  const ratio = Math.min(devicePixelRatio, 1.5);
  if (surface.width !== Math.round(w*ratio) || surface.height !== Math.round(h*ratio)) {
    surface.width = Math.round(w*ratio);
    surface.height = Math.round(h*ratio);
  }
  brush.setTransform(ratio,0,0,ratio,0,0);
  brush.clearRect(0,0,w,h);
  const time = still.matches ? 0 : now / 5500;
  const scroll = surface.getBoundingClientRect().top / innerHeight;
  for (let i=0; i<150; i++) {
    const angle=i*2.39996;
    const depth=(i*.618034+time+1)%1;
    const reach=depth*depth;
    const x=Math.cos(angle)*w*.85, y=Math.sin(angle)*h*.81;
    const cx=w*.5, cy=h*(.46+.05*scroll);
    brush.beginPath();
    brush.moveTo(cx+x*reach,cy+y*reach);
    brush.lineTo(cx+x*reach*1.22,cy+y*reach*1.22);
    brush.strokeStyle=['#ff4b24','#ffac64','#91b5ff','#fff'][i%4];
    brush.globalAlpha=depth*.82;
    brush.lineWidth=1+depth*2;
    brush.stroke();
  }
  brush.globalAlpha=1;
  if (!still.matches) scheduleLights();
}
function scheduleLights() {
  if (!animation && visible && !document.hidden) animation=requestAnimationFrame(paintJourney);
}
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;scheduleLights()}).observe(surface);
window.addEventListener('resize',scheduleLights);
document.addEventListener('visibilitychange',scheduleLights);
still.addEventListener('change',scheduleLights);
for(const card of document.querySelectorAll('.tile,.tools>div,.stats>div')){
  card.addEventListener('pointermove',event=>{
    if(still.matches || event.pointerType==='touch') return;
    const box=card.getBoundingClientRect();
    card.style.setProperty('--ry',((event.clientX-box.left)/box.width-.5)*12+'deg');
    card.style.setProperty('--rx',(.5-(event.clientY-box.top)/box.height)*10+'deg');
  });
  card.addEventListener('pointerleave',()=>{card.style.removeProperty('--ry');card.style.removeProperty('--rx')});
}
