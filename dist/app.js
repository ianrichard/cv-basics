import {ITEMS, ENABLED, DEMOS, GROUPS} from './config.js';
import {coverCrop} from './geometry.js';
import {PlaybackDelay} from './playback-delay.js';
const video=document.querySelector('#video'), picture=document.querySelector('#picture'), overlay=document.querySelector('#overlays');
const sampleImage=document.querySelector('#sample-image');
const retry=document.querySelector('#retry');
const playback=new PlaybackDelay(video,document.querySelector('#delayed-video'));
let endedTimer;
const statusText=document.querySelector('#status-text'), dot=document.querySelector('#status-dot'), statusIndicator=document.querySelector('.status');
const rows=document.querySelector('#rows'), narrativeTitle=document.querySelector('#narrative-title');
const flip=document.querySelector('#flip-camera'),clipSelector=document.querySelector('#demo-clips');
const detectionOptions=document.querySelector('#detection-options'), autoRotate=document.querySelector('#auto-rotate');
const stage=document.querySelector('.stage'),story=document.querySelector('.recognition-content'),recognition=document.querySelector('.recognition');
const sourceTray=document.querySelector('#source-tray'),controlsToggle=document.querySelector('#controls-toggle'),videoBottom=document.querySelector('.video-bottom'),cameraButton=document.querySelector('#camera');
const demoFilters=new Map(DEMOS.map(d=>[d.key,[...d.items]]));
let cameraFilters=[...GROUPS.produce.items,...GROUPS.people.items];
let activeKeys=[...DEMOS[0].items];
const requestedSample=new URL(location.href).searchParams.get('sample');
let selectedDemo=DEMOS.find(d=>d.key===(requestedSample==='curbside-photo'?'curbside':requestedSample))?.key||DEMOS[0].key, facing='environment', cameraDevices=[], activeDeviceId='';
let viewRevision=0,activePanel=null,sceneTransition=false;
const isLiveView=()=>activePanel===null;
let model, stream, mode='demo', generation=0, ready=false, busy=false, tracks=[], nextId=0, lastFrame=-1, lastInference=0, failed=false;
let imagePending=false,imageAnalyzed=false;
let detectionFPS=8,lastTrackingUpdate=0;
const isImage=()=>mode==='demo'&&DEMOS.find(d=>d.key===selectedDemo).type==='image';
const sampleKind=()=>isImage()?'image':'video';
let modelState='downloading', sourceState='loading', sourceError='', detectionActive=false;
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});
const sceneButtons=new Map();
for(const clip of DEMOS){
 const button=document.createElement('button');button.className='scene-thumb';button.dataset.clip=clip.key;button.setAttribute('aria-label',clip.label);button.title=clip.label;
 const image=document.createElement('img');image.src=clip.thumb||clip.poster;image.alt='';image.width=192;image.height=108;
 const track=document.createElement('span');track.className='scene-track';track.setAttribute('aria-hidden','true');
 const progress=document.createElement('span');progress.className='scene-progress';track.append(progress);button.append(image,track);
 button.addEventListener('click',()=>source('demo',false,clip.key));clipSelector.insertBefore(button,cameraButton);sceneButtons.set(clip.key,{button,progress});
}
function updateProgress(){
 if(mode!=='demo')return;
 const progress=sceneButtons.get(selectedDemo)?.progress;
 if(progress)progress.style.transform=`scaleX(${Number.isFinite(video.duration)&&video.duration>0?Math.min(1,video.currentTime/video.duration):0})`;
}
for(const event of ['timeupdate','durationchange','ended'])video.addEventListener(event,updateProgress);
for(const key of ENABLED){const item=ITEMS[key];const row=document.createElement('div');row.className='row empty';row.dataset.key=key;row.setAttribute('role','listitem');row.setAttribute('aria-label',`${item.label}: not currently detected`);row.innerHTML=`<img src="${item.image}" alt=""><span>${item.label}</span>`;rows.append(row)}
for(const [key,group] of Object.entries(GROUPS)){
 const label=document.createElement('label');label.className='check-option';label.dataset.group=key;
 const input=document.createElement('input');input.type='checkbox';input.dataset.group=key;
 label.append(input,document.createTextNode(group.label));detectionOptions.append(label);
 input.addEventListener('change',()=>{
  const keys=[...detectionOptions.querySelectorAll('input:checked')].filter(i=>!i.closest('label').hidden).flatMap(i=>GROUPS[i.dataset.group].items);
  if(mode==='camera')cameraFilters=keys;else demoFilters.set(selectedDemo,keys);
  configureScene();sceneTransition=false;viewRevision++;lastFrame=-1;detectionActive=false;imagePending=true;imageAnalyzed=false;clear();refreshStatus();
 });
}
function configureScene(immediate=false){
 if(immediate){desiredNarrative=detectionTitle();narrativeTitle.textContent=desiredNarrative;narrativeTitle.style.opacity='1'}else narrative(detectionTitle());
 activeKeys=[...(mode==='camera'?cameraFilters:demoFilters.get(selectedDemo))];
 for(const row of rows.children)row.hidden=!activeKeys.includes(row.dataset.key);
 document.querySelector('#demo-options').hidden=mode!=='demo';document.querySelector('#auto-rotate-option').hidden=mode!=='demo'||isImage();
 video.loop=mode==='demo'&&!isImage()&&!autoRotate.checked&&!playback.seconds;
 for(const [key,{button,progress}] of sceneButtons){const selected=mode==='demo'&&key===selectedDemo;button.setAttribute('aria-pressed',String(selected));if(!selected)progress.style.transform='scaleX(0)'}
 cameraButton.setAttribute('aria-pressed',String(mode==='camera'));
 updateProgress();
 for(const label of detectionOptions.querySelectorAll('label')){
  const key=label.dataset.group;label.hidden=mode==='camera'&&key==='cars';
  label.querySelector('input').checked=GROUPS[key].items.every(item=>activeKeys.includes(item));
 }
}
// One text node, one pending destination: higher-priority state always wins at swap time.
let desiredStatus={text:'Loading',state:'loading'},statusFading=false;
let desiredNarrative='',narrativeFading=false;
function narrative(text){
 desiredNarrative=text;
 if(narrativeFading||narrativeTitle.textContent===text)return;
 narrativeFading=true;narrativeTitle.style.opacity='0';
 setTimeout(()=>{
  narrativeTitle.textContent=desiredNarrative;narrativeTitle.style.opacity='1';
  setTimeout(()=>{narrativeFading=false;narrative(desiredNarrative)},statusDuration());
 },statusDuration());
}
function status(text,state='loading'){
 desiredStatus={text,state};
 if(statusFading)return;
 if(statusText.textContent===text){dot.className=state;statusIndicator.style.opacity='1';return}
 statusFading=true;statusIndicator.style.opacity='0';
 setTimeout(()=>{
  statusText.textContent=desiredStatus.text;dot.className=desiredStatus.state;statusIndicator.style.opacity='1';
  setTimeout(()=>{statusFading=false;status(desiredStatus.text,desiredStatus.state)},statusDuration());
 },statusDuration());
}
function statusDuration(){return matchMedia('(prefers-reduced-motion: reduce)').matches?0:250}
let lastPresentation='';
function refreshStatus(){
 if(!isLiveView())return;
 let text,state='loading',canRetry=false;
 // Model failure > detection failure > source failure > loading > active processing.
 if(modelState==='error'){text='Model didn’t load 😕';state='error';canRetry=true}
 else if(failed){text='Detection stopped 😕';state='error';canRetry=true}
 else if(sourceState==='error'){text=sourceError;state='error';canRetry=true}
 else if(modelState!=='ready'){text='Loading'}
 else if(sourceState==='permission')text='Allow Camera Access';
 else if(sceneTransition){text='Loading';state='loading'}
 else if(sourceState==='loading')text='Loading';
 else if(!activeKeys.length){text='Select items to detect';state='idle'}
 else if(isImage()&&!document.hidden){text=imageAnalyzed?'Detected':'Loading';state=imageAnalyzed?'complete':'loading'}
 else if(document.hidden||(video.paused&&!(video.ended&&playback.seconds))){text='Detection paused';state='idle'}
 else if(video.readyState<2||video.seeking||!detectionActive)text='Loading';
 else{text='Detecting';state='live'}
 const presentation=JSON.stringify([text,state,canRetry]);
 if(presentation===lastPresentation)return;lastPresentation=presentation;
 status(text,state);
 retry.hidden=!canRetry;
}
function detectionTitle(){
 if(mode!=='camera')return DEMOS.find(d=>d.key===selectedDemo).title;
 if(tracks.some(t=>t.confirmed&&t.key==='person'))return 'I see you now!';
 return tracks.some(t=>t.confirmed)?'Found something!':'Looking…';
}
function clear(){lastTrackingUpdate=0;tracks=[];overlay.replaceChildren();renderRecognition()}
function renderRecognition(){if(mode==='camera')narrative(detectionTitle());for(const row of rows.children){const detected=tracks.some(t=>t.confirmed&&t.key===row.dataset.key);if(row.classList.contains('empty')===detected){row.classList.toggle('empty',!detected);row.setAttribute('aria-label',`${ITEMS[row.dataset.key].label}: ${detected?'detected':'not currently detected'}`)}}}
function iou(a,b){const area=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));return area/(a[2]*a[3]+b[2]*b[3]-area||1)}
function update(detections,still=false){
 const now=performance.now(),frameGap=lastTrackingUpdate?now-lastTrackingUpdate:0;lastTrackingUpdate=now;
 // Keep the previous observation eligible for matching even at low detection FPS.
 // Unmatched boxes still expire using their original linger below.
 tracks=tracks.filter(t=>{if(now-t.seen>Math.max(ITEMS[t.key].linger,frameGap+50)){t.el.remove();return false}return true});
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
 tracks=tracks.filter(t=>{if(available.has(t)&&(!t.confirmed||observedKeys.has(t.key)||now-t.seen>ITEMS[t.key].linger)){t.el.remove();return false}return true});
 for(const t of tracks){const [x,y,w,h]=t.box;t.el.hidden=!t.confirmed;Object.assign(t.el.style,{left:`${x*100}%`,top:`${y*100}%`,width:`${w*100}%`,height:`${h*100}%`})}
 renderRecognition();
}
async function detect(){if(tf.getBackend()!=='webgl')throw new Error('GPU acceleration is unavailable.');const media=isImage()?sampleImage:video;const crop=isImage()?{x:0,y:0,width:sampleImage.naturalWidth,height:sampleImage.naturalHeight}:coverCrop(video.videoWidth,video.videoHeight,picture.clientWidth,picture.clientHeight);const scale=Math.min(1,640/Math.max(crop.width,crop.height));canvas.width=Math.max(1,Math.round(crop.width*scale));canvas.height=Math.max(1,Math.round(crop.height*scale));ctx.drawImage(media,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height);let input,result;try{input=tf.tidy(()=>tf.browser.fromPixels(canvas).expandDims(0));result=await model.executeAsync(input);const [scores,boxes]=await Promise.all([result[0].data(),result[1].data()]);const n=result[0].shape[1],classes=result[0].shape[2],candidates=[];for(let i=0;i<n;i++){let max=0,category=-1;for(let c=0;c<classes;c++){const s=scores[i*classes+c];if(s>max){max=s;category=c+1}}const key=activeKeys.find(k=>ITEMS[k].id===category);if(!key||max<ITEMS[key].trackingThreshold)continue;const b=i*4,y=Math.max(0,boxes[b]),x=Math.max(0,boxes[b+1]),y2=Math.min(1,boxes[b+2]),x2=Math.min(1,boxes[b+3]);if(x2>x&&y2>y)candidates.push({key,score:max,box:[x,y,x2-x,y2-y]})}candidates.sort((a,b)=>b.score-a.score);const selected=[];for(const c of candidates){if(!selected.some(s=>s.key===c.key&&iou(s.box,c.box)>.45))selected.push(c);if(selected.length>=40)break}return selected}finally{input?.dispose();if(result)tf.dispose(result)}}
async function loop(now){
 requestAnimationFrame(loop);
 if(!isLiveView())return;
 if(!isImage()&&sourceState==='ready'&&!document.hidden)playback.tick(now);
 if(!ready||busy||failed||!activeKeys.length||document.hidden)return;
 if(isImage()){if(!imagePending)return;imagePending=false}
 else if(video.paused||video.seeking||video.readyState<2||now-lastInference<1000/detectionFPS||lastFrame===video.currentTime)return;
 busy=true;const token=generation,revision=viewRevision;lastInference=now;lastFrame=video.currentTime;
 try{const found=await detect();if(token===generation&&revision===viewRevision){update(found,isImage());detectionActive=true;sceneTransition=false;if(isImage())imageAnalyzed=true;refreshStatus()}}
 catch(e){if(token!==generation||revision!==viewRevision)return;console.error(e);failed=true;detectionActive=false;clear();refreshStatus()}
 finally{busy=false}
}
async function source(next, switching=false, clipKey=selectedDemo){
 const hasPrevious=Boolean(video.currentSrc||stream||sampleImage.getAttribute('src'));
 clearTimeout(endedTimer);
 const token=++generation;ready=false;sceneTransition=true;sourceState='loading';sourceError='';failed=false;detectionActive=false;video.pause();
 // Freeze the outgoing scene, including its boxes and story, until fully faded out.
 picture.classList.add('fading');story.classList.add('fading');refreshStatus();
 if(hasPrevious)await Promise.all(picture.getAnimations().filter(animation=>animation.transitionProperty==='opacity').map(animation=>animation.finished.catch(()=>{})));
 if(token!==generation)return;
 mode=next;selectedDemo=clipKey;imagePending=true;imageAnalyzed=false;clear();configureScene(true);
 lastFrame=-1;playback.reset();flip.hidden=next!=='camera';flip.disabled=true;
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
   stream.getVideoTracks()[0].addEventListener('ended',()=>{if(token===generation){ready=false;sourceState='error';sourceError='Camera unavailable 😕';detectionActive=false;clear();refreshStatus()}});
  }else if(isImage()){
   const clip=DEMOS.find(d=>d.key===selectedDemo);
   sampleImage.alt=clip.label;sampleImage.src=clip.src;await sampleImage.decode();
   if(token!==generation)return;layoutOverlay();
  }else{
   const clip=DEMOS.find(d=>d.key===selectedDemo);video.poster=clip.poster;video.src=clip.src;
  }
  if(!isImage())await video.play();if(token!==generation)return;
  if(!isLiveView())video.pause();
  if(!activeKeys.length)sceneTransition=false;
  sourceState='ready';ready=modelState==='ready';flip.disabled=cameraDevices.length<2;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(token===generation){picture.classList.remove('fading');story.classList.remove('fading')}}));refreshStatus();
 }catch(e){
  if(token!==generation)return;picture.classList.remove('fading');story.classList.remove('fading');sceneTransition=false;flip.disabled=cameraDevices.length<2;sourceState='error';ready=false;
  sourceError=next!=='camera'?`Sample ${sampleKind()} didn’t load 😕`:e.name==='NotAllowedError'?'Camera access declined 😕':e.name==='NotFoundError'?'No camera detected 😕':'Camera unavailable 😕';
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
const fpsControl=document.querySelector('#detection-fps'),glowControl=document.querySelector('#box-glow'),fillControl=document.querySelector('#box-fill'),fillOpacity=document.querySelector('#fill-opacity'),delayControl=document.querySelector('#playback-delay');
function applyTuning(){
 detectionFPS=Number(fpsControl.value);
 const delay=Number(delayControl.value);
 if(delay!==playback.seconds){playback.setDelay(delay);viewRevision++;clear();lastFrame=-1;imagePending=true;imageAnalyzed=false;configureScene();if(video.ended)finishPlayback()}
 document.querySelector('#delay-value').value=`${delay.toFixed(2)} s`;
 overlay.style.setProperty('--box-duration',`${1000/detectionFPS}ms`);
 overlay.style.setProperty('--box-fill-opacity',`${fillOpacity.value}%`);
 overlay.classList.toggle('glow-enabled',glowControl.checked);
 overlay.classList.toggle('fill-disabled',!fillControl.checked);
 document.querySelector('#fps-value').value=detectionFPS===20?'Max (20)':String(detectionFPS);
 document.querySelector('#fill-value').value=`${fillOpacity.value}%`;
 fillOpacity.disabled=!fillControl.checked;
}
for(const control of [fpsControl,glowControl,fillControl,fillOpacity,delayControl])control.addEventListener('input',applyTuning);
applyTuning();
function finishPlayback(){
 clearTimeout(endedTimer);
 if(!isLiveView()||mode!=='demo'||isImage()||failed||sourceState==='error')return;
 const token=generation;
 endedTimer=setTimeout(()=>{
  if(token!==generation||!isLiveView()||failed||sourceState==='error')return;
  const clips=DEMOS.filter(d=>d.type!=='image');
  const next=autoRotate.checked?clips[(clips.findIndex(d=>d.key===selectedDemo)+1)%clips.length].key:selectedDemo;
  source('demo',false,next);
 },playback.seconds*1000);
}
autoRotate.addEventListener('change',()=>{configureScene();if(video.ended)finishPlayback()});
video.addEventListener('ended',finishPlayback);
video.addEventListener('seeking',()=>{if(isImage())return;playback.reset();viewRevision++;clear();lastFrame=-1;detectionActive=false;refreshStatus()});
for(const event of ['pause','playing','waiting','seeked'])video.addEventListener(event,()=>{if(isImage())return;if(event==='waiting')detectionActive=false;refreshStatus()});
video.addEventListener('error',()=>{if(!isImage()&&video.getAttribute('src')&&video.error){ready=false;sourceState='error';sourceError='Sample video didn’t load 😕';detectionActive=false;clear();refreshStatus()}});
let pointerInStage=false;
function showControls(visible){
 const wasVisible=sourceTray.classList.contains('visible');
 visible=visible&&!activePanel;
 sourceTray.classList.toggle('visible',visible);sourceTray.inert=!visible;
 controlsToggle.setAttribute('aria-expanded',String(visible));controlsToggle.setAttribute('aria-label',visible?'Hide scene controls':'Show scene controls');
 if(visible&&!wasVisible){
  const selected=mode==='camera'?cameraButton:sceneButtons.get(selectedDemo)?.button;
  if(selected){const left=selected.offsetLeft-clipSelector.offsetLeft;clipSelector.scrollTo({left:Math.max(0,left-(clipSelector.clientWidth-selected.offsetWidth)/2),behavior:'instant'})}
 }
}
let touchControl=false;
controlsToggle.addEventListener('pointerdown',event=>{touchControl=event.pointerType==='touch'||event.pointerType==='pen'});
controlsToggle.addEventListener('click',event=>{const touch=event.pointerType==='touch'||event.pointerType==='pen'||(event.detail>0&&touchControl);showControls(touch?!sourceTray.classList.contains('visible'):true)});
stage.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){pointerInStage=true;showControls(true)}});
stage.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'){pointerInStage=false;if(!sourceTray.querySelector(':focus-visible'))showControls(false)}});
stage.addEventListener('focusin',event=>{if(!activePanel&&(sourceTray.contains(event.target)||(event.target===controlsToggle&&controlsToggle.matches(':focus-visible'))))showControls(true)});
stage.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!pointerInStage&&!sourceTray.contains(document.activeElement)&&document.activeElement!==controlsToggle)showControls(false)}));
document.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'&&!stage.contains(event.target))showControls(false)});
cameraButton.addEventListener('click',()=>source('camera'));
function openPanel(name){
 if(activePanel===name)return;
 if(activePanel)document.querySelector('#'+activePanel+'-view').hidden=true;
 activePanel=name;clearTimeout(endedTimer);viewRevision++;video.pause();
 showControls(false);controlsToggle.inert=true;videoBottom.inert=true;recognition.inert=true;
 const panel=document.querySelector('#'+name+'-view');panel.hidden=false;
 for(const key of ['settings','about'])document.querySelector('#'+key).setAttribute('aria-expanded',String(key===name));
 panel.querySelector('.close-panel').focus({preventScroll:true});
}
function closePanel(){
 if(!activePanel)return;
 const previous=activePanel;document.querySelector('#'+previous+'-view').hidden=true;activePanel=null;
 controlsToggle.inert=false;videoBottom.inert=false;recognition.inert=false;
 document.querySelector('#'+previous).setAttribute('aria-expanded','false');document.querySelector('#'+previous).focus({preventScroll:true});
 // Resume the same source without reopening the camera or restarting the scene.
 lastTrackingUpdate=0;lastFrame=-1;imagePending=true;imageAnalyzed=false;
 if(sourceState==='ready'&&!isImage()){
  if(video.ended)finishPlayback();else video.play().catch(()=>source(mode));
 }
 refreshStatus();
}
for(const key of ['settings','about'])document.querySelector('#'+key).addEventListener('click',()=>openPanel(key));
for(const button of document.querySelectorAll('.close-panel'))button.addEventListener('click',closePanel);
stage.addEventListener('keydown',event=>{
 if(event.key==='Escape'){
  if(activePanel){event.preventDefault();closePanel()}
  else if(sourceTray.classList.contains('visible')){event.preventDefault();controlsToggle.focus({preventScroll:true});showControls(false)}
 }
 if(event.key==='Tab'&&activePanel){
  const panel=document.querySelector('#'+activePanel+'-view');
  const focusable=[...panel.querySelectorAll('button,input,a[href],[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 }
});
retry.addEventListener('click',()=>modelState==='error'?location.reload():source(mode));
document.addEventListener('visibilitychange',()=>{if(document.hidden){playback.reset();clear();detectionActive=false}else{lastFrame=-1;imagePending=true;imageAnalyzed=false}refreshStatus()});
window.addEventListener('pagehide',()=>{clearTimeout(endedTimer);playback.reset();generation++;ready=false;stream?.getTracks().forEach(t=>t.stop())});
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
