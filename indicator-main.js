(() => {
  const model=IndicatorData;
  const pageKeys={eat:'eatSpend',stay:'staySpend',transport:'transportSpend',travel:'travelSpend',shop:'shopSpend',entertain:'entertainSpend'};
  const mainContext=period=>({period:period||state.period,area:state.district?.name||''});
  const labelKey=label=>/夜间人均/.test(label)?'nightPerCapita':/人均旅游消费|人均花费/.test(label)?'perCapita':/夜间消费总额/.test(label)?'nightSpend':/旅游总消费|旅游消费金额|累计消费/.test(label)?'spend':/累计接待|接待游客/.test(label)?'visitors':/入住率/.test(label)?'occupancy':null;
  const metricFormat=(key,context,unit)=>model.summary(key,context,unit);
  const baseChart=chart;
  chart=function(key='chart',bar=false){
    if(state.page==='emergency')return baseChart(key,bar);
    const metricKey=key==='reception'?['scenicIn','hotelGuests','teams'][state.tab.reception||0]:key==='night'?'nightSpend':key==='sector'?pageKeys[state.page]||'spend':['consume','comparison'].includes(key)?'spend':key==='industryTrend'?(state.page==='travel'?'scenicIn':state.page==='stay'?'hotelGuests':pageKeys[state.page]||'visitors'):'visitors';
    const context=mainContext();
    const group=state.period==='昨日'?'hour':key==='industryTrend'?(state.tab.industryTrend||0)===0?'day':'month':state.period==='本年'?'month':'day';
    let rows=model.query(metricKey,{...context,group}).map(row=>({...row,key:metricKey}));
    if(key==='comparison'&&state.tab.comparison)rows=model.parts('spend',context).map(row=>({...row,bucket:row.name}));
    if(key==='flow'&&state.tab.flow)rows=[['元旦','2026-01-01','2026-01-03'],['春节','2026-02-15','2026-02-23'],['清明','2026-04-04','2026-04-06'],['劳动','2026-05-01','2026-05-05'],['端午','2026-06-19','2026-06-21'],['中秋','2026-09-25','2026-09-27']].map(([bucket,start,end])=>({bucket,start,end,key:'visitors',value:model.total('visitors',{...context,start,end})}));
    const maximum=Math.max(...rows.map(row=>row.value||0),1);
    const scrollDaily=group==='day'&&rows.length>10;
    const width=scrollDaily?rows.length*48:480,height=160,step=scrollDaily?48:460/Math.max(rows.length,1);
    const unit=model.definitions[metricKey].unit;
    const graphic=`<svg class="chart" ${scrollDaily?`style="width:${rows.length/10*100}%;max-width:none;flex:none"`:''} viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${model.definitions[metricKey].name}组成"><path class="grid" d="M0 25H${width}M0 60H${width}M0 95H${width}M0 130H${width}"/>${rows.map((row,index)=>{const position=10+index*step,size=row.value/maximum*112;const bounds=row.start?`data-start="${row.start}" data-end="${row.end}"${row.hour!==null&&row.hour!==undefined?` data-hour="${row.hour}"`:''}`:'';return `<g data-indicator="${row.key}" data-period="${state.period}" data-area="${context.area}" ${bounds} role="button" tabindex="0" aria-label="${row.bucket} ${row.value}${unit}"><rect x="${position}" y="${130-size}" width="${Math.max(2,step*.65)}" height="${size}" fill="#42d7d0" opacity=".85"><title>${row.bucket}：${fmt(row.value)} ${unit}</title></rect>${scrollDaily||rows.length<15||index%5===0?`<text x="${position}" y="150" font-size="9">${group==='hour'?row.bucket.slice(0,2):/^2026-/.test(row.bucket)?row.bucket.slice(5):row.bucket.slice(0,4)}</text>`:''}</g>`;}).join('')}</svg>`;
    return scrollDaily?`<div class="daily-chart-scroll" tabindex="0" role="region" aria-label="逐日趋势，左右滚动查看更多日期">${graphic}</div>`:graphic;
  };
  let dailyDrag=null;
  let suppressDailyClick=false;
  document.addEventListener('pointerdown',event=>{
    const viewport=event.target.closest('.daily-chart-scroll');
    if(!viewport||event.button!==0||event.pointerType==='touch')return;
    suppressDailyClick=false;
    dailyDrag={viewport,start:event.clientX,scroll:viewport.scrollLeft,moved:false};
  });
  document.addEventListener('pointermove',event=>{
    if(!dailyDrag)return;
    const distance=event.clientX-dailyDrag.start;
    if(Math.abs(distance)>5)dailyDrag.moved=true;
    if(dailyDrag.moved){dailyDrag.viewport.scrollLeft=dailyDrag.scroll-distance;event.preventDefault();}
  });
  document.addEventListener('pointerup',()=>{if(dailyDrag){suppressDailyClick=dailyDrag.moved;dailyDrag=null;}});
  document.addEventListener('pointercancel',()=>{dailyDrag=null;suppressDailyClick=false;});
  document.addEventListener('click',event=>{if(suppressDailyClick){suppressDailyClick=false;event.preventDefault();event.stopImmediatePropagation();}},true);
  document.addEventListener('wheel',event=>{
    const viewport=event.target.closest('.daily-chart-scroll');
    if(!viewport||event.ctrlKey)return;
    const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
    if((delta>0&&viewport.scrollLeft<viewport.scrollWidth-viewport.clientWidth-1)||(delta<0&&viewport.scrollLeft>0)){viewport.scrollLeft+=delta;event.preventDefault();}
  },{passive:false});
  const originalRender=render;
  render=function(){
    originalRender();
    if(state.page==='emergency')return;
    const context=mainContext();
    $('#crumb').textContent+=' / '+(context.area||'贵阳贵安 · 全域')+' / 数据截至 '+model.asOf;
    document.querySelectorAll('#app .kpi').forEach(element=>{
      const label=element.querySelector('span')?.textContent||'';
      let key=labelKey(label),period=state.period;
      if(/本年累计/.test(label))period='本年';
      if(/本月累计/.test(label))period='本月';
      if(/昨日累计/.test(label))period='昨日';
      const bounds=/上季/.test(label)?{start:'2026-04-01',end:'2026-06-30'}:/上月/.test(label)?{start:'2026-08-01',end:'2026-08-31'}:/上周/.test(label)?{start:'2026-09-21',end:'2026-09-27'}:model.periodRange(period);
      if(state.page==='travel'&&/累计接待/.test(label))key='scenicIn';
      if(metas[state.page]&&/消费总额|旅游购物消费|娱乐消费/.test(label))key=pageKeys[state.page];
      if(!key)return;
      const unit=element.querySelector('small')?.textContent?.trim()||model.definitions[key].unit;
      element.querySelector('b').textContent=metricFormat(key,{...context,...bounds},unit);
      Object.assign(element.dataset,{indicator:key,period,area:context.area,start:bounds.start,end:bounds.end});element.setAttribute('tabindex','0');element.setAttribute('role','button');
    });
    document.querySelectorAll('#app [data-legacy]').forEach(button=>{
      const key=({flow:'visitors',reception:['scenicIn','hotelGuests','teams'][state.tab.reception||0],origin:'visitors',consumption:'spend',night:'nightSpend',holiday:'visitors',activities:'tourActivities'})[button.dataset.legacy];
      if(key)Object.assign(button.dataset,{indicator:key,period:state.period,area:context.area});
      if(button.dataset.legacy==='origin')button.dataset.group='source';
    });
    document.querySelectorAll('#app .consumption [data-page]').forEach(button=>{
      const key=pageKeys[button.dataset.page];if(!key)return;
      button.querySelector('strong').textContent=metricFormat(key,context,'亿元');
      Object.assign(button.dataset,{indicator:key,period:state.period,area:context.area});
      button.querySelector('small').textContent='亿元 · 查看组成 →';
    });
    document.querySelectorAll('#app .panel').forEach(panel=>{
      const title=panel.querySelector('h2')?.textContent||'';
      if(title.includes('法定节假日')){
        const holiday=[['2026-01-01','2026-01-03'],['2026-02-15','2026-02-23'],['2026-04-04','2026-04-06'],['2026-05-01','2026-05-05'],['2026-06-19','2026-06-21'],['2026-09-25','2026-09-27'],['2026-10-01','2026-10-07']][state.tab.holiday||0];
        panel.querySelectorAll('.kpi').forEach((element,index)=>{const key=index===0?'visitors':'spend';element.querySelector('b').textContent=holiday[0]>model.asOf?'待发生':metricFormat(key,{...context,start:holiday[0],end:holiday[1]},index===0?'万人次':'亿元');Object.assign(element.dataset,{indicator:key,area:context.area,start:holiday[0],end:holiday[1]});});
        const rows=model.query('scenicIn',{...context,start:holiday[0],end:holiday[1],group:'entity'}).sort((first,second)=>second.value-first.value).slice(0,3);
        panel.querySelectorAll('tbody tr').forEach((row,index)=>{row.children[1].textContent=rows[index]?.bucket||'待发生';row.children[2].textContent=rows[index]?fmt(rows[index].value/10000)+' 万人次':'—';Object.assign(row.dataset,{indicator:'scenicIn',area:context.area,start:holiday[0],end:holiday[1]});if(holiday[0]>model.asOf)delete row.dataset.indicator;});
        const more=panel.querySelector('[data-legacy]');if(more)Object.assign(more.dataset,{start:holiday[0],end:holiday[1]});
        if(holiday[0]>model.asOf){panel.querySelectorAll('[data-indicator]').forEach(element=>delete element.dataset.indicator);if(more)more.onclick=()=>toast('国庆尚未发生，暂不生成演示游客数');}
      }
      if(title.includes('客流变化'))panel.querySelectorAll('.kpi').forEach(element=>{if(element.textContent.includes('同比增速')){element.querySelector('b').textContent='待接入';element.querySelector('small').textContent='缺少上年同期底表';}});
      if(title.includes('夜间消费差值')){const heading=panel.querySelector('h2');heading.firstChild.textContent='夜间旅游消费趋势';}
    });
    document.querySelectorAll('#app .panel').forEach(panel=>{
      if(!panel.querySelector('.rank'))return;
      const rows=model.query('visitors',{...context,group:'source'}),total=model.total('visitors',context);
      panel.querySelectorAll('[data-tab="source"],[data-tab="origin"]').forEach(button=>button.remove());
      panel.querySelector('.rank').insertAdjacentHTML('beforebegin',`<div class="indicator-ranks">${rows.map(row=>`<button class="indicator-rank" data-indicator="visitors" data-period="${state.period}" data-area="${context.area}" data-group="area" data-facet="source" data-facet-value="${row.bucket}"><span>${row.bucket}</span><i style="width:${total?row.value/total*100:0}%"></i><b>${fmt(row.value/10000)} 万人次</b></button>`).join('')}</div>`);
      panel.querySelectorAll('.rank').forEach(row=>row.remove());
      const summary=panel.querySelector('.summary');if(summary)summary.textContent='按客源省份互斥分类，包含其他来源；市级客源底表尚未接入。点击查看区域和日期组成。';
    });
    const profile=document.querySelector('#app .legacy-profile');
    if(profile)profile.innerHTML='<h3>客流画像</h3>'+['age','gender'].map(group=>{const rows=model.query('visitors',{...context,group}),total=model.total('visitors',context);return `<div class="legend">${rows.map(row=>row.bucket).join(' / ')}</div><div class="age" data-indicator="visitors" data-period="${state.period}" data-area="${context.area}" data-group="${group}" role="button" tabindex="0">${rows.map((row,index)=>`<span style="width:${total?row.value/total*100:0}%;background:${['#42a8dc','#65ca77','#c6a84e','#ae8ace','#df936f','#5c889b'][index]}"><title>${row.bucket} ${row.value}人次</title>${total&&row.value/total>.08?(row.value/total*100).toFixed(0)+'%':''}</span>`).join('')}</div>`;}).join('');
    const consumer=document.querySelector('#app .legacy-donut');
    if(consumer){const parts=model.parts('spend',context),total=model.total('spend',context);let cursor=0;const colors=['#43cbb7','#559ae6','#e2b965','#ad8bdf','#df936f','#548d99'],stops=parts.map((part,index)=>{const begin=cursor;cursor+=total?part.value/total*100:0;return `${colors[index]} ${begin}% ${cursor}%`;}).join(',');consumer.innerHTML=`<div class="ring" style="background:conic-gradient(${stops})" data-indicator="spend" data-period="${state.period}" data-area="${context.area}"></div><div>${parts.map(part=>`<p data-indicator="${part.key}" data-period="${state.period}" data-area="${context.area}">${part.name.replace('旅游消费','')} ${total?(part.value/total*100).toFixed(1):'—'}%</p>`).join('')}</div>`;if(consumer.previousElementSibling)consumer.previousElementSibling.textContent='六业旅游消费构成';}
    document.querySelectorAll('#app .kpi').forEach(element=>{if(element.textContent.includes('同比增速')||element.textContent.includes('客单价')){element.querySelector('b').textContent='待接入';element.querySelector('small').textContent='缺少对应业务底表';}});
    document.querySelectorAll('#app [data-question]').forEach(button=>{if(button.dataset.question==='risk')return;button.onclick=()=>{const total=model.total('spend',context),top=model.parts('spend',context).sort((first,second)=>second.value-first.value).slice(0,2);$('#insight').innerHTML=button.dataset.question==='flow'?`<h3>接待观察 · ${context.area||'全域'}</h3>所选期间接待 ${model.summary('visitors',context,'万人次')} 万人次。尚无上年同期或事件归因底表，不判断增长原因。点击接待指标核对日期组成。`:`<h3>消费观察 · ${context.area||'全域'}</h3>${top.map(part=>`${part.name}占${total?(part.value/total*100).toFixed(1):'—'}%`).join('，')}。由当前范围消费底表计算，点击消费指标可核对组成。`;};});
    const scale=document.querySelector('#app .legacy-analysis .legacy-scale');if(scale)scale.innerHTML='<span>行政区边界</span><i></i><span>点击区域联动筛选</span>';
  };
  const originalExport=$('#export').onclick;
  $('#export').onclick=()=>state.page==='emergency'?originalExport():openIndicatorDrill(pageKeys[state.page]||'visitors',mainContext());
  render();
})();
