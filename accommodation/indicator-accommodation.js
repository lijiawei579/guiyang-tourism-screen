(() => {
  const model=IndicatorData;
  const context=()=>({area:mapDrill.county||'',type:activeFilters.type==='全部类型'?'':activeFilters.type,start:activeFilters.startDate,end:activeFilters.endDate});
  const attributes=(key,override={})=>{const scope={...context(),...override};return `data-indicator="${key}" data-area="${scope.area}" data-type="${scope.type}" data-start="${scope.start}" data-end="${scope.end}" tabindex="0" role="button"`;};
  const card=(key,name,unit)=>`<article ${attributes(key)}><span>${name}</span><strong>${model.summary(key,context(),unit)}<em>${unit}</em></strong><small>所选日期 · 演示底表</small></article>`;
  $('#startDate').min='2026-01-01';$('#startDate').max=model.asOf;$('#endDate').max=model.asOf;
  $('#startDate').value='2026-09-01';$('#endDate').value=model.asOf;
  activeFilters.startDate='2026-09-01';activeFilters.endDate=model.asOf;
  $('#regionFilter').innerHTML='<option value="贵阳市">贵阳贵安 · 全域</option>'+model.regions.map(area=>`<option>${area}</option>`).join('');
  document.querySelector('.heat-legend span').textContent='同期间接待人次';
  document.querySelector('#operationContent').closest('.panel').querySelector('h2').textContent='平均房价与住宿时段';
  renderKpis=function(){
    $('#kpis').innerHTML=[['hotelGuests','所选期间住宿接待','万人次'],['roomRevenue','所选期间客房收入','万元'],['occupancy','客房入住率','%'],['roomPrice','平均房价','元/间夜'],['soldNights','售出间夜','间夜'],['stayLength','平均住宿时长','晚/人次']].map(([key,name,unit])=>card(key,name,unit).replace('<article ','<article class="kpi kpi-reception" ')).join('');
  };
  renderTrendMetrics=function(){ $('#trendMetrics').innerHTML=[['hotelGuests','住宿接待','万人次'],['occupancy','入住率','%'],['stayLength','住宿时长','晚/人次']].map(([key,name,unit])=>card(key,name,unit)).join(''); };
  drawTrend=function(){
    renderTrendMetrics();
    const group=context().start===context().end?'hour':activeTabs.period==='day'?'day':'month';
    const rows=model.query('hotelGuests',{...context(),group});
    const max=Math.max(...rows.map(row=>row.value),1),width=Math.max(520,rows.length*28),step=(width-28)/Math.max(rows.length,1);
    $('#trendChart').setAttribute('viewBox',`0 0 ${width} 122`);
    $('#trendChart').innerHTML=rows.map((row,index)=>{const size=row.value/max*90;return `<g data-indicator="hotelGuests" data-area="${context().area}" data-type="${context().type}" data-start="${row.start}" data-end="${row.end}" ${group==='hour'?`data-hour="${row.hour}"`:''}><rect x="${14+index*step}" y="${108-size}" width="${step*.65}" height="${size}" fill="#42ddc4"><title>${row.bucket}：${row.value}人次</title></rect></g>`;}).join('');
    $('#trendAxis').innerHTML=rows.map(row=>`<span>${group==='hour'?row.bucket.slice(0,2):row.bucket.slice(5)}</span>`).join('');
    $('#trendTitle').textContent=group==='hour'?'全天24小时接待游客数（模拟）':group==='day'?'所选期间逐日接待游客数':'所选期间逐月接待游客数';
    $('#trendCompare').textContent='同一底表汇总 · 点击图形下钻';
    $('#trendCanvas').style.minWidth=width+'px';
    const legend=document.querySelector('.trend-legend');if(legend)legend.innerHTML='<span class="reception">住宿接待人次</span>';
  };
  renderSupply=function(){
    const scope={area:context().area};const types=['酒店','民宿','客栈及其他'];
    $('#supplyContent').innerHTML=`<div class="supply-combined"><section class="supply-overall"><article class="supply-total" data-indicator="hotels" data-area="${scope.area}"><span>住宿场所快照</span><strong>${model.summary('hotels',scope)}<em>家</em></strong><small>截至 ${model.asOf} · 模拟快照</small></article></section><section class="supply-detail"><div class="supply-tabs">${types.map(type=>`<button data-indicator="hotels" data-area="${scope.area}" data-type="${type}">${type} ${model.summary('hotels',{...scope,type})}家</button>`).join('')}</div><div class="supply-detail-metrics"><article data-indicator="beds" data-area="${scope.area}"><span>床位数</span><strong>${model.summary('beds',scope)}<em>张</em></strong></article><article><span>官方星级酒店名录</span><strong>${officialTourismResources.filter(row=>row.category===1&&(!scope.area||row.area===scope.area)).length}<em>家</em></strong></article></div><p class="consumption-note">场所模拟存量与星级名录分别展示；经营底表覆盖62家星级酒店与20个其他示例对象。</p></section></div>`;
  };
  renderGuest=function(){
    const group=activeTabs.guestStructure==='demographic'?'age':'source';
    const rows=model.query('hotelGuests',{...context(),group}),total=model.total('hotelGuests',context());
    const gender=group==='age'?`<div class="consumption-note" ${attributes('hotelGuests')} data-group="gender">${model.query('hotelGuests',{...context(),group:'gender'}).map(row=>`${row.bucket} ${total?(row.value/total*100).toFixed(1):'—'}%`).join(' / ')} · 点击查看性别组成</div>`:'';
    $('#guestContent').innerHTML=`<div class="guest-source-overview-head"><strong>${group==='source'?'客源组成':'性别与年龄'}</strong><span>同期间住宿接待 · 含其他/未知</span></div>${gender}<div class="source-ranking">${rows.map(row=>`<button class="source-rank-button" ${attributes('hotelGuests')} data-group="area" data-facet="${group}" data-facet-value="${row.bucket}"><span>${row.bucket}</span><i style="--w:${total?row.value/total*100:0}%"></i><b>${total?(row.value/total*100).toFixed(1):'—'}%</b><em>${row.value.toLocaleString('zh-CN')}人次</em></button>`).join('')}</div>`;
  };
  renderRoutes=function(){
    $('#routeTitle').textContent='住宿类型接待组成';$('#routeScope').textContent='所选区域与日期 · 经营底表示例';
    const rows=model.query('hotelGuests',{...context(),group:'type'});
    $('#routes').innerHTML=rows.map(row=>`<div class="route-rank" ${attributes('hotelGuests',{type:row.bucket})}><span>${row.bucket}</span><strong>${row.value.toLocaleString('zh-CN')}人次</strong></div>`).join('');
  };
  renderOperation=function(){
    if(activeTabs.operation==='price'){
      const rows=model.query('roomPrice',{...context(),group:'type'}),maximum=Math.max(...rows.map(row=>row.value||0),1);
      $('#operationContent').innerHTML=`<div class="price-list">${rows.map(row=>`<div class="price-row" ${attributes('roomPrice',{type:row.bucket})}><span>${row.bucket}</span><i style="--w:${(row.value||0)/maximum*100}%"></i><strong>${row.value===null?'—':row.value.toFixed(2)}元/间夜</strong></div>`).join('')}<div class="consumption-note">按住宿类型比较平均房价，点击核对客房收入与售出间夜；总览使用汇总分子分母。</div></div>`;
    }else $('#operationContent').innerHTML='<div class="consumption-note">入住／离店分时底表待接入，暂不生成比例。正式接入后按同期间办理人次分组，保留未知时段。</div>';
  };
  renderOpportunity=function(){
    $('#opportunityTitle').textContent='住宿经营计算依据';$('#opportunityScope').textContent='点击分子分母查看贡献';
    $('#opportunityContent').innerHTML=`<div class="gap-summary">${[['soldNights','售出间夜','间夜'],['availableNights','可售间夜','间夜'],['roomRevenue','客房收入','元']].map(([key,name,unit])=>card(key,name,unit)).join('')}</div><div class="consumption-note">入住率=售出间夜÷可售间夜；平均房价=客房收入÷售出间夜。跨市轨迹与未到访人群缺少可核验依据，暂不展示推测值。</div>`;
  };
  const originalUpdate=updateMap;
  updateMap=function(){originalUpdate();$('#mapTitle').textContent='区县住宿接待分布';$('#mapInsight').textContent='颜色按同期间接待人次分级，点击区县联动';$('#mapRanking').innerHTML=model.query('hotelGuests',{...context(),group:'area'}).sort((first,second)=>second.value-first.value).slice(0,4).map(row=>`<span class="rank-chip" ${attributes('hotelGuests',{area:row.bucket})}>${row.bucket} ${row.value.toLocaleString('zh-CN')}人次</span>`).join('');if(!mapDrill.county)$('#currentRegionLabel').textContent='贵阳贵安 · 全域';};
  renderMap();
  renderAll();
})();
