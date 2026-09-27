import {ITEMS, ENABLED, DEMOS} from './config.js';
import {coverCrop} from './geometry.js';
const video=document.querySelector('#video'), picture=document.querySelector('#picture'), overlay=document.querySelector('#overlays');
const notice=document.querySelector('#notice'), noticeText=document.querySelector('#notice-text'), retry=document.querySelector('#retry');
const statusText=document.querySelector('#status-text'), dot=document.querySelector('#status-dot');
const rows=document.querySelector('#rows');
const flip=document.querySelector('#flip-camera'),clipSelector=document.querySelector('#demo-clips');
let selectedDemo=DEMOS[0].key, facing='environment', cameraDevices=[], activeDeviceId='';
for(const clip of DEMOS){const button=document.createElement('button');button.textContent=clip.label;button.dataset.clip=clip.key;button.setAttribute('aria-pressed',String(clip.key===selectedDemo));button.addEventListener('click',()=>{selectedDemo=clip.key;source('demo')});clipSelector.append(button)}
for(const key of ENABLED){const item=ITEMS[key];const row=document.createElement('div');row.className='row';row.innerHTML=`<img src="${item.image}" alt=""><span>${item.label}</span><output id="count-${key}" aria-label="${item.label}">0</output>`;rows.append(row)}
let viewRevision=0;
let model, stream, mode='demo', generation=0, ready=false, busy=false, tracks=[], nextId=0, lastFrame=-1, lastInference=0, failed=false;
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});
function status(text,state=''){statusText.textContent=text;dot.className=state}
function message(text,canRetry=false){notice.hidden=false;noticeText.textContent=text;retry.hidden=!canRetry}
function clear(){tracks=[];overlay.replaceChildren();renderCounts()}
function renderCounts(){for(const key of ENABLED)document.querySelector(`#count-${key}`).value=tracks.filter(t=>t.key===key).length;document.querySelector('#total').value=tracks.length}
function iou(a,b){const area=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));return area/(a[2]*a[3]+b[2]*b[3]-area||1)}
function update(detections){const now=performance.now(),available=new Set(tracks);for(const d of detections){let match=null,best=.16;for(const t of available){const overlap=iou(t.box,d.box);if(t.key===d.key&&overlap>best){best=overlap;match=t}}if(match){available.delete(match);match.box=d.box;match.seen=now}else{const el=document.createElement('div');el.className='box';el.style.setProperty('--color',ITEMS[d.key].color);overlay.append(el);tracks.push({id:nextId++,key:d.key,box:d.box,seen:now,el})}}tracks=tracks.filter(t=>{if(now-t.seen>450){t.el.remove();return false}return true});for(const t of tracks){const [x,y,w,h]=t.box;Object.assign(t.el.style,{left:`${x*100}%`,top:`${y*100}%`,width:`${w*100}%`,height:`${h*100}%`})}renderCounts()}
async function detect(){if(tf.getBackend()!=='webgl')throw new Error('GPU acceleration is unavailable.');const crop=coverCrop(video.videoWidth,video.videoHeight,picture.clientWidth,picture.clientHeight);const scale=Math.min(1,640/Math.max(crop.width,crop.height));const width=Math.max(1,Math.round(crop.width*scale)),height=Math.max(1,Math.round(crop.height*scale));if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;ctx.drawImage(video,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height);let input,result;try{input=tf.tidy(()=>tf.browser.fromPixels(canvas).expandDims(0));result=await model.executeAsync(input);const [scores,boxes]=await Promise.all([result[0].data(),result[1].data()]);const n=result[0].shape[1],classes=result[0].shape[2],candidates=[];for(let i=0;i<n;i++){let max=0,category=-1;for(let c=0;c<classes;c++){const s=scores[i*classes+c];if(s>max){max=s;category=c+1}}const key=ENABLED.find(k=>ITEMS[k].id===category);if(!key||max<ITEMS[key].threshold)continue;const b=i*4,y=Math.max(0,boxes[b]),x=Math.max(0,boxes[b+1]),y2=Math.min(1,boxes[b+2]),x2=Math.min(1,boxes[b+3]);if(x2>x&&y2>y)candidates.push({key,score:max,box:[x,y,x2-x,y2-y]})}candidates.sort((a,b)=>b.score-a.score);const selected=[];for(const c of candidates){if(!selected.some(s=>s.key===c.key&&iou(s.box,c.box)>.45))selected.push(c);if(selected.length>=40)break}return selected}finally{input?.dispose();if(result)tf.dispose(result)}}
async function loop(now){requestAnimationFrame(loop);if(!ready||busy||failed||document.hidden||video.paused||video.seeking||video.readyState<2||now-lastInference<50||lastFrame===video.currentTime)return;busy=true;const token=generation,revision=viewRevision;lastInference=now;lastFrame=video.currentTime;try{const found=await detect();if(token===generation&&revision===viewRevision){update(found);notice.hidden=true;status('Live Detection','live')}}catch(e){if(token!==generation)return;console.error(e);failed=true;clear();status('Detection unavailable','error');message('Detection stopped. Try restarting the camera or demo.',true)}finally{busy=false}}
async function source(next, switching=false){
 const token=++generation;mode=next;failed=false;ready=false;clear();lastFrame=-1;
 flip.hidden=next!=='camera';flip.disabled=true;clipSelector.hidden=next!=='demo';
 status(next==='camera'?'Opening camera':'Loading demo');message(next==='camera'?'Opening camera…':'Loading demo…');
 for(const key of ['camera','demo'])document.querySelector('#'+key).setAttribute('aria-pressed',String(key===next));
 for(const button of clipSelector.children)button.setAttribute('aria-pressed',String(button.dataset.clip===selectedDemo));
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
 video.pause();video.srcObject=null;video.removeAttribute('src');video.load();
 try{
  if(next==='camera'){
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera needs HTTPS or localhost.');
   const constraints={width:{ideal:1280},height:{ideal:720},facingMode:switching?{exact:facing}:{ideal:facing}};
   let acquired;
   try{acquired=await navigator.mediaDevices.getUserMedia({video:constraints,audio:false})}
   catch(error){
    if(!switching||!['OverconstrainedError','NotFoundError'].includes(error.name))throw error;
    const other=cameraDevices.find(d=>d.deviceId!==activeDeviceId);
    acquired=await navigator.mediaDevices.getUserMedia({video:other?{deviceId:{exact:other.deviceId},width:{ideal:1280},height:{ideal:720}}:{facingMode:{ideal:facing}},audio:false});
   }
   if(token!==generation){acquired.getTracks().forEach(t=>t.stop());return}
   stream=acquired;video.srcObject=stream;
   const settings=stream.getVideoTracks()[0].getSettings();activeDeviceId=settings.deviceId;facing=settings.facingMode||facing;
   cameraDevices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');
   if(token!==generation)return;
   stream.getVideoTracks()[0].addEventListener('ended',()=>{if(token===generation){ready=false;clear();status('Camera disconnected','error');message('Camera disconnected. Reconnect it or choose Demo.',true)}});
  }else{
   const clip=DEMOS.find(d=>d.key===selectedDemo);video.poster=clip.poster;video.src=clip.src;
  }
  await video.play();if(token!==generation)return;
  ready=Boolean(model);flip.disabled=false;
  if(model){notice.hidden=true;status('Live Detection','live')}else{message('Preparing detection…');status('Loading detector')}
 }catch(e){if(token!==generation)return;flip.disabled=false;status(next==='camera'?'Camera unavailable':'Demo paused','error');message(next==='camera'?'Allow camera access, or choose Demo.':'Tap Try again to play the demo.',true);console.error(e)}
}
new ResizeObserver(()=>{viewRevision++;clear();lastFrame=-1}).observe(document.querySelector('.stage'));
flip.addEventListener('click',()=>{if(cameraDevices.length<2){status('No other camera available','error');return}facing=facing==='environment'?'user':'environment';source('camera',true)});
video.addEventListener('seeking',()=>{viewRevision++;clear();lastFrame=-1});
video.addEventListener('error',()=>{if(video.getAttribute('src')){ready=false;clear();status('Video unavailable','error');message('The demo video could not load. Try again or choose Camera.',true)}});
for(const key of ['camera','demo'])document.querySelector('#'+key).addEventListener('click',()=>source(key));retry.addEventListener('click',()=>model?source(mode):location.reload());
document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();status('Paused')}else{lastFrame=-1;if(ready)status('Live Detection','live')}});
window.addEventListener('pagehide',()=>{generation++;ready=false;stream?.getTracks().forEach(t=>t.stop())});
// Keep TensorFlow.js defaults for small helper operations; inference still requires WebGL.
async function init(){source('demo');try{if(!window.tf)throw new Error('Runtime missing');if(!await tf.setBackend('webgl'))throw new Error('WebGL unavailable');await tf.ready();if(tf.getBackend()!=='webgl')throw new Error('WebGL unavailable');model=await tf.loadGraphModel('model/model.json');const warm=tf.zeros([1,300,300,3],'int32');let result;try{result=await model.executeAsync(warm);await Promise.all(result.map(t=>t.data()))}finally{warm.dispose();if(result)tf.dispose(result)}ready=video.readyState>=2&&!video.paused;if(ready){notice.hidden=true;status('Live Detection','live')}requestAnimationFrame(loop)}catch(e){console.error(e);failed=true;status('GPU unavailable','error');message('GPU detection could not start. Enable hardware acceleration and try again in a supported browser.',true)}}
if('serviceWorker' in navigator){
 const hadController=Boolean(navigator.serviceWorker.controller);let reloading=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController&&!reloading){reloading=true;location.reload()}});
 navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(error=>console.warn('Offline setup unavailable',error));
}
init();
