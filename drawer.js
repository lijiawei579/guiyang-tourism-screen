const industryDrawer = document.createElement('dialog');
for (const href of ['vendor/leaflet.css', 'boundary.css', 'map-presentation.css']) {
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
const topicNavigation = document.createElement('nav');
topicNavigation.className = 'primary-topics';
topicNavigation.setAttribute('aria-label','文化旅游专题');
topicNavigation.innerHTML = '<a href="screens.html#culture">文化</a><a href="screens.html#tourism">旅游</a>';
document.querySelector('#legacy-screen').append(topicNavigation);
const topicStyles = document.createElement('link');
topicStyles.rel = 'stylesheet';
topicStyles.href = 'topic-modules.css';
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
