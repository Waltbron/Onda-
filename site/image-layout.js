'use strict';
/* ONDA visual: politica unica de formato, independiente de fuente y navegador. */
(function(root){
 function decide({scope,imageType,imageLayout,aspectRatio}={}){
  if(scope!=='foto')return 'side';
  if(imageLayout==='banner'||imageLayout==='side')return imageLayout;
  const ratio=Number(aspectRatio),known=Number.isFinite(ratio)&&ratio>0;
  if(imageType==='poster'||imageType==='flyer')return known&&ratio<1?'side':'banner';
  return known&&ratio>=1.6?'banner':'side';
 }
 root.ONDAImageLayout=Object.freeze({decide});
})(globalThis);
