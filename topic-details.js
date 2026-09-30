(() => {
  const sampleNames = {
    文化: {1:'社区文化服务中心',4:'市图书馆',5:'市少儿图书馆',6:'市群艺馆',7:'周末阅读分享',8:'流动文化进社区',10:'城市音乐演出',11:'公益阅读活动',12:'公共文化服务创新成果',13:'传统技艺保护项目',14:'传承人',15:'非遗展示中心',16:'非遗体验课堂',17:'生态文明主题文献'},
    旅游: {1:'城市山水景区',4:'景区入口闸机',5:'景区客流日报',7:'观光车线路',8:'游客服务中心停车场',9:'入园广场监控',11:'城市接待酒店',14:'城市旅行社',21:'中心商圈',22:'中心商圈',23:'中心商圈',24:'商业综合体',25:'传统工艺企业',26:'金秋文旅活动',28:'山居旅居点',29:'文旅服务提升项目',30:'游客中心公厕'}
  };
  function fieldsFor(metric) {
    return metric.fields.split(/[、；;]/).map(field => field.trim()).filter(Boolean);
  }
  function sampleValue(field, metric, sheet, index, context) {
    const name = (sampleNames[sheet][metric.id] || metric.name) + ' · 示例' + (index + 1);
    const count = (index + 1) * 128;
    const date = context.period === '昨日' ? '2026-09-29' : context.period === '本年' ? `2026-${String(index + 1).padStart(2,'0')}-15` : `2026-09-${String(5 + index * 4).padStart(2,'0')}`;
    if (/经纬|视频流|设备标识|图片|电话|地址/.test(field)) return '待接入';
    if (/名称|姓名|点位$/.test(field)) return name;
    if (sheet === '文化' && metric.id === 17 && field === '资源类型') return index % 2 ? '文献' : '图书';
    if (sheet === '文化' && metric.id === 13 && field === '类别') return ['传统技艺','民俗','传统音乐','传统舞蹈','传统美术'][index];
    if (sheet === '文化' && metric.id === 1 && field === '设施类型') return ['图书馆','文化馆','博物馆','文化站','城市书房'][index];
    if (sheet === '文化' && metric.id === 10 && field === '演出类型') return ['音乐','戏剧','舞蹈','曲艺','综合文艺'][index];
    if (/投资额/.test(field)) return (1280 + index * 800) + ' 万元';
    if (/面积/.test(field)) return (1800 + index * 360) + ' ㎡';
    if (/房价|人均花费/.test(field)) return (280 + index * 30) + ' 元';
    if (/营业额|收入|花费|销售额/.test(field)) return (count * 10) + ' 万元';
    if (/简介|消费特点/.test(field)) return '演示记录：展示文化服务、资源保护与公众参与情况，正式内容待业务填报。';
    if (/授予单位/.test(field)) return '示例评审单位（非真实授奖）';
    if (/单位/.test(field)) return '示例业务单位';
    if (/区县|地区|区域|地点|举办地点|来源行政区划/.test(field)) return context.region === '全域' ? ['南明区','云岩区','花溪区','观山湖区','贵安新区'][index] : context.region;
    if (/时间|日期|周期|运营日期|实施时间/.test(field)) return /开放时间/.test(field) ? '09:00—17:00（演示）' : date;
    if (/状态|完成情况|运营情况|处理结果/.test(field)) return ['正常','进行中','已完成','正常','进行中'][index] + '（演示）';
    if (/计划场次/.test(field)) return 10 + index * 2;
    if (/实际场次|场次/.test(field)) return 8 + index * 2;
    if (/出园人数|出馆人数/.test(field)) return count - 28;
    if (/在园人数|在馆人数/.test(field)) return 28;
    if (/入住率|办结率|使用率|进度/.test(field)) return (60 + index * 6) + '%';
    if (/同比|环比/.test(field)) return '+' + (4.2 + index).toFixed(1) + '%';
    if (/年龄/.test(field)) return ['18岁以下','18—29岁','30—44岁','45—59岁','60岁以上'][index];
    if (/性别/.test(field)) return index % 2 ? '男（汇总）' : '女（汇总）';
    if (/客源地/.test(field)) return ['贵州','四川','重庆','广东','湖南'][index];
    if (/类型|类别|业态|语种|出行方式/.test(field)) return ['文化体验','休闲游览','亲子研学','城市休闲','生态体验'][index] + '（演示）';
    if (/级别|等级|批次/.test(field)) return ['市级','省级','市级','市级','省级'][index] + '（演示）';
    if (/服务对象/.test(field)) return ['社区居民','青少年','老年群体','亲子家庭','公众'][index];
    if (/房价|人均花费/.test(field)) return 280 + index * 30;
    if (/数量|人数|人次|人口|房间|车位|承载|客流|峰值|接待|面积|营业额|收入|投资额|花费|销售额/.test(field)) return count;
    return '待填报';
  }
  window.topicDetailData = (sheet, metric, context) => {
    const official = sheet === '旅游' && [1,10,11].includes(metric.id);
    const fields = fieldsFor(metric);
    if (official) {
      const category = metric.id === 11 ? 1 : 0;
      return {fields, official: true, rows: window.officialTourismResources.filter(row => row.category === category && (context.region === '全域' || row.area === context.region)).map(row => fields.map(field => /名称/.test(field) ? row.name : /等级/.test(field) ? row.grade : /区县/.test(field) ? row.area : /地址/.test(field) ? row.address : '待接入'))};
    }
    return {fields, official: false, rows: context.demo ? Array.from({length:5}, (_, index) => fields.map(field => sampleValue(field, metric, sheet, index, context))) : []};
  };
})();
