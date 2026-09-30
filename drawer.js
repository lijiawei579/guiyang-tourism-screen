const industryDrawer = document.createElement('dialog');
for (const href of ['vendor/leaflet.css', 'boundary.css']) {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = href;
  document.head.append(stylesheet);
}
const leafletScript = document.createElement('script');
leafletScript.src = 'vendor/leaflet.js';
leafletScript.onload = () => {
  const mapsScript = document.createElement('script');
  mapsScript.src = 'maps.js';
  document.body.append(mapsScript);
};
document.body.append(leafletScript);
industryDrawer.id = 'industry-drawer';
industryDrawer.setAttribute('aria-label', '六业专题');
industryDrawer.innerHTML = '<div class="drawer-head"><div><small>TOURISM ECOSYSTEM</small><h2>六业专题</h2></div><button aria-label="关闭专题抽屉">×</button></div><p>探索文旅全链条，切换专题数据视图</p>';
document.body.append(industryDrawer);
industryDrawer.append(document.querySelector('#industries'));
const cultureTourismEntries = document.createElement('nav');
cultureTourismEntries.className = 'drawer-cultural-topics';
cultureTourismEntries.setAttribute('aria-label', '文化旅游大屏');
cultureTourismEntries.innerHTML = '<a href="screens.html#culture"><b>文</b><span>文化大屏<small>公共文化 · 文化资源 · 服务效能</small></span><i>↗</i></a><a href="screens.html#tourism"><b>旅</b><span>旅游大屏<small>旅游资源 · 市场运行 · 区域分析</small></span><i>↗</i></a>';
industryDrawer.append(cultureTourismEntries);
const topicStyles = document.createElement('style');
topicStyles.textContent = '.drawer-cultural-topics{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px;padding-top:18px;border-top:1px solid #285878}.drawer-cultural-topics a{display:flex;align-items:center;gap:12px;padding:18px 14px;background:linear-gradient(120deg,#123d56,#0b233b);border:1px solid #317287;color:#c9f5ff;text-decoration:none;border-radius:8px}.drawer-cultural-topics a:hover,.drawer-cultural-topics a:focus-visible{border-color:#5fe2dc;background:#16495b}.drawer-cultural-topics b{font-size:24px;color:#66ded2}.drawer-cultural-topics span{font-size:18px}.drawer-cultural-topics small{display:block;font-size:11px;color:#8baebe;margin-top:6px}.drawer-cultural-topics i{margin-left:auto}';
document.head.append(topicStyles);
function openAccommodationTopic(){if(location.hash === '#stay') location.replace('accommodation/index.html');}
document.querySelector('#industries').addEventListener('click',event=>{if(event.target.closest('[data-page="stay"]')){event.preventDefault();event.stopImmediatePropagation();location.href='accommodation/index.html';}},true);
addEventListener('hashchange',openAccommodationTopic);
openAccommodationTopic();
const drawerToggle = document.createElement('button');
drawerToggle.id = 'drawer-toggle';
drawerToggle.setAttribute('aria-haspopup', 'dialog');
drawerToggle.innerHTML = '<b>▦</b><span>六业专题<small>吃 · 住 · 行 · 游 · 购 · 娱</small></span><span>↗</span>';
document.body.append(drawerToggle);
drawerToggle.onclick = () => industryDrawer.showModal();
industryDrawer.querySelector('button').onclick = () => industryDrawer.close();
industryDrawer.addEventListener('click', event => {
  if (event.target !== industryDrawer) return;
  const bounds = industryDrawer.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) industryDrawer.close();
});
document.querySelector('#industries').addEventListener('click', event => {
  if (event.target.closest('[data-page]')) industryDrawer.close();
});
