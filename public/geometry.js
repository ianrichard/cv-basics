// Center crop equivalent to CSS object-fit: cover. Detection runs on this visible crop.
export function coverCrop(sourceWidth,sourceHeight,viewWidth,viewHeight){
 const ratio=viewWidth/viewHeight;
 const width=Math.min(sourceWidth,sourceHeight*ratio);
 const height=width/ratio;
 return {x:(sourceWidth-width)/2,y:(sourceHeight-height)/2,width,height};
}
