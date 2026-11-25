// The panoramic view shares data and detail components with the single-screen pages.
const state={page:'overview',period:'本年',area:'贵阳市',district:null,mapMode:'heat'};
const functionalVisibility={guian:true,shuanglong:true};
(() => {
  const model=IndicatorData;
  const $=selector=>document.querySelector(selector);
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colors=['#47dfc2','#559dff','#ecc772','#a68de4','#e89477','#6bbcca','#90c97a','#dc8fca','#729ed0','#cfb182','#66c7ae','#b3abd9','#92b660'];
  const area=()=>state.district?.name||'';
  const context=extra=>({period:state.period,area:area(),...extra});
  const raw=(key,extra)=>model.total(key,context(extra));
  const value=(key,unit,extra)=>model.summary(key,context(extra),unit);
  const format=(number,digits=0)=>number===null?'—':Number(number).toLocaleString('zh-CN',{maximumFractionDigits:digits});
  const compact=number=>number===null?'—':Math.abs(number)>=1e8?format(number/1e8,1)+'亿':Math.abs(number)>=1e4?format(number/1e4,1)+'万':format(number);
  const attrs=(key,extra={})=>{const {area:scopeArea=area(),period:scopePeriod=state.period,...rest}=extra;return `data-indicator="${key}" data-period="${scopePeriod}" data-area="${escape(scopeArea)}" ${Object.entries(rest).map(([name,value])=>`data-${name}="${escape(value)}"`).join(' ')}`;};
  const officialCount=category=>officialTourismResources.filter(row=>row.category===category&&(!area()||row.area===area())).length;
  const mini=(key,label,unit)=>`<button class="small-metric" ${attrs(key)}><span>${label}</span><strong>${value(key,unit)}<small>${unit||model.definitions[key].unit}</small></strong></button>`;
  const panel=(title,body,key,extra='',group)=>`<section class="p-panel ${extra}"><header class="p-panel-head"><h3>${title}</h3><button ${key.startsWith('official')?`data-official="${key.slice(-1)}"`:attrs(key,group?{group}:{})}>查看明细 ↗</button></header><div class="panel-body">${body}</div></section>`;
  function ring(items,label,total,unit='个',totalKey){
    const sum=items.reduce((n,item)=>n+(item.value||0),0),circumference=2*Math.PI*76;
    let cursor=0;
    const core=`<strong>${total}</strong><span>${label}</span>`;
    return `<div class="ring-graphic"><svg viewBox="0 0 180 180" role="img" aria-label="${label}结构"><circle cx="90" cy="90" r="76" stroke="#17435c"/>${items.map((item,index)=>{const length=sum?item.value/sum*circumference:0,offset=cursor;cursor+=length;return `<circle cx="90" cy="90" r="76" stroke="${colors[index%colors.length]}" stroke-dasharray="${Math.max(0,length-3)} ${circumference}" stroke-dashoffset="${-offset}" ${item.key?attrs(item.key,item.scope||(item.type?{type:item.type,group:'entity'}:{})):''} tabindex="0" role="button"><title>${escape(item.name)}：${format(item.value)}${unit}（${sum?(item.value/sum*100).toFixed(1):'0.0'}%）</title></circle>`;}).join('')}</svg>${totalKey?`<button class="ring-core spend-total" ${attrs(totalKey)} aria-label="查看${escape(label)}明细">${core}<small>亿元 · 查看明细 ↗</small></button>`:`<div class="ring-core">${core}</div>`}</div>`;
  }
  function ranks(rows,key,options={}){
    const max=Math.max(...rows.map(row=>row.value||0),1),total=rows.reduce((sum,row)=>sum+(row.value||0),0);
    return `<div class="rank-list">${rows.map((row,index)=>`<button class="rank-row" ${attrs(key,options.group==='type'?{type:row.bucket,group:'entity'}:options.group==='source'?{facet:'source','facet-value':row.bucket,group:'area'}:{})} style="--bar-width:${row.value/max*100}%;--bar-color:${colors[index%colors.length]}"><span>${escape(row.bucket)}</span><i><b></b></i><strong>${options.percent?total?(row.value/total*100).toFixed(1)+'%':'—':format(row.value)}</strong></button>`).join('')}</div>`;
  }
  function chart(key,stacked=false){
    const group=model.defaultGroup(key,context()),rows=model.query(key,context({group}));
    const parts=stacked?['commercialShows','publicShows'].map(child=>({key:child,rows:model.query(child,context({group}))})):null;
    const maximum=Math.max(...rows.map(row=>row.value||0),1),width=820,height=stacked?112:160,left=68,right=805,baseline=stacked?78:121,plot=stacked?52:98,step=(right-left)/Math.max(rows.length,1);
    const point=(row,index)=>`${left+(index+.5)*step},${baseline-row.value/maximum*plot}`;
    return `<svg class="p-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${escape(model.definitions[key].name)}${group==='month'?'逐月':group==='day'?'逐日':'逐小时'}趋势">${[0,.5,1].map(r=>`<path d="M${left} ${baseline-r*plot}H${right}" stroke="#2d5f7b" stroke-dasharray="4 5"/><text x="${left-10}" y="${baseline-r*plot+7}" text-anchor="end">${compact(maximum*r)}</text>`).join('')}${stacked?'':`<polygon points="${left},${baseline} ${rows.map(point).join(' ')} ${right},${baseline}" fill="#38d4b51a"/><polyline points="${rows.map(point).join(' ')}" fill="none" stroke="#48e7cb" stroke-width="3"/>`}${rows.map((row,index)=>{const x=left+(index+.5)*step;let y=baseline;return `<g ${attrs(key,{start:row.start,end:row.end,...(row.hour!==null?{hour:row.hour}:{})})} role="button" tabindex="0" aria-label="${escape(row.bucket)} ${format(row.value)}${model.definitions[key].unit}"><rect class="chart-hit" x="${x-step/2}" y="10" width="${step}" height="${height-15}" fill="transparent"/>${stacked?parts.map((part,j)=>{const amount=part.rows.find(partRow=>partRow.bucket===row.bucket)?.value||0,h=amount/maximum*plot;y-=h;return `<rect x="${x-step*.27}" y="${y}" width="${step*.54}" height="${h}" rx="2" fill="${colors[j]}"/>`;}).join(''):`<circle cx="${x}" cy="${baseline-row.value/maximum*plot}" r="4" fill="#a1ffed"/>`}<title>${escape(row.bucket)}：${format(row.value)} ${model.definitions[key].unit}</title>${rows.length<=12||index%Math.ceil(rows.length/10)===0||index===rows.length-1?`<text x="${x}" y="${height-7}" text-anchor="middle">${group==='month'?Number(row.bucket.slice(5))+'月':group==='hour'?row.bucket.slice(-5,-3)+'时':row.bucket.slice(5)}</text>`:''}</g>`;}).join('')}</svg>`;
  }
  function headlines(){
    const groups={culture:[['libraryIn','市图书馆游客接待人次','万人次','▤'],['childrenIn','少儿图书馆游客接待人次','万人次','▤'],['artsIn','群艺馆游客接待人次','万人次','▤']],overview:[['visitors','游客接待人次','万人次','◎'],['spend','旅游总花费','亿元','◈'],['perCapita','人均旅游花费','元/人次','◷']],tourism:[['scenicIn','景区游客接待人次','万人次','◇'],['scenicNow','实时在园人数','人','◎'],['official0','A级景区','处','▧']]};
    Object.entries(groups).forEach(([zone,items])=>{
      if(zone==='culture'){$('#culture-metrics').innerHTML=venues();return;}
      $('#'+zone+'-metrics').innerHTML=items.map(([key,label,unit,icon])=>`<button class="headline-card" ${key==='official0'?'data-official="0"':attrs(key)} style="--accent:${zone==='culture'?'#66dfec':zone==='overview'?'#48efc4':'#eccb80'}"><div class="headline-icon"><span>${icon}</span></div><div class="headline-copy"><p>${label}</p><div class="headline-value">${key==='official0'?officialCount(0):value(key,unit)}<small>${unit}</small></div></div><span>${key==='official0'||model.definitions[key].kind==='snapshot'?'资源快照':state.period} ↗</span></button>`).join('');
    });
  }
  function venues(){
    const items=[['libraryIn','市图书馆'],['childrenIn','少儿图书馆'],['artsIn','群艺馆']];
    const yesterday=model.periodRange('昨日').start;
    return items.map(([key,label],index)=>`<article class="headline-card venue-card" style="--accent:${colors[index]}"><button class="venue-card-name" data-venue="${key}"><span>▤</span>${label}<small>↗</small></button><button class="venue-card-total" ${attrs(key,{period:'本年'})}><span>累计到馆<small>本年</small></span><b>${value(key,'万人次',{period:'本年'})}<small>万人次</small></b></button><button class="venue-card-yesterday" ${attrs(key,{period:'昨日'})} title="${yesterday}游客接待人次"><span>昨日到馆</span><b>${value(key,'人次',{period:'昨日'})}<small>人次</small></b></button></article>`).join('');
  }
  let activityCursor=0;
  function featuredRows(){
    const range=model.periodRange(state.period);
    return ActivityLedger.filter(row=>(!area()||row.area===area())&&row.date>=range.start&&row.date<=range.end).sort((first,second)=>second.date.localeCompare(first.date)||first.id.localeCompare(second.id)).slice(0,8);
  }
  function featuredCards(){
    const rows=featuredRows();
    return rows.length?Array.from({length:Math.min(4,rows.length)},(_,index)=>rows[(activityCursor+index)%rows.length]).map(row=>`<button class="featured-activity" data-featured="${row.id}"><span class="featured-date"><b>${row.date.slice(8)}</b><small>${Number(row.date.slice(5,7))}月</small></span><span class="featured-copy"><strong>${escape(row.name)}</strong><span><em>${escape(row.type)}</em>${escape(row.area)}<i>·</i>${row.status}</span></span><span class="featured-arrow">↗</span></button>`).join(''):'<div class="featured-empty">当前区域与周期暂无重点活动摘录</div>';
  }
  function featuredActivities(){
    return `<section class="p-panel featured-panel"><header class="p-panel-head"><h3>重点活动</h3><div><span>活动摘录 · 演示</span><button data-featured-all>查看目录 ↗</button><button data-featured-next aria-label="下一组重点活动">↓</button></div></header><div class="panel-body featured-activity-roll" aria-live="off">${featuredCards()}</div></section>`;
  }
  function openFeatured(identifier){
    const rows=featuredRows(),modal=$('#metric-dialog');
    modal.innerHTML=`<div class="dialog-head"><h2>重点活动目录 <small>${escape(area()||'贵阳贵安全域')} · ${state.period} · ${rows.length}项摘录</small></h2><button data-featured-close aria-label="关闭重点活动目录">×</button></div><div class="warning-dialog-body"><div class="warning-table-wrap"><table class="warning-table featured-table"><thead><tr><th>活动时间</th><th>所属区域</th><th>活动名称</th><th>活动类别</th><th>状态</th></tr></thead><tbody>${rows.map(row=>`<tr class="${identifier===row.id?'warning-selected':''}"><td>${row.date}</td><td>${escape(row.area)}</td><td>${escape(row.name)}</td><td>${escape(row.type)}</td><td>${row.status}</td></tr>`).join('')||'<tr><td colspan="5">当前范围暂无重点活动摘录</td></tr>'}</tbody></table></div><p class="warning-footnote">摘录来自现有活动原型中的重点活动演示名录，按活动日期和区域筛选，不代表文化活动场次底表的全部记录。</p></div>`;
    modal.querySelector('[data-featured-close]').onclick=()=>modal.close();if(!modal.open)modal.showModal();
    modal.querySelector('.warning-selected')?.scrollIntoView?.({block:'nearest'});
  }
  function activities(){
    const total=raw('cultureActivities');
    const types=model.query('cultureActivities',context({group:'type'}));
    const allAreas=model.query('cultureActivities',context({group:'area'})).filter(row=>row.value>0).sort((a,b)=>b.value-a.value);
    const regions=allAreas.slice(0,5).map(row=>({...row,scope:{area:row.bucket,group:'entity'}}));
    if(allAreas.length>5)regions.push({bucket:'其他区域',value:allAreas.slice(5).reduce((sum,row)=>sum+row.value,0),scope:{group:'area'},members:allAreas.slice(5).map(row=>row.bucket).join('、')});
    const distribution=(rows,label,type=false)=>`<section class="activity-share" data-share="${type?'type':'area'}"><h4>${label}<small>场次 / 占比</small></h4><div class="activity-share-body">${ring(rows.map(row=>({name:row.bucket,value:row.value,key:'cultureActivities',scope:type?{type:row.bucket,group:'entity'}:row.scope})),label,format(total),'场')}<div class="activity-share-key">${rows.map((row,i)=>`<button ${attrs('cultureActivities',type?{type:row.bucket,group:'entity'}:row.scope)} data-share-value="${row.value}" style="--tone:${colors[i]}" title="${escape(row.members||row.bucket)}"><i></i><span>${escape(row.bucket.replace('双龙航空港经济区','双龙').replace('贵安新区','贵安'))}</span><b>${format(row.value)}</b><em>${total?(row.value/total*100).toFixed(1):'0.0'}%</em></button>`).join('')||'<p class="panel-note">当前范围暂无活动</p>'}</div></div></section>`;
    return `<div class="activity-composition"><section class="activity-time"><div class="activity-summary"><button ${attrs('cultureActivities')}>活动 <b>${value('cultureActivities')}</b>场</button><span>${state.period==='本年'?'逐月':state.period==='本月'?'逐日':'逐小时'}趋势</span></div>${chart('cultureActivities',true)}<div class="chart-legend"><span><i style="--tone:${colors[0]}"></i>营业性演出</span><span><i style="--tone:${colors[1]}"></i>公益演出</span></div></section>${distribution(types,'活动类别占比',true)}${distribution(regions,'区域占比')}</div>`;
  }
  function culture(){
    $('#culture-content').innerHTML=featuredActivities()+panel('文化活动供给',activities(),'cultureActivities','wide-panel activity-panel');
  }
  function resource(){
    const records=officialTourismResources.filter(row=>row.category===0&&(!area()||row.area===area()));
    const grades=['AAAAA','AAAA','AAA','AA'].map(grade=>({grade,count:records.filter(row=>row.grade===grade).length})).filter(row=>row.count);
    const all=model.query('scenicIn',context({group:'entity'})).sort((a,b)=>b.value-a.value).slice(0,4);
    const short=name=>ScenicOverview.anchors.find(a=>officialTourismResources.find(r=>r.id==='official-scenic-'+a[0])?.name===name)?.[1]||name.replace(/^贵阳市/,'').replace(/旅游景区$|景区$/,'');
    return `<div class="resource-summary"><button data-official="0">A级景区<b>${records.length}</b><small>处 ↗</small></button><button data-official="1">星级酒店<b>${officialCount(1)}</b><small>家 ↗</small></button><small>官方名录快照</small></div><div class="grade-bar" aria-label="景区等级构成">${grades.map((row,i)=>`<button data-grade="${row.grade}" style="flex:${row.count};--tone:${colors[i]}" title="${row.grade}：${row.count}处"></button>`).join('')}</div><div class="grade-legend">${grades.map((row,i)=>`<button data-grade="${row.grade}" style="--tone:${colors[i]}"><i></i>${row.grade}<b>${row.count}</b></button>`).join('')}</div><table class="scenic-rank"><colgroup><col style="width:49%"><col style="width:21%"><col></colgroup><thead><tr><th>景区接待排名</th><th>所属区域</th><th>万人次</th></tr></thead><tbody>${all.map(row=>`<tr><td><button data-scenic="${row.resourceId}" title="${escape(row.bucket)}">${escape(short(row.bucket))} ↗</button></td><td>${escape(row.area.replace('双龙航空港经济区','双龙'))}</td><td>${format(row.value/10000,2)}</td></tr>`).join('')||'<tr><td colspan="3">当前区域暂无A级景区记录</td></tr>'}</tbody></table>`;
  }
  // Province-wide profile is a separate percentage mockup, not a Guiyang aggregation.
  const provinceProfileDemo={age:[['18岁以下',6],['18—29岁',25],['30—44岁',36],['45—59岁',22],['60岁以上',9],['未知',2]],gender:[['女性',52],['男性',46],['未知',2]]};
  function provinceProfile(){
    return `<section class="province-profile" data-profile-scope="贵州省"><h4>全省客流画像 <button data-province-profile aria-label="查看全省客流画像">↗</button></h4><div class="province-profile-caption">省级比例演示</div><div class="province-age-list">${provinceProfileDemo.age.map(([label,percent],i)=>`<div><span>${label}</span><i><b style="width:${percent/36*100}%;background:${colors[i]}"></b></i><strong>${percent}%</strong></div>`).join('')}</div><div class="province-gender-stack" aria-label="全省游客性别比例演示">${provinceProfileDemo.gender.map(([label,percent],i)=>`<i style="width:${percent}%;background:${colors[i]}" title="${label} ${percent}%">${percent>10?percent+'%':''}</i>`).join('')}</div><div class="province-gender-key">${provinceProfileDemo.gender.map(([label],i)=>`<span><i style="background:${colors[i]}"></i>${label}</span>`).join('')}</div><p class="province-profile-note">全省范围 · 不随区县下钻</p></section>`;
  }
  function openProvinceProfile(){
    const modal=$('#metric-dialog');
    modal.innerHTML=`<div class="dialog-head"><h2>全省客流画像 <small>贵州省 · 比例演示</small></h2><button data-province-close aria-label="关闭全省画像">×</button></div><div class="warning-dialog-body"><p class="warning-footnote">省级画像接口尚未接入，以下为独立的比例样例。未使用贵阳市或景区数据代替全省数据；不表示当前区县、所选期间的实测结果。</p><div class="province-profile-tables">${[['年龄结构','age'],['性别结构','gender']].map(([title,key])=>`<section><h3>${title}</h3><table class="warning-table"><thead><tr><th>分类</th><th>占比</th></tr></thead><tbody>${provinceProfileDemo[key].map(([label,percent])=>`<tr><td>${label}</td><td>${percent}%</td></tr>`).join('')}<tr><td>合计</td><td>100%</td></tr></tbody></table></section>`).join('')}</div></div>`;
    modal.querySelector('[data-province-close]').onclick=()=>modal.close();if(!modal.open)modal.showModal();
  }
  function spending(){
    const parts=model.parts('spend',context()),total=raw('spend');
    const graphic=ring(parts.map(part=>({name:part.name,value:part.value,key:part.key})),'旅游总花费',value('spend','亿元'),'元','spend');
    return `<div class="spend-body">${graphic}<div class="spend-list">${parts.map((part,i)=>`<button class="spend-item" ${attrs(part.key)} style="--tone:${colors[i]};--width:${total?part.value/total*100:0}%"><span><i></i>${['吃','住','行','游','购','娱'][i]}<em>${total?(part.value/total*100).toFixed(1):'0.0'}%</em></span><b>${format(part.value/100000000,2)}<small>亿元</small></b><div><i></i></div></button>`).join('')}</div></div>`;
  }
  const cameras=['黔灵山 · 入园广场','青岩古镇 · 游客通道','天河潭 · 核心游览区'];
  function scene(index){
    return `<svg viewBox="0 0 400 230" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${cameras[index]}监控示意，非实时画面"><rect width="400" height="230" fill="#245064"/><circle cx="328" cy="43" r="21" fill="#d0dcad77"/><path d="M0 148 70 37 143 115 211 47 294 129 357 72 400 121V230H0" fill="#2b6569"/><path d="M0 180 85 115 181 162 280 94 400 150V230H0" fill="#164452"/>${index===1?'<path d="M62 147h110v70H62zm168-18h111v88H230" fill="#637c7d"/><path d="M43 147l75-43 74 43zm169-19l73-43 74 43" fill="#163245"/><path d="M105 217v-47h28v47m139 0v-54h26v54" fill="#102d41"/>':index===2?'<path d="M0 230Q142 130 400 175V230" fill="#267c8b"/><path d="M40 212Q174 150 350 173" fill="none" stroke="#a6ac9077" stroke-width="10"/>':'<path d="M90 230 168 144H228L350 230" fill="#6f8b8a"/><path d="M156 145v-27h85v27m-100-27 59-31 57 31" fill="#a09c80"/>'}<path d="M10 30V10H30m340 0h20v20M10 200v20h20m340 0h20v-20" fill="none" stroke="#d9fbf377"/><text x="20" y="212" fill="#b0d5d9" font-size="12">CAM 0${index+1} · DEMO</text></svg>`;
  }
  function monitors(){return `<div class="panorama-monitor-grid">${cameras.map((name,i)=>`<button class="panorama-monitor" data-camera="${i}">${scene(i)}<span class="camera-tag">● 监控示意 · 待接入</span><b>${name}</b></button>`).join('')}</div>`;}
  const scenicRecord=id=>officialTourismResources.find(row=>row.id==='official-scenic-'+id);
  const scenicName=id=>ScenicOverview.anchors.find(row=>row[0]===id)?.[1]||scenicRecord(id)?.name||'';
  const weatherWarnings=[
    {id:'weather-1',name:'暴雨',level:'橙色',tone:'#f6a45b',time:'08:30',valid:'08:30—14:30',scenic:[26,42],message:'演练：短时强降水，关注低洼地段、涉水游线及山体周边安全。'},
    {id:'weather-2',name:'雷电',level:'黄色',tone:'#ead36e',time:'09:10',valid:'09:10—15:10',scenic:[10,12],message:'演练：雷电天气，关注户外活动、临水游览和高处设施。'},
    {id:'weather-3',name:'大雾',level:'黄色',tone:'#ead36e',time:'07:50',valid:'07:50—11:50',scenic:[1,5],message:'演练：低能见度，关注景区接驳交通及游览通道引导。'},
    {id:'weather-4',name:'高温',level:'黄色',tone:'#ead36e',time:'10:00',valid:'10:00—18:00',scenic:[45,47],message:'演练：高温天气，关注排队区域防暑、补水及户外游览时长。'}
  ];
  // Independent drill scenario: never substitute these values for the visitor snapshot above.
  const crowdWarnings=[{id:'crowd-1',scenic:[1],rate:1.04,level:'红色',tone:'#ff8080'},{id:'crowd-2',scenic:[10],rate:.93,level:'橙色',tone:'#f6a45b'},{id:'crowd-3',scenic:[12],rate:.84,level:'黄色',tone:'#ead36e'}].map(row=>{
    const entity=model.entities('scenic').find(entity=>entity.resourceId==='official-scenic-'+row.scenic[0]);
    const capacity=model.total('scenicCapacity',{entityId:entity.id});
    const count=Math.round(capacity*row.rate);
    return {...row,name:'客流承载',capacity,count,rate:capacity?count/capacity:0,time:'18:00',valid:'固定演练快照',message:'按瞬时在园人数 ÷ 瞬时承载量计算。黄色为80%至不足90%，橙色为90%至不足100%，红色为100%及以上；阈值为演练配置。'};
  });
  let weatherCursor=0;
  const inWarningScope=row=>!area()||row.scenic.some(id=>scenicRecord(id)?.area===area());
  const affectedNames=row=>row.scenic.map(id=>scenicName(id)).join('、');
  function weatherCards(){
    const rows=weatherWarnings.filter(inWarningScope);
    return rows.length?Array.from({length:Math.min(2,rows.length)},(_,index)=>rows[(weatherCursor+index)%rows.length]).map(row=>`<button class="weather-warning-card" data-warning="${row.id}" style="--warn-tone:${row.tone}"><div><strong>${row.name}${row.level}预警</strong><time>${row.time} 发布 · 演练</time></div><p><span>关联景区</span><b>${escape(affectedNames(row))}</b></p><small>${escape(row.scenic.map(id=>scenicRecord(id).area).join(' / '))}　有效 ${row.valid}</small></button>`).join(''):'<div class="safety-empty">当前区域暂无模拟天气预警</div>';
  }
  function safety(){
    const weather=weatherWarnings.filter(inWarningScope),crowd=crowdWarnings.filter(inWarningScope);
    return `<section class="p-panel wide-panel safety-panel"><header class="p-panel-head"><h3>景区天气与客流预警 <small>模拟预警</small></h3></header><div class="panel-body"><div class="safety-columns"><section class="weather-warning-section"><div class="safety-subhead"><h4>天气预警 <b>${weather.length}</b></h4><button data-warning-all="weather">全部预警 ↗</button><button data-weather-next aria-label="下一组天气预警">↓</button></div><div class="weather-warning-roll" aria-live="polite">${weatherCards()}</div></section><section><div class="safety-subhead"><h4>客流预警 <b>${crowd.length}</b></h4><button data-warning-all="crowd">全部预警 ↗</button></div><div class="crowd-warning-list">${crowd.map(row=>`<button class="crowd-warning-card" data-warning="${row.id}" style="--warn-tone:${row.tone}"><span>${scenicName(row.scenic[0])}</span><div><b>${format(row.count)}</b><small> / ${format(row.capacity)}人</small></div><strong>${(row.rate*100).toFixed(1)}%</strong><i style="--rate:${Math.min(row.rate,1)*100}%"></i></button>`).join('')||'<div class="safety-empty">当前区域暂无模拟客流预警</div>'}</div><p class="warning-snapshot">${model.asOf} 18:00 演练快照 · 人数 / 瞬时承载量 / 承载率</p></section></div></div></section>`;
  }
  function openWarnings(kind='weather',selectedId=''){
    const modal=$('#metric-dialog'),source=kind==='weather'?weatherWarnings:crowdWarnings;
    let scope=area(),level='',search='';
    function draw(){
      const rows=source.filter(row=>(!scope||row.scenic.some(id=>scenicRecord(id)?.area===scope))&&(!level||row.level===level)&&(!search||affectedNames(row).includes(search)));
      modal.innerHTML=`<div class="dialog-head"><h2>景区${kind==='weather'?'天气':'客流'}预警 <small>模拟场景 · ${model.asOf}</small></h2><button data-warning-close aria-label="关闭预警列表">×</button></div><div class="warning-dialog-body"><form class="warning-filters"><label>区域<select name="area"><option value="">全部区域</option>${model.regions.map(name=>`<option ${name===scope?'selected':''}>${name}</option>`).join('')}</select></label><label>级别<select name="level"><option value="">全部级别</option>${[...new Set(source.map(row=>row.level))].map(name=>`<option ${name===level?'selected':''}>${name}</option>`).join('')}</select></label><label>景区<input name="search" value="${escape(search)}" placeholder="输入景区名称"></label><button>查询</button><button type="button" data-warning-reset>重置</button><span>共 ${rows.length} 条预警</span></form><div class="warning-table-wrap"><table class="warning-table"><thead><tr><th>预警</th><th>${kind==='weather'?'发布 / 有效时间':'在园 / 瞬时承载量'}</th><th>关联景区与所属区域</th><th>${kind==='weather'?'提示':'承载率 / 规则'}</th></tr></thead><tbody>${rows.map(row=>`<tr class="${selectedId===row.id?'warning-selected':''}"><td><span style="color:${row.tone}">${row.name}${row.level}预警</span><small>演练 · ${row.id}</small></td><td>${kind==='weather'?`${row.time}<small>${row.valid}</small>`:`${format(row.count)} / ${format(row.capacity)} 人<small>18:00 快照</small>`}</td><td>${row.scenic.map(id=>`<button data-warning-scenic="${id}">${escape(scenicName(id))} ↗</button><small>${escape(scenicRecord(id).area)}</small>`).join('')}</td><td>${kind==='crowd'?`<b style="color:${row.tone}">${(row.rate*100).toFixed(1)}%</b><br>`:''}${escape(row.message)}</td></tr>`).join('')||'<tr><td colspan="4">当前筛选条件下暂无预警</td></tr>'}</tbody></table></div><p class="warning-footnote">预警使用独立模拟场景，尚未接入气象或实时客流预警接口。客流演练数值与顶部在园人数快照为不同场景，不互相汇总；天气关联景区依据演练区域配置。</p></div>`;
      modal.querySelector('[data-warning-close]').onclick=()=>modal.close();
      const form=modal.querySelector('form'),apply=()=>{scope=form.querySelector('[name=area]').value;level=form.querySelector('[name=level]').value;search=form.querySelector('[name=search]').value.trim();selectedId='';draw();};
      form.onsubmit=e=>{e.preventDefault();apply();};form.querySelectorAll('select').forEach(select=>select.onchange=apply);
      modal.querySelector('[data-warning-reset]').onclick=()=>{scope=level=search=selectedId='';draw();};
      modal.querySelectorAll('[data-warning-scenic]').forEach(button=>button.onclick=()=>{modal.close();openScenicDetail('official-scenic-'+button.dataset.warningScenic);});
      modal.querySelector('.warning-selected')?.scrollIntoView?.({block:'nearest'});
    }
    draw();if(!modal.open)modal.showModal();
  }
  function tourism(){
    $('#tourism-content').innerHTML=panel('景区资源与接待',resource(),'official0','resource-panel')+panel('重点景区监控',monitors(),'scenicNow','monitor-panel')+safety();
    const more=$('#tourism-content .monitor-panel .p-panel-head button');more.removeAttribute('data-indicator');more.dataset.camera='0';
  }
  function overview(){
    $('#map-left').innerHTML=provinceProfile();
    const regionRows=model.query('visitors',{period:state.period,group:'area'}).sort((first,second)=>second.value-first.value);
    const functionalAreas=['贵安新区','双龙航空港经济区','高新区'];
    const maximum=Math.max(...regionRows.map(row=>row.value),1);
    const regionList=(rows,kind)=>`<div class="reception-list" data-reception-kind="${kind}">${rows.map((row,index)=>`<button class="map-area-row ${area()===row.bucket?'is-active':''}" data-area="${row.bucket}" aria-pressed="${area()===row.bucket}" style="--reception-width:${row.value/maximum*100}%"><i>${String(index+1).padStart(2,'0')}</i><span>${row.bucket.replace('双龙航空港经济区','双龙').replace('贵安新区','贵安')}</span><b>${format(row.value/10000,1)}</b><em></em></button>`).join('')}</div>`;
    $('#map-right').innerHTML=`<h4>区县游客接待<small>万人次 · ${state.period}</small></h4>${regionList(regionRows.filter(row=>!functionalAreas.includes(row.bucket)),'district')}<h5>功能区 · 独立管理归属</h5>${regionList(regionRows.filter(row=>functionalAreas.includes(row.bucket)),'functional')}`;
    $('#overview-bottom').innerHTML=panel('游客接待趋势',chart('visitors'),'visitors')+panel('六业旅游消费构成',spending(),'spend','overview-spending');
  }
  let map;
  function mountMap(){
    if(map){map.remove();map=null;}
    $('#map-panel').classList.remove('scenic-map');
    const error=$('#map-error');error.hidden=true;
    try{
      const city=GUIYANG_MAP_DATA['guiyang.json'],functional=GUIYANG_MAP_DATA['functional-boundaries.json'];
      const active=[...city.features,...functional.features].find(row=>row.properties.name===area());
      const featureData=active?{type:'FeatureCollection',features:[active]}:city;
      map=L.map('unified-map',{zoomControl:false,attributionControl:false,scrollWheelZoom:true,doubleClickZoom:false,zoomSnap:.1,zoomDelta:.4,minZoom:7,maxZoom:14,wheelPxPerZoomLevel:100});
      const totals=model.query('visitors',{period:state.period,group:'area'}),max=Math.max(...totals.map(row=>row.value),1);
      const baseStyle=feature=>({color:'#65c7e3',weight:1.6,fillColor:state.mapMode==='area'?`hsl(192 65% ${20+(totals.find(row=>row.bucket===feature.properties.name)?.value||0)/max*20}%)`:'#145775',fillOpacity:.88});
      const borders=L.geoJSON(featureData,{style:baseStyle,onEachFeature(feature,layer){
        layer.on('click',event=>{L.DomEvent.stopPropagation(event);if(area()!==feature.properties.name)setArea(feature.properties.name);});
        layer.on('mouseover',()=>layer.setStyle({weight:3,color:'#c2fff6'}));
        layer.on('mouseout',()=>layer.setStyle(baseStyle(feature)));
        layer.on('add',()=>{const el=layer.getElement();el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label','下钻'+feature.properties.name);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setArea(feature.properties.name);}});});
        if(state.mapMode==='area'){
          const center=feature.properties.centroid||feature.properties.center,position=center?[center[1],center[0]]:layer.getBounds().getCenter();
          L.marker(position,{icon:L.divIcon({className:'map-county-label',html:`<span>${feature.properties.name}</span>`,iconSize:[180,32],iconAnchor:[90,16]}),autoPanOnFocus:false,title:feature.properties.name}).addTo(map).on('click',()=>setArea(feature.properties.name));
        }
      }}).addTo(map);
      const bounds=borders.getBounds();
      if(!active){
        map.createPane('functionalReference').style.zIndex=450;
        L.geoJSON(functional,{pane:'functionalReference',style:feature=>({color:feature.properties.color,fillColor:feature.properties.color,weight:3.4,dashArray:'9 3',fillOpacity:.46}),onEachFeature(feature,layer){
          bounds.extend(layer.getBounds());
          layer.on('click',event=>{L.DomEvent.stopPropagation(event);setArea(feature.properties.name);});
          layer.on('mouseover',()=>layer.setStyle({weight:4,fillOpacity:.62}));layer.on('mouseout',()=>layer.setStyle({weight:3.4,fillOpacity:.46}));
          layer.on('add',()=>{const el=layer.getElement();el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label','下钻'+feature.properties.name);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setArea(feature.properties.name);}});});
          if(state.mapMode==='area'){const position=feature.properties.id==='guian'?[26.459,106.472]:[26.50,106.84];L.marker(position,{icon:L.divIcon({className:'map-function-label',html:`<span style="--tone:${feature.properties.color}">${feature.properties.id==='guian'?'贵安新区':'双龙航空港'}</span>`,iconSize:[180,30],iconAnchor:[90,15]}),autoPanOnFocus:false}).addTo(map).on('click',()=>setArea(feature.properties.name));}
        }}).addTo(map);
      }
      map.fitBounds(bounds,{paddingTopLeft:[32,66],paddingBottomRight:[32,56],maxZoom:12,animate:false});
      if(state.mapMode==='heat'){
        mountScenicOverview(map,featureData,functional,area());
        $('#map-panel .boundary-readout').innerHTML=`<span>景区客流热度 · ${state.period} · 示意点位</span><span class="scenic-heat-legend">低 <i></i> 高</span>`;
      }else{
        $('#map-panel .boundary-readout').innerHTML='<span>区域游客接待人次 · 点击区县下钻</span><span class="area-map-key">低 → 高 / 深蓝 → 亮青</span>';
        $('#map-panel .boundary-note').textContent='实线：行政区 · 虚线：贵安、双龙近似参考范围；业务按独立管理归属统计';
      }
      if(area()&&!active){$('#map-panel .boundary-note').textContent=area()+'暂无独立矢量边界，当前保留全域地图；业务数据已按该区域筛选。';}
    }catch(e){
      error.hidden=false;error.innerHTML='<span>地图暂未加载</span><button id="retry-map">重新加载地图</button>';$('#retry-map').onclick=mountMap;console.error(e);
    }
  }
  function render(){
    $('#scope-label').textContent=area()||'贵阳贵安 · 全域';$('#map-scope').textContent=area()||'贵阳贵安';
    $('#reset-area').hidden=!area();$('#map-up').hidden=!area();$('#region').value=area();
    $('#periods').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.period===state.period)));
    document.querySelectorAll('[data-map-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mapMode===state.mapMode)));
    const range=model.periodRange(state.period);$('#data-range').textContent=range.start+' — '+range.end;
    headlines();culture();tourism();overview();mountMap();
  }
  function setArea(name){state.district=name?{name}:null;render();}
  function openOfficial(category,grade){
    const modal=$('#metric-dialog');
    openOfficialDirectory(modal,category,area()||'全域',context());
    if(grade){const button=modal.querySelector(`[data-od-grade="${grade}"]`);button?.click();}
  }
  function openCamera(index){
    const modal=$('#metric-dialog');
    modal.innerHTML=`<div class="dialog-head"><h2>${cameras[index]} · 监控示意</h2><button data-monitor-close aria-label="关闭监控详情">×</button></div><div class="monitor-modal-scene">${scene(index)}<p>展示景区监控点位及切换交互，非实时画面。当前全域筛选不改变固定监控点位。</p></div><div class="monitor-modal-switch">${cameras.map((name,i)=>`<button data-modal-camera="${i}" aria-pressed="${i===index}">${name}</button>`).join('')}</div>`;
    modal.querySelector('[data-monitor-close]').onclick=()=>modal.close();modal.querySelectorAll('[data-modal-camera]').forEach(button=>button.onclick=()=>openCamera(Number(button.dataset.modalCamera)));if(!modal.open)modal.showModal();
  }
  $('#region').innerHTML='<option value="">贵阳贵安 · 全域</option>'+model.regions.map(name=>`<option value="${name}">${name}</option>`).join('');
  $('#region').onchange=event=>setArea(event.target.value);$('#reset-area').onclick=()=>setArea('');$('#map-up').onclick=()=>setArea('');
  $('#periods').querySelectorAll('button').forEach(button=>button.onclick=()=>{state.period=button.dataset.period;render();});
  document.querySelectorAll('[data-map-mode]').forEach(button=>button.onclick=()=>{state.mapMode=button.dataset.mapMode;mountMap();document.querySelectorAll('[data-map-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
  document.addEventListener('click',event=>{
    const featured=event.target.closest('[data-featured],[data-featured-all],[data-featured-next]');
    if(featured?.closest('#panorama')){
      if(featured.hasAttribute('data-featured-next')){activityCursor++;$('.featured-activity-roll').innerHTML=featuredCards();}
      else openFeatured(featured.dataset.featured);
      return;
    }
    if(event.target.closest('[data-province-profile]')){openProvinceProfile();return;}
    const warningTarget=event.target.closest('[data-warning],[data-warning-all],[data-weather-next]');
    if(warningTarget?.closest('#panorama')){
      if(warningTarget.hasAttribute('data-weather-next')){weatherCursor++;const roll=$('.weather-warning-roll');if(roll)roll.innerHTML=weatherCards();}
      else if(warningTarget.dataset.warningAll)openWarnings(warningTarget.dataset.warningAll);
      else openWarnings(warningTarget.dataset.warning.startsWith('weather')?'weather':'crowd',warningTarget.dataset.warning);
      return;
    }
    const target=event.target.closest('[data-official],[data-grade],[data-scenic],[data-camera],[data-area],[data-venue]');if(!target||!target.closest('#panorama'))return;
    if(target.hasAttribute('data-official'))openOfficial(Number(target.dataset.official));
    else if(target.hasAttribute('data-grade'))openOfficial(0,target.dataset.grade);
    else if(target.hasAttribute('data-scenic'))openScenicDetail(target.dataset.scenic);
    else if(target.hasAttribute('data-camera'))openCamera(Number(target.dataset.camera));
    else if(target.hasAttribute('data-venue'))openIndicatorDrill(target.dataset.venue,{...context(),group:state.period==='本年'?'month':state.period==='本月'?'day':'hour',lockArea:true,metricOptions:[{key:'libraryIn',name:'市图书馆'},{key:'childrenIn',name:'市少儿图书馆'},{key:'artsIn',name:'市群艺馆'}]});
    else if(target.hasAttribute('data-area'))setArea(target.dataset.area);
  });
  const fit=()=>document.documentElement.style.setProperty('--panorama-scale',Math.min(innerWidth/5760,innerHeight/1080));
  addEventListener('resize',()=>{fit();map?.invalidateSize({animate:false});});fit();
  const tick=()=>$('#wall-clock').textContent=new Date().toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}).replaceAll('/','.');tick();setInterval(tick,1000);
  setInterval(()=>{const roll=$('.weather-warning-roll');if(roll&&!document.querySelector('dialog[open]')&&!roll.matches(':hover')&&!roll.contains(document.activeElement)){weatherCursor++;roll.innerHTML=weatherCards();}},6500);
  setInterval(()=>{const roll=$('.featured-activity-roll');if(roll&&featuredRows().length>4&&!document.querySelector('dialog[open]')&&!roll.matches(':hover')&&!roll.contains(document.activeElement)){activityCursor++;roll.innerHTML=featuredCards();}},5500);
  $('#as-of').textContent=model.asOf;
  $('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#fullscreen').textContent='请按 F11 全屏';}};
  document.addEventListener('fullscreenchange',()=>$('#fullscreen').textContent=document.fullscreenElement?'⛶ 退出全屏':'⛶ 全屏展示');
  globalThis.PanoramaScreen={render,setArea,context,dimensions:{width:5760,height:1080}};
  render();
})();
