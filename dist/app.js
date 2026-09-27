import {ITEMS, ENABLED, DEMOS, GROUPS} from './config.js';
import {coverCrop} from './geometry.js';
const video=document.querySelector('#video'), picture=document.querySelector('#picture'), overlay=document.querySelector('#overlays');
const sampleImage=document.querySelector('#sample-image');
const notice=document.querySelector('#notice'), noticeText=document.querySelector('#notice-text'), retry=document.querySelector('#retry');
const statusText=document.querySelector('#status-text'), dot=document.querySelector('#status-dot');
const rows=document.querySelector('#rows');
const flip=document.querySelector('#flip-camera'),clipSelector=document.querySelector('#demo-clips');
const detectionOptions=document.querySelector('#detection-options'), autoRotate=document.querySelector('#auto-rotate');
const demoFilters=new Map(DEMOS.map(d=>[d.key,[...d.items]]));
let cameraFilters=[...GROUPS.produce.items,...GROUPS.people.items];
let activeKeys=[...DEMOS[0].items];
let selectedDemo=DEMOS.find(d=>d.key===new URL(location.href).searchParams.get('sample'))?.key||DEMOS[0].key, facing='environment', cameraDevices=[], activeDeviceId='';
let viewRevision=0;
let model, stream, mode='demo', generation=0, ready=false, busy=false, tracks=[], nextId=0, lastFrame=-1, lastInference=0, failed=false;
let imagePending=false,imageAnalyzed=false;
const isImage=()=>mode==='demo'&&DEMOS.find(d=>d.key===selectedDemo).type==='image';
const sampleKind=()=>isImage()?'image':'video';
let modelState='downloading', sourceState='loading', sourceError='', detectionActive=false;
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});
for(const clip of DEMOS){const button=document.createElement('button');button.textContent=clip.label;button.dataset.clip=clip.key;button.addEventListener('click',()=>source('demo',false,clip.key));clipSelector.append(button)}
for(const key of ENABLED){const item=ITEMS[key];const row=document.createElement('div');row.className='row empty';row.dataset.key=key;row.setAttribute('role','listitem');row.setAttribute('aria-label',`${item.label}: not currently detected`);row.innerHTML=`<img src="${item.image}" alt=""><span>${item.label}</span>`;rows.append(row)}
for(const [key,group] of Object.entries(GROUPS)){
 const label=document.createElement('label');label.className='check-option';label.dataset.group=key;
 const input=document.createElement('input');input.type='checkbox';input.dataset.group=key;
 label.append(input,document.createTextNode(group.label));detectionOptions.append(label);
 input.addEventListener('change',()=>{
  const keys=[...detectionOptions.querySelectorAll('input:checked')].filter(i=>!i.closest('label').hidden).flatMap(i=>GROUPS[i.dataset.group].items);
  if(mode==='camera')cameraFilters=keys;else demoFilters.set(selectedDemo,keys);
  configureScene();viewRevision++;lastFrame=-1;detectionActive=false;imagePending=true;imageAnalyzed=false;clear();refreshStatus();
 });
}
function configureScene(){
 activeKeys=[...(mode==='camera'?cameraFilters:demoFilters.get(selectedDemo))];
 for(const row of rows.children)row.hidden=!activeKeys.includes(row.dataset.key);
 clipSelector.hidden=mode!=='demo';document.querySelector('#auto-rotate-option').hidden=mode!=='demo'||isImage();
 video.loop=mode==='demo'&&!isImage()&&!autoRotate.checked;
 for(const button of clipSelector.children)button.setAttribute('aria-pressed',String(button.dataset.clip===selectedDemo));
 for(const label of detectionOptions.querySelectorAll('label')){
  const key=label.dataset.group;label.hidden=mode==='camera'&&key==='cars';
  label.querySelector('input').checked=GROUPS[key].items.every(item=>activeKeys.includes(item));
 }
}
// One text node, one pending destination: higher-priority state always wins at swap time.
let desiredStatus={text:'Downloading vision superpowers',state:'loading'},statusFading=false;
function status(text,state='loading'){
 desiredStatus={text,state};
 if(statusFading)return;
 if(statusText.textContent===text){dot.className=state;return}
 statusFading=true;statusText.style.opacity='0';
 setTimeout(()=>{
  statusText.textContent=desiredStatus.text;dot.className=desiredStatus.state;statusText.style.opacity='1';
  setTimeout(()=>{statusFading=false;status(desiredStatus.text,desiredStatus.state)},statusDuration());
 },statusDuration());
}
function statusDuration(){return matchMedia('(prefers-reduced-motion: reduce)').matches?0:250}
let lastPresentation='';
function refreshStatus(){
 let text,state='loading',detail='',canRetry=false;
 // Model failure > detection failure > source failure > loading > active processing.
 if(modelState==='error'){text='Couldn’t load vision superpowers';state='error';detail='Detection could not start. Try again with hardware acceleration enabled.';canRetry=true}
 else if(failed){text='Detection unavailable';state='error';detail='Try restarting the camera or demo.';canRetry=true}
 else if(sourceState==='error'){text=sourceError;state='error';detail=mode==='camera'?'Try again or choose Demo.':'Try again or choose another sample.';canRetry=true}
 else if(modelState!=='ready'){text=modelState==='downloading'?'Downloading vision superpowers':'Preparing vision superpowers';detail='Loading superpowers…\nThis may take a bit.'}
 else if(sourceState==='permission')text='Waiting for camera permission';
 else if(sourceState==='loading')text=mode==='camera'?'Starting camera':`Loading sample ${sampleKind()}`;
 else if(!activeKeys.length){text='Select items to detect';state='idle'}
 else if(isImage()&&!document.hidden){text=imageAnalyzed?'Sample image analyzed':'Analyzing sample image';state=imageAnalyzed?'complete':'loading'}
 else if(document.hidden||video.paused){text='Detection paused';state='idle'}
 else if(video.readyState<2||video.seeking||!detectionActive)text=mode==='camera'?'Starting camera':`Loading sample ${sampleKind()}`;
 else{text=mode==='camera'?'Detecting from camera':'Detecting in sample video';state='live'}
 const presentation=JSON.stringify([text,state,detail,canRetry]);
 if(presentation===lastPresentation)return;lastPresentation=presentation;
 status(text,state);
 notice.hidden=!detail;noticeText.textContent=detail;retry.hidden=!canRetry;
}
function clear(){tracks=[];overlay.replaceChildren();renderRecognition()}
function renderRecognition(){for(const row of rows.children){const detected=tracks.some(t=>t.confirmed&&t.key===row.dataset.key);if(row.classList.contains('empty')===detected){row.classList.toggle('empty',!detected);row.setAttribute('aria-label',`${ITEMS[row.dataset.key].label}: ${detected?'detected':'not currently detected'}`)}}}
function iou(a,b){const area=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));return area/(a[2]*a[3]+b[2]*b[3]-area||1)}
function update(detections,still=false){
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
   tracks.push({id:nextId++,key:d.key,box:d.box,rawBox:d.box,seen:now,confirmed:still||d.key!=='person',el});
  }
 }
 // Fresh detections win over linger: never count unmatched echoes alongside them.
 tracks=tracks.filter(t=>{if(available.has(t)&&(!t.confirmed||observedKeys.has(t.key))){t.el.remove();return false}return true});
 for(const t of tracks){const [x,y,w,h]=t.box;t.el.hidden=!t.confirmed;Object.assign(t.el.style,{left:`${x*100}%`,top:`${y*100}%`,width:`${w*100}%`,height:`${h*100}%`})}
 renderRecognition();
}
async function detect(){if(tf.getBackend()!=='webgl')throw new Error('GPU acceleration is unavailable.');const media=isImage()?sampleImage:video;const crop=isImage()?{x:0,y:0,width:sampleImage.naturalWidth,height:sampleImage.naturalHeight}:coverCrop(video.videoWidth,video.videoHeight,picture.clientWidth,picture.clientHeight);const scale=Math.min(1,640/Math.max(crop.width,crop.height));canvas.width=Math.max(1,Math.round(crop.width*scale));canvas.height=Math.max(1,Math.round(crop.height*scale));ctx.drawImage(media,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height);let input,result;try{input=tf.tidy(()=>tf.browser.fromPixels(canvas).expandDims(0));result=await model.executeAsync(input);const [scores,boxes]=await Promise.all([result[0].data(),result[1].data()]);const n=result[0].shape[1],classes=result[0].shape[2],candidates=[];for(let i=0;i<n;i++){let max=0,category=-1;for(let c=0;c<classes;c++){const s=scores[i*classes+c];if(s>max){max=s;category=c+1}}const key=activeKeys.find(k=>ITEMS[k].id===category);if(!key||max<ITEMS[key].trackingThreshold)continue;const b=i*4,y=Math.max(0,boxes[b]),x=Math.max(0,boxes[b+1]),y2=Math.min(1,boxes[b+2]),x2=Math.min(1,boxes[b+3]);if(x2>x&&y2>y)candidates.push({key,score:max,box:[x,y,x2-x,y2-y]})}candidates.sort((a,b)=>b.score-a.score);const selected=[];for(const c of candidates){if(!selected.some(s=>s.key===c.key&&iou(s.box,c.box)>.45))selected.push(c);if(selected.length>=40)break}return selected}finally{input?.dispose();if(result)tf.dispose(result)}}
async function loop(now){
 requestAnimationFrame(loop);
 if(!ready||busy||failed||!activeKeys.length||document.hidden)return;
 if(isImage()){if(!imagePending)return;imagePending=false}
 else if(video.paused||video.seeking||video.readyState<2||now-lastInference<50||lastFrame===video.currentTime)return;
 busy=true;const token=generation,revision=viewRevision;lastInference=now;lastFrame=video.currentTime;
 try{const found=await detect();if(token===generation&&revision===viewRevision){update(found,isImage());detectionActive=true;if(isImage())imageAnalyzed=true;refreshStatus()}}
 catch(e){if(token!==generation||revision!==viewRevision)return;console.error(e);failed=true;detectionActive=false;clear();refreshStatus()}
 finally{busy=false}
}
async function source(next, switching=false, clipKey=selectedDemo){
 const fade=next==='demo'&&mode==='demo'&&sourceState==='ready';
 const token=++generation;mode=next;ready=false;sourceState='loading';sourceError='';failed=false;detectionActive=false;video.pause();
 selectedDemo=clipKey;imagePending=true;imageAnalyzed=false;configureScene();clear();refreshStatus();
 for(const key of ['camera','demo'])document.querySelector('#'+key).setAttribute('aria-pressed',String(key===next));
 picture.classList.toggle('fading',next==='demo');
 if(fade&&!matchMedia('(prefers-reduced-motion: reduce)').matches)await new Promise(resolve=>setTimeout(resolve,320));
 if(token!==generation)return;
 lastFrame=-1;flip.hidden=next!=='camera';flip.disabled=true;
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
 video.srcObject=null;video.removeAttribute('src');if(next==='camera')video.poster='';video.load();
 sampleImage.hidden=!isImage();video.hidden=isImage();sampleImage.removeAttribute('src');layoutOverlay();
 try{
  if(next==='camera'){
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera needs HTTPS or localhost.');
   // Only label this as a permission wait when the browser reports a prompt.
   try{const permission=await navigator.permissions.query({name:'camera'});if(token!==generation)return;if(permission.state==='prompt'){sourceState='permission';refreshStatus()}}catch{}
   const constraints={width:{ideal:1280},height:{ideal:720},facingMode:switching?{exact:facing}:{ideal:facing}};
   let acquired;
   try{acquired=await navigator.mediaDevices.getUserMedia({video:constraints,audio:false})}
   catch(error){
    if(!switching||!['OverconstrainedError','NotFoundError'].includes(error.name))throw error;
    const other=cameraDevices.find(d=>d.deviceId!==activeDeviceId);
    acquired=await navigator.mediaDevices.getUserMedia({video:other?{deviceId:{exact:other.deviceId},width:{ideal:1280},height:{ideal:720}}:{facingMode:{ideal:facing}},audio:false});
   }
   if(token!==generation){acquired.getTracks().forEach(t=>t.stop());return}
   sourceState='loading';refreshStatus();stream=acquired;video.srcObject=stream;
   const settings=stream.getVideoTracks()[0].getSettings();activeDeviceId=settings.deviceId;facing=settings.facingMode||facing;
   cameraDevices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');
   if(token!==generation)return;
   stream.getVideoTracks()[0].addEventListener('ended',()=>{if(token===generation){ready=false;sourceState='error';sourceError='Camera unavailable';detectionActive=false;clear();refreshStatus()}});
  }else if(isImage()){
   const clip=DEMOS.find(d=>d.key===selectedDemo);
   sampleImage.alt=clip.label;sampleImage.src=clip.src;await sampleImage.decode();
   if(token!==generation)return;layoutOverlay();
  }else{
   const clip=DEMOS.find(d=>d.key===selectedDemo);video.poster=clip.poster;video.src=clip.src;
  }
  if(!isImage())await video.play();if(token!==generation)return;
  sourceState='ready';ready=modelState==='ready';flip.disabled=cameraDevices.length<2;
  requestAnimationFrame(()=>{if(token===generation)picture.classList.remove('fading')});refreshStatus();
 }catch(e){
  if(token!==generation)return;picture.classList.remove('fading');flip.disabled=cameraDevices.length<2;sourceState='error';ready=false;
  sourceError=next!=='camera'?`Couldn’t load sample ${sampleKind()}`:e.name==='NotAllowedError'?'Camera permission declined':e.name==='NotFoundError'?'No camera detected':'Camera unavailable';
  clear();refreshStatus();console.error(e);
 }
}
function layoutOverlay(){
 if(isImage()&&sampleImage.naturalWidth){
  const scale=Math.min(picture.clientWidth/sampleImage.naturalWidth,picture.clientHeight/sampleImage.naturalHeight);
  const width=sampleImage.naturalWidth*scale,height=sampleImage.naturalHeight*scale;
  Object.assign(overlay.style,{left:`${(picture.clientWidth-width)/2}px`,top:`${(picture.clientHeight-height)/2}px`,width:`${width}px`,height:`${height}px`,right:'auto',bottom:'auto'});
 }else Object.assign(overlay.style,{left:'0',top:'0',width:'100%',height:'100%',right:'auto',bottom:'auto'});
}
new ResizeObserver(()=>{viewRevision++;clear();lastFrame=-1;imagePending=true;imageAnalyzed=false;layoutOverlay();refreshStatus()}).observe(document.querySelector('.stage'));
flip.addEventListener('click',()=>{if(cameraDevices.length<2)return;facing=facing==='environment'?'user':'environment';source('camera',true)});
autoRotate.addEventListener('change',()=>{video.loop=mode==='demo'&&!isImage()&&!autoRotate.checked});
video.addEventListener('ended',()=>{if(mode==='demo'&&!isImage()&&!failed&&sourceState!=='error'){const clips=DEMOS.filter(d=>d.type!=='image');const next=autoRotate.checked?clips[(clips.findIndex(d=>d.key===selectedDemo)+1)%clips.length].key:selectedDemo;source('demo',false,next)}});
video.addEventListener('seeking',()=>{if(isImage())return;viewRevision++;clear();lastFrame=-1;detectionActive=false;refreshStatus()});
for(const event of ['pause','playing','waiting','seeked'])video.addEventListener(event,()=>{if(isImage())return;if(event==='waiting')detectionActive=false;refreshStatus()});
video.addEventListener('error',()=>{if(!isImage()&&video.getAttribute('src')&&video.error){ready=false;sourceState='error';sourceError='Couldn’t load sample video';detectionActive=false;clear();refreshStatus()}});
for(const key of ['camera','demo'])document.querySelector('#'+key).addEventListener('click',()=>source(key));
retry.addEventListener('click',()=>modelState==='error'?location.reload():source(mode));
document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();detectionActive=false}else{lastFrame=-1;imagePending=true;imageAnalyzed=false}refreshStatus()});
window.addEventListener('pagehide',()=>{generation++;ready=false;stream?.getTracks().forEach(t=>t.stop())});
async function init(){
 source('demo');
 try{
  if(!window.tf)throw new Error('Runtime missing');if(!await tf.setBackend('webgl'))throw new Error('WebGL unavailable');await tf.ready();if(tf.getBackend()!=='webgl')throw new Error('WebGL unavailable');
  model=await tf.loadGraphModel('model/model.json');modelState='preparing';refreshStatus();
  const warm=tf.zeros([1,300,300,3],'int32');let result;
  try{result=await model.executeAsync(warm);await Promise.all(result.map(t=>t.data()))}finally{warm.dispose();if(result)tf.dispose(result)}
  modelState='ready';ready=sourceState==='ready';refreshStatus();requestAnimationFrame(loop);
 }catch(e){console.error(e);modelState='error';ready=false;refreshStatus()}
}
if('serviceWorker' in navigator){
 const hadController=Boolean(navigator.serviceWorker.controller);let reloading=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController&&!reloading){reloading=true;location.reload()}});
 navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(error=>console.warn('Offline setup unavailable',error));
}
init();
