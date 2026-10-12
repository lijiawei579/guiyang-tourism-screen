(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const gradeRank = grade => ({'AAAAA':5,'AAAA':4,'AAA':3,'AA':2,'五星级':5,'四星级':4,'三星级':3,'二星级':2}[grade] || 0);
  window.openOfficialDirectory = (modal, category, initialRegion = '全域', context = {}) => {
    const records = window.officialTourismResources.filter(row => row.category === category);
    const title = category === 0 ? 'A级景区' : '星级酒店';
    const unit = category === 0 ? '处' : '家';
    const areas = [...new Set(records.map(row => row.area))];
    if (initialRegion !== '全域' && !areas.includes(initialRegion)) areas.push(initialRegion);
    const grades = [...new Set(records.map(row => row.grade))].sort((first, second) => gradeRank(second) - gradeRank(first));
    const state = {name:'',address:'',phone:'',area:initialRegion === '全域' ? '' : initialRegion,grade:'',page:1,size:15,sort:'',direction:1,expanded:null};
    const options = (values, selected, all) => `<option value="">${all}</option>${values.map(value => `<option value="${escape(value)}" ${value === selected ? 'selected' : ''}>${escape(value)}</option>`).join('')}`;
    function render() {
      const found = records.filter(row => ['name','address','phone'].every(field => String(row[field] || '').toLocaleLowerCase().includes(state[field].toLocaleLowerCase())) && (!state.area || row.area === state.area) && (!state.grade || row.grade === state.grade));
      if (state.sort) found.sort((first, second) => state.direction * (state.sort === 'grade' ? gradeRank(first.grade) - gradeRank(second.grade) : String(first[state.sort] || '').localeCompare(String(second[state.sort] || ''),'zh-CN',{numeric:true})));
      const pages = Math.max(1, Math.ceil(found.length / state.size));
      state.page = Math.min(state.page, pages);
      const offset = (state.page - 1) * state.size;
      const headers = [['','序号'],['name',title === 'A级景区' ? '景区名称' : '酒店名称'],['area','所属区域'],['grade',category === 0 ? '景区等级' : '酒店星级'],['address','详细地址'],['phone','联系电话'],['','操作']];
      modal.innerHTML = `<div class="dialog-head"><h2>${title}<span class="od-total">贵阳贵安 · <b>${records.length}</b> ${unit}</span></h2><button data-od-close aria-label="关闭名录">×</button></div><div class="official-directory"><form class="od-filters"><label>名称<input name="name" value="${escape(state.name)}" placeholder="输入${title === 'A级景区' ? '景区' : '酒店'}名称"></label><label>区域<select name="area">${options(areas,state.area,'全部区域')}</select></label><label>${category === 0 ? '等级' : '星级'}<select name="grade">${options(grades,state.grade,'全部等级')}</select></label><label>地址<input name="address" value="${escape(state.address)}" placeholder="地址关键词"></label><label>电话<input name="phone" value="${escape(state.phone)}" placeholder="电话号码"></label><button type="submit" class="od-query">查询</button><button type="button" data-od-reset>重置</button></form><div class="od-summary"><span role="status">筛选结果 <b>${found.length}</b> ${unit}${state.area ? ' · '+escape(state.area) : ''}${state.grade ? ' · '+escape(state.grade) : ''}</span><small>官方名录 · 2026年8月公布 · 数量不随统计周期换算</small></div><div class="od-table-wrap"><table class="od-table"><caption class="od-sr-only">${title}官方名录</caption><colgroup><col style="width:52px"><col style="width:23%"><col style="width:11%"><col style="width:9%"><col><col style="width:16%"><col style="width:152px"></colgroup><thead><tr>${headers.map(([field,label]) => `<th scope="col" ${field ? `aria-sort="${state.sort === field ? state.direction === 1 ? 'ascending' : 'descending' : 'none'}"` : ''}>${field ? `<button data-od-sort="${field}">${label}<span aria-hidden="true">${state.sort === field ? state.direction === 1 ? '↑' : '↓' : '↕'}</span></button>` : label}</th>`).join('')}</tr></thead><tbody>${found.slice(offset,offset+state.size).map((row,index) => `<tr><td class="od-index">${offset+index+1}</td><td class="od-name">${escape(row.name)}</td><td>${escape(row.area)}</td><td><span class="od-grade">${escape(row.grade)}</span></td><td>${escape(row.address || '未公布')}</td><td class="od-phone">${escape(row.phone || '未公布')}</td><td class="od-actions"><button data-od-detail="${escape(row.id)}" aria-expanded="${state.expanded === row.id}" aria-controls="od-detail-${escape(row.id)}">${state.expanded === row.id ? '收起' : '详情'}</button></td></tr>${state.expanded === row.id ? `<tr class="od-expanded" id="od-detail-${escape(row.id)}"><td></td><td colspan="6"><dl><dt>资源简介</dt><dd>${escape(row.description || '官方名录未公布资源简介。')}</dd>${row.operator ? `<dt>运营单位</dt><dd>${escape(row.operator)}</dd>` : ''}<dt>公布日期</dt><dd>${escape(row.published)}</dd></dl></td></tr>` : ''}`).join('') || '<tr><td colspan="7" class="od-empty">没有符合条件的记录，请调整筛选条件或点击重置。</td></tr>'}</tbody></table></div><div class="od-pagination"><span>共 ${found.length} 条 · 当前 ${found.length ? offset+1 : 0}–${Math.min(offset+state.size,found.length)} 条</span><label>每页<select data-od-size aria-label="每页条数">${[15,30,50].map(size=>`<option value="${size}" ${state.size === size ? 'selected' : ''}>${size} 条</option>`).join('')}</select></label><button data-od-prev ${state.page === 1 ? 'disabled' : ''}>上一页</button><span>${state.page} / ${pages}</span><button data-od-next ${state.page === pages ? 'disabled' : ''}>下一页</button></div></div>`;
      const matchesText=row=>['name','address','phone'].every(field=>String(row[field]||'').toLocaleLowerCase().includes(state[field].toLocaleLowerCase()));
      if(context.categories){modal.querySelector('.official-directory').insertAdjacentHTML('afterbegin',`<details class="od-composition"><summary>切换资源类别 ▾</summary><div class="od-count-tabs">${context.categories.map(item=>`<button data-od-category="${item.index}" aria-pressed="${category===item.index}">${escape(item.name)}<b>${item.count}</b></button>`).join('')}</div></details>`);modal.querySelectorAll('[data-od-category]').forEach(button=>button.onclick=()=>context.onCategory(Number(button.dataset.odCategory)));}
      const areaBase=records.filter(row=>matchesText(row)&&(!state.grade||row.grade===state.grade));
      const gradeBase=records.filter(row=>matchesText(row)&&(!state.area||row.area===state.area));
      modal.querySelector('.od-summary').insertAdjacentHTML('beforebegin',`<details class="od-composition" open><summary>区域与等级组成 · 点击筛选，再次点击取消</summary><div class="od-count-tabs">${areas.map(area=>`<button data-od-area="${escape(area)}" aria-pressed="${area===state.area}">${escape(area)}<b>${areaBase.filter(row=>row.area===area).length}</b></button>`).join('')}</div><div class="od-count-tabs">${grades.map(grade=>`<button data-od-grade="${escape(grade)}" aria-pressed="${grade===state.grade}">${escape(grade)}<b>${gradeBase.filter(row=>row.grade===grade).length}</b></button>`).join('')}</div><p>区域数量使用当前名称、地址、电话、等级条件；等级数量使用当前区域及文本条件。按名录资源编号去重，一项资源只归属一个管理区域。</p></details>`);
      modal.querySelectorAll('[data-od-area]').forEach(button=>button.onclick=()=>{state.area=state.area===button.dataset.odArea?'':button.dataset.odArea;state.page=1;state.expanded=null;render();});
      modal.querySelectorAll('[data-od-grade]').forEach(button=>button.onclick=()=>{state.grade=state.grade===button.dataset.odGrade?'':button.dataset.odGrade;state.page=1;state.expanded=null;render();});
      modal.querySelectorAll('.od-actions').forEach((actions,index)=>{
        const row=found[offset+index],key=category===0?'scenicIn':'hotelGuests',object=globalThis.IndicatorData?.entities(category===0?'scenic':'hotel').find(object=>object.resourceId===row.id);
        if(object){const button=document.createElement('button');button.textContent='经营下钻';button.setAttribute('aria-label',row.name+'经营数据下钻');button.onclick=()=>{modal.close();openIndicatorDrill(key,{...context,area:row.area,entityId:object.id,entityName:row.name});};actions.append(button);}
      });
      modal.querySelector('[data-od-close]').onclick = () => modal.close();
      const form = modal.querySelector('form');
      const apply = () => {
        const data = new FormData(form);
        for (const field of ['name','area','grade','address','phone']) state[field] = String(data.get(field) || '').trim();
        state.page = 1;
        state.expanded = null;
        render();
      };
      form.onsubmit = event => {event.preventDefault();apply();};
      form.querySelectorAll('select').forEach(select => select.onchange = apply);
      modal.querySelector('[data-od-reset]').onclick = () => {Object.assign(state,{name:'',address:'',phone:'',area:'',grade:'',page:1,sort:'',direction:1,expanded:null});render();};
      modal.querySelectorAll('[data-od-sort]').forEach(button => button.onclick = () => {state.direction = state.sort === button.dataset.odSort ? -state.direction : 1;state.sort = button.dataset.odSort;state.page = 1;render();});
      modal.querySelectorAll('[data-od-detail]').forEach(button => button.onclick = () => {state.expanded = state.expanded === button.dataset.odDetail ? null : button.dataset.odDetail;render();});
      modal.querySelector('[data-od-size]').onchange = event => {state.size = Number(event.target.value);state.page = 1;render();};
      modal.querySelector('[data-od-prev]').onclick = () => {state.page = Math.max(1,state.page-1);render();};
      modal.querySelector('[data-od-next]').onclick = () => {state.page = Math.min(pages,state.page+1);render();};
    }
    render();
    if (!modal.open) modal.showModal();
  };
})();
