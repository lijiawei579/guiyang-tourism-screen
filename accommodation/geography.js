Promise.all([
  fetch('../guizhou.json').then(response => { if (!response.ok) throw new Error('省级边界加载失败'); return response.json(); }),
  fetch('../guiyang.json').then(response => { if (!response.ok) throw new Error('贵阳边界加载失败'); return response.json(); })
]).then(([province, county]) => {
  window.GUIZHOU_GEOJSON = province;
  window.GUIZHOU_COUNTY_GEOJSON = {'520100': county};
  const script = document.createElement('script');
  script.src = 'app.js';
  document.body.append(script);
}).catch(error => {
  document.querySelector('#mapHint').textContent = error.message + '，请刷新重试';
});
