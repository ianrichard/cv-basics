import {ITEMS, ENABLED, DEMOS} from './config.js';
import {coverCrop} from './geometry.js';
const video=document.querySelector('#video'), picture=document.querySelector('#picture'), overlay=document.querySelector('#overlays');
const notice=document.querySelector('#notice'), noticeText=document.querySelector('#notice-text'), retry=document.querySelector('#retry');
const statusText=document.querySelector('#status-text'), dot=document.querySelector('#status-dot');
const rows=document.querySelector('#rows');
const flip=document.querySelector('#flip-camera'),clipSelector=document.querySelector('#demo-clips');
const cameraScenes={fruit:DEMOS.find(d=>d.items.includes('apple')).key,people:DEMOS.find(d=>d.items.includes('person')).key};
let activeKeys=DEMOS[0].items;
let selectedDemo=DEMOS[0].key, facing='environment', cameraDevices=[], activeDeviceId='';
for(const clip of DEMOS){const button=document.createElement('button');button.textContent=clip.label;button.dataset.clip=clip.key;button.setAttribute('aria-pressed',String(clip.key===selectedDemo));button.addEventListener('click',()=>{if(mode==='demo')source('demo',false,clip.key);else{selectedDemo=clip.key;configureScene();viewRevision++;clear()}});clipSelector.append(button)}
for(const key of ENABLED){const item=ITEMS[key];const row=document.createElement('div');row.className='row empty';row.dataset.key=key;row.innerHTML=`<img src="${item.image}" alt=""><span>${item.label}</span><output id="count-${key}" aria-label="${item.label}">0</output>`;rows.append(row)}
let viewRevision=0;
let model, stream, mode='demo', generation=0, ready=false, busy=false, tracks=[], nextId=0, lastFrame=-1, lastInference=0, failed=false;
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});
function configureScene(){
 const scene=DEMOS.find(d=>d.key===selectedDemo);activeKeys=scene.items;
 for(const row of rows.children)row.hidden=!activeKeys.includes(row.dataset.key);
 const people=activeKeys.length===1&&activeKeys[0]==='person';
 for(const button of clipSelector.children){
  const clip=DEMOS.find(d=>d.key===button.dataset.clip),cameraKey=people?cameraScenes.people:cameraScenes.fruit;
  button.hidden=mode==='camera'&&!Object.values(cameraScenes).includes(clip.key);
  button.textContent=mode==='camera'?(clip.key===cameraScenes.people?'People':'Fruit'):clip.label;
  button.setAttribute('aria-pressed',String(clip.key===(mode==='camera'?cameraKey:selectedDemo)));
 }
 document.querySelector('.total').hidden=people;
 document.querySelector('#scene-note').textContent=mode==='demo'?scene.note:(people?'People currently in view':'Show apples, bananas and oranges');
}
function status(text,state=''){statusText.textContent=text;dot.className=state}
function message(text,canRetry=false){notice.hidden=false;noticeText.textContent=text;retry.hidden=!canRetry}
function clear(){tracks=[];overlay.replaceChildren();renderCounts()}
function renderCounts(){for(const row of rows.children){const count=tracks.filter(t=>t.confirmed&&t.key===row.dataset.key).length;row.querySelector('output').value=count;row.classList.toggle('empty',count===0)}document.querySelector('#total').value=tracks.filter(t=>t.confirmed).length}
function iou(a,b){const area=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));return area/(a[2]*a[3]+b[2]*b[3]-area||1)}
function update(detections){
 const now=performance.now();
 // Expire before matching so a stale box cannot revive a weak detection.
 tracks=tracks.filter(t=>{if(now-t.seen>ITEMS[t.key].linger){t.el.remove();return false}return true});
 const available=new Set(tracks),observedKeys=new Set();
 for(const d of detections){
  let match=null,best=d.key==='person'?.16:.10;
  for(const t of available){const overlap=iou(t.rawBox,d.box);if(t.key===d.key&&(t.confirmed||d.score>=ITEMS[d.key].threshold)&&overlap>best){best=overlap;match=t}}
  if(match){
   available.delete(match);observedKeys.add(d.key);const weight=d.key==='person'?.65:.85;
   match.box=match.box.map((v,i)=>v*(1-weight)+d.box[i]*weight);match.rawBox=d.box;match.seen=now;
   // New people need two consecutive detections above the entry threshold.
   if(!match.confirmed&&d.score>=ITEMS[d.key].threshold)match.confirmed=true;
  }else if(d.score>=ITEMS[d.key].threshold){
   observedKeys.add(d.key);
   const el=document.createElement('div');el.className='box';el.style.setProperty('--color',ITEMS[d.key].color);overlay.append(el);
   tracks.push({id:nextId++,key:d.key,box:d.box,rawBox:d.box,seen:now,confirmed:d.key!=='person',el});
  }
 }
 // Fresh detections win over linger: never count unmatched echoes alongside them.
 tracks=tracks.filter(t=>{if(available.has(t)&&(!t.confirmed||observedKeys.has(t.key))){t.el.remove();return false}return true});
 for(const t of tracks){const [x,y,w,h]=t.box;t.el.hidden=!t.confirmed;Object.assign(t.el.style,{left:`${x*100}%`,top:`${y*100}%`,width:`${w*100}%`,height:`${h*100}%`})}
 renderCounts();
}
async function detect(){if(tf.getBackend()!=='webgl')throw new Error('GPU acceleration is unavailable.');const crop=coverCrop(video.videoWidth,video.videoHeight,picture.clientWidth,picture.clientHeight);const scale=Math.min(1,640/Math.max(crop.width,crop.height));canvas.width=Math.max(1,Math.round(crop.width*scale));canvas.height=Math.max(1,Math.round(crop.height*scale));ctx.drawImage(video,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height);let input,result;try{input=tf.tidy(()=>tf.browser.fromPixels(canvas).expandDims(0));result=await model.executeAsync(input);const [scores,boxes]=await Promise.all([result[0].data(),result[1].data()]);const n=result[0].shape[1],classes=result[0].shape[2],candidates=[];for(let i=0;i<n;i++){let max=0,category=-1;for(let c=0;c<classes;c++){const s=scores[i*classes+c];if(s>max){max=s;category=c+1}}const key=activeKeys.find(k=>ITEMS[k].id===category);if(!key||max<ITEMS[key].trackingThreshold)continue;const b=i*4,y=Math.max(0,boxes[b]),x=Math.max(0,boxes[b+1]),y2=Math.min(1,boxes[b+2]),x2=Math.min(1,boxes[b+3]);if(x2>x&&y2>y)candidates.push({key,score:max,box:[x,y,x2-x,y2-y]})}candidates.sort((a,b)=>b.score-a.score);const selected=[];for(const c of candidates){if(!selected.some(s=>s.key===c.key&&iou(s.box,c.box)>.45))selected.push(c);if(selected.length>=40)break}return selected}finally{input?.dispose();if(result)tf.dispose(result)}}
async function loop(now){requestAnimationFrame(loop);if(!ready||busy||failed||document.hidden||video.paused||video.seeking||video.readyState<2||now-lastInference<50||lastFrame===video.currentTime)return;busy=true;const token=generation,revision=viewRevision;lastInference=now;lastFrame=video.currentTime;try{const found=await detect();if(token===generation&&revision===viewRevision){update(found);notice.hidden=true;status('Live Detection','live')}}catch(e){if(token!==generation)return;console.error(e);failed=true;clear();status('Detection unavailable','error');message('Detection stopped. Try restarting the camera or demo.',true)}finally{busy=false}}
async function source(next, switching=false, clipKey=selectedDemo){
 const fade=next==='demo'&&mode==='demo'&&video.readyState>=2;
 const token=++generation;mode=next;ready=false;video.pause();
 picture.classList.toggle('fading',next==='demo');
 if(fade&&!matchMedia('(prefers-reduced-motion: reduce)').matches)await new Promise(resolve=>setTimeout(resolve,320));
 if(token!==generation)return;
 selectedDemo=clipKey;configureScene();failed=false;clear();lastFrame=-1;
 flip.hidden=next!=='camera';flip.disabled=true;
 status(next==='camera'?'Opening camera':'Loading demo');if(fade)notice.hidden=true;else message(next==='camera'?'Opening camera…':'Loading demo…');
 for(const key of ['camera','demo'])document.querySelector('#'+key).setAttribute('aria-pressed',String(key===next));
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
  requestAnimationFrame(()=>{if(token===generation)picture.classList.remove('fading')});
  if(model){notice.hidden=true;status('Live Detection','live')}else{message('Preparing detection…');status('Loading detector')}
 }catch(e){if(token!==generation)return;picture.classList.remove('fading');flip.disabled=false;status(next==='camera'?'Camera unavailable':'Demo paused','error');message(next==='camera'?'Allow camera access, or choose Demo.':'Tap Try again to play the demo.',true);console.error(e)}
}
new ResizeObserver(()=>{viewRevision++;clear();lastFrame=-1}).observe(document.querySelector('.stage'));
flip.addEventListener('click',()=>{if(cameraDevices.length<2){status('No other camera available','error');return}facing=facing==='environment'?'user':'environment';source('camera',true)});
video.addEventListener('ended',()=>{if(mode==='demo'&&!failed){const next=DEMOS[(DEMOS.findIndex(d=>d.key===selectedDemo)+1)%DEMOS.length];source('demo',false,next.key)}});
video.addEventListener('seeking',()=>{viewRevision++;clear();lastFrame=-1});
video.addEventListener('error',()=>{if(video.getAttribute('src')){ready=false;clear();status('Video unavailable','error');message('The demo video could not load. Try again or choose Camera.',true)}});
for(const key of ['camera','demo'])document.querySelector('#'+key).addEventListener('click',()=>source(key));retry.addEventListener('click',()=>model?source(mode):location.reload());
document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();status('Paused')}else{lastFrame=-1;if(ready)status('Live Detection','live')}});
window.addEventListener('pagehide',()=>{generation++;ready=false;stream?.getTracks().forEach(t=>t.stop())});
async function init(){source('demo');try{if(!window.tf)throw new Error('Runtime missing');if(!await tf.setBackend('webgl'))throw new Error('WebGL unavailable');await tf.ready();if(tf.getBackend()!=='webgl')throw new Error('WebGL unavailable');model=await tf.loadGraphModel('model/model.json');const warm=tf.zeros([1,300,300,3],'int32');let result;try{result=await model.executeAsync(warm);await Promise.all(result.map(t=>t.data()))}finally{warm.dispose();if(result)tf.dispose(result)}ready=video.readyState>=2&&!video.paused;if(ready){notice.hidden=true;status('Live Detection','live')}requestAnimationFrame(loop)}catch(e){console.error(e);failed=true;status('GPU unavailable','error');message('GPU detection could not start. Enable hardware acceleration and try again in a supported browser.',true)}}
if('serviceWorker' in navigator){
 const hadController=Boolean(navigator.serviceWorker.controller);let reloading=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController&&!reloading){reloading=true;location.reload()}});
 navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(error=>console.warn('Offline setup unavailable',error));
}
init();
