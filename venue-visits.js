(() => {
const model=IndicatorData,venues=[{key:'artsIn',name:'市群艺馆',shortName:'群艺馆',color:'#59e5d0'},{key:'childrenIn',name:'市少儿图书馆',shortName:'少儿图书馆',color:'#efbd69'},{key:'libraryIn',name:'市图书馆',shortName:'市图书馆',color:'#70adff'}];
globalThis.VenueVisitOptions=venues;
function open(key='artsIn'){
 if(!venues.some(venue=>venue.key===key))key='artsIn';
 const end=model.asOf,date=new Date(end+'T00:00:00Z');date.setUTCDate(date.getUTCDate()-29);
 openIndicatorDrill(key,{start:date.toISOString().slice(0,10),end,area:state.district?.name||'',lockArea:true,group:'day',metricOptions:venues});
}
const originalRender=render;
render=function(){originalRender();if(state.page!=='entertain')return;const panel=document.querySelector('#app .col .panel');if(!panel)return;panel.querySelector('h2').innerHTML='场馆情况 <button class="vv-more" data-venue-visits>更多 ›</button>';const entry=document.createElement('div');entry.className='vv-entry';entry.innerHTML='<span>日访问人数</span><span>市群艺馆 · 市少儿图书馆 · 市图书馆</span><button data-venue-visits>查看趋势与明细 ↗</button>';panel.append(entry);panel.querySelectorAll('[data-venue-visits]').forEach(b=>b.onclick=open);};
window.openVenueVisits=open;
render();
})();
