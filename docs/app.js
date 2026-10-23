let lang=localStorage.getItem('growth-language')||'zh',rows=[],filtered=[],selectedId=null;
const $=id=>document.getElementById(id),t=(zh,en)=>lang==='zh'?zh:en;
const names={loyal:['稳定复购','Repeat shoppers'],exploring:['数字探索','Digital explorers'],dormant:['待唤回','Reactivation'],email:['邮件','Email'],sms:['短信','SMS'],app:['App 推送','App push'],north:['北区','North'],central:['中区','Central'],south:['南区','South']};
const name=k=>names[k][lang==='zh'?0:1],pct=(a,b)=>b?(100*a/b).toFixed(1)+'%':'—';
function translate(){document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.querySelectorAll('[data-zh]').forEach(e=>e.textContent=e.dataset[lang]);$('language').textContent=lang==='zh'?'English':'中文';render();}
function render(){
  filtered=Growth.select(rows,{segment:$('segment').value,region:$('region').value,channel:$('channel').value,min:$('minimum').value}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  $('minval').textContent=$('minimum').value;
  const eligible=filtered.filter(r=>r.consent),high=filtered.filter(r=>r.score>=70);
  $('export').textContent=t(`导出可触达客户 (${eligible.length}) ↓`,`Export eligible (${eligible.length}) ↓`);
  $('status').textContent=t(`当前筛选 ${filtered.length.toLocaleString()} / ${rows.length.toLocaleString()} 位模拟客户`,`Showing ${filtered.length.toLocaleString()} of ${rows.length.toLocaleString()} synthetic customers`);
  $('metrics').innerHTML=[[t('筛选客户','Filtered customers'),filtered.length.toLocaleString()],[t('优先级 ≥ 70','Priority ≥ 70'),pct(high.length,filtered.length)],[t('高优先级人数','High-priority customers'),high.length.toLocaleString()],[t('可触达客户','Eligible contacts'),eligible.length.toLocaleString()]].map(([a,b])=>`<div class="metric"><small>${a}</small><strong>${b}</strong></div>`).join('');
  if(!filtered.some(r=>r.id===selectedId))selectedId=filtered[0]?.id;
  $('customers').innerHTML=filtered.slice(0,12).map(r=>`<tr class="${r.id===selectedId?'selected':''} ${r.consent?'':'no-consent'}"><td><button class="rowbutton" data-id="${r.id}" aria-pressed="${r.id===selectedId}">${r.id}</button></td><td>${r.score}<span class="score"><i style="width:${r.score}%"></i></span></td><td>${name(r.channel)}</td><td>${r.consent?t('已授权','Yes'):t('不可触达','No consent')}</td></tr>`).join('')||`<tr><td colspan="4">${t('没有匹配客户，请调整筛选。','No matching customers. Adjust the filters.')}</td></tr>`;
  $('customers').querySelectorAll('button').forEach(b=>b.onclick=()=>{selectedId=b.dataset.id;render();});
  const r=filtered.find(r=>r.id===selectedId);
  $('detail').innerHTML=r?`<b>${r.id} · ${name(r.segment)}</b><p>${t(`距最近购买 ${r.recency} 天 · 购买频次 ${r.visits} · 数字准备度 ${r.readiness}/100`,`Recency ${r.recency} days · Frequency ${r.visits} · Digital readiness ${r.readiness}/100`)}</p><p>${t('评分贡献（总分四舍五入）：近期活跃','Score components (total rounded): recency')} ${(0.4*Math.max(0,100-r.recency/1.8)).toFixed(1)} + ${t('频次','frequency')} ${(0.3*Math.min(100,r.visits*5)).toFixed(1)} + ${t('数字准备度','readiness')} ${(0.3*r.readiness).toFixed(1)}</p><p>${t('内容测试方向：','Content hypothesis: ')}${r.segment==='loyal'?t('常购商品的线上补货便利。','Convenient online reordering.'):r.segment==='exploring'?t('首次线上下单引导。','A first online order walkthrough.'):t('重新了解需求，测试回访邀请。','A check-in invitation to understand current needs.')}</p>`:t('暂无客户详情。','No customer details.');
  const groups=['email','sms','app'].map(k=>({k,total:filtered.filter(r=>r.channel===k).length,yes:eligible.filter(r=>r.channel===k).length}));
  const max=Math.max(1,...groups.map(g=>g.total));
  $('channels').innerHTML=groups.map(g=>`<div class="bar-row"><div class="bar-label"><span>${name(g.k)}</span><span>${g.yes} / ${g.total} ${t('人','customers')}</span></div><div class="track"><div class="bar-total" style="width:${100*g.total/max}%"><div class="bar-consent" style="width:${g.total?100*g.yes/g.total:0}%"></div></div></div></div>`).join('');
  const counts=Array.from({length:4},()=>Array(7).fill(0));filtered.forEach(r=>counts[r.period][r.weekday]++);const peak=Math.max(1,...counts.flat());
  const days=lang==='zh'?['一','二','三','四','五','六','日']:['Mo','Tu','We','Th','Fr','Sa','Su'];
  $('heatmap').innerHTML='<div class="heat"><span></span>'+days.map(d=>`<span>${d}</span>`).join('')+counts.map((row,p)=>`<span>${['08–12','12–16','16–20','20–24'][p]}</span>`+row.map((n,d)=>`<span class="cell" title="${days[d]} ${['08–12','12–16','16–20','20–24'][p]}: ${n}" style="background:rgba(36,87,166,${.06+.86*n/peak});color:${n/peak>.55?'white':'#334155'}">${n}</span>`).join('')).join('')+'</div>';
  const steps=[['WHO',t('客户优先级','Audience priority'),t('将近期活跃、频次和数字准备度转换为可解释的排序；先检查触达许可。','Translate recency, frequency and digital readiness into an explainable ranking; check consent first.')],['WHEN',t('触达时机','Contact timing'),t('按星期与时段聚合行为，缩小需要测试的发送窗口。','Aggregate activity by weekday and period to select candidate test windows.')],['WHAT',t('内容假设','Content hypotheses'),t('围绕复购、首次尝试或唤回需求，制定不同消息测试方向。','Define different messaging hypotheses for reorders, first digital orders and reactivation.')],['WHERE',t('渠道选择','Channel choice'),t('结合可达性与偏好选择渠道，保持客户粒度避免重复触达。','Use consent and preferences to choose channels, keeping one row per customer to avoid duplicate contacts.')],['HOW',t('试点与复盘','Pilot and evaluation'),t('约束预算和容量，先规划名单，再用随机对照评估真实增量。','Constrain budget and capacity, plan an audience, then use a randomized holdout to measure incremental impact.')]];
  $('steps').innerHTML=steps.map(([a,b,c])=>`<div class="step"><b>${a}</b><div><strong>${b}</strong><p>${c}</p></div></div>`).join('');
  renderPlan();
}
function renderPlan(){
  const budget=+$('budget').value,capacity=+$('capacity').value;const p=Growth.plan(filtered,budget,capacity);
  const eligible=filtered.filter(r=>r.consent);
  const limit=p.selected.length===eligible.length?t('已覆盖全部可触达客户','All eligible contacts covered'):p.selected.length>=capacity?t('人数上限','Contact capacity'):t('预算上限','Budget cap');
  $('budgetval').textContent=budget;$('capacityval').textContent=capacity;
  const low=+$('low').value,high=+$('high').value,valid=$('low').value!==''&&$('high').value!==''&&low>=0&&high<=100&&low<=high;
  $('plan').innerHTML=`<div class="big">${p.selected.length}</div><div>${t('位客户可纳入触达名单','customers in the contact plan')}</div><div class="planrow"><span>${t('预计触达支出','Planned contact spend')}</span><b>${p.spent.toFixed(2)} / ${budget}</b></div><div class="planrow"><span>${t('预算余额','Unused budget')}</span><b>${(budget-p.spent).toFixed(2)}</b></div><div class="planrow"><span>${t('假设响应人数','Assumed responses')}</span><b>${valid?`${(p.selected.length*low/100).toFixed(1)} – ${(p.selected.length*high/100).toFixed(1)}`:t('请输入 0–100 且下限≤上限','Use 0–100; lower ≤ upper')}</b></div><div class="planrow"><span>${t('当前限制','Binding constraint')}</span><b>${limit}</b></div><p>${['email','sms','app'].map(k=>name(k)+' '+p.selected.filter(r=>r.channel===k).length).join(' / ')}</p><p class="caption">${t('按分数优先纳入可负担的客户；余额不足会跳过较贵渠道。本名单尚未划分对照组。','Highest-scoring affordable contacts are selected; unaffordable contacts may be skipped. No holdout allocation has been made.')}</p><p class="caption">${t('区间端点 = 名单人数 × 设定响应率；不是置信区间。','Range endpoints = contacts × assumed response rate; not a confidence interval.')}</p>`;
}
$('language').onclick=()=>{lang=lang==='zh'?'en':'zh';localStorage.setItem('growth-language',lang);translate();};
['segment','region','channel','minimum'].forEach(id=>$(id).addEventListener('input',render));
['budget','capacity','low','high'].forEach(id=>$(id).addEventListener('input',renderPlan));
$('reset').onclick=()=>{['segment','region','channel'].forEach(id=>$(id).value='');$('minimum').value=0;render();};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.view').forEach(s=>s.hidden=s.id!==b.dataset.view);document.querySelectorAll('[data-view]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-current',x===b?'page':'false');});});
function exportRows(list,filename){const keys=['id','segment','region','channel','score','consent','unit_cost'];const csv=keys.join(',')+'\n'+list.map(r=>keys.map(k=>k==='unit_cost'?Growth.costs[r.channel]:r[k]).join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').onclick=()=>exportRows(filtered.filter(r=>r.consent),'synthetic-consented-audience.csv');
$('export-pilot').onclick=()=>exportRows(Growth.plan(filtered,+$('budget').value,+$('capacity').value).selected,'synthetic-pilot-plan.csv');

translate();fetch('data.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(d=>{if(d.kind!=='synthetic')throw Error('Expected synthetic data');rows=d.customers;render();}).catch(()=>{$('status').textContent=t('数据加载失败，请刷新重试。','Data failed to load. Please refresh.');});
