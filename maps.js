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
const boundaryCache = {};
let boundaryMap;
let boundaryVersion = 0;
let selectedCounty = null;
let countyParent = null;
const baseRender = render;
function boundaryName(name) {
  return name.replace('黔东南苗族侗族自治州','黔东南州').replace('黔南布依族苗族自治州','黔南州').replace('黔西南布依族苗族自治州','黔西南州');
}
async function boundaryData(filename) {
  if (!boundaryCache[filename]) {
    const response = await fetch(filename);
    if (!response.ok) throw new Error('地图文件读取失败');
    boundaryCache[filename] = await response.json();
  }
  return boundaryCache[filename];
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
  const title = selectedCounty?.properties.name || '贵阳市';
  return `<section class="boundary-panel"><div class="boundary-heading"><div><small>REGIONAL OVERVIEW</small><h2>${title}</h2></div><button id="boundary-back" ${!selectedCounty ? 'disabled' : ''}>← 返回上级</button></div><div class="boundary-breadcrumb"><button id="boundary-root">贵阳市</button>${selectedCounty ? ` / <span>${selectedCounty.properties.name}</span>` : ''}</div><div id="geo-map" class="boundary-canvas" aria-label="${title}行政区边界"></div><div id="boundary-status" class="boundary-status" role="status">正在加载边界…</div><div id="boundary-readout" class="boundary-readout"><span>${metric[0]} · ${state.period}</span><strong>悬停查看 · 点击下钻</strong><small>业务演示数据</small></div><div class="boundary-note">真实行政区边界 · 无道路和点位图层${state.area === '贵阳市' ? '<br>贵安新区、双龙航空港经济区：独立矢量边界待核验' : ''}</div></section>`;
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
  if ($('#boundary-city')) $('#boundary-city').onclick = () => { selectedCounty = null; state.district = null; render(); };
  try {
    let data = await boundaryData('guiyang.json');
    if (version !== boundaryVersion) return;
    if (selectedCounty) data = {type:'FeatureCollection',features:[selectedCounty]};
    const instance = L.map('geo-map', {zoomControl:false, attributionControl:false, scrollWheelZoom:false, dragging:false, doubleClickZoom:false, boxZoom:false, keyboard:false, touchZoom:false, zoomSnap:.1});
    boundaryMap = instance;
    const style = {color:'#5cb4d6',weight:1.2,fillColor:'#144d70',fillOpacity:.88};
    const borders = L.geoJSON(data, {
      style,
      onEachFeature(feature, layer) {
        const index = selectedCounty ? state.district.index : data.features.indexOf(feature);
        const name = boundaryName(feature.properties.name);
        const center = feature.properties.centroid || feature.properties.center;
        const labelPosition = center ? [center[1],center[0]] : layer.getBounds().getCenter();
        const label = L.marker(labelPosition, {icon:L.divIcon({className:'boundary-label',html:`<span>${name}</span>`,iconSize:[100,24],iconAnchor:[50,12]}),keyboard:true,title:name}).addTo(instance);
        function select() {
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
    instance.fitBounds(borders.getBounds(),{padding:document.querySelector('#legacy-screen')?[12,8]:[45,30]});
    $('#boundary-status').textContent = selectedCounty ? '已到区县级 · 点击返回上级' : '点击地区下钻' ;
    if (selectedCounty) readBoundary(selectedCounty,state.district?.index || 0);
  } catch (error) {
    if (version === boundaryVersion) $('#boundary-status').textContent = '边界加载失败，请刷新重试';
  }
}
render();
