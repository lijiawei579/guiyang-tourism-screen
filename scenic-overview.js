(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = value => Math.round(value || 0).toLocaleString('zh-CN');
  // Approximate presentation anchors, not surveyed coordinates or navigation destinations.
  const anchors = [
    [1,'黔灵山公园',26.604,106.685,-105,-42], [5,'甲秀楼',26.568,106.715,8,-15],
    [8,'泉湖公园',26.686,106.629,-112,-22], [10,'青岩古镇',26.333,106.676,8,-16],
    [12,'天河潭',26.437,106.573,-94,-26], [19,'地质博物馆',26.637,106.613,-124,3],
    [26,'花画小镇',26.829,106.874,8,-24], [29,'乡愁贵州',26.645,106.397,-98,-20],
    [34,'阳明文化园',26.84,106.596,-115,-30], [35,'桃源河',26.929,106.734,8,-22],
    [38,'息烽集中营',27.109,106.73,-118,-25], [42,'南江大峡谷',27.054,106.965,8,-20],
    [45,'多彩贵州',26.548,106.793,10,-26], [47,'云漫湖',26.37,106.423,-98,-24]
  ];
  globalThis.ScenicOverview = {anchors};
  function visibleRecords(area) {
    const records = globalThis.officialTourismResources || [];
    return anchors.map(([id,label,lat,lng,x,y]) => ({row:records.find(row=>row.id==='official-scenic-'+id),label,lat,lng,x,y})).filter(point=>point.row && (!area || point.row.area===area));
  }
  globalThis.mountScenicOverview = (map, county, functional, area) => {
    if (state.page !== 'overview') return;
    const points = visibleRecords(area);
    const panel = map.getContainer().closest('.boundary-panel');
    panel.classList.add('scenic-map');
    panel.querySelector('.boundary-readout').innerHTML = `<span>景区客流热度 · ${esc(state.period)} · 演示</span><span class="scenic-heat-legend">低 <i></i> 高</span>`;
    panel.querySelector('.boundary-note').innerHTML = '贵安、双龙为近似参考范围 · 热力与点位为展示示意';
    const pane = map.createPane('scenicHeat');
    pane.style.zIndex = 430;
    pane.style.pointerEvents = 'none';
    const canvas = document.createElement('canvas');
    canvas.className = 'scenic-heat-canvas';
    canvas.setAttribute('aria-hidden','true');
    pane.append(canvas);
    const mask = document.createElement('canvas');
    let frame;
    const labels=[];
    const traffic=points.map(point=>{
      const entity=IndicatorData.entities('scenic').find(entity=>entity.resourceId===point.row.id);
      return IndicatorData.total('scenicIn',{entityId:entity.id,period:state.period});
    });
    const peak=Math.max(...traffic,1);
    function arrangeLabels(size){
      const placed=[];
      labels.forEach(({point,element})=>{
        const p=map.latLngToContainerPoint([point.lat,point.lng]);
        const label=element.querySelector('.scenic-pin-name');
        const width=label.offsetWidth||26+point.label.length*12,height=label.offsetHeight||29;
        const candidates=[[point.x,point.y],...[0,-32,32,-64,64,-96,96].flatMap(y=>[[10,y-15],[-width-10,y-15],[-width/2,y-35]])];
        let best;
        candidates.forEach(([dx,dy])=>{
          const x=Math.max(4,Math.min(size.x-width-4,p.x+dx)),y=Math.max(6,Math.min(size.y-height-6,p.y+dy));
          const overlap=placed.reduce((sum,r)=>sum+Math.max(0,Math.min(x+width+5,r.x+r.width)-Math.max(x-5,r.x))*Math.max(0,Math.min(y+height+5,r.y+r.height)-Math.max(y-5,r.y)),0);
          const header=(y<98&&x<150)||(y<45&&x+width>size.x-200)?10000:0;
          const score=(overlap+header)*1000+Math.hypot(x+width/2-p.x,y+height/2-p.y);
          if(!best||score<best.score)best={x,y,width,height,score};
        });
        placed.push(best);
        const dx=best.x-p.x,dy=best.y-p.y;
        const name=element.querySelector('.scenic-pin-name');name.style.setProperty('--pin-x',dx+'px');name.style.setProperty('--pin-y',dy+'px');
        const linkX=Math.max(dx,Math.min(dx+width,0)),linkY=Math.max(dy,Math.min(dy+height,0));
        const leader=element.querySelector('.scenic-pin-leader');leader.style.width=Math.hypot(linkX,linkY)+'px';leader.style.transform='rotate('+Math.atan2(linkY,linkX)+'rad)';
      });
    }
    const features = [...county.features, ...(!area && functional ? functional.features.filter(feature => functionalVisibility[feature.properties.id]) : [])];
    function draw() {
      const size = map.getSize(), ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = mask.width = Math.round(size.x*ratio);
      canvas.height = mask.height = Math.round(size.y*ratio);
      canvas.style.width = size.x+'px';canvas.style.height = size.y+'px';
      L.DomUtil.setPosition(canvas,map.containerPointToLayerPoint([0,0]));
      const ctx = canvas.getContext('2d'), clip = mask.getContext('2d');
      ctx.scale(ratio,ratio);clip.scale(ratio,ratio);
      clip.fillStyle='#fff';
      features.forEach(feature => {
        const polygons=feature.geometry.type==='MultiPolygon'?feature.geometry.coordinates:[feature.geometry.coordinates];
        polygons.forEach(rings=>{
          clip.beginPath();
          rings.forEach(ring=>ring.forEach(([lng,lat],index)=>{
            const p=map.latLngToContainerPoint([lat,lng]);
            index?clip.lineTo(p.x,p.y):clip.moveTo(p.x,p.y);
          }));
          clip.closePath();clip.fill('evenodd');
        });
      });
      ctx.fillStyle='#19d56388';ctx.fillRect(0,0,size.x,size.y);
      points.forEach((point,index)=>{
        const p=map.latLngToContainerPoint([point.lat,point.lng]);
        const intensity=traffic[index]/peak;
        const radius=Math.max(36,Math.min(size.x,size.y)*(.12+intensity*.075))*Math.pow(1.25,map.getZoom()-10);
        const heat=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius);
        heat.addColorStop(0,intensity>.8?'#ff312bf2':'#ff8c29e6');
        heat.addColorStop(.25,'#ffb425d9');heat.addColorStop(.57,'#e5f438a6');heat.addColorStop(1,'#73e82000');
        ctx.fillStyle=heat;ctx.fillRect(p.x-radius,p.y-radius,radius*2,radius*2);
      });
      ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0,size.x,size.y);ctx.globalCompositeOperation='source-over';
      arrangeLabels(size);
    }
    const redraw = () => {cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);};
    map.on('move zoom resize',redraw);
    map.once('unload',()=>{cancelAnimationFrame(frame);map.off('move zoom resize',redraw);});
    points.forEach(point=>{
      const marker=L.marker([point.lat,point.lng],{icon:L.divIcon({className:'scenic-pin',iconSize:[1,1],iconAnchor:[0,0],html:`<span class="scenic-pin-leader"></span><span class="scenic-pin-glow"></span><span class="scenic-pin-name" style="--pin-x:${point.x}px;--pin-y:${point.y}px"><i></i>${esc(point.label)}</span>`}),title:point.label+' · 查看景区详情',keyboard:true,autoPanOnFocus:false,zIndexOffset:1200,bubblingMouseEvents:false}).addTo(map);
      marker.on('click',event=>{L.DomEvent.stopPropagation(event);openScenicDetail(point.row.id);});
      const element=marker.getElement();
      if(element){labels.push({point,element});element.setAttribute('aria-label',point.label+'，查看景区详情');L.DomEvent.disableClickPropagation(element);L.DomEvent.disableScrollPropagation(element);}
    });
    draw();
  };

  let dialog;
  globalThis.openScenicDetail = id => {
    const row = (globalThis.officialTourismResources || []).find(row=>row.id===id&&row.category===0);
    if(!row)return;
    const model=IndicatorData, entity=model.entities('scenic').find(item=>item.resourceId===id);
    if(!dialog){dialog=document.createElement('dialog');dialog.className='scenic-detail';document.body.append(dialog);dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});}
    const previousDialog=document.querySelector('#dlg[open]');
    previousDialog?.close();
    let tab='基础信息',date=model.asOf;
    const context=()=>({entityId:entity.id,area:row.area,start:date,end:date});
    const snapshot=()=>({...context(),start:model.asOf,end:model.asOf});
    const section=(name,body)=>`<section class="sd-section"><h3>${name}</h3>${body}</section>`;
    function graph(group,compact=false){
      const rows=model.query('scenicIn',{...context(),...(group==='month'?{start:'2026-01-01',end:model.asOf}:{}),group});
      const max=Math.max(...rows.map(r=>r.value),1),step=540/rows.length;
      return `<svg class="sd-chart" viewBox="0 0 600 220" role="img" aria-label="${esc(row.name)}${group==='hour'?'逐小时':'逐月'}游客接待人次"><defs><linearGradient id="sd-fill" x2="0" y2="1"><stop stop-color="#22e6c1" stop-opacity=".32"/><stop offset="1" stop-color="#22e6c1" stop-opacity="0"/></linearGradient></defs>${[0,.5,1].map(r=>`<path d="M46 ${174-r*135}H588" stroke="#28516e" stroke-dasharray="4 5"/><text x="38" y="${178-r*135}" text-anchor="end">${number(max*r)}</text>`).join('')}${group==='hour'?`<polygon points="46,174 ${rows.map((r,i)=>`${46+(i+.5)*step},${174-r.value/max*135}`).join(' ')} 588,174" fill="url(#sd-fill)"/><polyline points="${rows.map((r,i)=>`${46+(i+.5)*step},${174-r.value/max*135}`).join(' ')}" fill="none" stroke="#44efd3" stroke-width="2.5"/>`:''}${rows.map((r,i)=>`<g><title>${esc(r.bucket)} · 游客接待人次 ${number(r.value)}人次</title>${group==='hour'?`<circle cx="${46+(i+.5)*step}" cy="${174-r.value/max*135}" r="3" fill="#a3fff2"/>`:`<rect x="${46+(i+.2)*step}" y="${174-r.value/max*135}" width="${step*.6}" height="${r.value/max*135}" fill="#26c9d6" rx="2"/>`}${i% (compact?3:1)===0?`<text x="${46+(i+.5)*step}" y="202" text-anchor="middle">${group==='hour'?String(i).padStart(2,'0')+'时':r.bucket.slice(5)+'月'}</text>`:''}</g>`).join('')}</svg>`;
    }
    function information(){
      const details=[['所属区域',row.area],['景区等级',row.grade],['开放时间',row.openingHours||'待接入'],['游客中心电话',row.phone||'待接入'],['值班电话',row.dutyPhone||'待接入'],['地址',row.address||'待接入'],['运营单位',row.operator||'待接入'],['门票政策',row.ticket||'待接入']];
      return `<div class="sd-bottom-grid">${section('基础信息',`<dl class="sd-information">${details.map(([key,value])=>`<div class="${key==='地址'||key==='运营单位'?'sd-wide':''}"><dt>${key}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`)}<div class="sd-side-stack">${section('承载与采集口径','<dl class="sd-information sd-single"><div><dt>最大日承载量</dt><dd>单个自然日允许接待的最大游客人次</dd></div><div><dt>瞬时承载量</dt><dd>同一时点允许在园的最大游客人数</dd></div><div><dt>游客接待人次</dt><dd>按入园记录累计；同一游客重复入园分别计数</dd></div></dl>')}${section('信息维护',`<p>名录公布日期：${esc(row.published)}</p><p>开放时间、值班电话待景区核验后接入。</p><a href="${esc(row.source)}" target="_blank" rel="noopener noreferrer">查看官方名录 ↗</a>`)}</div></div>`;
    }
    function profiles(){return `<div class="sd-bottom-grid">${['age','gender'].map(group=>{const rows=model.query('scenicIn',{...context(),group}),total=rows.reduce((s,r)=>s+r.value,0);return section(group==='age'?'游客年龄结构':'游客性别结构',`<div class="sd-profile">${rows.map((r,i)=>`<div><span>${esc(r.bucket)}</span><i><b style="width:${total?r.value/total*100:0}%;background:${['#28c9da','#45dbb0','#e8be56','#8f9ff6','#f28973'][i%5]}"></b></i><strong>${total?(r.value/total*100).toFixed(1):'0.0'}%</strong></div>`).join('')}</div>`);}).join('')}</div>`;}
    function render(){
      const daily=model.total('scenicIn',context()),out=model.total('scenicOut',context()),annual=model.total('scenicIn',{entityId:entity.id,period:'本年'});
      const now=model.total('scenicNow',snapshot()),capacity=model.total('scenicCapacity',snapshot()),dailyCapacity=capacity*5,rate=capacity?now/capacity*100:0;
      dialog.setAttribute('aria-label',row.name+'景区详情');
      dialog.innerHTML=`<header class="sd-header"><div><small>SCENIC AREA · 景区运行详情</small><h2>${esc(row.name)}<span class="sd-grade">${esc(row.grade)}</span></h2></div><button data-sd-close aria-label="关闭景区详情">×</button></header><div class="sd-context"><span>贵阳贵安 / ${esc(row.area)}</span><label>统计日 <input type="date" value="${date}" min="2026-01-01" max="${model.asOf}" data-sd-date></label><span class="sd-demo">客流与承载量 · 演示数据</span></div><div class="sd-top"><section class="sd-traffic"><div class="sd-main-kpi"><div><span>游客接待人次<small>本年累计</small></span><b>${number(annual)}<em>人次</em></b></div><button data-sd-drill="year">查看逐月 ↗</button></div><div class="sd-daily-kpis"><button data-sd-drill="day"><span>游客接待人次<small>所选统计日</small></span><b>${number(daily)}<em>人次</em></b></button><div><span>实时在园人数<small>${model.asOf} 18:00 快照</small></span><b>${number(now)}<em>人</em></b></div></div><div class="sd-capacity"><div><span>最大日承载量</span><b>${number(dailyCapacity)}<em>人次 / 日</em></b></div><div><span>瞬时承载量</span><b>${number(capacity)}<em>人</em></b></div><div><span>瞬时承载率</span><b>${rate.toFixed(1)}<em>%</em></b></div></div></section><section class="sd-trend"><h3>统计日游客接待人次 · 小时趋势<span>人次</span></h3>${graph('hour',true)}<div class="sd-chart-key"><i></i>入园游客接待人次 <span>${date}</span></div></section><section class="sd-image"><div class="sd-scenic-art" aria-label="景区插画示意，并非景区实景照片"><svg viewBox="0 0 560 280" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sd-sky" x2="0" y2="1"><stop stop-color="#17596e"/><stop offset="1" stop-color="#8bb9ad"/></linearGradient><linearGradient id="sd-water" x2="0" y2="1"><stop stop-color="#327e88"/><stop offset="1" stop-color="#0b3c55"/></linearGradient></defs><path fill="url(#sd-sky)" d="M0 0H560V280H0Z"/><circle cx="420" cy="62" r="32" fill="#f1dba0" opacity=".8"/><path d="M0 170 100 45 180 130 280 40 390 152 480 73 560 136V280H0" fill="#286976"/><path d="M0 196 100 125 230 184 370 93 460 174 560 118V280H0" fill="#164e60"/><path d="M0 210Q130 170 280 214T560 204V280H0" fill="url(#sd-water)"/><path d="M0 246Q160 215 340 250T560 240" fill="none" stroke="#83d8d3" opacity=".35"/><path d="M293 173H401V197H293Z" fill="#263d4a"/><path d="M280 172Q340 155 347 135 358 156 414 172Z" fill="#194252" stroke="#97b5ad"/><path d="M316 138H378V157H316Z" fill="#324c54"/><path d="M300 138Q340 124 347 107 353 125 394 138Z" fill="#194252" stroke="#9bb7ae"/><path d="M300 197 266 212H425L394 197" fill="#53747b"/><path d="M320 175V195M345 173V195M371 175V195" stroke="#b7bd93" stroke-width="4"/></svg><span>景区视觉示意 · 实景图片待接入</span></div><div class="sd-image-caption"><b>${esc(row.area)}</b><span>国家${esc(row.grade)}级旅游景区</span></div><div class="sd-live"><i></i>采集快照 ${model.asOf} 18:00<span>演示</span></div></section></div><nav class="sd-tabs" aria-label="景区详情栏目">${['景区总览','景区监测','基础信息','游客画像','兴趣偏好'].map(name=>`<button data-sd-tab="${name}" aria-pressed="${name===tab}">${name}</button>`).join('')}</nav><div class="sd-body">${tab==='基础信息'?information():tab==='游客画像'?profiles():tab==='景区总览'?`<div class="sd-bottom-grid">${section('本年逐月游客接待人次',graph('month'))}${section('统计日接待明细',`<table class="sd-table"><thead><tr><th>统计日</th><th>游客接待人次</th><th>出园人次</th></tr></thead><tbody><tr><td>${date}</td><td>${number(daily)}</td><td>${number(out)}</td></tr></tbody></table><p>入园为累计流量，在园为固定时点存量；两者不能相加。跨景区游客接待人次存在重复，不等同全市独立游客人数。</p><button class="sd-link" data-sd-drill="day">查看逐小时明细与计算规则 ↗</button>`)}</div>`:tab==='景区监测'?section('景区监测 · 三路示意',`<div class="sd-monitors">${['游客中心','主要入口','核心游览区'].map((name,i)=>`<div><div class="sd-monitor-art"><span>CAM 0${i+1}</span><b>▣</b><small>监控示意 · 视频待接入</small></div><h4>${name}</h4></div>`).join('')}</div>`):section('兴趣偏好','<div class="sd-pending"><span>◎</span><b>游客兴趣偏好数据待接入</b><p>接入偏好标签及统计样本后展示分布，当前不生成推断结果。</p></div>')}</div><footer class="sd-footer"><span>景区名称、等级、电话、地址来自官方名录；图片为插画示意。</span><span>客流、热度、承载量均为演示</span></footer>`;
      dialog.querySelector('[data-sd-close]').onclick=()=>dialog.close();
      dialog.querySelector('[data-sd-date]').onchange=event=>{if(event.target.value>model.asOf||event.target.value<'2026-01-01'||!event.target.value)return;date=event.target.value;render();};
      dialog.querySelectorAll('[data-sd-tab]').forEach(button=>button.onclick=()=>{tab=button.dataset.sdTab;render();});
      dialog.querySelectorAll('[data-sd-drill]').forEach(button=>button.onclick=()=>{dialog.close();openIndicatorDrill('scenicIn',{entityId:entity.id,entityName:row.name,area:row.area,...(button.dataset.sdDrill==='year'?{period:'本年'}:{start:date,end:date,group:'hour'})});});
    }
    render();if(!dialog.open)dialog.showModal();
  };
  // Route scenic-name links to the same detail component; retain all other resource behavior.
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-detail]');
    if(!button)return;
    const label=button.dataset.detail;
    if(!label||['A级景区','星级酒店','等级民宿','旅游度假区','乡村旅游点'].includes(label))return;
    const row=(globalThis.officialTourismResources||[]).find(row=>row.category===0&&row.name.includes(label.replace(/景区$/,'')));
    if(row){event.preventDefault();event.stopImmediatePropagation();openScenicDetail(row.id);}
  },true);
})();
