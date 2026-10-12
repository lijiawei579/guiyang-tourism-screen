(() => {
  const regions = ['南明区','云岩区','花溪区','乌当区','白云区','观山湖区','开阳县','息烽县','修文县','清镇市','贵安新区','双龙航空港经济区','高新区'];
  const asOf = '2026-09-30';
  const definitions = {};
  const ledgerCache = new Map();
  const entitiesCache = new Map();
  const add = (key, name, total, unit, options = {}) => { definitions[key] = {key,name,total,unit,kind:'flow',source:'业务演示底表',...options}; };
  add('visitors','游客接待',289592900,'人次',{domain:'regional',note:'旅游统计接待人次采用独立的区域汇总来源；景区、住宿、团队接待存在交叉，不相加为此指标。'});
  add('spend','旅游总花费',196878000000,'元',{domain:'regional',note:'采用旅游统计总花费演示底表；行业营业额包含居民消费，另作关联观察。'});
  add('overnight','过夜游客接待',96530960,'人次',{domain:'regional'});
  add('dayVisitors','一日游接待',0,'人次',{derived:['visitors','overnight'],operation:'subtract'});
  add('perCapita','人均旅游花费',0,'元/人次',{derived:['spend','visitors'],operation:'ratio',formula:'人均旅游花费 = 同范围旅游总花费（元）÷ 游客接待（人次）'});
  add('nightSpend','夜间旅游花费',80299000000,'元',{domain:'regional',note:'夜间为18:00至次日06:00，按开始日期归属统计日；属于旅游总花费的子集。'});
  add('nightVisitors','夜间消费游客',93941458,'人次',{domain:'regional',note:'与夜间花费对应的消费游客人次；属于独立消费调查演示口径，不以全部游客作为分母。'});
  add('nightPerCapita','夜间人均花费',0,'元/人次',{derived:['nightSpend','nightVisitors'],operation:'ratio',formula:'夜间人均花费 = 同范围夜间旅游花费 ÷ 对应夜间消费游客人次'});
  add('eatSpend','餐饮旅游消费',57542000000,'元',{domain:'regional'});
  add('staySpend','住宿旅游消费',46730000000,'元',{domain:'regional'});
  add('transportSpend','交通旅游消费',8046000000,'元',{domain:'regional'});
  add('travelSpend','游览旅游消费',38598000000,'元',{domain:'regional'});
  add('shopSpend','购物旅游消费',35969000000,'元',{domain:'regional'});
  add('entertainSpend','文娱旅游消费',9993000000,'元',{domain:'regional'});
  definitions.spend.derived = ['eatSpend','staySpend','transportSpend','travelSpend','shopSpend','entertainSpend'];
  definitions.spend.operation = 'sum';
  add('scenicIn','景区累计入园',23426580,'人次',{domain:'scenic',note:'景区闸机入园人次合计，跨景区重复入园分别计数；不等于全市独立游客人数。'});
  add('scenicOut','景区累计出园',23419780,'人次',{domain:'scenic'});
  add('scenicNow','实时在园',6800,'人',{kind:'snapshot',domain:'scenic',note:'固定采集时点2026-09-30 18:00；不能累计各小时在园人数。'});
  add('scenicCapacity','瞬时承载上限',68000,'人',{kind:'snapshot',domain:'scenic'});
  add('capacityRate','瞬时承载率',0,'%',{kind:'snapshot',derived:['scenicNow','scenicCapacity'],operation:'percent',formula:'瞬时承载率 = 同景区实时在园人数 ÷ 瞬时承载上限 × 100%；总览使用汇总分子分母。'});
  add('teams','团队接待',2842800,'人次',{domain:'agency'});
  add('hotelGuests','住宿接待',7937600,'人次',{domain:'hotel',note:'按入住办理日期记录入住人次，跨酒店入住分别计数；与区域过夜游客统计定义不同。'});
  add('soldNights','售出间夜',6820400,'间夜',{domain:'hotel'});
  add('availableNights','可售间夜',9743429,'间夜',{domain:'hotel'});
  add('roomRevenue','客房收入',2632674400,'元',{domain:'hotel'});
  add('guestNights','住客住宿夜数',13811424,'人夜',{domain:'hotel'});
  add('occupancy','客房入住率',0,'%',{derived:['soldNights','availableNights'],operation:'percent',formula:'入住率 = 售出间夜 ÷ 可售间夜 × 100%；区域、月份汇总先加分子分母，再计算。'});
  add('roomPrice','平均房价',0,'元/间夜',{derived:['roomRevenue','soldNights'],operation:'ratio',formula:'平均房价 = 客房收入（元）÷ 售出间夜；不能平均各酒店平均房价。'});
  add('stayLength','平均住宿时长',0,'晚/人次',{derived:['guestNights','hotelGuests'],operation:'ratio',formula:'平均住宿时长 = 住客住宿夜数 ÷ 同批次入住人次；演示按入住批次统计。'});
  add('libraryIn','市图书馆入馆',677320,'人次',{domain:'library'});
  add('childrenIn','市少儿图书馆入馆',479044,'人次',{domain:'children'});
  add('artsIn','市群艺馆入馆',365720,'人次',{domain:'arts'});
  add('cultureIn','三馆累计入馆',0,'人次',{derived:['libraryIn','childrenIn','artsIn'],operation:'sum',note:'只统计市图书馆、市少儿图书馆、市群艺馆接入记录；不代表全部公共文化设施客流。'});
  add('cultureActivities','文化活动场次',3510,'场',{domain:'activity',note:'以唯一场次编号计数，公益、惠民、非遗为标签，不跨标签重复相加。'});
  add('commercialShows','营业性演出场次',705,'场',{domain:'activity',baseType:'营业性演出'});
  add('publicShows','公益演出场次',2805,'场',{domain:'activity',baseType:'公益演出'});
  definitions.cultureActivities.derived = ['commercialShows','publicShows'];
  definitions.cultureActivities.operation = 'sum';
  add('participation','活动参与',1054520,'人次',{domain:'activity',note:'按实际场次累计参与人次；同一人参与不同场次计多个人次。'});
  add('benefit','惠民受益',793760,'人次',{domain:'benefit',note:'惠民项目受益人次；不等于去重服务人口，也不与文化活动参与人次相加。'});
  add('heritageEvents','非遗活动场次',295,'场',{domain:'heritageEvent',note:'非遗活动带独立场次编号；在综合文化活动中可能已被计入，禁止跨模块相加。'});
  add('heritageParticipation','非遗活动参与',103320,'人次',{domain:'heritageEvent'});
  const stock = (key,name,total,unit,domain,options={}) => add(key,name,total,unit,{kind:'snapshot',domain,...options});
  stock('facilities','公共文化设施',326,'个','facility');
  stock('buildingArea','设施建筑面积',182600,'㎡','facility');
  stock('serviceArea','设施服务面积',124800,'㎡','facility');
  stock('activityArea','设施活动面积',86200,'㎡','facility',{note:'建筑、服务、活动面积存在包含关系，分别展示，不相加。'});
  stock('heritage','非遗代表性项目',153,'项','heritage');
  stock('inheritors','代表性传承人',216,'人','inheritor');
  stock('heritageVenues','非遗展示场所',42,'个','heritageVenue');
  stock('benefitProjects','惠民项目',28,'项','benefitProject');
  stock('towns','覆盖乡镇街道',86,'个','town');
  stock('communities','覆盖村社区',418,'个','community');
  stock('honors','成果与荣誉',24,'项','honor');
  stock('books','生态文明图书',12680,'册','book');
  stock('documents','生态文明文献',426,'件','document');
  stock('collections','收藏单位',18,'家','collection');
  stock('agencies','旅行社',286,'家','agencyStock');
  stock('guides','持证导游',4620,'人','guide');
  stock('projects','产业项目',66,'项','project');
  stock('tourCars','观光车辆',126,'辆','car');
  stock('parking','停车位',12800,'个','parking');
  stock('parkingFree','剩余停车位',1860,'个','parking');
  stock('toilets','旅游厕所',286,'座','toilet');
  add('restaurantRevenue','餐饮业营业额',7093000000,'元',{domain:'business',note:'餐饮行业营业额含居民消费，不能作为餐饮旅游消费替代值。'});
  add('mallSales','重点商圈销售额',5116800000,'元',{domain:'mall',note:'重点商圈销售额可能与社零口径交叉，不相加为旅游花费。'});
  add('mallVisitors','重点商圈客流',5116800,'人次',{domain:'mall'});
  add('retail','社会消费品零售总额',17062800000,'元',{domain:'regional'});
  add('oldBrandRevenue','老字号营业额',1033200000,'元',{domain:'brand'});
  add('tourActivities','重要文旅活动场次',558,'场',{domain:'tourActivity'});
  stock('residences','旅居资源点',42,'个','residence');
  stock('hotels','住宿场所',4798,'家','hotelStock');
  stock('beds','住宿床位',128000,'张','hotelStock');
  stock('traffic','交通保障线路',126,'条','traffic');
  const split = (total, weights) => {
    const sum = weights.reduce((count,weight)=>count+weight,0);
    let previous = 0, cursor = 0;
    return weights.map(weight=>{cursor+=weight;const next=Math.round(total*cursor/sum);const value=next-previous;previous=next;return value;});
  };
  const range = (start,end) => {
    const values=[];
    for(let stamp=Date.parse(start+'T00:00:00Z');stamp<=Date.parse(end+'T00:00:00Z');stamp+=86400000) values.push(new Date(stamp).toISOString().slice(0,10));
    return values;
  };
  const dates = range('2026-01-01',asOf);
  const dayWeights = dates.map((date,index)=>Math.round(100+35*Math.sin(index/28)+index%7*4));
  const domainCatalog = {
    regional:regions.map(name=>({name:name+'统计汇总',area:name,type:'区域统计来源'})),
    library:[{name:'市图书馆',area:'观山湖区',type:'市级场馆'}],
    children:[{name:'市少儿图书馆',area:'南明区',type:'市级场馆'}],
    arts:[{name:'市群艺馆',area:'南明区',type:'市级场馆'}]
  };
  const configs = {
    facility:[326,'公共文化设施',['图书馆','文化馆','博物馆','其他阵地']],
    heritage:[153,'非遗项目',['国家级','省级','市级及其他']],
    inheritor:[216,'代表性传承人',['国家级','省级','市级']],
    project:[66,'产业项目',['储备','在建','投产']],
    hotelStock:[4798,'住宿场所',['酒店','民宿','客栈及其他']],
    agencyStock:[286,'旅行社',['国内业务','出境业务']],
    guide:[4620,'持证导游',['中文','外语']],
    activity:[32,'文化活动',['营业性演出','公益演出']],
    show:[12,'营业性演出',['音乐','戏剧','舞蹈']],
    publicShow:[20,'公益演出',['公益音乐','文化讲堂','社区演出']],
    benefit:[28,'惠民项目',['社区居民','青少年','公众']],
    benefitProject:[28,'惠民项目',['社区居民','青少年','公众']],
    heritageEvent:[12,'非遗活动',['技艺体验','非遗展演','传承课堂']],
    heritageVenue:[42,'非遗展示场所',['展示中心','体验基地']],
    town:[86,'乡镇街道',['乡镇','街道']],community:[418,'村社区',['行政村','社区']],
    honor:[24,'文化成果',['成果','荣誉']],book:[18,'图书收藏单位',['图书']],document:[18,'文献收藏单位',['文献']],collection:[18,'收藏单位',['图书馆','档案单位']],
    car:[12,'观光车运营单位',['燃油车','新能源车']],parking:[20,'停车场',['景区停车场','公共停车场']],toilet:[286,'旅游厕所',['Ⅰ类','Ⅱ类','其他']],
    business:[20,'餐饮统计单位',['限上餐饮','其他餐饮']],mall:[8,'商圈',['商业综合体','商业街']],brand:[12,'老字号企业',['餐饮','零售']],
    tourActivity:[16,'文旅活动',['文化演出','节庆活动','文旅推广']],residence:[42,'旅居资源点',['康养','避暑','乡村']],traffic:[30,'交通线路',['铁路','航空','公交地铁']]
  };
  function entities(domain) {
    if(entitiesCache.has(domain)) return entitiesCache.get(domain);
    let rows;
    if(domainCatalog[domain]) rows=domainCatalog[domain];
    else if(['scenic','hotel'].includes(domain)) {
      rows=(globalThis.officialTourismResources||[]).filter(row=>row.category===(domain==='scenic'?0:1)).map(row=>({name:row.name,area:row.area,type:domain==='hotel'?'酒店':row.grade,resourceId:row.id}));
      if(domain==='hotel')rows.push(...Array.from({length:20},(_,index)=>({name:(index<12?'民宿':'其他住宿')+' · 示例'+(index+1),area:regions[index%regions.length],type:index<12?'民宿':'客栈及其他'})));
    }
    else {
      const [count,label,types]=configs[domain] || [10,'业务单位',['综合']];
      rows=Array.from({length:count},(_,index)=>({name:`${label} · 示例${index+1}`,area:regions[index%regions.length],type:types[index%types.length]}));
      if(domain==='facility') rows.forEach((row,index)=>row.type=index<28?'图书馆':index<44?'文化馆':index<76?'博物馆':'其他阵地');
      if(domain==='heritage') rows.forEach((row,index)=>row.type=index<18?'国家级':index<81?'省级':'市级及其他');
      if(domain==='project') rows.forEach((row,index)=>row.type=index<36?'储备':index<54?'在建':'投产');
      if(domain==='activity') rows.forEach((row,index)=>row.type=index<12?'营业性演出':'公益演出');
      if(domain==='hotelStock') rows.forEach((row,index)=>row.type=index<2927?'酒店':index<4366?'民宿':'客栈及其他');
    }
    rows=rows.map((row,index)=>({...row,id:`${domain}-${index+1}`,weight:10+(index*7)%13}));
    entitiesCache.set(domain,rows);
    return rows;
  }
  function ledger(key) {
    if(ledgerCache.has(key)) return ledgerCache.get(key);
    const metric=definitions[key];
    const objects=entities(metric.domain).filter(row=>!metric.baseType||row.type===metric.baseType);
    const weights=objects.map(row=>['facilities','heritage','inheritors','heritageVenues','benefitProjects','towns','communities','honors','collections','agencies','guides','projects','toilets','residences','hotels'].includes(key)?1:row.weight);
    const annual=split(metric.total,weights);
    const rows=objects.map((object,index)=>({...object,values:metric.kind==='snapshot'?[annual[index]]:split(annual[index],dayWeights)}));
    ledgerCache.set(key,rows);
    return rows;
  }
  function periodRange(period='本年') {
    return period==='昨日'?{start:'2026-09-29',end:'2026-09-29'}:period==='本月'?{start:'2026-09-01',end:asOf}:{start:'2026-01-01',end:asOf};
  }
  const hourWeights=[2,1,1,1,2,3,8,14,22,35,45,50,48,44,48,54,60,65,70,58,42,25,12,5];
  function defaultGroup(key,context={}) {
    if(definitions[key].kind==='snapshot')return 'type';
    const bounds={...periodRange(context.period),...context};
    if(bounds.hour!==undefined&&bounds.hour!==null)return 'entity';
    if(bounds.start===bounds.end)return 'hour';
    return bounds.start.slice(0,7)===bounds.end.slice(0,7)?'day':'month';
  }
  function query(key, context={}) {
    const metric=definitions[key];
    if(!metric) return [];
    const bounds={...periodRange(context.period),...context};
    if(metric.derived) {
      const children=metric.derived.map(child=>query(child,context));
      const combined=new Map();
      children.forEach((rows,childIndex)=>rows.forEach(row=>{
        const groupKey=[row.bucket,row.area,row.type,row.entityId].join('|');
        if(!combined.has(groupKey)) combined.set(groupKey,{...row,parts:Array(children.length).fill(0)});
        combined.get(groupKey).parts[childIndex]+=row.value;
      }));
      return [...combined.values()].map(row=>({...row,value:metric.operation==='sum'?row.parts.reduce((sum,value)=>sum+value,0):metric.operation==='subtract'?row.parts[0]-row.parts[1]:row.parts[1]?row.parts[0]/row.parts[1]*(metric.operation==='percent'?100:1):null}));
    }
    const group=bounds.group || 'total';
    const indices=dates.map((date,index)=>({date,index})).filter(({date})=>date>=bounds.start&&date<=bounds.end);
    const grouped=new Map();
    ledger(key).filter(row=>(!bounds.area||['全域','贵阳市','贵阳贵安'].includes(bounds.area)||row.area===bounds.area)&&(!bounds.type||row.type===bounds.type)&&(!bounds.entityId||row.id===bounds.entityId)).forEach(row=>{
      const samples=metric.kind==='snapshot'?[{date:asOf,index:0}]:indices;
      samples.forEach(({date,index})=>{
        const facets={source:[['贵州','四川','重庆','广东','湖南','其他'],[62,12,9,7,6,4]],age:[['18岁以下','18—29岁','30—44岁','45—59岁','60岁以上','未知'],[5,27,38,20,8,2]],gender:[['女','男','未知'],[51,47,2]]};
        const facet=facets[bounds.facet||group];
        const hourly=metric.kind!=='snapshot'&&(group==='hour'||bounds.hour!==undefined&&bounds.hour!==null||facet);
        const hours=hourly?split(row.values[index],hourWeights).map((count,hour)=>({count,hour})):[{count:row.values[index],hour:null}];
        hours.forEach(sample=>{
          if(bounds.hour!==undefined&&bounds.hour!==null&&sample.hour!==Number(bounds.hour))return;
          const counts=facet?split(sample.count,facet[1]):[sample.count];
          counts.forEach((count,facetIndex)=>{
            if(bounds.facetValue&&facet[0][facetIndex]!==bounds.facetValue)return;
            const hourLabel=String(sample.hour).padStart(2,'0')+':00';
            const bucket=facets[group]?facet[0][facetIndex]:group==='hour'?(indices.length===1?'':date+' ')+hourLabel:group==='month'?date.slice(0,7):group==='day'?date:group==='area'?row.area:group==='type'?row.type:group==='entity'?row.name:'合计';
            if(!grouped.has(bucket)) grouped.set(bucket,{bucket,value:0,area:group==='entity'?row.area:'',type:group==='entity'?row.type:'',entityId:group==='entity'?row.id:'',resourceId:row.resourceId||'',start:group==='month'?date.slice(0,7)+'-01':date,end:date,hour:group==='hour'?sample.hour:bounds.hour??null});
            const item=grouped.get(bucket);item.value+=count;item.end=date;
          });
        });
      });
    });
    return [...grouped.values()];
  }
  const total = (key,context={}) => {
    const metric=definitions[key];
    if(!metric) return null;
    if(metric.derived){const parts=metric.derived.map(child=>total(child,context)||0);return metric.operation==='sum'?parts.reduce((sum,value)=>sum+value,0):metric.operation==='subtract'?parts[0]-parts[1]:parts[1]?parts[0]/parts[1]*(metric.operation==='percent'?100:1):null;}
    return query(key,{...context,group:'total'}).reduce((sum,row)=>sum+row.value,0);
  };
  function summary(key, context={}, targetUnit) {
    const raw=total(key,context);const unit=targetUnit||definitions[key].unit;
    const factor={'万人次':10000,'亿元':100000000,'万元':10000}[unit]||1;
    return raw===null?'—':(raw/factor).toLocaleString('zh-CN',{maximumFractionDigits:factor>1||definitions[key].derived&&definitions[key].operation!=='sum'?2:0});
  }
  function parts(key,context={}) {return (definitions[key].derived||[]).map(child=>({key:child,name:definitions[child].name,value:total(child,context),unit:definitions[child].unit}));}
  const topicMap = {文化:{1:'facilities',2:'facilities',3:'buildingArea',4:'libraryIn',5:'childrenIn',6:'artsIn',7:'cultureActivities',8:'benefit',9:'communities',10:'commercialShows',11:'publicShows',12:'honors',13:'heritage',14:'inheritors',15:'heritageVenues',16:'heritageEvents',17:'books'},旅游:{2:'capacityRate',4:'scenicIn',5:'scenicIn',6:'scenicIn',7:'tourCars',8:'parkingFree',12:'hotelGuests',13:'occupancy',14:'teams',15:'guides',16:'traffic',17:'visitors',18:'spend',19:'restaurantRevenue',20:'retail',21:'mallVisitors',22:'mallSales',23:'mallSales',24:'mallSales',25:'oldBrandRevenue',26:'tourActivities',28:'residences',29:'projects',30:'toilets'}};
  globalThis.IndicatorData={definitions,regions,asOf,dates,split,range,entities,query,total,summary,parts,periodRange,defaultGroup,topicMap};
})();
