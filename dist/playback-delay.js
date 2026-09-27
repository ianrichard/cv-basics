// Optional presentation delay. Keep one decoder; buffer at most 18 downscaled frames.
export class PlaybackDelay {
 constructor(video,screen){this.video=video;this.screen=screen;this.context=screen.getContext('2d',{alpha:false});this.seconds=0;this.frames=[];this.pool=[];this.lastCapture=-Infinity;this.lastMediaTime=-1;this.shown=null}
 setDelay(seconds){if(seconds===this.seconds)return;this.seconds=seconds;this.reset()}
 reset(){
  for(const frame of this.frames)frame.canvas.width=frame.canvas.height=0;
  for(const canvas of this.pool)canvas.width=canvas.height=0;
  this.frames=[];this.pool=[];this.lastCapture=-Infinity;this.lastMediaTime=-1;this.shown=null;
  this.screen.hidden=true;this.screen.width=this.screen.height=0;this.video.style.visibility='';
 }
 tick(now){
  const video=this.video;if(!this.seconds||!video.videoWidth||video.readyState<2)return;
  if(video.currentTime!==this.lastMediaTime&&now-this.lastCapture>=1000/30-1){
   const scale=Math.min(1,1280/video.videoWidth,720/video.videoHeight);
   const width=Math.max(1,Math.round(video.videoWidth*scale)),height=Math.max(1,Math.round(video.videoHeight*scale));
   const canvas=this.pool.pop()||document.createElement('canvas');
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
   canvas.getContext('2d',{alpha:false}).drawImage(video,0,0,width,height);
   this.frames.push({canvas,at:now});this.lastCapture=now;this.lastMediaTime=video.currentTime;
  }
  const target=now-this.seconds*1000;
  while(this.frames.length>1&&(this.frames[1].at<=target||this.frames.length>18))this.pool.push(this.frames.shift().canvas);
  const frame=this.frames[0];if(!frame||frame===this.shown)return;
  if(this.screen.width!==frame.canvas.width||this.screen.height!==frame.canvas.height){this.screen.width=frame.canvas.width;this.screen.height=frame.canvas.height}
  this.context.drawImage(frame.canvas,0,0);this.shown=frame;
  this.screen.hidden=false;video.style.visibility='hidden';
 }
}
