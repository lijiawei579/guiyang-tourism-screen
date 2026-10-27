(() => {
const data=ActivityLedger,areas=[...new Set(data.map(r=>r.area))],colors=['#15d7df','#239dff','#36d47c','#6574ff','#f4dc64','#be87fa','#f28dd4','#62d4a4','#e2a75d','#509cda','#957ce8','#54b9c0'];
const screenArea=()=>state.district?.name||'';
const scopedActivities=()=>data.filter(r=>!screenArea()||r.area===screenArea());
const venueCatalog=[['博物馆',12],['图书馆',12],['体育馆',12],['艺术馆',31]].flatMap(([type,n])=>Array.from({length:n},(_,i)=>({type,area:areas[i%areas.length]})));
const areaCount=name=>data.filter(r=>r.area===name).length;
const host=document.createElement('dialog');host.id='activity-directory-host';host.innerHTML='<button class="activity-host-close" aria-label="关闭活动统计">×</button><iframe title="活动区域时间统计与明细"></iframe>';document.body.append(host);host.querySelector('button').onclick=()=>host.close();
function open(status='',area='',date='',start='',end='',type=''){host.querySelector('iframe').src='activity-proposal.html?directory=1&v=20261026-stacks&status='+encodeURIComponent(status)+'&area='+encodeURIComponent(area)+'&date='+encodeURIComponent(date)+'&start='+encodeURIComponent(start)+'&end='+encodeURIComponent(end)+'&type='+encodeURIComponent(type);if(!host.open)host.showModal();}
globalThis.openActivityDirectory=open;
globalThis.activityMapBubble=name=>`<div class="en-pin" role="button" tabindex="0" aria-label="${name}活动${areaCount(name)}项" data-activity-area="${name}"><div class="en-pin-body"><b>${areaCount(name)}</b></div><i></i><small>${name==='双龙航空港经济区'?'双龙航空港':name}</small></div>`;
let stackMode='type';
const stackYear=data.reduce((year,r)=>Math.max(year,Number(r.date.slice(0,4))),2026);
const stackData=data.filter(r=>r.date.startsWith(stackYear+'-'));
const types=[...new Set(data.map(r=>r.type))];
const typeColors=['#15d7df','#239dff','#f4c96b','#be87fa'];
const shortArea=name=>name==='双龙航空港经济区'?'双龙':name;
function renderStacks(){
 const container=document.querySelector('.en-distribution-charts');
 container.classList.add('en-monthly-stacks');
 const visible=stackData.filter(r=>!screenArea()||r.area===screenArea());
 const names=stackMode==='area'?(screenArea()?[screenArea()]:areas):types,palette=stackMode==='area'?names.map(name=>colors[areas.indexOf(name)]):typeColors;
 const months=Array.from({length:12},(_,i)=>{const date=stackYear+'-'+String(i+1).padStart(2,'0'),rows=visible.filter(r=>r.date.startsWith(date));return{date,total:rows.length,values:names.map(name=>rows.filter(r=>r[stackMode]===name).length)};});
 const max=Math.max(4,...months.map(m=>m.total)),step=Math.max(1,Math.ceil(max/4)),top=step*4;
 const baseline=158,plotHeight=130,slot=413/12;
 container.innerHTML=`<div class="en-stack-toolbar"><span>${stackYear}年 · ${screenArea()?shortArea(screenArea()):'贵阳贵安'} <small>活动数 / 项</small></span><div class="en-stack-switch" role="group" aria-label="活动堆叠维度">${[['area','按区域'],['type','按类型']].map(([mode,label])=>`<button data-en-stack-mode="${mode}" aria-pressed="${stackMode===mode}" class="${stackMode===mode?'active':''}">${label}</button>`).join('')}</div></div>
 <svg class="en-stack-chart" viewBox="0 0 450 188" preserveAspectRatio="none" role="group" aria-label="${stackYear}年逐月活动${stackMode==='area'?'区域':'类型'}堆叠柱状图">${[0,1,2,3,4].map(i=>{const y=baseline-i*plotHeight/4;return `<text class="en-stack-axis" x="23" y="${y+4}" text-anchor="end">${step*i}</text><path d="M29 ${y}H444" class="en-stack-grid"/>`;}).join('')}${months.map((m,i)=>{const x=29+i*slot+slot/2;let y=baseline;return `<g class="en-stack-month"><g class="en-stack-hit" data-en-stack-date="${m.date}" role="button" tabindex="0" aria-label="${m.date}，${m.total}项活动，查看当月名录"><rect x="${x-slot/2}" y="12" width="${slot}" height="170" fill="transparent"/><text class="en-stack-total" x="${x}" y="${baseline-m.total/top*plotHeight-7}" text-anchor="middle">${m.total}</text><text class="en-stack-axis" x="${x}" y="179" text-anchor="middle">${i+1}月</text><title>${m.date}：${m.total}项活动</title></g>${m.values.map((n,j)=>{if(!n)return '';const height=n/top*plotHeight;y-=height;return `<g class="en-stack-segment" data-en-stack-${stackMode}="${names[j]}" data-en-stack-date="${m.date}" data-count="${n}" role="button" tabindex="0" aria-label="${m.date} ${names[j]}：${n}项活动，查看筛选名录"><rect x="${x-11}" y="${y}" width="22" height="${height}" fill="${palette[j]}" stroke="#092e49" stroke-width=".5"/><title>${m.date} · ${names[j]}：${n}项</title></g>`;}).join('')}</g>`;}).join('')}</svg>
 <div class="en-stack-legend" aria-label="${stackMode==='area'?'各区域':'各类型'}年度活动统计">${names.map((name,i)=>{const n=visible.filter(r=>r[stackMode]===name).length;return `<button data-en-stack-${stackMode}="${name}" title="${name}：${n}项，点击查看名录"><i style="background:${palette[i]}"></i><span>${stackMode==='area'?shortArea(name):name}</span><b>${n}</b></button>`;}).join('')}</div><div class="en-stack-note">模拟台账 · 按活动开始日期统计</div>`;
 container.querySelectorAll('[data-en-stack-mode]').forEach(button=>button.onclick=()=>{stackMode=button.dataset.enStackMode;renderStacks();});
 container.querySelectorAll('[data-en-stack-area],[data-en-stack-type],.en-stack-hit').forEach(target=>{
  const show=()=>open('',target.dataset.enStackArea||screenArea(),target.dataset.enStackDate||'','','',target.dataset.enStackType||'');
  target.onclick=event=>{event.stopPropagation();show();};
  if(target.tagName.toLowerCase()!=='button')target.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();show();}};
 });
}
function renderSpend(){
 const scope={period:state.period,area:screenArea()},panel=document.querySelector('.en-spend'),cards=panel.querySelectorAll('.en-spend-cards>div');
 const amount=IndicatorData.total('entertainSpend',scope),total=IndicatorData.total('spend',scope);
 cards[0].querySelector('.en-year').textContent=state.period;
 cards[0].querySelector('b').textContent=IndicatorData.summary('entertainSpend',scope,'亿元');
 cards[1].querySelector('b').textContent='—';cards[1].title='尚无上年同期数据，暂不计算增速';
 cards[2].querySelector('b').textContent=total?(amount/total*100).toFixed(2)+'%':'—';
 panel.querySelector('.en-source').textContent='* '+(screenArea()||'贵阳贵安')+' · 演示消费底表，截至 '+IndicatorData.asOf+'；同比未接入';
 const year=IndicatorData.asOf.slice(0,4),rows=IndicatorData.query('entertainSpend',{area:screenArea(),group:'month'});
 const months=Array.from({length:12},(_,i)=>({label:i+1,value:rows.find(r=>r.bucket===year+'-'+String(i+1).padStart(2,'0'))?.value||0}));
 const max=Math.max(1,...months.map(r=>r.value/10000)),step=Math.max(1,Math.ceil(max/4)),top=step*4;
 panel.querySelector('.en-columns').outerHTML=`<svg class="en-columns" viewBox="0 0 520 230" preserveAspectRatio="none" aria-label="${screenArea()||'贵阳贵安'}月度文娱消费"><defs><linearGradient id="en-scope-spend" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#00e6e1"/><stop offset="1" stop-color="#2b668c" stop-opacity=".15"/></linearGradient></defs>${[0,1,2,3,4].map(i=>`<text x="40" y="${194-i*40}" text-anchor="end">${step*i}</text><path d="M48 ${190-i*40}H515" stroke="#3b6281" stroke-dasharray="3 4"/>`).join('')}${months.map((r,i)=>{const x=57+i*38.5,height=r.value/10000/top*160,date=year+'-'+String(i+1).padStart(2,'0');return `<g><rect x="${x}" y="${190-height}" width="23" height="${height}" fill="url(#en-scope-spend)"/><text x="${x+11.5}" y="216" text-anchor="middle">${r.label}月</text><title>${date}：${date>IndicatorData.asOf.slice(0,7)?'尚未发生':(r.value/10000).toFixed(2)+' 万元'}</title></g>`;}).join('')}</svg>`;
}
function trend(){const end=IndicatorData.asOf,date=new Date(end+'T00:00:00Z');date.setUTCDate(date.getUTCDate()-6);const start=date.toISOString().slice(0,10),venues=VenueVisitOptions.map(venue=>({...venue,name:venue.shortName})),series=venues.map(v=>({...v,rows:IndicatorData.query(v.key,{start,end,area:screenArea(),group:'day'})})),max=Math.max(1,...series.flatMap(v=>v.rows.map(r=>r.value))),top=Math.ceil(max/100)*100;
return `<div class="en-line-legend">${series.map(v=>`<button type="button" data-en-venue="${v.key}" style="--venue-color:${v.color}" aria-label="查看${v.name}访问人数">⊙ <em>${v.name}</em></button>`).join('')}<small>人次 · 演示</small></div><svg class="en-lines" viewBox="0 0 540 220" preserveAspectRatio="none" role="img" aria-label="群艺馆、少儿图书馆、市图书馆七天日访问趋势">${[0,1,2,3,4].map(i=>`<text x="0" y="${194-i*40}">${Math.round(top*i/4)}</text><path d="M45 ${190-i*40}H530" stroke="#3d6a8a" stroke-dasharray="3 4"/>`).join('')}${series.map(v=>`<polyline points="${v.rows.map((r,i)=>`${52+i*77},${190-r.value/top*160}`).join(' ')}" fill="none" stroke="${v.color}" stroke-width="2"/>${v.rows.map((r,i)=>`<circle cx="${52+i*77}" cy="${190-r.value/top*160}" r="3" stroke="${v.color}" fill="#0a2f49"><title>${r.bucket} ${v.name}：${r.value} 人次</title></circle>`).join('')}`).join('')}${series[0].rows.map((r,i)=>`<text x="${52+i*77}" y="212" text-anchor="middle">${r.bucket.slice(5)}</text>`).join('')}</svg>`;}
const previous=render;render=function(){previous();if(state.page!=='entertain')return;const panel=document.querySelector('.en-venues');const heading=[...panel.querySelectorAll('h3')].find(h=>h.textContent.includes('热门'));heading.textContent='群艺馆、少儿图书馆、市图书馆 · 七天接待情况';panel.querySelector('.en-line-legend').remove();panel.querySelector('.en-lines').outerHTML=trend();
panel.querySelectorAll('[data-en-venue]').forEach(button=>button.onclick=()=>openVenueVisits(button.dataset.enVenue));
const list=scopedActivities();
panel.querySelectorAll('.en-four>div').forEach((card,i)=>{const type=['博物馆','图书馆','体育馆','艺术馆'][i],n=venueCatalog.filter(r=>r.type===type&&(!screenArea()||r.area===screenArea())).length;card.querySelector('b').innerHTML=n+' <small>（家）</small>';});
if(screenArea()&&!VenueVisitOptions.some(({key})=>IndicatorData.entities(IndicatorData.definitions[key].domain).some(r=>r.area===screenArea()))){panel.querySelector('.en-lines').outerHTML='<div class="en-lines en-venue-empty">当前区域暂无上述三馆接入记录</div>';}
const buttons=document.querySelectorAll('.en-three button');[list.length,list.filter(r=>r.status==='已开展').length,list.filter(r=>r.status==='未开展').length].forEach((n,i)=>{buttons[i].querySelector('b').innerHTML=n+' <small>（项）</small>';buttons[i].onclick=()=>open(['','已开展','未开展'][i],screenArea());});
document.querySelector('.en-distribution [data-en-directory]').onclick=()=>open('',screenArea());
renderSpend();
renderStacks();
};
document.addEventListener('click',event=>{const target=event.target.closest('[data-pie-area],[data-activity-area]');if(target){event.preventDefault();event.stopPropagation();open('',target.dataset.pieArea||target.dataset.activityArea);}},true);
document.addEventListener('keydown',event=>{const target=event.target.closest('[data-pie-area],[data-activity-area]');if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();open('',target.dataset.pieArea||target.dataset.activityArea);}});
render();
})();
