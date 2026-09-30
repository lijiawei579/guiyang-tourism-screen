Promise.all([
  fetch('../guizhou.json').then(response => { if (!response.ok) throw new Error('省级边界加载失败'); return response.json(); }),
  fetch('../guiyang.json').then(response => { if (!response.ok) throw new Error('贵阳边界加载失败'); return response.json(); }),
  fetch('../functional-boundaries.json').then(response => { if (!response.ok) throw new Error('参考范围加载失败'); return response.json(); }).catch(() => null)
]).then(([province, county, functional]) => {
  window.GUIZHOU_GEOJSON = province;
  window.GUIZHOU_COUNTY_GEOJSON = {'520100': county};
  window.FUNCTIONAL_BOUNDARIES = functional;
  const script = document.createElement('script');
  script.src = 'app.js';
  document.body.append(script);
}).catch(error => {
  document.querySelector('#mapHint').textContent = error.message + '，请刷新重试';
});
