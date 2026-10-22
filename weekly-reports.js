(() => {
  const regions=['清镇市','花溪区','南明区','云岩区','观山湖区','乌当区','白云区','开阳县','息烽县','修文县','贵安新区','双龙航空港经济区'];
  const routeNames={
    '清镇市':['红枫湖—四季贵州亲子线','时光贵州—乡愁贵州','红枫湖骑行露营线','鸭池河峡谷观景线'],
    '花溪区':['青岩古镇—天河潭','花溪公园—十里河滩','高坡露营—云顶日落','镇山村布依文化线'],
    '南明区':['甲秀楼—青云市集夜游','河滨公园—南明河漫步','曹状元街—翠微园寻味','城市休闲体验线'],
    '云岩区':['黔灵山—文昌阁漫游','太平路—民生路寻味','阳明祠文化体验线','黔灵山亲子自然线'],
    '观山湖区':['观山湖公园—金融城夜游','贵州省博物馆文化线','阅山湖城市绿道','百花湖滨水休闲线'],
    '乌当区':['偏坡布依乡村漫游','羊昌花画小镇亲子线','新添寨温泉体验','下坝田园休闲线'],
    '白云区':['泉湖公园—梵华里','蓬莱仙界田园体验','长坡岭森林亲子线','城市休闲体验线'],
    '开阳县':['南江大峡谷—十里画廊','禾丰布依文化体验','香火岩山水徒步线','开阳茶旅乡村线'],
    '息烽县':['息烽集中营纪念馆红色线','息烽温泉康养线','乌江峡谷风光线','鹿窝乡村休闲线'],
    '修文县':['阳明文化园—阳明洞','修文猕猴桃采摘线','桃源河山水休闲线','六广河峡谷观光线'],
    '贵安新区':['云漫湖—车田村亲子线','月亮湖—贵安生态游','平寨村田园体验','贵安周末骑行线'],
    '双龙航空港经济区':['双龙生态公园—多彩贵州城','多彩贵州城非遗体验','龙洞堡城市微度假','航空港周末休闲线']
  };
  const topicNames=['亲子周末怎么玩','停车与接驳','门票及预约','夜游与美食','住宿怎么选','非遗文化体验','天气与出行'];
  const issueNames=['停车与交通接驳','预约与入园排队','价格与退改规则','环境与配套设施','服务态度与响应'];
  const state={region:'清镇市',drafts:{},active:null,editing:false,generating:false};
  const escape=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const number=value=>Number(value).toLocaleString('zh-CN');
  const pct=(part,total)=>(total?part/total*100:0).toFixed(1);
  const change=(value,previous)=>(value/previous-1)*100;
  const delta=value=>`${value>=0?'↑':'↓'} ${Math.abs(value).toFixed(1)}%`;
  const dateAt=(start,offset)=>new Date(Date.parse(start+'T00:00:00Z')+offset*86400000).toISOString().slice(0,10);
  const endAt=index=>dateAt('2026-10-11',-index*7);
  const startAt=index=>dateAt(endAt(index),-6);
  const shortDate=date=>date.slice(5).replace('-','.');
  const isoWeek=date=>{const stamp=new Date(date+'T00:00:00Z');stamp.setUTCDate(stamp.getUTCDate()+4-(stamp.getUTCDay()||7));return Math.ceil((((stamp-new Date(Date.UTC(stamp.getUTCFullYear(),0,1)))/86400000)+1)/7);};
  let noticeTimer;
  try{const saved=JSON.parse(localStorage.getItem('guiyang-county-weeklies-v2')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved)){for(const [key,draft] of Object.entries(saved)){if(draft&&typeof draft.notes==='string'&&typeof draft.saved==='string')state.drafts[key]={notes:draft.notes,saved:draft.saved};}}}catch{}
  function split(total,names,weights){
    const weightSum=weights.reduce((sum,value)=>sum+value,0),items=names.map((name,index)=>({name,count:Math.floor(total*weights[index]/weightSum)}));
    items[0].count+=total-items.reduce((sum,item)=>sum+item.count,0);return items.sort((first,second)=>second.count-first.count);
  }
  function weekData(region,index){
    const regionIndex=regions.indexOf(region),weight=[1.15,1.45,1.2,1.1,1.05,.72,.65,.8,.58,.7,.85,.62][regionIndex],season=[1.08,1.47,1.14,1.02,.94,1.01,.9][index],base=weight*season;
    const consult=Math.round((2600+regionIndex*39)*base),opinions=Math.round((1940+regionIndex*23)*base),complaint=Math.round((220+regionIndex*4)*base*(index===0?.85:1)),search=Math.round((6200+regionIndex*77)*base*(index===0?1.22:1));
    const topicWeights=[28,22,18,13,8,6,5];
    if(index===1){topicWeights[0]=19;topicWeights[2]=31;}else if(index===2){topicWeights[3]=34;topicWeights[0]=21;}else if(index===3){topicWeights[5]=31;topicWeights[0]=22;}else if(index===4){topicWeights[0]=24;topicWeights[1]=29;}else if(index===5){topicWeights[6]=27;topicWeights[0]=23;}
    const issueWeights=index===1?[31,37,17,9,6]:index===2?[29,22,33,10,6]:[36+index,27,18,12,7];
    const routeWeights=[45,28,17,10];if(index%3===1){routeWeights[0]=31;routeWeights[1]=42;}if(index%3===2){routeWeights[0]=27;routeWeights[2]=43;}
    return {consult,opinions,complaint,search,total:consult+opinions+complaint,topics:split(consult,topicNames,topicWeights),issues:split(complaint,issueNames,issueWeights),routes:split(search,routeNames[region],routeWeights)};
  }
  function reportAt(index,region=state.region){
    const current=weekData(region,index),past=weekData(region,index+1),end=endAt(index),start=startAt(index),id=region+'-'+end,draft=state.drafts[id];
    return {id,index,region,start,end,issue:isoWeek(end),current,past,notes:draft?.notes||'',saved:draft?.saved||'',generated:dateAt(end,1)+' 09:00',occasion:index===1?'国庆假期':index===2?'中秋假期':index===3?'秋日文化体验':index===4?'周末休闲':index===5?'初秋出游':'节后周末'};
  }
  function recommendations(report){
    const {current}=report;
    return [
      {title:'内容策划 · 回答游客关切',body:`围绕“${current.topics[0].name}”制作一页式出行攻略，补齐预约、交通和配套说明。`,metric:'跟踪：同类咨询量、攻略访问量'},
      {title:'服务优化 · 先核实再改进',body:`优先核查“${current.issues[0].name}”线索，明确现场责任单位，完善重点时段服务指引。`,metric:'跟踪：核实问题解决率、重复线索量'},
      {title:'线路联动 · 策划周末体验',body:`以“${current.routes[0].name}”为重点，联动沿线资源和交通接驳，策划轻量主题活动。`,metric:'跟踪：线路咨询、预约与实际接待'}
    ];
  }
  function toast(message){const notice=document.querySelector('#notice');notice.textContent=message;notice.classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.classList.remove('show'),3200);}
  function render(){
    document.querySelector('#scope-name').textContent=state.region;document.querySelector('#region').value=state.region;
    document.querySelector('#report-list').innerHTML=Array.from({length:6},(_,index)=>{
      const report=reportAt(index),{current}=report;
      return `<button class="report-card ${index===0?'latest':''}" data-report="${index}" aria-label="查看${escape(state.region)}第${report.issue}周文旅报告"><div class="card-top"><span class="card-issue">2026 / WEEK ${report.issue}</span><span class="badge ${index===0?'mint':''}">${report.saved?'已存草稿':index===0?'最新一期':'周报示例'}</span></div><span class="card-watermark">${report.issue}</span><h3>第 ${report.issue} 周文旅简报<small>${report.occasion}</small></h3><div class="card-dates">${shortDate(report.start)} — ${shortDate(report.end)} <span style="font-size:9px;color:#537b91">/ 2026</span></div><div class="card-findings"><div class="card-finding" style="--tone:#71dfc1"><span>游客关注</span><b>${escape(current.topics[0].name)}</b></div><div class="card-finding" style="--tone:#e9c17b"><span>问题聚焦</span><b>${escape(current.issues[0].name)}</b></div><div class="card-finding" style="--tone:#91b8dd"><span>热门线路</span><b>${escape(current.routes[0].name)}</b></div></div><div class="card-footer"><span>${report.generated.slice(5,10).replace('-','.')} 生成 · ${number(current.total)} 条线索</span><span>阅读周报 ↗</span></div></button>`;
    }).join('');
  }
  function bars(items,total){return `<div class="report-bars">${items.slice(0,5).map((item,index)=>`<div class="bar-row"><span class="bar-label">${escape(item.name)}</span><span class="bar-track"><i style="--width:${pct(item.count,items[0].count)}%;${index?'opacity:'+Math.max(.45,1-index*.13):''}"></i></span><b>${number(item.count)}<small>${pct(item.count,total)}%</small></b></div>`).join('')}</div>`;}
  function complaintGraphic(data){
    const colors=['#d6aa70','#9f879f','#6f99b9','#628e9c','#577486'];let stop=0;
    const ring=data.issues.map((item,index)=>{const begin=stop;stop+=item.count/data.complaint*100;return `${colors[index]} ${begin}% ${stop}%`;}).join(',');
    return `<div class="complaint-overview"><div class="complaint-ring" style="--ring:conic-gradient(${ring})"><div><b>${pct(data.issues[0].count,data.complaint)}%</b>首要问题占比</div></div><div class="complaint-legend">${data.issues.slice(0,3).map((item,index)=>`<div style="--tone:${colors[index]}"><i></i><span>${escape(item.name)}</span><b>${pct(item.count,data.complaint)}%</b></div>`).join('')}</div></div><div class="remaining-issues">${data.issues.slice(3).map(item=>`<span>${escape(item.name)} ${pct(item.count,data.complaint)}%</span>`).join('')}</div>`;
  }
  function actionCards(report){
    if(report.notes){return report.notes.split('\n').filter(line=>line.trim()).map((line,index)=>`<div class="action-card"><small>ACTION ${String(index+1).padStart(2,'0')}</small><h4>工作建议 ${index+1}</h4><p>${escape(line)}</p></div>`).join('');}
    return recommendations(report).map((item,index)=>`<div class="action-card"><small>ACTION ${String(index+1).padStart(2,'0')}</small><h4>${item.title}</h4><p>${escape(item.body)}</p><span class="action-metric">${item.metric}</span></div>`).join('');
  }
  function openReport(index){
    state.active=reportAt(index);state.editing=false;renderModal();
    const dialog=document.querySelector('#report-dialog');if(!dialog.open)dialog.showModal();dialog.querySelector('.modal-body').scrollTop=0;
  }
  function renderModal(){
    const report=state.active,{current,past}=report,topTopic=current.topics[0],topIssue=current.issues[0],topRoute=current.routes[0];
    const searchGrowth=change(current.search,past.search),complaintGrowth=change(current.complaint,past.complaint),nextStart=dateAt(report.end,1),nextEnd=dateAt(report.end,7);
    const editorText=report.notes||recommendations(report).map(item=>`${item.title}：${item.body} ${item.metric}`).join('\n');
    document.querySelector('#report-dialog').innerHTML=`<div class="modal-head"><div class="modal-identity"><span class="document-icon">▤</span><div><small>COUNTY TOURISM / WEEKLY BRIEF</small><h2 id="report-title">${escape(report.region)}文旅周报 <span>2026 / W${report.issue}</span></h2></div></div><div class="modal-tools"><button data-save>保存草稿</button><button data-export>↓ 导出简报</button><button data-print class="print-button">打印 / PDF</button><button data-close class="close-button" aria-label="关闭周报">×</button></div></div><div class="modal-body"><div class="report-lead"><div><span class="eyebrow">WEEK ${report.issue} · ${escape(report.occasion)}</span><h3>这一周，游客在关注什么？</h3><p>统计周期 ${report.start.replaceAll('-','.')} — ${report.end.replaceAll('-','.')} <span style="margin:0 8px;color:#43697f">|</span> ${report.generated} 生成 <span class="badge" style="margin-left:8px">模拟数据 · 待审核</span></p></div><div class="report-stamp">${escape(report.region)}<b>WEEKLY ${report.issue}</b>关注 · 问题 · 机会</div></div><div class="summary-strip"><section class="summary-card" style="--tone:#7cdbbc"><span class="summary-number">01</span><small>游客最关心</small><h4>${escape(topTopic.name)}</h4><p>${number(topTopic.count)} 次咨询，占本周咨询 ${pct(topTopic.count,current.consult)}%</p></section><section class="summary-card" style="--tone:#dfb77a"><span class="summary-number">02</span><small>投诉集中问题</small><h4>${escape(topIssue.name)}</h4><p>${number(topIssue.count)} 条待核实线索，占同类线索 ${pct(topIssue.count,current.complaint)}%</p></section><section class="summary-card" style="--tone:#91bbdc"><span class="summary-number">03</span><small>搜索热度最高</small><h4>${escape(topRoute.name)}</h4><p>${number(topRoute.count)} 次搜索，占线路搜索 ${pct(topRoute.count,current.search)}%</p></section></div><div class="report-metrics">${[['咨询次数',current.consult,past.consult,'次'],['舆情条数',current.opinions,past.opinions,'条'],['投诉线索',current.complaint,past.complaint,'条'],['线路搜索',current.search,past.search,'次']].map(([label,value,previous,unit])=>`<div><small>${label}</small><strong>${number(value)}<em>${unit}</em></strong><p>较上一周 <span class="${value>=previous?'up':'down'}">${delta(change(value,previous))}</span></p></div>`).join('')}</div><div class="report-modules"><section class="report-module"><div class="module-head"><h4><em>01</em>游客关注 · 咨询主题</h4><span>TOP 5 / 占咨询总量</span></div><div class="module-body">${bars(current.topics,current.consult)}<p class="module-note">${escape(topTopic.name)}、${escape(current.topics[1].name)}合计占咨询 ${pct(topTopic.count+current.topics[1].count,current.consult)}%，适合优先完善出行攻略与服务问答。</p></div></section><section class="report-module"><div class="module-head"><h4><em>02</em>问题聚焦 · 投诉分类</h4><span>${number(current.complaint)} 条 / 尚未核实</span></div><div class="module-body">${complaintGraphic(current)}<p class="module-note">${escape(topIssue.name)}为首要问题。本周投诉线索较上周${complaintGrowth>=0?'增加':'减少'} ${Math.abs(complaintGrowth).toFixed(1)}%，需结合实际接待和线索核实结果判断。</p></div></section><section class="report-module"><div class="module-head"><h4><em>03</em>出游意向 · 热门线路</h4><span>TOP 3 / 搜索次数</span></div><div class="module-body">${current.routes.slice(0,3).map((item,index)=>`<div class="weekly-route"><em>${String(index+1).padStart(2,'0')}</em><div><b>${escape(item.name)}</b><span class="bar-track"><i style="--width:${pct(item.count,topRoute.count)}%"></i></span></div><span>${number(item.count)}<small>次搜索</small></span></div>`).join('')}<p class="module-note">搜索反映行程兴趣，不能直接等同于实际到访。建议联动资源开放、交通与预约数据进行验证。</p></div></section><section class="report-module"><div class="module-head"><h4><em>04</em>下周判断 · 需求与市场</h4><span>${shortDate(nextStart)} — ${shortDate(nextEnd)}</span></div><div class="module-body"><div class="judgment-list"><div class="judgment-item"><span>客</span><div><b>${searchGrowth>=0?'搜索意向升温，关注周末承载':'搜索意向回落，按实际预约安排承载'}</b><p>线路搜索较上周${searchGrowth>=0?'增长':'下降'} ${Math.abs(searchGrowth).toFixed(1)}%，重点跟踪热门线路预约与交通接驳。</p></div></div><div class="judgment-item"><span>市</span><div><b>从高频咨询识别产品需求</b><p>围绕“${escape(topTopic.name)}”整理适配产品与服务信息，再以预约转化验证需求。</p></div></div><div class="judgment-item"><span>活</span><div><b>主题体验与服务补位同步</b><p>结合${escape(report.occasion)}与本地资源策划体验，先核查高频问题，再组织宣传与活动。</p></div></div></div></div></section></div><section class="report-module actions-module"><div class="module-head"><h4><em>05</em>把洞察变成行动 · 下周建议</h4><button class="edit-action" data-edit>编辑建议 ✎</button></div><div class="module-body"><div class="action-editor"><textarea id="action-notes" aria-label="编辑下周行动建议">${escape(editorText)}</textarea><div class="editor-tools"><button data-cancel-edit>取消</button><button data-apply-edit class="primary">完成编辑</button></div></div><div class="actions-grid">${actionCards(report)}</div></div></section><details class="report-method"><summary>统计口径与数据说明 ⓘ</summary><p>所有数字、归集结果、线路及建议均为演示。有效线索 = 咨询 + 舆情 + 投诉线索，三类互斥；搜索次数单独统计。主题与投诉占比分别以本周咨询量、投诉线索量为分母。环比为同区县上一完整周。<br>投诉线索未经核实，不等同于投诉案件；情感分类与市场判断需业务人员复核。搜索热度不能直接换算成客流人数。当前未接入外部采集、实际客流或定时任务，正式版拟每周一汇总上一完整周并生成待审核草稿。</p></details></div><div class="modal-footer"><span>${report.saved?'草稿保存于 '+escape(report.saved):'周报示例 · 审核后用于工作参考'} · ${escape(report.region)}</span><div class="issue-nav"><button data-step="1" ${report.index===5?'disabled':''}>← 上一期</button><span>${report.index+1} / 6</span><button data-step="-1" ${report.index===0?'disabled':''}>下一期 →</button></div></div>`;
  }
  function markdown(report){
    const {current,past}=report;
    return `# ${report.region}文旅周报 · 2026年第${report.issue}周\n\n统计周期：${report.start} — ${report.end}\n生成日期：${report.generated}\n状态：演示数据 · 待审核\n\n## 本周三项发现\n- 游客最关心：${current.topics[0].name}，${number(current.topics[0].count)}次，占咨询${pct(current.topics[0].count,current.consult)}%。\n- 投诉集中问题：${current.issues[0].name}，${number(current.issues[0].count)}条待核实线索，占投诉线索${pct(current.issues[0].count,current.complaint)}%。\n- 搜索最热线路：${current.routes[0].name}，${number(current.routes[0].count)}次搜索。\n\n## 本周概况\n咨询${number(current.consult)}次（环比${delta(change(current.consult,past.consult))}），舆情${number(current.opinions)}条，投诉线索${number(current.complaint)}条，线路搜索${number(current.search)}次。\n\n## 游客关注\n${current.topics.map(item=>`- ${item.name}：${number(item.count)}次，占比${pct(item.count,current.consult)}%`).join('\n')}\n\n## 投诉问题\n${current.issues.map(item=>`- ${item.name}：${number(item.count)}条，占比${pct(item.count,current.complaint)}%`).join('\n')}\n\n## 热门线路\n${current.routes.map(item=>`- ${item.name}：${number(item.count)}次搜索`).join('\n')}\n\n## 下周研判\n线路搜索较上周${delta(change(current.search,past.search))}。结合实际预约、交通和接待数据判断承载，不能仅凭搜索热度推算客流。围绕高频咨询完善产品信息，先核实高频问题，再安排体验活动。\n\n## 下周行动建议\n${report.notes||recommendations(report).map((item,index)=>`${index+1}. ${item.title}：${item.body} ${item.metric}`).join('\n')}\n\n## 统计口径\n本报告全部为演示数据。咨询、舆情、投诉线索互斥；搜索次数单独统计。投诉线索不等同于核实案件，搜索热度不等同于客流。主题占比与投诉占比分别以本周咨询量、投诉线索量为分母。尚未接入自动采集与定时生成，示例生成时间不代表已执行定时任务。\n`;
  }
  function exportReport(){
    const report=state.active,url=URL.createObjectURL(new Blob(['\uFEFF'+markdown(report)],{type:'text/markdown;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=`${report.region}文旅周报-${report.end}-演示.md`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('简报已导出');
  }
  function saveDraft(){
    const report=state.active;report.saved=new Date().toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});state.drafts[report.id]={notes:report.notes,saved:report.saved};
    try{localStorage.setItem('guiyang-county-weeklies-v2',JSON.stringify(state.drafts));toast('草稿已保存至本机浏览器');}catch{toast('浏览器存储不可用，请导出简报以保留修改');}
    render();const scroll=document.querySelector('.modal-body').scrollTop;renderModal();document.querySelector('.modal-body').scrollTop=scroll;
  }
  function beginEdit(){state.editing=true;document.querySelector('.action-editor').classList.add('open');document.querySelector('#action-notes').focus();}
  function finishEdit(){
    const notes=document.querySelector('#action-notes').value.trim();if(!notes){toast('请至少保留一条行动建议');return false;}
    state.active.notes=notes;state.editing=false;return true;
  }
  document.querySelector('#region').innerHTML=regions.map(region=>`<option>${region}</option>`).join('');
  document.querySelector('#region').onchange=event=>{state.region=event.target.value;render();};
  document.querySelector('#generate').onclick=()=>{
    if(state.generating)return;state.generating=true;const region=state.region,button=document.querySelector('#generate');button.disabled=true;button.textContent='正在生成…';
    setTimeout(()=>{state.region=region;state.generating=false;button.disabled=false;button.innerHTML='<span>＋</span> 生成最近一期';render();openReport(0);toast('已生成最近完整周的简报预览（演示）');},400);
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;const attributes=button.dataset;
    if(attributes.report!==undefined)openReport(Number(attributes.report));
    if(attributes.close!==undefined)document.querySelector('#report-dialog').close();
    if(attributes.step!==undefined){if(state.editing){toast('请先完成或取消当前建议编辑');return;}openReport(state.active.index+Number(attributes.step));}
    if(attributes.edit!==undefined)beginEdit();
    if(attributes.cancelEdit!==undefined){state.editing=false;const scroll=document.querySelector('.modal-body').scrollTop;renderModal();document.querySelector('.modal-body').scrollTop=scroll;}
    if(attributes.applyEdit!==undefined){if(finishEdit())saveDraft();}
    if(attributes.save!==undefined){if(state.editing&&!finishEdit())return;saveDraft();}
    if(attributes.export!==undefined){if(state.editing&&!finishEdit())return;const scroll=document.querySelector('.modal-body').scrollTop;renderModal();document.querySelector('.modal-body').scrollTop=scroll;exportReport();}
    if(attributes.print!==undefined){if(state.editing&&!finishEdit())return;renderModal();window.print();}
  });
  const dialog=document.querySelector('#report-dialog');
  dialog.addEventListener('cancel',event=>{if(state.editing){event.preventDefault();toast('请先完成或取消当前建议编辑');}});
  dialog.addEventListener('click',event=>{if(event.target!==dialog||state.editing)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  render();
})();
