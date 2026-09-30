(() => {
  const base = new URL('.', document.currentScript.src);
  const maps = {
    guian: {
      name: '贵安新区',
      images: [
        {label: '贵阳境内范围 · 2025', file: 'guian-context.jpg', source: 'https://zyghj.guiyang.gov.cn/newsite/xczs/dtfw/202504/t20250430_87608373.html', note: '贵阳市标准地图（政区版一），图例中的紫色虚线为贵安新区范围线。此图展示贵阳境内部分，不代表贵安新区全部规划范围。'},
        {label: '贵安直管区主城区 · 2021版', file: 'guian-direct.jpg', source: 'https://zyghj.guiyang.gov.cn/newsite/xczs/dtfw/202210/t20221017_76753316.html', note: '贵阳市·贵安直管区主城区图，2021版，2022年发布。主城区图有图幅限制，不是完整直管区边界。'}
      ],
      scope: '贵安新区规划范围与直管区并非同一范围。2026年官方区划说明：规划面积1901平方公里，直管区491平方公里。',
      scopeUrl: 'https://www.gaxq.gov.cn/galy/xzqh/202605/t20260506_90143104.html'
    },
    shuanglong: {
      name: '双龙航空港经济区',
      images: [
        {label: '官方规划范围图 · 2015—2030', file: 'shuanglong-plan.jpg', source: 'https://www.sl.gov.cn/zwgk/zdlyxxgk/jhgh/202002/t20200218_74704126.html', note: '贵州贵阳临空经济区总体规划（2015—2030），2015年12月编制，双龙官网2020年发布。紫色为规划范围148平方公里；外围辐射范围1600平方公里不能作为经济区边界。'}
      ],
      scope: '本页保留官方原图及图例，展示历史规划口径，不能据此认定现行托管范围。'
    }
  };
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('functional-maps.css', base).href;
  document.head.append(stylesheet);
  const dialog = document.createElement('dialog');
  dialog.className = 'functional-map-dialog';
  dialog.setAttribute('aria-label', '贵安与双龙官方范围图');
  document.body.append(dialog);
  let activeKey = 'guian';
  let activeImage = 0;
  function show(key, index = 0) {
    activeKey = key;
    activeImage = index;
    const entry = maps[key];
    const source = entry.images[index];
    dialog.innerHTML = `<div class="fm-heading"><div><small>OFFICIAL MAP REFERENCE</small><h2>${entry.name} · 官方范围图</h2></div><button data-fm-close aria-label="关闭范围图">×</button></div><div class="fm-toolbar"><nav>${Object.entries(maps).map(([name, item]) => `<button data-fm-region="${name}" aria-pressed="${key === name}">${item.name}</button>`).join('')}</nav><label>缩放 <input type="range" min="100" max="400" step="25" value="100" aria-label="范围图缩放"><output>100%</output></label><button data-fm-reset>适应窗口</button></div><div class="fm-versions">${entry.images.map((item, position) => `<button data-fm-image="${position}" aria-pressed="${index === position}">${item.label}</button>`).join('')}<a href="${source.source}" target="_blank" rel="noopener noreferrer">查看官方来源 ↗</a></div><div class="fm-viewport" tabindex="0" aria-label="地图图幅，放大后可滚动查看"><img src="${new URL('functional-maps/' + source.file, base).href}" alt="${source.label}，保留官方地图图例及范围线"></div><div class="fm-notes"><p>${source.note}</p><p>${entry.scope}${entry.scopeUrl ? ` <a href="${entry.scopeUrl}" target="_blank" rel="noopener noreferrer">官方区划说明 ↗</a>` : ''}</p><small>主地图虚线范围由官方图片近似描绘；贵安仅含贵阳境内，双龙为历史规划口径，不用于面积统计。</small></div>`;
    dialog.querySelector('[data-fm-close]').onclick = () => dialog.close();
    dialog.querySelectorAll('[data-fm-region]').forEach(button => button.onclick = () => show(button.dataset.fmRegion));
    dialog.querySelectorAll('[data-fm-image]').forEach(button => button.onclick = () => show(activeKey, Number(button.dataset.fmImage)));
    const slider = dialog.querySelector('input');
    const viewport = dialog.querySelector('.fm-viewport');
    const picture = viewport.querySelector('img');
    slider.oninput = () => {
      picture.style.width = slider.value + '%';
      picture.style.height = slider.value + '%';
      picture.style.maxWidth = 'none';
      dialog.querySelector('output').value = slider.value + '%';
    };
    dialog.querySelector('[data-fm-reset]').onclick = () => show(activeKey, activeImage);
    picture.onerror = () => { viewport.textContent = '图片加载失败，请点击“查看官方来源”查看原图。'; };
    if (!dialog.open) dialog.showModal();
  }
  function attach() {
    document.querySelectorAll('.boundary-panel,.map-panel').forEach(panel => {
      if (panel.querySelector('.functional-map-links')) return;
      const dock = document.createElement('div');
      dock.className = 'functional-map-links';
      dock.innerHTML = '<span>功能区范围图</span><button data-fm-open="guian">贵安新区 ↗</button><button data-fm-open="shuanglong">双龙航空港经济区 ↗</button><small>官方图片 · 点击展开</small>';
      panel.append(dock);
      dock.querySelectorAll('button').forEach(button => button.onclick = () => show(button.dataset.fmOpen));
    });
  }
  const observer = new MutationObserver(attach);
  observer.observe(document.body, {childList: true, subtree: true});
  attach();
})();
