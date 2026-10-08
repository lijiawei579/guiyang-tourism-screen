const boundaryMetrics = {
  overview:['接待游客','万人次',1286.4],
  analysis:['客流环比','%',12.4],
  emergency:['预警事件','起',18],
  eat:['餐饮消费','亿元',57.54],
  stay:['入住率','%',62.5],
  transport:['进入车辆','万辆',126.4],
  travel:['景区接待','万人次',285.69],
  shop:['购物消费','亿元',35.96],
  entertain:['活动数量','场',32]
};
const boundaryCache = {...globalThis.GUIYANG_MAP_DATA};
const boundaryRequests = {};
let boundaryMap;
let boundaryVersion = 0;
let selectedCounty = null;
let countyParent = null;
let selectedFunctional = null;
const functionalVisibility = {guian:true, shuanglong:true};
const baseRender = render;
function boundaryName(name) {
  return name.replace('黔东南苗族侗族自治州','黔东南州').replace('黔南布依族苗族自治州','黔南州').replace('黔西南布依族苗族自治州','黔西南州');
}
async function boundaryData(filename) {
  if (boundaryCache[filename]) return boundaryCache[filename];
  if (!boundaryRequests[filename]) {
    boundaryRequests[filename] = fetch(filename).then(response => {
      if (!response.ok) throw new Error('地图文件读取失败');
      return response.json();
    }).then(data => {
      boundaryCache[filename] = data;
      return data;
    }).finally(() => { delete boundaryRequests[filename]; });
  }
  return boundaryRequests[filename];
}
function boundaryValue(index) {
  const metric = boundaryMetrics[state.page];
  let value = metric[2] * (0.64 + index * 0.073);
  if (!['analysis','stay'].includes(state.page)) value *= state.period === '本月' ? .12 : state.period === '昨日' ? .004 : 1;
  if (['emergency','entertain'].includes(state.page)) return Math.max(0, Math.round(value));
  return Number(value.toFixed(2));
}
map = function () {
  const metric = boundaryMetrics[state.page];
  const title = selectedCounty?.properties.name || selectedFunctional?.properties.name || '贵阳市';
  return `<section class="boundary-panel"><div class="boundary-heading"><div><small>REGIONAL OVERVIEW</small><h2>${title}</h2></div><button id="boundary-back" ${!selectedCounty && !selectedFunctional ? 'disabled' : ''}>← 返回上级</button></div><div class="boundary-breadcrumb"><button id="boundary-root">贵阳市</button>${selectedCounty || selectedFunctional ? ` / <span>${title}</span>` : ''}</div>${!selectedCounty ? `<div class="functional-layer-switches" aria-label="参考范围图层"><span>叠加图层</span>${[['guian','贵安新区','#be9bf2'],['shuanglong','双龙航空港','#ffd16b']].map(([key,name,color])=>`<button data-functional-toggle="${key}" aria-pressed="${functionalVisibility[key]}" style="--layer-color:${color}"><i></i>${name}</button>`).join('')}</div>` : ''}<div id="geo-map" class="boundary-canvas" aria-label="${title}行政区与功能区参考范围"></div><div id="boundary-status" class="boundary-status" role="status">正在加载边界…</div><div id="boundary-readout" class="boundary-readout"><span>${metric[0]} · ${state.period}</span><strong>悬停查看 · 点击下钻</strong><small>业务演示数据</small></div><div class="boundary-note">实线：区县边界 · 虚线：功能区近似参考范围<br>贵安仅贵阳境内 · 双龙为历史规划范围</div></section>`;
};
render = function () {
  state.area = '贵阳市';
  if (countyParent !== state.area) { selectedCounty = null; countyParent = null; state.district = null; }
  if (boundaryMap) { boundaryMap.remove(); boundaryMap = null; }
  baseRender();
  if (selectedCounty) $('#crumb').textContent += ' / ' + selectedCounty.properties.name;
  mountBoundaries();
};
function upBoundary() {
  selectedCounty = null;
  selectedFunctional = null;
  state.district = null;
  state.area = '贵阳市';
  render();
}
function readBoundary(feature, index) {
  const metric = boundaryMetrics[state.page];
  const value = boundaryValue(index);
  $('#boundary-readout').innerHTML = `<span>${boundaryName(feature.properties.name)} · ${metric[0]}</span><strong>${fmt(value)} <small>${metric[1]}</small></strong><small>${state.period} · 演示数据</small>`;
}
async function mountBoundaries() {
  const version = ++boundaryVersion;
  $('#boundary-back').onclick = () => upBoundary();
  $('#boundary-root').onclick = () => upBoundary(true);
  document.querySelectorAll('[data-functional-toggle]').forEach(button => {
    button.onclick = () => {
      const key = button.dataset.functionalToggle;
      functionalVisibility[key] = !functionalVisibility[key];
      if (selectedFunctional?.properties.id === key) selectedFunctional = null;
      render();
    };
  });
  if ($('#boundary-city')) $('#boundary-city').onclick = () => { selectedCounty = null; state.district = null; render(); };
  try {
    let [data, functionalData] = await Promise.all([
      boundaryData('guiyang.json'),
      boundaryData('functional-boundaries.json').catch(() => null)
    ]);
    if (version !== boundaryVersion) return;
    if (selectedCounty) data = {type:'FeatureCollection',features:[selectedCounty]};
    const instance = L.map('geo-map', {zoomControl:false, attributionControl:false, scrollWheelZoom:true, dragging:true, doubleClickZoom:false, boxZoom:false, keyboard:true, touchZoom:true, zoomSnap:.1,zoomDelta:.5,wheelPxPerZoomLevel:100,minZoom:7,maxZoom:14});
    boundaryMap = instance;
    const style = {color:'#76cce7',weight:1.5,fillColor:'#144d70',fillOpacity:.88};
    const borders = L.geoJSON(data, {
      style,
      onEachFeature(feature, layer) {
        const index = selectedCounty ? state.district.index : data.features.indexOf(feature);
        const name = boundaryName(feature.properties.name);
        const center = feature.properties.centroid || feature.properties.center;
        const labelPosition = center ? [center[1],center[0]] : layer.getBounds().getCenter();
        const label = L.marker(labelPosition, {icon:L.divIcon({className:'boundary-label',html:`<span>${name}</span>`,iconSize:[100,24],iconAnchor:[50,12]}),keyboard:true,title:name}).addTo(instance);
        function select() {
          selectedFunctional = null;
          if (!selectedCounty) { selectedCounty = feature; countyParent = state.area; state.district = {name,index}; }
          else { readBoundary(feature,index); return; }
          render();
        }
        label.on('click',select);
        layer.on('mouseover',() => {layer.setStyle({fillColor:'#277c9c',weight:2});readBoundary(feature,index)});
        layer.on('mouseout',() => layer.setStyle(style));
        layer.on('click',select);
        layer.on('add',() => {
          const element = layer.getElement();
          element.setAttribute('role','button');
          element.setAttribute('aria-label',`下钻${name}`);
          element.setAttribute('tabindex','0');
          element.addEventListener('keydown',event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();select()}});
        });
      }
    }).addTo(instance);
    const fullBounds = borders.getBounds();
    let focusedLayer = null;
    if (!selectedCounty && functionalData) {
      instance.createPane('functionalReference').style.zIndex = 450;
      L.geoJSON({type:'FeatureCollection',features:functionalData.features.filter(feature => functionalVisibility[feature.properties.id])}, {
        pane:'functionalReference',
        style:feature => ({color:feature.properties.color,weight:3.4,dashArray:'9 3',fillColor:feature.properties.color,fillOpacity:.46}),
        onEachFeature(feature, layer) {
          const properties = feature.properties;
          fullBounds.extend(layer.getBounds());
          const labelPoint = properties.id === 'guian' ? [26.459,106.472] : [26.50,106.84];
          const label = L.marker(labelPoint, {icon:L.divIcon({className:'functional-boundary-label',html:`<span style="--layer-color:${properties.color}">${properties.id === 'guian' ? '贵安新区' : '双龙航空港'}</span>`,iconSize:[92,22],iconAnchor:[46,11]}),keyboard:true,title:properties.name,zIndexOffset:500}).addTo(instance);
          const read = () => {
            $('#boundary-readout').innerHTML = `<span>${properties.name}</span><strong class="functional-scope">${properties.id === 'guian' ? '贵阳境内参考范围' : '2015—2030规划范围'}</strong><small>官方图近似描绘 · 不参与区县统计</small>`;
          };
          layer.bindPopup(`<div class="functional-boundary-popup"><b>${properties.name}</b><p>${properties.scope}</p><small>按官方图片近似描绘，非官方矢量边界。</small><a href="${properties.source}" target="_blank" rel="noopener noreferrer">查看官方来源 ↗</a></div>`,{className:'functional-popup',maxWidth:270});
          const focus = () => {
            selectedFunctional = feature;
            instance.fitBounds(layer.getBounds(),{padding:[70,55],maxZoom:12});
            document.querySelector('.boundary-heading h2').textContent = properties.name;
            $('#boundary-back').disabled = false;
            $('#boundary-status').textContent = '功能区参考范围 · 点击返回全市';
            read();
            layer.openPopup(layer.getBounds().getCenter());
          };
          label.on('click',focus);
          layer.on('click',focus);
          layer.on('mouseover',() => {layer.setStyle({fillOpacity:.62,weight:4});read();});
          layer.on('mouseout',() => layer.setStyle({fillOpacity:.46,weight:3.4}));
          layer.on('add',() => {
            const element = layer.getElement();
            element.setAttribute('role','button');
            element.setAttribute('aria-label',`查看${properties.name}参考范围`);
            element.setAttribute('tabindex','0');
            element.addEventListener('keydown',event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();focus();}});
          });
          if (selectedFunctional?.properties.id === properties.id) focusedLayer = {layer,read};
        }
      }).addTo(instance);
    }
    instance.fitBounds(focusedLayer ? focusedLayer.layer.getBounds() : fullBounds,{padding:focusedLayer ? [70,55] : document.querySelector('#legacy-screen')?[12,8]:[45,30],maxZoom:12});
    $('#boundary-status').textContent = selectedCounty ? '已到区县级 · 点击返回上级' : focusedLayer ? '功能区参考范围 · 点击返回全市' : functionalData ? '点击区县下钻 · 点击彩色范围聚焦' : '区县已加载 · 功能区图层加载失败，请刷新';
    $('#boundary-status').setAttribute('data-error',String(!functionalData));
    if (focusedLayer) focusedLayer.read();
    if (selectedCounty) readBoundary(selectedCounty,state.district?.index || 0);
  } catch (error) {
    if (version === boundaryVersion) {
      $('#boundary-status').textContent = '边界加载失败，请刷新重试';
      $('#boundary-status').setAttribute('data-error','true');
    }
  }
}
render();
