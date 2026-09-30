const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const scaleScreen = () => $('#screen').style.setProperty('--screen-scale', Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
addEventListener('resize', scaleScreen);
scaleScreen();

const cityNames = ['贵阳市', '遵义市', '安顺市', '黔东南州', '黔南州', '毕节市', '铜仁市', '六盘水市', '黔西南州'];
const cityAdcodes = {
  '贵阳市': '520100',
  '六盘水市': '520200',
  '遵义市': '520300',
  '安顺市': '520400',
  '毕节市': '520500',
  '铜仁市': '520600',
  '黔西南州': '522300',
  '黔东南州': '522600',
  '黔南州': '522700'
};
const countyCatalog = {
  '贵阳市': ['南明区', '云岩区', '花溪区', '乌当区', '白云区', '观山湖区', '清镇市', '修文县', '息烽县', '开阳县'],
  '遵义市': ['红花岗区', '汇川区', '播州区', '赤水市', '仁怀市', '桐梓县', '绥阳县', '湄潭县', '习水县', '余庆县'],
  '安顺市': ['西秀区', '平坝区', '普定县', '镇宁县', '关岭县', '紫云县'],
  '黔东南州': ['凯里市', '黄平县', '施秉县', '镇远县', '黎平县', '从江县', '榕江县', '雷山县'],
  '黔南州': ['都匀市', '福泉市', '荔波县', '贵定县', '瓮安县', '龙里县', '惠水县', '罗甸县'],
  '毕节市': ['七星关区', '大方县', '黔西市', '金沙县', '织金县', '纳雍县', '威宁县', '赫章县'],
  '铜仁市': ['碧江区', '万山区', '江口县', '石阡县', '思南县', '德江县', '沿河县', '松桃县'],
  '六盘水市': ['钟山区', '六枝特区', '水城区', '盘州市'],
  '黔西南州': ['兴义市', '兴仁市', '普安县', '晴隆县', '贞丰县', '望谟县', '册亨县', '安龙县']
};
const regionFactors = { '全省': 1, '贵阳市': .196, '遵义市': .129, '安顺市': .119, '黔东南州': .154, '黔南州': .1, '毕节市': .088, '铜仁市': .078, '六盘水市': .055, '黔西南州': .081 };
const typeFactors = { '全部类型': 1, '酒店': .61, '民宿': .3, '客栈及其他': .09 };
const colors = ['#28efff', '#42f5d1', '#ffd252', '#1678ff', '#ff8a5c', '#7288ff', '#55b9ff', '#9bf4b2', '#d67cff'];
const dashboard = {
  cities: [
    ['贵阳市', 82.4, 4.86, 16820], ['黔东南州', 84.7, 3.82, 3280], ['遵义市', 68.8, 3.21, 2540],
    ['安顺市', 76.2, 2.94, 1580], ['黔南州', 71.3, 2.47, 2180], ['毕节市', 58.2, 2.18, 1820],
    ['铜仁市', 60.5, 1.93, 1430], ['六盘水市', 43.1, 1.51, 2960], ['黔西南州', 47.6, 1.39, 1280]
  ],
  cityStay: [['黔东南州', 2.16], ['黔西南州', 2.04], ['六盘水市', 1.96], ['安顺市', 1.89], ['贵阳市', 1.84], ['黔南州', 1.78], ['遵义市', 1.72], ['铜仁市', 1.67], ['毕节市', 1.61]],
  supply: {
    total: 26440,
    active: 15826,
    beds: 642180,
    categories: {
      hotel: { label: '酒店', total: 12162, active: 8942, beds: 408720, share: 46, gradeLabel: '星级酒店', grades: [['五星', 9], ['四星', 79], ['三星', 113]] },
      homestay: { label: '民宿', total: 11105, active: 5108, beds: 173460, share: 42, gradeLabel: '等级民宿', grades: [['金山级', 99], ['银山级', 174], ['青山级', 365]] },
      other: { label: '客栈及其他住宿类场所', shortLabel: '客栈及其他', total: 3173, active: 1776, beds: 60000, share: 12 }
    }
  },
  periods: {
    day: { label: '昨日接待人次', value: 24.8, unit: '万人次', compare: '较去年同期 +8.6%', title: '日接待人次与入住率趋势', values: [12.2, 13.8, 12.9, 15.1, 16.4, 15.8, 17.3, 18.6, 19.2, 18.7, 20.4, 21.3, 22.8, 24.8], occupancy: [51.8, 53.2, 52.6, 54.8, 56.1, 55.7, 57.4, 58.8, 59.6, 58.9, 60.4, 61.2, 62.1, 63.5], axis: ['08/07', '08/08', '08/09', '08/10', '08/11', '08/12', '08/13', '08/14', '08/15', '08/16', '08/17', '08/18', '08/19', '08/20'] },
    month: { label: '上月接待人次', value: 412.6, unit: '万人次', compare: '较去年同期 +12.4%', title: '月接待人次与入住率趋势', values: [238, 252, 267, 281, 296, 305, 318, 326, 341, 354, 348, 362, 371, 378, 386, 395, 404, 412.6], occupancy: [48.6, 49.8, 51.2, 52.4, 54.8, 56.2, 55.4, 57.1, 58.3, 57.6, 55.8, 56.9, 58.7, 59.6, 60.8, 61.7, 62.4, 63.5], axis: ['25/03', '25/04', '25/05', '25/06', '25/07', '25/08', '25/09', '25/10', '25/11', '25/12', '26/01', '26/02', '26/03', '26/04', '26/05', '26/06', '26/07', '26/08'] },
    year: { label: '本年接待人次', value: 3568.4, unit: '万人次', compare: '较去年同期 +15.2%', title: '年接待人次与入住率趋势', values: [1286, 1468, 1672, 1956, 1834, 2216, 2594, 2910, 3188, 3402, 3568.4], occupancy: [46.2, 48.5, 50.4, 53.6, 42.8, 49.7, 54.9, 57.8, 60.2, 62.1, 63.5], axis: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'] }
  },
  consumption: {
    year: { label: '本年旅游消费', value: 222.18, unit: '亿元', compare: '较去年同期 +12.6% · 模拟' },
    month: { label: '上月旅游消费', value: 110.88, unit: '亿元', compare: '较去年同期 +9.8% · 模拟' },
    day: { label: '昨日旅游消费', value: 3.82, unit: '亿元', compare: '模拟日更新' }
  },
  profile: {
    source: [['省内游客', 37.5, '#1678ff'], ['省外游客', 61.3, '#42f5d1'], ['境外游客', 1.2, '#ffd252']],
    outside: [['广东', 16.8], ['四川', 14.2], ['重庆', 11.7], ['湖南', 9.3], ['浙江', 7.8], ['广西', 5.6], ['江苏', 5.2], ['湖北', 4.7]],
    inside: [['贵阳', 25.4], ['遵义', 18.2], ['毕节', 14.7], ['黔东南', 11.9], ['安顺', 9.8], ['黔南', 8.6]],
    ages: [['18岁以下', 5, '#7288ff'], ['18-24岁', 18, '#42f5d1'], ['25-35岁', 30, '#ffd252'], ['35-45岁', 22, '#28efff'], ['45岁以上', 25, '#91b7ff']],
    genders: [['女', 51.4, '#ffd252'], ['男', 48.6, '#42f5ff']]
  },
  price: [['150元以下', 24], ['150–300元', 38], ['300–450元', 22], ['450–600元', 11], ['600元以上', 5]],
  preference: {
    '离店时间': [['00:00-6:00', 1, '#ff6670'], ['6:00-10:00', 46, '#ffd252'], ['10:00-14:00', 35, '#68ef73'], ['14:00-16:00', 10, '#42f5d1'], ['16:00-00:00', 8, '#39b6ff']],
    '入住时间': [['00:00-6:00', 2, '#ff6670'], ['6:00-10:00', 10, '#ffd252'], ['10:00-14:00', 30, '#68ef73'], ['14:00-16:00', 25, '#42f5d1'], ['16:00-00:00', 33, '#39b6ff']]
  },
  popularRoutes: [['贵阳', '安顺', 8621, '山地观光'], ['贵阳', '黔东南', 7284, '民族文化'], ['遵义', '毕节', 4963, '避暑休闲'], ['贵阳', '黔南', 4216, '城市休闲'], ['安顺', '黔西南', 3708, '峡谷康养'], ['黔东南', '黔南', 2984, '村寨串联'], ['铜仁', '遵义', 2412, '红色山水'], ['六盘水', '毕节', 2096, '避暑周末'], ['黔南', '贵阳', 1968, '返程集散']],
  routeDemand: { '贵阳市': 9200, '遵义市': 6500, '安顺市': 5200, '黔东南州': 5800, '黔南州': 4800, '毕节市': 4500, '铜仁市': 3900, '六盘水市': 3300, '黔西南州': 3600 },
  gaps: {
    '贵阳市': { count: 1711, share: 18.6, cities: [['黔东南州', 29.4], ['安顺市', 24.8], ['遵义市', 18.6], ['黔南州', 14.2]], origins: [['四川', 24.6], ['重庆', 19.8], ['湖南', 14.2], ['广东', 12.7]] },
    '遵义市': { count: 1781, share: 27.4, cities: [['贵阳市', 31.2], ['毕节市', 22.5], ['铜仁市', 18.3], ['黔东南州', 13.6]], origins: [['广东', 21.4], ['四川', 18.9], ['重庆', 17.6], ['浙江', 11.3]] },
    '安顺市': { count: 1654, share: 31.8, cities: [['贵阳市', 33.5], ['黔西南州', 21.9], ['黔南州', 17.6], ['毕节市', 12.8]], origins: [['四川', 22.1], ['广东', 19.2], ['重庆', 15.8], ['湖南', 12.6]] },
    '黔东南州': { count: 1404, share: 24.2, cities: [['贵阳市', 28.2], ['黔南州', 24.4], ['铜仁市', 16.8], ['遵义市', 12.4]], origins: [['重庆', 20.3], ['四川', 17.7], ['广东', 16.5], ['广西', 13.4]] },
    '黔南州': { count: 1421, share: 29.6, cities: [['贵阳市', 27.6], ['黔东南州', 23.8], ['安顺市', 16.7], ['黔西南州', 11.9]], origins: [['广东', 23.8], ['四川', 16.4], ['湖南', 14.8], ['重庆', 13.2]] },
    '毕节市': { count: 1580, share: 35.1, cities: [['遵义市', 25.8], ['六盘水市', 21.7], ['贵阳市', 18.5], ['安顺市', 12.4]], origins: [['重庆', 21.9], ['四川', 20.6], ['广东', 13.7], ['湖南', 10.8]] },
    '铜仁市': { count: 1498, share: 38.4, cities: [['遵义市', 26.4], ['黔东南州', 22.1], ['贵阳市', 17.2], ['毕节市', 11.5]], origins: [['湖南', 25.1], ['重庆', 18.4], ['四川', 15.9], ['广东', 12.1]] },
    '六盘水市': { count: 1409, share: 42.7, cities: [['毕节市', 28.6], ['安顺市', 19.8], ['贵阳市', 15.7], ['黔西南州', 13.9]], origins: [['四川', 22.8], ['重庆', 18.2], ['云南', 16.5], ['广东', 10.9]] },
    '黔西南州': { count: 1422, share: 39.5, cities: [['安顺市', 27.8], ['黔南州', 20.2], ['贵阳市', 16.9], ['六盘水市', 12.6]], origins: [['云南', 24.7], ['广西', 18.5], ['广东', 15.8], ['四川', 11.6]] }
  }
};

let activeFilters = { region: '贵阳市', type: '全部类型', startDate: '2026-07-10', endDate: '2026-08-20' };
const activeTabs = { supply: 'hotel', period: 'day', operation: 'price', guestPanel: 'structure', guestStructure: 'source', guestSource: 'inside' };
const mapDrill = { level: 'city', city: '贵阳市', county: null };
const districtWeights = {'南明区':.17,'云岩区':.16,'花溪区':.14,'乌当区':.06,'白云区':.06,'观山湖区':.18,'清镇市':.08,'修文县':.05,'息烽县':.04,'开阳县':.06};
const districtFactor = () => districtWeights[mapDrill.county] || 1;
const geographyFactor = () => .196 * districtFactor();
const selectedDays = () => Math.max(1, Math.round((new Date(activeFilters.endDate) - new Date(activeFilters.startDate)) / 86400000) + 1);
const dateFactor = () => Math.max(.12, Math.min(4, selectedDays() / 42));
const scopeFactor = () => geographyFactor() * (typeFactors[activeFilters.type] || 1);
const flowFactor = () => scopeFactor() * dateFactor();
const regionToken = region => region.replace(/市|州/g, '').replace('苗族侗族自治', '').replace('布依族苗族自治', '');
const cityShortName = name => name.replace('苗族侗族自治州', '州').replace('布依族苗族自治州', '州');
const heatColor = heat => heat >= 80 ? '#00eefa' : heat >= 70 ? '#1678ff' : heat >= 60 ? '#0d55d8' : heat >= 50 ? '#0a3c8c' : '#082b61';
const conicSegments = items => { let cursor = 0; return items.map(([, value, color]) => { const start = cursor; cursor += value; return `${color} ${start}% ${cursor}%`; }).join(','); };
const occupancySeries = () => {
  const period = dashboard.periods[activeTabs.period];
  const cityHeat = dashboard.cities.find(([name]) => name === activeFilters.region)?.[1] || 68;
  const regionOffset = activeFilters.region === '全省' ? 0 : (cityHeat - 68) * .12;
  const typeOffset = { '全部类型': 0, '酒店': 2.2, '民宿': -1.3, '客栈及其他': -2.4 }[activeFilters.type] || 0;
  return period.occupancy.map(value => Math.min(88, Math.max(35, value + regionOffset + typeOffset)));
};
const currentOccupancy = () => occupancySeries().at(-1);
const occupancyCompare = () => activeTabs.period === 'day' ? '较前日 +2.8pct' : '较去年同期 +4.2pct';
const stayValue = () => activeFilters.type === '民宿' ? 1.92 : activeFilters.type === '酒店' ? 1.68 : activeFilters.type === '客栈及其他' ? 1.61 : 1.74;
const trendMetricItems = () => {
  const period = dashboard.periods[activeTabs.period];
  const factor = scopeFactor();
  return [
    [period.label, (period.value * factor).toFixed(factor < .2 ? 2 : 1), '万人次', period.compare],
    ['入住率', currentOccupancy().toFixed(1), '%', occupancyCompare()],
    ['平均入住天数', stayValue().toFixed(2), '天', '同比 +0.12天']
  ];
};

function renderKpis() {
  const factor = scopeFactor();
  const receptionItems = ['year', 'month', 'day'].map(key => {
    const period = dashboard.periods[key];
    return [period.label, (period.value * factor).toFixed(factor < .2 ? 2 : 1), period.unit, period.compare, 'reception'];
  });
  const consumptionItems = ['year', 'month', 'day'].map(key => {
    const item = dashboard.consumption[key];
    return [item.label, (item.value * geographyFactor()).toFixed(2), item.unit, item.compare, key === 'day' ? 'consumption kpi-consumption-day' : 'consumption'];
  });
  const items = [...receptionItems, ...consumptionItems];
  $('#kpis').innerHTML = items.map(([label, value, unit, note, kind]) => `<article class="kpi kpi-${kind}"><span>${label}</span><strong>${Number(value).toLocaleString('zh-CN')}<em>${unit}</em></strong><small>${note}</small></article>`).join('');
}

function renderTrendMetrics() {
  $('#trendMetrics').innerHTML = trendMetricItems().map(([label, value, unit, note]) => `<article><span>${label}</span><strong>${Number(value).toLocaleString('zh-CN')}<em>${unit}</em></strong><small>${note}</small></article>`).join('');
}

function renderSupply() {
  const content = $('#supplyContent');
  const supply = dashboard.supply;
  const factor = geographyFactor();
  const categories = Object.entries(supply.categories);
  const current = supply.categories[activeTabs.supply];
  const number = value => Math.round(value * factor).toLocaleString('zh-CN');
  const gradeTotal = current.grades?.reduce((sum, [, value]) => sum + value, 0) || 0;
  const detail = current.grades
    ? `<div class="supply-grade-detail"><article class="supply-grade-total"><span>${current.gradeLabel}</span><strong>${number(gradeTotal)}<em>家</em></strong><small>占${current.label}总数 ${(gradeTotal / current.total * 100).toFixed(1)}%</small></article><div class="supply-grade-list">${current.grades.map(([name, value]) => `<span><i>${name}</i><b>${number(value)}家</b></span>`).join('')}</div></div>`
    : `<div class="supply-other-note"><strong>经营基础盘</strong><span>在营率 ${(current.active / current.total * 100).toFixed(1)}%</span><span>床位占全行业 ${(current.beds / supply.beds * 100).toFixed(1)}%</span></div>`;
  content.innerHTML = `<div class="supply-combined"><section class="supply-overall"><article class="supply-total"><span>住宿类场所总数</span><strong>${number(supply.total)}<em>家</em></strong><small>原型模拟数据</small></article><div class="supply-share"><div class="supply-share-head"><span>场所类型构成</span><b>总量视角</b></div><div class="supply-segments">${categories.map(([, item], index) => `<i style="--w:${item.share}%;--c:${colors[index]}"></i>`).join('')}</div><div class="supply-share-legend">${categories.map(([, item], index) => `<span><i style="--c:${colors[index]}"></i>${item.shortLabel || item.label}<b>${item.share}%</b></span>`).join('')}</div></div></section><section class="supply-detail"><div class="supply-tabs" data-tab-group="supply">${categories.map(([key, item]) => `<button class="${key === activeTabs.supply ? 'active' : ''}" data-tab="${key}">${item.shortLabel || item.label}</button>`).join('')}</div><div class="supply-detail-body"><div class="supply-detail-head"><strong>${current.label}</strong><span>分类经营口径</span></div><div class="supply-detail-metrics"><article><span>场所总数</span><strong>${number(current.total)}<em>家</em></strong></article><article><span>在营数</span><strong>${number(current.active)}<em>家</em></strong></article><article><span>床位数</span><strong>${number(current.beds)}<em>张</em></strong></article></div>${detail}</div></section></div>`;
  content.querySelector('[data-tab-group="supply"]').addEventListener('click', event => {
    const button = event.target.closest('[data-tab]');
    if (!button) return;
    activeTabs.supply = button.dataset.tab;
    renderSupply();
  });
}

function drawTrend() {
  const period = dashboard.periods[activeTabs.period];
  const values = period.values.map(value => value * scopeFactor());
  const occupancyValues = occupancySeries();
  renderTrendMetrics();
  const width = Math.max(520, values.length * 42);
  const height = 122, padX = 14, padY = 15;
  const min = Math.min(...values) * .92, max = Math.max(...values) * 1.05;
  const points = values.map((value, index) => [padX + index * (width - padX * 2) / (values.length - 1), height - padY - (value - min) / (max - min) * (height - padY * 2)]);
  const occupancyPoints = occupancyValues.map((value, index) => [padX + index * (width - padX * 2) / (occupancyValues.length - 1), height - padY - (value - 35) / 55 * (height - padY * 2)]);
  const line = points.map(point => point.join(',')).join(' ');
  const occupancyLine = occupancyPoints.map(point => point.join(',')).join(' ');
  const area = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;
  $('#trendTitle').textContent = period.title;
  $('#trendCompare').textContent = period.compare;
  $('#trendChart').setAttribute('viewBox', `0 0 ${width} ${height}`);
  $('#trendChart').innerHTML = `<defs><linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#42f5d1" stop-opacity=".28"/><stop offset="1" stop-color="#42f5d1" stop-opacity="0"/></linearGradient></defs><path d="M${padX} 34H${width-padX}M${padX} 66H${width-padX}M${padX} 98H${width-padX}" stroke="rgba(91,213,220,.1)"/><polygon points="${area}" fill="url(#trendArea)"/><polyline points="${line}" fill="none" stroke="#42f5d1" stroke-width="2"/><polyline points="${occupancyLine}" fill="none" stroke="#ffd252" stroke-width="2" stroke-dasharray="5 3"/><circle cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="3.5" fill="#42f5d1" stroke="#fff"/><circle cx="${occupancyPoints.at(-1)[0]}" cy="${occupancyPoints.at(-1)[1]}" r="3.5" fill="#ffd252" stroke="#fff"/><text x="${width-padX}" y="12" text-anchor="end" fill="#d7b94c" font-size="10">入住率 %</text>`;
  $('#trendCanvas').style.width = `${width}px`;
  $('#trendAxis').innerHTML = period.axis.map(label => `<span>${label}</span>`).join('');
}

function renderOperation() {
  const content = $('#operationContent');
  if (activeTabs.operation === 'price') {
    content.innerHTML = `<div class="price-list">${dashboard.price.map(([name, value]) => `<div class="price-row"><span>${name}</span><i style="--w:${value / 38 * 100}%"></i><strong>${value}%</strong></div>`).join('')}<div class="consumption-note">价格分布为模拟数据。</div></div>`;
  } else {
    const rows = Object.entries(dashboard.preference).map(([name, items]) => `<div class="pref-row"><span>${name}</span><div class="pref-stack">${items.map(([, value, color]) => `<i style="--w:${value}%;--c:${color}"></i>`).join('')}</div></div>`).join('');
    content.innerHTML = `<div class="preference-list">${rows}<div class="pref-legend">${dashboard.preference['离店时间'].map(([name, , color]) => `<span><i style="--c:${color}"></i>${name}</span>`).join('')}</div></div>`;
  }
}

const countyNames = city => window.GUIZHOU_COUNTY_GEOJSON?.[cityAdcodes[city]]?.features?.map(feature => feature.properties.name) || countyCatalog[city] || [];
const countyValue = (city, index) => 55 + (Math.max(0,index) * 7) % 35;
const countyRanking = city => countyNames(city).map((name, index) => [name, countyValue(city, index)]).sort((a, b) => b[1] - a[1]);
const cityFromSource = { 贵阳: '贵阳市', 遵义: '遵义市', 毕节: '毕节市', 黔东南: '黔东南州', 安顺: '安顺市', 黔南: '黔南州' };
const outsideCityMap = { 广东: '贵阳市', 四川: '遵义市', 重庆: '黔东南州', 湖南: '铜仁市', 浙江: '贵阳市', 广西: '黔南州', 江苏: '安顺市', 湖北: '毕节市' };
const guestSourceRows = mode => {
  const share = mode === 'inside' ? 37.5 : 61.3;
  const rows = dashboard.profile[mode];
  const total = rows.reduce((sum, [,value]) => sum + value, 0);
  return rows.map(([name,value]) => [name, value / total * share]);
};

function syncGuestTabs() {
  const current = activeTabs.guestPanel === 'structure' ? activeTabs.guestStructure : activeTabs.guestSource;
  $$('[data-tab-group="guestView"] button').forEach(button => button.classList.toggle('active', button.dataset.tab === current));
}

function renderGuest() {
  const content = $('#guestContent');
  syncGuestTabs();
  if (activeTabs.guestPanel === 'structure' && activeTabs.guestStructure === 'source') {
    const items = dashboard.profile.source;
    const periodValue = dashboard.periods[activeTabs.period].value * scopeFactor();
    const formatCount = value => `${(periodValue * value / 100).toFixed(2)}万人次`;
    const rankingMarkup = (title, share, rows) => {
      const max = Math.max(...rows.map(([, value]) => value), 1);
      return `<section class="guest-source-column"><header><strong>${title}</strong><span>${formatCount(share)} · ${share.toFixed(1)}%</span></header><div class="guest-source-list">${rows.map(([name, value, city], index) => { const drillAttribute = `data-source-name="${name}"`; return `<div class="guest-source-row" ${drillAttribute}><b>${String(index + 1).padStart(2, '0')}</b><span>${name}</span><i style="--w:${value / max * 100}%"></i><strong>${formatCount(value)}</strong></div>`; }).join('')}</div></section>`;
    };
    const insideRows = guestSourceRows('inside');
    const outsideRows = guestSourceRows('outside');
    const insideShare = items.find(([name]) => name === '省内游客')?.[1] || 0;
    const outsideShare = items.find(([name]) => name === '省外游客')?.[1] || 0;
    content.innerHTML = `<div class="guest-combined"><section class="guest-source-overview"><div class="guest-source-overview-head"><strong>客源结构</strong><span>住宿接待客流构成 · ${mapDrill.level === 'province' ? '全省' : mapDrill.county || mapDrill.city}</span></div><div class="guest-source-segments">${items.map(([, value, color]) => `<i style="--w:${value}%;--c:${color}"></i>`).join('')}</div><div class="guest-source-legend">${items.map(([name, value, color]) => `<span><i style="--c:${color}"></i>${name}<b>${value}%</b></span>`).join('')}</div></section><div class="guest-source-rankings">${rankingMarkup('省内游客排行', insideShare, insideRows)}${rankingMarkup('省外游客排行', outsideShare, outsideRows)}</div></div>`;
    return;
  }
  if (activeTabs.guestPanel === 'structure') {
    const ages = dashboard.profile.ages, genders = dashboard.profile.genders;
    content.innerHTML = `<div class="demographic-layout"><div class="demographic-chart"><div class="age-ring" style="--age:${conicSegments(ages)}"></div><div class="gender-pie" style="--gender:${conicSegments(genders)}"><span>女<br>51.4%</span><span>男<br>48.6%</span></div></div><div class="demographic-legend">${genders.map(([name,value,color]) => `<div><i style="--c:${color}"></i><span>${name}（内圈）</span><b>${value}%</b></div>`).join('')}${ages.map(([name,value,color]) => `<div><i style="--c:${color}"></i><span>${name}（外圈）</span><b>${value}%</b></div>`).join('')}</div></div><div class="guest-drill-hint">外圈年龄 · 内圈性别 · 客源结构为模拟比例 · 人次随区域筛选更新</div>`;
    return;
  }
  const mode = activeTabs.guestSource;
  const rows = guestSourceRows(mode);
  const max = Math.max(...rows.map(([, value]) => value));
  const levelText = mapDrill.level === 'province' ? '全省市州排名' : mapDrill.level === 'city' ? `${mapDrill.city}区县排名` : `${mapDrill.county}客源结构`;
  if (mapDrill.level === 'county') {
    content.innerHTML = `<div class="county-profile"><div class="county-profile-title"><strong>${mapDrill.county}</strong><span>${mode === 'inside' ? '省内' : '省外'}客源明细</span></div><div class="county-profile-cards"><article><span>核心客源占比</span><b>56.8%</b></article><article><span>关联住宿人次</span><b>2,486</b></article><article><span>平均停留</span><b>1.86晚</b></article></div><div class="guest-drill-hint">可点击地图其他区县切换，点击“返回上一级”回到${mapDrill.city}</div></div>`;
    return;
  }
  content.innerHTML = `<div class="source-ranking"><div class="source-ranking-title"><strong>${mode === 'inside' ? '省内游客到访' : '省外游客来源'}</strong><span>${levelText} · 点击条目下钻</span></div>${rows.map(([name,value,city]) => { const drillAttribute = `data-source-name="${name}"`; return `<button class="source-rank-button" ${drillAttribute}><span>${name}</span><i style="--w:${value/max*100}%"></i><b>${value}%</b><em>›</em></button>`; }).join('')}</div>`;
}

const routeCount = (from, to) => {
  const fromIndex = cityNames.indexOf(from), toIndex = cityNames.indexOf(to);
  const base = dashboard.routeDemand[from] * .44 + dashboard.routeDemand[to] * .56;
  return Math.round(base * (.78 + (((fromIndex + 2) * 13 + (toIndex + 3) * 7) % 23) / 100));
};
const routeRecord = (from,to) => [regionToken(from),regionToken(to),routeCount(from,to),'跨市住宿客流'];
const cityRouteStats = city => ({ arrived: cityNames.filter(from => from !== city).map(from => routeRecord(from,city)).sort((a,b)=>b[2]-a[2]), left: cityNames.filter(to => to !== city).map(to => routeRecord(city,to)).sort((a,b)=>b[2]-a[2]) });

function renderRoutes() {
  if (activeFilters.region === '全省') {
    $('#routeTitle').textContent = '热门跨市住宿路径';
    $('#routeScope').textContent = '全省跨市住宿客流 TOP 9';
    $('#routes').className = 'province-routes';
    $('#routes').innerHTML = dashboard.popularRoutes.map(([start,end,count,note],index) => `<article class="province-route"><b>${String(index+1).padStart(2,'0')}</b><span>${start}<i>→</i>${end}<small>${note}</small></span><strong>${Math.round(count*dateFactor()*(typeFactors[activeFilters.type]||1)).toLocaleString('zh-CN')}<em>人</em></strong></article>`).join('');
    return;
  }
  const city = activeFilters.region, focus = regionToken(city), { arrived, left } = cityRouteStats(city);
  const ranking = (routes, mode) => routes.map(([start,end,count],index) => `<div class="route-rank"><b>${String(index+1).padStart(2,'0')}</b><span>${mode==='in'?`${start} → ${focus}`:`${focus} → ${end}`}</span><i style="--w:${count/routes[0][2]*100}%"></i><strong>${Math.round(count*dateFactor()*(typeFactors[activeFilters.type]||1)).toLocaleString('zh-CN')}</strong></div>`).join('');
  $('#routeTitle').textContent = '跨市住宿客流排名';
  $('#routeScope').textContent = `${city} · 全市跨市客流`;
  $('#routes').className = 'city-routes';
  $('#routes').innerHTML = `<section class="route-direction incoming"><div class="route-direction-title"><b>来</b><span>游客到访</span><em>向${city}汇聚</em></div>${ranking(arrived,'in')}</section><section class="route-direction outgoing"><div class="route-direction-title"><b>走</b><span>游客离开</span><em>从${city}出发</em></div>${ranking(left,'out')}</section>`;
}

function renderOpportunity() {
  const content = $('#opportunityContent');
  if (activeFilters.region === '全省') {
    $('#opportunityTitle').textContent = '各市州平均住宿时长';
    $('#opportunityScope').textContent = '全省住宿游客 · 点击市州下钻';
    const max = Math.max(...dashboard.cityStay.map(([, value]) => value));
    content.innerHTML = `<div class="stay-ranking">${dashboard.cityStay.map(([name,value],index) => `<button data-opportunity-city="${name}"><b>${String(index+1).padStart(2,'0')}</b><span>${name}</span><i style="--w:${value/max*100}%"></i><strong>${value.toFixed(2)}晚</strong></button>`).join('')}</div>`;
    return;
  }
  const data = dashboard.gaps[activeFilters.region];
  const count = Math.round(data.count * dateFactor() * (typeFactors[activeFilters.type] || 1));
  $('#opportunityTitle').textContent = '到访贵州但未到访本市';
  $('#opportunityScope').textContent = `${activeFilters.region} · 全市机会分析`;
  const rows = items => items.map(([name,value],index) => `<div class="gap-row"><b>${index+1}</b><span>${name}</span><i style="--w:${Math.min(100,value*3.1)}%"></i><strong>${value}%</strong></div>`).join('');
  content.innerHTML = `<div class="gap-summary"><article><span>未到访本市游客</span><strong>${count.toLocaleString('zh-CN')}<em>人</em></strong></article><article><span>占到访贵州游客</span><strong>${data.share}<em>%</em></strong></article></div><div class="gap-grid"><section class="gap-section"><h3>这些游客去了哪里</h3><p>到访其他市州，未到访${activeFilters.region}</p>${rows(data.cities)}</section><section class="gap-section"><h3>这些游客来自哪里</h3><p>到访贵州，未到访${activeFilters.region}</p>${rows(data.origins)}</section></div>`;
}

const geometryPolygons = feature => feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
const flattenCoordinates = feature => geometryPolygons(feature).flat(2);
const pathFor = (feature, project) => geometryPolygons(feature).map(polygon => polygon.map(ring => `${ring.map(([lng,lat],index) => `${index?'L':'M'}${project(lng,lat).join(' ')}`).join('')}Z`).join('')).join('');
const featureBounds = feature => { const coordinates = flattenCoordinates(feature); const lngs = coordinates.map(([lng]) => lng), lats = coordinates.map(([, lat]) => lat); return { minLng: Math.min(...lngs), maxLng: Math.max(...lngs), minLat: Math.min(...lats), maxLat: Math.max(...lats) }; };

function renderMap() {
  const geo = window.GUIZHOU_GEOJSON;
  if (!geo?.features?.length) { $('#geoRegions').innerHTML = '<text x="410" y="215" text-anchor="middle" fill="#9bc2ca">贵州省地图数据加载失败</text>'; return; }
  const cityView = mapDrill.level !== 'province';
  const countyGeo = cityView ? window.GUIZHOU_COUNTY_GEOJSON?.[cityAdcodes[mapDrill.city]] : null;
  if (cityView && !countyGeo?.features?.length) { $('#geoRegions').innerHTML = '<text x="410" y="215" text-anchor="middle" fill="#9bc2ca">区县地图数据加载失败</text>'; $('#mapLabels').innerHTML = ''; return; }
  const mapFeatures = cityView ? countyGeo.features : geo.features;
  const referenceFeatures = cityView ? window.FUNCTIONAL_BOUNDARIES?.features || [] : [];
  const coordinates = [...mapFeatures,...referenceFeatures].flatMap(flattenCoordinates);
  const lngs = coordinates.map(([lng])=>lng), lats = coordinates.map(([,lat])=>lat);
  const minLng=Math.min(...lngs),maxLng=Math.max(...lngs),minLat=Math.min(...lats),maxLat=Math.max(...lats);
  const width=820,height=430,padding=25,ratio=Math.min((width-padding*2)/(maxLng-minLng),(height-padding*2)/(maxLat-minLat));
  const offsetX=(width-(maxLng-minLng)*ratio)/2,offsetY=(height-(maxLat-minLat)*ratio)/2;
  const project=(lng,lat)=>[offsetX+(lng-minLng)*ratio,height-offsetY-(lat-minLat)*ratio];
  if (!cityView) {
    $('#geoRegions').innerHTML=geo.features.map(feature=>{const name=cityShortName(feature.properties.name);const heat=dashboard.cities.find(([city])=>city===name)?.[1]||46;return `<path class="city-region" data-city="${name}" style="--city-color:${heatColor(heat)}" d="${pathFor(feature,project)}"></path>`;}).join('');
    $('#mapLabels').innerHTML=geo.features.map(feature=>{const [lng,lat]=feature.properties.centroid||feature.properties.center;const [x,y]=project(lng,lat);return `<text class="city-label" x="${x}" y="${y+3}">${cityShortName(feature.properties.name)}</text>`;}).join('');
    $$('.city-region').forEach(path=>path.addEventListener('click',event=>{event.stopPropagation();mapDrill.level='city';mapDrill.city=path.dataset.city;mapDrill.county=null;$('#regionFilter').value=path.dataset.city;applyFilters();}));
    return;
  }
  $('#geoRegions').innerHTML=mapFeatures.map((feature,index)=>{const heat=countyValue(mapDrill.city,index);const selected=mapDrill.level==='county'&&feature.properties.name===mapDrill.county;return `<path class="county-region${selected?' is-selected':''}" data-county="${feature.properties.name}" style="--city-color:${heatColor(heat)}" d="${pathFor(feature,project)}"></path>`;}).join('');
  $('#mapLabels').innerHTML=mapFeatures.map(feature=>{const fallback=featureBounds(feature);const [lng,lat]=feature.properties.centroid||feature.properties.center||[(fallback.minLng+fallback.maxLng)/2,(fallback.minLat+fallback.maxLat)/2];const [x,y]=project(lng,lat);return `<text class="county-label" x="${x}" y="${y+3}">${feature.properties.name}</text>`;}).join('');
  $$('.county-region').forEach(path=>path.addEventListener('click',event=>{event.stopPropagation();mapDrill.level='county';mapDrill.county=path.dataset.county;renderMap();renderAll();}));
  $('#geoRegions').insertAdjacentHTML('beforeend',referenceFeatures.map(feature=>`<path class="functional-reference-region" role="button" tabindex="0" aria-label="查看${feature.properties.name}参考范围" data-reference="${feature.properties.id}" fill="${feature.properties.color}" stroke="${feature.properties.color}" d="${pathFor(feature,project)}"><title>${feature.properties.name}：${feature.properties.scope}</title></path>`).join(''));
  $('#mapLabels').insertAdjacentHTML('beforeend',referenceFeatures.map(feature=>{const [lng,lat]=feature.properties.id==='guian'?[106.472,26.459]:[106.84,26.5];const [labelX,labelY]=project(lng,lat);return `<text class="functional-reference-text" x="${labelX}" y="${labelY}" fill="${feature.properties.color}">${feature.properties.id==='guian'?'贵安新区':'双龙航空港'} · 参考</text>`;}).join(''));
  $$('[data-reference]').forEach(path=>{
    const openReference = event => {event.stopPropagation();document.querySelector(`[data-fm-open="${path.dataset.reference}"]`)?.click();};
    path.addEventListener('click',openReference);
    path.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openReference(event);}});
  });
}

function updateMap() {
  $$('.city-region').forEach(path=>{const selected=mapDrill.level!=='province'&&path.dataset.city===mapDrill.city;path.classList.toggle('is-selected',selected);path.classList.toggle('is-muted',mapDrill.level!=='province'&&!selected);});
  const city = mapDrill.city || activeFilters.region;
  const displayRegion = mapDrill.level === 'county' ? `${city} · ${mapDrill.county}` : mapDrill.level === 'city' ? city : '全省';
  $('#currentRegionLabel').textContent = displayRegion;
  $('#scopeSummary').textContent = `${displayRegion} · ${activeFilters.type} · ${activeFilters.startDate} 至 ${activeFilters.endDate}`;
  const rows = mapDrill.level === 'province' ? [...dashboard.cities].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([name,heat])=>[name,heat]) : mapDrill.level === 'city' ? countyRanking(city).slice(0,4) : [[mapDrill.county, countyValue(city, countyNames(city).indexOf(mapDrill.county))]];
  $('#mapTitle').textContent=mapDrill.level==='province'?'全省住宿热度空间分布':mapDrill.level==='city'?`${city}区县住宿热度分布`:`${mapDrill.county}住宿热度 · 区县筛选`;
  $('#mapHint').textContent=mapDrill.level==='province'?'点击市州下钻 · 点击空白返回':mapDrill.level==='city'?'点击区县筛选 · 点击空白恢复全市':'区县明细 · 返回贵阳市';
  $('#mapBack').disabled = mapDrill.level === 'city';
  $('#regionFilter').value = mapDrill.county || '贵阳市';
  $('#mapRanking').innerHTML=rows.map(([name,heat],index)=>`<span class="rank-chip"><b>${String(index+1).padStart(2,'0')}</b>${name} ${heat}</span>`).join('');
  $('#mapInsight').textContent=mapDrill.level==='province'?'黔东南、贵阳、安顺住宿热度较高':mapDrill.level==='city'?`${city}共${countyNames(city).length}个区县，可继续下钻`:`${mapDrill.county}当前客源热度 ${rows[0]?.[1]||0}`;
}

const routeFlow = ([start,end,count,note],city,mode,index) => `<article class="flow-row"><b>${String(index+1).padStart(2,'0')}</b><span class="node">${mode==='in'?start:regionToken(city)}</span><i>${mode}</i><span class="node focus">${mode==='in'?regionToken(city):end}</span><em>${Math.round(count*dateFactor()*(typeFactors[activeFilters.type]||1)).toLocaleString('zh-CN')} 人</em><small>${note}</small></article>`;
function openRouteCity(city){const {arrived,left}=cityRouteStats(city);$('#routeDialogTitle').textContent=`${city}游客住宿路径`;$('#routeDialogScope').textContent=`${activeFilters.type} · ${activeFilters.startDate} 至 ${activeFilters.endDate}`;$('#routeDialogBody').innerHTML=`<section class="route-detail-grid"><article><h3>游客到访 · 向${city}汇聚</h3>${arrived.map((route,index)=>routeFlow(route,city,'in',index)).join('')}</article><article><h3>游客离开 · 从${city}出发</h3>${left.map((route,index)=>routeFlow(route,city,'out',index)).join('')}</article></section>`;}
function openRouteOverview(){ $('#routeDialogTitle').textContent='游客住宿路径详情';$('#routeDialogScope').textContent=`${activeFilters.region} · ${activeFilters.type}`;$('#routeDialogBody').innerHTML=`<div class="route-city-list">${cityNames.map((city,index)=>{const {arrived,left}=cityRouteStats(city);const total=[...arrived,...left].reduce((sum,route)=>sum+route[2],0);return `<button data-route-city="${city}"><b>${String(index+1).padStart(2,'0')}</b><span>${city}</span><em>${Math.round(total*dateFactor()*(typeFactors[activeFilters.type]||1)).toLocaleString('zh-CN')} 人</em><small>到访 8 个市州 / 离开 8 个市州</small></button>`;}).join('')}</div>`;}

function renderAll(){renderKpis();renderSupply();drawTrend();renderOperation();renderGuest();renderRoutes();renderOpportunity();updateMap();}
function applyFilters(){
  const startDate = $('#startDate').value, endDate = $('#endDate').value;
  if(!startDate || !endDate || startDate > endDate){ $('#endDate').setCustomValidity('请选择有效日期，结束日期不能早于开始日期'); $('#endDate').reportValidity(); return; }
  $('#endDate').setCustomValidity('');
  const selectedRegion = $('#regionFilter').value;
  activeFilters = {region:'贵阳市',type:$('#typeFilter').value,startDate,endDate};
  mapDrill.city='贵阳市'; mapDrill.county=selectedRegion==='贵阳市'?null:selectedRegion; mapDrill.level=mapDrill.county?'county':'city';
  const supplyTabByType={'酒店':'hotel','民宿':'homestay','客栈及其他':'other'};
  if(supplyTabByType[activeFilters.type])activeTabs.supply=supplyTabByType[activeFilters.type];
  renderMap(); renderAll();
}
$('#endDate').addEventListener('input',()=>$('#endDate').setCustomValidity(''));
$('#startDate').addEventListener('input',()=>$('#endDate').setCustomValidity(''));
function returnToGuiyang(){ mapDrill.level='city';mapDrill.city='贵阳市';mapDrill.county=null;renderMap();renderAll(); }


$$('[data-tab-group]').forEach(group=>group.addEventListener('click',event=>{const button=event.target.closest('[data-tab]');if(!button)return;const key=group.dataset.tabGroup;activeTabs[key]=button.dataset.tab;if(key==='guestView'){if(button.dataset.tab==='source'||button.dataset.tab==='demographic'){activeTabs.guestPanel='structure';activeTabs.guestStructure=button.dataset.tab;}else{activeTabs.guestPanel='source';activeTabs.guestSource=button.dataset.tab;}}group.querySelectorAll('button').forEach(option=>option.classList.toggle('active',option===button));if(key==='period'){drawTrend();renderKpis();}if(key==='operation')renderOperation();if(key==='guestView')renderGuest();}));
$('#filterForm').addEventListener('submit',event=>{event.preventDefault();applyFilters();});
$('.map-stage').addEventListener('click',event=>{if(!event.target.closest('.county-region'))returnToGuiyang();});
$('#mapBack').addEventListener('click',returnToGuiyang);
$('#guestContent').addEventListener('click',event=>{const county=event.target.closest('[data-source-county]');if(county && districtWeights[county.dataset.sourceCounty]){mapDrill.level='county';mapDrill.county=county.dataset.sourceCounty;renderMap();renderAll();}});

$('#routeDetail').addEventListener('click',()=>{activeFilters.region==='全省'?openRouteOverview():openRouteCity(activeFilters.region);$('#routeDialog').showModal();});
$('#routeDialogBody').addEventListener('click',event=>{const city=event.target.closest('[data-route-city]');const back=event.target.closest('[data-route-back]');if(city)openRouteCity(city.dataset.routeCity);if(back)openRouteOverview();});
$('#closeRouteDialog').addEventListener('click',()=>$('#routeDialog').close());
$('#routeDialog').addEventListener('click',event=>{if(event.target===$('#routeDialog'))$('#routeDialog').close();});

const tick=()=>{const now=new Date();$('#date').textContent=now.toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',weekday:'long'});$('#time').textContent=now.toLocaleTimeString('zh-CN',{hour12:false});};
renderMap();renderAll();tick();setInterval(tick,1000);
