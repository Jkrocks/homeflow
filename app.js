'use strict';
/* Refuse to run inside someone else's frame (clickjacking). */
if(window.top!==window.self){try{window.top.location.replace(window.location.href)}catch(e){document.documentElement.innerHTML='';throw new Error('framed')}}
/* ---------- constants ---------- */
const CATS=[
 {k:'home',l:'Home',i:'🏠',subs:['Rent','Maintenance','Repairs','Household items','Domestic help']},
 {k:'food',l:'Food',i:'🍎',subs:['Groceries','Vegetables','Milk','Eating out','Delivery']},
 {k:'bills',l:'Bills',i:'💡',subs:['Electricity','Water','Gas','Internet','Phone','Subscriptions']},
 {k:'family',l:'Family',i:'👨‍👩‍👧',subs:['School','Children','Clothes','Activities']},
 {k:'transport',l:'Transport',i:'🚗',subs:['Fuel','Cab','Bus','Metro','Car maintenance']},
 {k:'health',l:'Health',i:'💊',subs:['Medicine','Doctor','Hospital','Insurance']},
 {k:'shopping',l:'Shopping',i:'🛍️',subs:['Clothes','Electronics','Personal care']},
 {k:'fun',l:'Fun',i:'🎉',subs:['Entertainment','Travel','Gifts','Dining']},
 {k:'other',l:'Other',i:'📦',subs:['Miscellaneous']},
];
const KEYWORDS=[
 ['school fee','family','School'],['school fees','family','School'],['eating out','food','Eating out'],['domestic help','home','Domestic help'],
 ['electricity','bills','Electricity'],['electric','bills','Electricity'],['bescom','bills','Electricity'],['power bill','bills','Electricity'],
 ['water','bills','Water'],['cylinder','bills','Gas'],['lpg','bills','Gas'],['gas','bills','Gas'],
 ['internet','bills','Internet'],['wifi','bills','Internet'],['broadband','bills','Internet'],['recharge','bills','Phone'],['phone bill','bills','Phone'],['mobile bill','bills','Phone'],
 ['netflix','bills','Subscriptions'],['hotstar','bills','Subscriptions'],['prime','bills','Subscriptions'],['spotify','bills','Subscriptions'],['subscription','bills','Subscriptions'],
 ['rent','home','Rent'],['maintenance','home','Maintenance'],['plumber','home','Repairs'],['electrician','home','Repairs'],['carpenter','home','Repairs'],['repair','home','Repairs'],
 ['maid','home','Domestic help'],['cook','home','Domestic help'],['detergent','home','Household items'],['cleaning','home','Household items'],
 ['groceries','food','Groceries'],['grocery','food','Groceries'],['kirana','food','Groceries'],['dmart','food','Groceries'],['bigbasket','food','Groceries'],['blinkit','food','Groceries'],['zepto','food','Groceries'],['rice','food','Groceries'],['atta','food','Groceries'],['dal','food','Groceries'],['oil','food','Groceries'],
 ['vegetables','food','Vegetables'],['vegetable','food','Vegetables'],['veggies','food','Vegetables'],['sabzi','food','Vegetables'],['fruits','food','Vegetables'],['fruit','food','Vegetables'],
 ['milk','food','Milk'],['curd','food','Milk'],['paneer','food','Milk'],
 ['swiggy','food','Delivery'],['zomato','food','Delivery'],['delivery','food','Delivery'],['pizza','food','Delivery'],['restaurant','food','Eating out'],['dinner','food','Eating out'],['lunch','food','Eating out'],
 ['school','family','School'],['tuition','family','School'],['books','family','School'],['uniform','family','Clothes'],['toys','family','Children'],['kids','family','Children'],['classes','family','Activities'],
 ['petrol','transport','Fuel'],['diesel','transport','Fuel'],['fuel','transport','Fuel'],['uber','transport','Cab'],['ola','transport','Cab'],['rapido','transport','Cab'],['auto','transport','Cab'],['cab','transport','Cab'],['bus','transport','Bus'],['metro','transport','Metro'],['car service','transport','Car maintenance'],
 ['medicine','health','Medicine'],['medicines','health','Medicine'],['pharmacy','health','Medicine'],['doctor','health','Doctor'],['clinic','health','Doctor'],['hospital','health','Hospital'],['insurance','health','Insurance'],
 ['clothes','shopping','Clothes'],['shirt','shopping','Clothes'],['saree','shopping','Clothes'],['shoes','shopping','Clothes'],['dress','shopping','Clothes'],['charger','shopping','Electronics'],['headphones','shopping','Electronics'],['electronics','shopping','Electronics'],['shampoo','shopping','Personal care'],['soap','shopping','Personal care'],['haircut','shopping','Personal care'],['salon','shopping','Personal care'],
 ['movie','fun','Entertainment'],['cinema','fun','Entertainment'],['trip','fun','Travel'],['hotel','fun','Travel'],['flight','fun','Travel'],['train','fun','Travel'],['gift','fun','Gifts'],['birthday','fun','Gifts'],
];
const COLS=['expenses','bills','tasks','shop','goals','members','cats'];
const GOAL_ICONS=['🎓','🏖️','🚗','🏠','💍','🩺','📱','🎁','🪔','💰'];
const MEMBER_ICONS=['👩','👨','👧','👦','👵','👴','🧑'];
const FREQ={1:'Every month',3:'Every 3 months',6:'Every 6 months',12:'Every year'};

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Math.round(Math.abs(n)).toLocaleString('en-IN');
const inrS=n=>(n<0?'−':'')+inr(n);
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const ymOf=s=>s.slice(0,7);
const parseD=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const now=()=>new Date();
const TODAY=()=>ymd(now());
const CUR=()=>TODAY().slice(0,7);
const addMonths=(ym,n)=>{const[y,m]=ym.split('-').map(Number);const d=new Date(y,m-1+n,1);return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const monthDiff=(a,b)=>{const[y1,m1]=a.split('-').map(Number),[y2,m2]=b.split('-').map(Number);return (y2-y1)*12+(m2-m1)};
const dim=ym=>{const[y,m]=ym.split('-').map(Number);return new Date(y,m,0).getDate()};
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthName=ym=>MONTHS[+ym.slice(5)-1]+' '+ym.slice(0,4);
const shortMonth=ym=>MONTHS[+ym.slice(5)-1].slice(0,3);
const fmtDay=s=>{const d=parseD(s);return d.getDate()+' '+MONTHS[d.getMonth()].slice(0,3)};
const dayLabel=s=>{const t=TODAY();if(s===t)return'Today';const y=ymd(new Date(now().getFullYear(),now().getMonth(),now().getDate()-1));if(s===y)return'Yesterday';const d=parseD(s);return d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'})};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const allCats=()=>[...CATS.slice(0,-1),...(S.cats||[]).map(c=>({k:c.id,l:c.label,i:esc(String(c.icon||'🏷️').slice(0,4)),subs:[],custom:true})),CATS[CATS.length-1]];
const catOf=k=>allCats().find(c=>c.k===k)||CATS[CATS.length-1];
const cc=k=>CATS.some(c=>c.k===k)?`var(--c-${k})`:'var(--c-other)';
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- data hygiene ----------
   Rows come from the shared database, so anything another household member
   (or a tampered client) wrote is treated as untrusted: ids must be plain
   tokens, numbers must be numbers, dates must be real dates. Text is always
   escaped at render time with esc(). */
const ID_RE=/^[A-Za-z0-9_-]{1,120}$/, DATE_RE=/^\d{4}-\d{2}-\d{2}$/, YM_RE=/^\d{4}-\d{2}$/;
const n0=v=>{v=+v;return Number.isFinite(v)?Math.max(0,Math.min(v,1e12)):0};
const str=(v,max=200)=>typeof v==='string'?v.slice(0,max):'';
const catKey=v=>typeof v==='string'&&ID_RE.test(v)?v:'other';
function clean(col,id,d){
  if(!ID_RE.test(String(id))||!d||typeof d!=='object'||d._deleted)return null;
  const o={id:String(id)};
  if(col==='expenses'){if(!DATE_RE.test(d.date))return null;Object.assign(o,{amount:n0(d.amount),cat:catKey(d.cat),sub:str(d.sub,60),note:str(d.note,160),date:d.date,by:ID_RE.test(d.by||'')?d.by:'',created:n0(d.created)});
    if(d.recurring){o.recurring=true;o.rootId=ID_RE.test(d.rootId||'')?d.rootId:o.id}
    if(d.billId&&ID_RE.test(d.billId)&&YM_RE.test(d.bm||'')){o.billId=d.billId;o.bm=d.bm}}
  else if(col==='bills'){const paid={};Object.keys(d.paid||{}).forEach(k=>{if(YM_RE.test(k)&&d.paid[k])paid[k]=true});
    Object.assign(o,{name:str(d.name,60)||'Bill',amount:n0(d.amount),dueDay:Math.min(31,Math.max(1,Math.round(n0(d.dueDay))||1)),every:[1,3,6,12].includes(+d.every)?+d.every:1,start:YM_RE.test(d.start||'')?d.start:CUR(),cat:catKey(d.cat),sub:str(d.sub,60),reminder:d.reminder!==false,paid})}
  else if(col==='tasks')Object.assign(o,{text:str(d.text,160),due:DATE_RE.test(d.due||'')?d.due:'',done:!!d.done});
  else if(col==='shop')Object.assign(o,{text:str(d.text,120),price:n0(d.price),done:!!d.done});
  else if(col==='goals')Object.assign(o,{name:str(d.name,60)||'Goal',icon:str(d.icon,4)||'💰',target:n0(d.target)||1,saved:n0(d.saved)});
  else if(col==='members')Object.assign(o,{name:str(d.name,40)||'Member',icon:str(d.icon,4)||'🧑'});
  else if(col==='cats')Object.assign(o,{label:str(d.label,30)||'Category',icon:str(d.icon,4)||'🏷️'});
  else return null;
  return o;
}
function cleanSettings(d){d=d&&typeof d==='object'?d:{};const b={};Object.keys(d.budgets||{}).forEach(k=>{if(ID_RE.test(k)&&n0(d.budgets[k]))b[k]=n0(d.budgets[k])});return{income:n0(d.income),budgets:b,sample:!!d.sample}}

/* ---------- store ---------- */
const S={expenses:[],bills:[],tasks:[],shop:[],goals:[],members:[],cats:[],settings:null,ready:false,mode:'local'};
let SB=null, HH=null, HHINFO=null, readOnly=false, CHANNEL=null;
const LSKEY='homeflow_demo_v1';
function saveLocal(){if(S.mode!=='local')return;const o={settings:S.settings};COLS.forEach(c=>o[c]=S[c]);ls.set(LSKEY,JSON.stringify(o))}
async function sbWrite(col,id,data){const {error}=await SB.from('items').upsert({household_id:HH,col,id,data,updated_at:new Date().toISOString()});if(error)sbErr(error)}
async function put(col,obj){
  const {id,...body}=obj;
  const i=S[col].findIndex(x=>x.id===id);
  if(i>=0)S[col][i]={...obj};else S[col].push({...obj});
  refresh();
  if(S.mode==='sb')await sbWrite(col,id,body);else saveLocal();
}
async function del(col,id){
  S[col]=S[col].filter(x=>x.id!==id);refresh();
  if(S.mode==='sb')await sbWrite(col,id,{_deleted:true});
  else saveLocal();
}
async function setSettings(patch){
  S.settings={...(S.settings||{}),...patch};refresh();
  if(S.mode==='sb')await sbWrite('settings','main',S.settings);else saveLocal();
}
function sbErr(e){console.warn(e);toast(navigator.onLine===false?'You are offline. This change was not saved.':'Could not save. Check your connection and try again.')}

/* ---------- sample (demo mode only) ---------- */
/*SAMPLE-START*/
function makeSample(today){
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const T=new Date(today.getFullYear(),today.getMonth(),today.getDate());
  const ym=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  const f=d=>ym(d)+'-'+String(d.getDate()).padStart(2,'0');
  const cur=ym(T);
  const out={settings:{income:127000,sample:true,budgets:{food:18000,bills:9000,transport:7000,family:15000,shopping:6000,home:25000,health:5000,fun:5000,other:4000}},expenses:[],bills:[],tasks:[],shop:[],goals:[],members:[],cats:[]};
  out.members=[{id:'m-mom',name:'Mom',icon:'👩'},{id:'m-dad',name:'Dad',icon:'👨'},{id:'m-riya',name:'Riya',icon:'👧'}];
  const who=()=>rnd()<.55?'m-mom':(rnd()<.85?'m-dad':'m-riya');
  let n=0;const E=(d,amount,cat,sub,note,extra)=>out.expenses.push({id:'s'+(++n),date:f(d),amount,cat,sub,note:note||'',by:who(),...(extra||{})});
  for(let back=2;back>=0;back--){
    const first=new Date(T.getFullYear(),T.getMonth()-back,1);
    const days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
    const last=back===0?T.getDate():days;
    const D=k=>new Date(first.getFullYear(),first.getMonth(),k);
    const m=ym(first);
    E(D(1),24000,'home','Rent','Flat rent',{recurring:true,rootId:'rent'});
    if(last>=3)E(D(3),3500,'home','Domestic help','Kamala didi',{recurring:true,rootId:'help'});
    if(last>=5)E(D(5),2000+Math.round(rnd()*700),'home','Maintenance','Society maintenance');
    for(let k=1;k<=last;k++){
      if(k%3===1)E(D(k),180,'food','Milk','Nandini milk, 3 days');
      if(rnd()<.32)E(D(k),200+Math.round(rnd()*25)*10,'food','Vegetables','Vegetables from market');
      if(k%8===2)E(D(k),1400+Math.round(rnd()*120)*10,'food','Groceries','Monthly kirana top-up');
      if(rnd()<.14)E(D(k),350+Math.round(rnd()*50)*10,'food','Delivery','Swiggy dinner');
      if(k%9===4)E(D(k),1800+Math.round(rnd()*40)*10,'transport','Fuel','Petrol');
      if(rnd()<.12)E(D(k),150+Math.round(rnd()*20)*10,'transport','Cab','Auto');
      if(rnd()<.05)E(D(k),300+Math.round(rnd()*60)*10,'health','Medicine','Pharmacy');
      if(rnd()<.05)E(D(k),600+Math.round(rnd()*200)*10,'shopping','Clothes','Clothes');
      if(rnd()<.05)E(D(k),500+Math.round(rnd()*100)*10,'fun','Entertainment','Movie night');
    }
    if(last>=10)E(D(10),8000,'family','School','School fee',{billId:'b-school',bm:m});
    if(last>=14)E(D(14),1500,'family','Activities','Dance class');
    if(last>=18)E(D(18),back===1?4200:2600,'shopping','Personal care','Salon & toiletries');
    if(last>=21)E(D(21),back===2?2200:900,'other','Miscellaneous','Courier & stationery');
    if(back>0){E(D(4),2400+back*80,'bills','Electricity','BESCOM',{billId:'b-elec',bm:m});E(D(5),999,'bills','Internet','Airtel fibre',{billId:'b-net',bm:m});E(D(12),649,'bills','Subscriptions','Netflix',{billId:'b-netflix',bm:m});E(D(8),1100,'bills','Gas','Cylinder refill');if(back===2)E(D(16),3200,'health','Doctor','Paediatrician visit')}
    else{if(last>=4)E(D(4),2450,'bills','Electricity','BESCOM',{billId:'b-elec',bm:m});if(last>=5)E(D(5),999,'bills','Internet','Airtel fibre',{billId:'b-net',bm:m});if(last>=12)E(D(12),649,'bills','Subscriptions','Netflix',{billId:'b-netflix',bm:m});if(last>=20)E(D(20),6500,'fun','Gifts','Wedding gift')}
  }
  const paid={};const mark=(id)=>{paid[id]={};out.expenses.filter(e=>e.billId===id).forEach(e=>paid[id][e.bm]=true)};
  ['b-elec','b-net','b-netflix','b-school'].forEach(mark);
  const start=ym(new Date(T.getFullYear(),T.getMonth()-2,1));
  out.bills=[
    {id:'b-elec',name:'Electricity',amount:2450,dueDay:4,every:1,start,cat:'bills',sub:'Electricity',reminder:true,paid:paid['b-elec']},
    {id:'b-net',name:'Internet',amount:999,dueDay:5,every:1,start,cat:'bills',sub:'Internet',reminder:true,paid:paid['b-net']},
    {id:'b-school',name:'School Fee',amount:8000,dueDay:10,every:1,start,cat:'family',sub:'School',reminder:true,paid:paid['b-school']},
    {id:'b-netflix',name:'Netflix',amount:649,dueDay:12,every:1,start,cat:'bills',sub:'Subscriptions',reminder:false,paid:paid['b-netflix']},
    {id:'b-phone',name:'Phone recharge',amount:599,dueDay:Math.min(28,T.getDate()+1),every:1,start:cur,cat:'bills',sub:'Phone',reminder:true,paid:{}},
    {id:'b-ins',name:'Health insurance',amount:18500,dueDay:15,every:12,start:ym(new Date(T.getFullYear(),T.getMonth()+1,1)),cat:'health',sub:'Insurance',reminder:true,paid:{}},
  ];
  const dd=k=>f(new Date(T.getFullYear(),T.getMonth(),T.getDate()+k));
  out.tasks=[
    {id:'t1',text:'Call plumber about kitchen tap',due:dd(1),done:false},
    {id:'t2',text:'Buy school books for Riya',due:dd(3),done:false},
    {id:'t3',text:'Refill gas cylinder',due:dd(6),done:false},
    {id:'t4',text:'Medicine pickup for Nani',due:dd(0),done:false},
    {id:'t5',text:'Pay rent',due:dd(-2),done:true},
  ];
  out.shop=[{id:'i1',text:'Milk',price:60,done:false},{id:'i2',text:'Bread',price:45,done:false},{id:'i3',text:'Rice (5 kg)',price:850,done:false},{id:'i4',text:'Vegetables',price:500,done:false},{id:'i5',text:'Detergent',price:240,done:false},{id:'i6',text:'Shampoo',price:199,done:true}];
  out.goals=[{id:'g1',name:'School Fees',icon:'🎓',target:50000,saved:32000},{id:'g2',name:'Family Trip',icon:'🏖️',target:80000,saved:25000},{id:'g3',name:'New Car',icon:'🚗',target:500000,saved:120000}];
  return out;
}
/*SAMPLE-END*/

/* ---------- derived ---------- */
const inMonth=ym=>S.expenses.filter(e=>e.date&&ymOf(e.date)===ym);
const sum=a=>a.reduce((s,e)=>s+(+e.amount||0),0);
function byCat(list){const m={};list.forEach(e=>m[e.cat]=(m[e.cat]||0)+(+e.amount||0));return m}
function billDue(b,ym){if(!b.start||monthDiff(b.start,ym)<0||monthDiff(b.start,ym)%(b.every||1))return null;return ym+'-'+pad(Math.min(b.dueDay||1,dim(ym)))}
function billItems(fromYm,months){const out=[];for(let i=0;i<months;i++){const ym=addMonths(fromYm,i);S.bills.forEach(b=>{const d=billDue(b,ym);if(d)out.push({b,ym,date:d,paid:!!(b.paid&&b.paid[ym])})})}return out.sort((a,b)=>a.date.localeCompare(b.date))}
function daysBetween(a,b){return Math.round((parseD(b)-parseD(a))/864e5)}
function dueTag(it){
  if(it.paid)return`<span class="due paid">Paid</span>`;
  const n=daysBetween(TODAY(),it.date);
  if(n<0)return`<span class="due late">${-n===1?'1 day late':(-n)+' days late'}</span>`;
  if(n===0)return`<span class="due late">Due today</span>`;
  if(n===1)return`<span class="due soon">Tomorrow</span>`;
  if(n<=7)return`<span class="due soon">Due ${fmtDay(it.date)}</span>`;
  return`<span class="due later">Due ${fmtDay(it.date)}</span>`;
}
function upcoming(){const t=TODAY();return billItems(addMonths(CUR(),-1),3).filter(it=>!it.paid&&daysBetween(t,it.date)>=-20&&daysBetween(t,it.date)<=35)}

/* ---------- recurring expenses ---------- */
let recurringDone=false;
function runRecurring(){
  if(recurringDone||readOnly)return;recurringDone=true;
  const cur=CUR(),t=TODAY();const roots={};
  S.expenses.filter(e=>e.recurring&&e.rootId).forEach(e=>{if(!roots[e.rootId]||e.date>roots[e.rootId].date)roots[e.rootId]=e});
  Object.values(roots).forEach(e=>{
    if(ymOf(e.date)>=cur)return;
    const day=Math.min(+e.date.slice(8),dim(cur));const date=cur+'-'+pad(day);
    if(date>t)return;
    const id='r-'+e.rootId+'-'+cur;
    if(S.expenses.some(x=>x.id===id))return;
    const {id:_,...rest}=e;put('expenses',{...rest,id,date,created:Date.now()});
  });
}

/* ---------- smart capture ---------- */
function parseCapture(text){
  const raw=text.trim();if(!raw)return null;
  const low=' '+raw.toLowerCase().replace(/[,]/g,'')+' ';
  let amount=0;
  const nums=[...low.matchAll(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k|thousand)?(?![\d])(?!\s*(?:kg|g\b|gm|ltr|l\b|litre|pcs|st\b|nd\b|rd\b|th\b))/g)];
  nums.forEach(m=>{let v=parseFloat(m[1]);if(m[2])v*=1000;if(v>amount)amount=v});
  let date=TODAY();const T=now();
  if(/day before yesterday/.test(low))date=ymd(new Date(T.getFullYear(),T.getMonth(),T.getDate()-2));
  else if(/\byesterday\b/.test(low))date=ymd(new Date(T.getFullYear(),T.getMonth(),T.getDate()-1));
  else{const wd=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].findIndex(w=>low.includes(' '+w)||low.includes('last '+w));
    if(wd>=0){let back=(T.getDay()-wd+7)%7||7;date=ymd(new Date(T.getFullYear(),T.getMonth(),T.getDate()-back))}
    const on=low.match(/\bon (\d{1,2})(st|nd|rd|th)\b/);if(on){let d=new Date(T.getFullYear(),T.getMonth(),+on[1]);if(d>T)d=new Date(T.getFullYear(),T.getMonth()-1,+on[1]);date=ymd(d)}}
  let cat='other',sub='',label='';
  const bill=S.bills.find(b=>low.includes(' '+b.name.toLowerCase())||low.includes(b.name.toLowerCase()+' '));
  for(const c of (S.cats||[])){if(low.includes(' '+c.label.toLowerCase()+' ')){cat=c.id;label=c.label;break}}
  if(!label)for(const [kw,c,s] of KEYWORDS){const re=new RegExp('\\b'+kw.replace(/ /g,'\\s+')+'\\b');if(re.test(low)){cat=c;sub=s;label=kw;break}}
  if(bill&&!label){cat=bill.cat;sub=bill.sub||bill.name;label=bill.name}
  let by='';for(const m of S.members){if(new RegExp('\\b'+m.name.toLowerCase().replace(/[^a-z0-9 ]/g,'')+'\\b').test(low)){by=m.id;break}}
  const cleaned=raw.replace(/(?:₹|rs\.?|inr)?\s*\d[\d,]*(?:\.\d+)?\s*(k|thousand)?/gi,' ').replace(/\b(spent|spend|paid|pay|bought|buy|on|for|the|a|an|of|today|yesterday|day before|at|from|rupees|rs|bill|to|my|our|in)\b/gi,' ').replace(/\s+/g,' ').trim();
  let note=cleaned?cleaned.charAt(0).toUpperCase()+cleaned.slice(1):'';
  if(by){const m=S.members.find(x=>x.id===by);note=note.replace(new RegExp('\\b'+m.name+'\\b','i'),'').replace(/\s+/g,' ').trim()}
  const paysBill=bill&&(/\bpaid\b|\bpay\b|\bbill\b/.test(low))?bill:null;
  return {amount:Math.round(amount*100)/100,date,cat,sub,note:note||sub||catOf(cat).l,by,bill:paysBill};
}

/* ---------- actions ---------- */
function me(){return ls.get('hf_me')||''}
async function addExpense(e){
  if(readOnly)return toast('You can view this notebook, but not change it.');
  const obj={id:e.id||uid(),amount:+e.amount,cat:e.cat,sub:e.sub||'',note:e.note||'',date:e.date||TODAY(),by:e.by??me(),created:Date.now()};
  if(e.recurring){obj.recurring=true;obj.rootId=e.rootId||obj.id}
  if(e.billId){obj.billId=e.billId;obj.bm=e.bm}
  await put('expenses',obj);
}
async function setBillPaid(b,ym,on){
  if(readOnly)return toast('You can view this notebook, but not change it.');
  const paid={...(b.paid||{})};if(on)paid[ym]=true;else delete paid[ym];
  await put('bills',{...b,paid});
  const eid='bill-'+b.id+'-'+ym;
  const existing=S.expenses.find(e=>e.billId===b.id&&e.bm===ym);
  if(on&&!existing)await addExpense({id:eid,amount:b.amount,cat:b.cat,sub:b.sub||b.name,note:b.name+' bill',date:TODAY(),billId:b.id,bm:ym});
  if(!on&&existing)await del('expenses',existing.id);
  toast(on?`${b.name} marked paid · ${inr(b.amount)} added to expenses`:`${b.name} marked unpaid`);
}

/* ---------- icons ---------- */
const I={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
 list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
 bill:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
 month:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 12l3 3 5-6"/></svg>',
 goal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
 cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
 fam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9.5" r="2.5"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5M15 15.2c.6-.2 1.3-.3 2-.3 2.3 0 4 1.5 4.5 4.6"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
 spark:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></svg>',
 search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
 x:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 moon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>',
 sun:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
 chev:(d)=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${d==='l'?'M15 6l-6 6 6 6':'M9 6l6 6-6 6'}"/></svg>`,
 logo:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5L12 5l8 6.5V20H4z"/><path d="M8.5 15c1.2-1.6 2.3-1.6 3.5 0s2.3 1.6 3.5 0"/></svg>',
};
const VIEWS=[
 ['home','Home',I.home],['expenses','Expenses',I.list],['bills','My Bills',I.bill],['month','My Month',I.month],
 ['lists','To-do & Shopping',I.check],['goals','My Goals',I.goal],['calendar','Calendar',I.cal],['family','Our Family',I.fam],['settings','Settings',I.gear]];
const TABS=['home','expenses','bills','month'];

/* ---------- UI state ---------- */
const U={view:'home',monthYm:null,calYm:null,calDay:null,f:{q:'',cat:'',range:'month',min:'',max:''},captureText:''};

function nav(){
  const brand=`<div class="brand"><span class="mark">${I.logo}</span><span>HomeFlow</span></div>`;
  $('#side').innerHTML=brand+VIEWS.map(([k,l,ic])=>`<button class="nav" data-go="${k}" aria-label="${l}" ${U.view===k?'aria-current="page"':''}>${ic}<span class="lbl">${l}</span></button>`).join('')+`<div class="spacer"></div>`;
  const inMore=!TABS.includes(U.view);
  $('#tabbar').innerHTML=TABS.map(k=>{const v=VIEWS.find(x=>x[0]===k);return`<button class="tab" data-go="${k}" ${U.view===k?'aria-current="page"':''}>${v[2]}<span>${k==='bills'?'Bills':k==='month'?'Month':v[1]}</span></button>`}).join('')+`<button class="tab" data-act="more" ${inMore?'aria-current="page"':''}>${I.more}<span>More</span></button>`;
}
function isDark(){const t=getTheme();return t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches)}
function remindCount(){const t=TODAY();return upcoming().filter(it=>it.b.reminder!==false&&daysBetween(t,it.date)<=1).length+S.tasks.filter(x=>!x.done&&x.due&&x.due<=t).length}
function topbar(){
  const dark=isDark();const rc=remindCount();
  const titles={home:'Dashboard',expenses:'Expenses',bills:'Bills',month:'My Month',lists:'To-do & Shopping',goals:'Goals',calendar:'Calendar',family:'Family',settings:'Settings'};
  return`<div class="topbar"><div class="tl"><div class="brand"><span class="mark">${I.logo}</span>HomeFlow</div><span class="hide-sm" style="font-weight:700;align-items:center;gap:8px;color:var(--ink)"><span style="color:var(--accent);display:inline-flex;width:18px;height:18px">${(VIEWS.find(v=>v[0]===U.view)||VIEWS[0])[2]}</span>${titles[U.view]||''}</span><span class="greet hide-sm">· ${now().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</span></div>
  <div class="tr"><div class="themepill hide-sm" role="group" aria-label="Theme"><button data-theme="light" aria-pressed="${!dark}">${I.sun}Light</button><button data-theme="dark" aria-pressed="${dark}">${I.moon}Dark</button></div>
  <button class="iconbtn" data-go="calendar" aria-label="Reminders${rc?' ('+rc+')':''}" title="${rc?rc+' reminder'+(rc>1?'s':''):'No reminders'}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a2 2 0 003.4 0"/></svg>${rc?'<span class="badge"></span>':''}</button>
  <button class="iconbtn show-sm" data-act="theme" aria-label="Switch to ${dark?'light':'dark'} mode">${dark?I.sun:I.moon}</button>
  <button class="ctabtn hide-sm" data-act="add">+ Add expense</button></div></div>`;
}
/* ---------- views ---------- */
function vHome(){
  const s=S.settings||{};const cur=CUR();const list=inMonth(cur);const spent=sum(list);const income=+s.income||0;const left=income-spent;
  const t=TODAY();const daysLeft=dim(cur)-+t.slice(8)+1;const perDay=left/daysLeft;
  const pct=income?Math.min(100,spent/income*100):0;
  const todays=S.expenses.filter(e=>e.date===t).sort((a,b)=>(b.created||0)-(a.created||0));
  const bc=byCat(list);const cats=allCats().map(c=>({...c,v:bc[c.k]||0})).filter(c=>c.v>0||!c.custom).sort((a,b)=>b.v-a.v);
  const maxv=Math.max(1,...cats.map(c=>c.v));
  const up=upcoming().slice(0,4);
  let h=topbar();
  const meM=S.members.find(x=>x.id===me());const hr=now().getHours();
  const unpaidSoon=upcoming().filter(it=>daysBetween(t,it.date)<=7).length;
  h+=`<div class="hello fade"><div><h1>${hr<12?'Good morning':hr<17?'Hi':'Good evening'}${meM?', '+esc(meM.name):''}!${S.members.length?`<span class="wave" aria-hidden="true">${S.members.slice(0,3).map(m=>`<span>${esc(m.icon)}</span>`).join('')}</span>`:''}<br>How is your home doing this month?</h1>
   <p>${income?`You've used ${Math.round(pct)}% of this month's money${unpaidSoon?` and have ${unpaidSoon} bill${unpaidSoon>1?'s':''} due this week`:''}.`:'Write down what you spend, and HomeFlow shows where your money goes.'}</p></div>
   <div class="tiles"><button class="tile dashed" data-act="add" aria-label="Add expense"><span class="plus">+</span></button>
   <button class="tile" data-act="add"><span class="art" style="background:var(--accent-soft)">🧾</span><b>Add expense</b><small>Takes under 10 seconds</small></button>
   <button class="tile" data-go="bills"><span class="art" style="background:var(--gold-bg)">🗓️</span><b>Pay bills</b><small>${unpaidSoon?unpaidSoon+' due this week':'All caught up'}</small></button>
   <button class="tile" data-go="lists"><span class="art" style="background:var(--good-soft)">🛒</span><b>Shopping list</b><small>${S.shop.filter(x=>!x.done).length} items to buy</small></button></div></div>`;
  if(S.mode==='local'&&SB)h+=`<div class="sample"><span class="sp">You're trying the <b>demo household</b>. Nothing here is saved online.</span><button class="btn sm" data-act="leaveDemo">Sign in to start mine</button></div>`;
  else if(s.sample)h+=`<div class="sample"><span class="sp">This notebook is filled with an <b>example household</b> so you can see how it works.</span><button class="btn sm ghost" data-act="clearSample">Clear it and start mine</button></div>`;
  h+=reminders();
  if(!income&&!S.expenses.length){
    h+=`<div class="card fade" style="margin-bottom:16px"><div class="eyebrow">Let's begin</div><h2 style="font-size:24px;margin:6px 0 6px">How much money comes in each month?</h2><p class="muted" style="margin:0 0 14px">Your salary, business income or household allowance. You can skip this and just track spending.</p>
    <form class="addline" data-form="income"><input class="inp" id="incomeFirst" inputmode="numeric" placeholder="₹ e.g. 85,000" aria-label="Monthly income"><button class="btn">Save</button></form></div>`;
  }
  h+=`<div class="grid hero fade">
  <section class="hero-card" aria-label="Monthly money"><div class="eyebrow">${monthName(cur)} · Monthly money</div>
   <div class="big" style="margin-top:10px">${income?inr(income):'—'}</div><div class="hero-sub">${income?'Money in this month':'<button class="link" style="color:inherit;text-decoration:underline" data-go="month">Add your monthly income</button>'}</div>
   <div class="bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="Share of income spent"><i style="width:${pct}%"></i></div>
   <div class="splits"><div><b>${inr(spent)}</b><span>Money out</span></div>${income?`<div><b>${inrS(left)}</b><span>Left</span></div><div><b>${Math.round(pct)}%</b><span>Used</span></div>`:''}</div>
  </section>
  <section class="left-card ${left<0?'neg':''}" aria-label="Money left">
   <div class="top"><div><div class="eyebrow">Left for this month</div><div class="big" style="margin-top:10px">${income?inrS(left):inr(spent)}</div><div style="margin-top:4px;font-size:14px;color:var(--ink-3)">${income?(left<0?'More went out than came in this month':'Available until '+fmtDay(cur+'-'+dim(cur))):'Spent so far this month'}</div></div>
   ${income?`<div class="pring" style="--p:${Math.max(0,100-pct)};--rc:${left<0?'var(--rose)':'var(--good)'}"><span>${Math.max(0,Math.round(100-pct))}%</span></div>`:''}</div>
   ${income&&left>0?`<div class="perday"><span style="font-size:24px">☀️</span><div><b>${inr(perDay)} / day</b><span style="font-size:13px">available for the next ${daysLeft} day${daysLeft>1?'s':''}</span></div></div>`:''}
  </section></div>`;
  h+=`<section class="card fade" style="margin-top:16px" aria-label="Quick capture"><form data-form="capture"><label class="flabel" for="capture" style="display:block;margin-bottom:8px">Just type what you spent</label>
   <div class="capture"><span class="spark">${I.spark}</span><input id="capture" autocomplete="off" placeholder="Spent 450 on vegetables today" value="${esc(U.captureText)}"><button class="btn sm" id="capBtn">Add</button></div>
   <div id="capPreview">${capPreview()}</div></form></section>`;
  h+=`<div class="grid two" style="margin-top:16px">
  <section class="card notebook-card"><div class="card-h"><h2>Today</h2><span class="muted num">${inr(sum(todays))}</span></div>
   <div class="notebook">${todays.length?todays.slice(0,7).map(expRow).join(''):`<div class="empty">Nothing written down for today yet.</div>`}</div>
   ${todays.length>7?`<button class="link" data-go="expenses">See all ${todays.length}</button>`:''}
   <button class="btn ghost block" style="margin-top:12px" data-act="add">+ Add Expense</button></section>
  ${weekCard()}
  <section class="card"><div class="card-h"><h2>Bills coming up</h2><button class="link" data-go="bills">View all bills</button></div>
   ${up.length?up.map(it=>billRow(it,true)).join(''):`<div class="empty">No unpaid bills in the next few weeks.</div>`}</section>
  <section class="card"><div class="card-h"><h2>Where it went this month</h2><button class="link" data-go="month">Details</button></div>
   <div class="cats">${cats.map(c=>{const lim=+(s.budgets||{})[c.k]||0;return`<div class="cat" style="--cc:${cc(c.k)}"><span class="ic" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center;font-size:18px;background:color-mix(in srgb,${cc(c.k)} 16%,transparent)">${c.i}</span><span class="nm">${esc(c.l)}${lim?` <small>of ${inr(lim)}</small>`:''}</span><span class="v">${inr(c.v)}</span><span class="track"><i class="${lim&&c.v>lim?'over':''}" style="width:${(lim?Math.min(1,c.v/Math.max(lim,maxv)):c.v/maxv)*100}%"></i></span></div>`}).join('')}</div></section>
  <section class="card"><div class="card-h"><h2>This month, in plain words</h2></div>${insights().map(x=>`<div class="insight"><span class="dot"></span><span>${x}</span></div>`).join('')||`<div class="empty">Add a few expenses and simple observations will show up here.</div>`}</section>
  ${familyCard(list)}
  ${S.goals.length?`<section class="card"><div class="card-h"><h2>My goals</h2><button class="link" data-go="goals">All goals</button></div>${S.goals.slice(0,3).map(g=>{const p=Math.min(100,Math.round((+g.saved||0)/(+g.target||1)*100));return`<div class="row"><span class="ic" style="background:var(--surface-2)">${esc(g.icon||'💰')}</span><span class="t"><b>${esc(g.name)}</b><small>${inr(g.saved)} of ${inr(g.target)}</small><span class="cat" style="display:block"><span class="track" style="display:block;margin-top:5px;--cc:var(--accent)"><i style="width:${p}%"></i></span></span></span><span class="amt">${p}%</span></div>`}).join('')}</section>`:''}
  </div>`;
  return h;
}
function weekCard(){
  const T=now();const base=new Date(T.getFullYear(),T.getMonth(),T.getDate());const sel=U.weekDay||TODAY();
  const days=[...Array(7)].map((_,i)=>ymd(new Date(base.getFullYear(),base.getMonth(),base.getDate()+i-1)));
  const bills={};billItems(addMonths(CUR(),0),2).forEach(i=>{(bills[i.date]=bills[i.date]||[]).push(i)});
  const tasks=S.tasks.filter(x=>x.due===sel);const bs=bills[sel]||[];const ex=S.expenses.filter(e=>e.date===sel);
  return`<section class="card"><div class="card-h"><h2>${MONTHS[parseD(sel).getMonth()]} ${parseD(sel).getFullYear()}</h2><button class="link" data-go="calendar">Calendar</button></div>
  <div class="week">${days.map(d=>`<button data-wday="${d}" class="${d===sel?'on':''}" aria-pressed="${d===sel}">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][parseD(d).getDay()]}<b>${+d.slice(8)}</b>${bills[d]&&bills[d].some(i=>!i.paid)?'<i></i>':'<i style="background:transparent"></i>'}</button>`).join('')}</div>
  ${bs.length?`<div class="slot">Bills</div>`+bs.map(i=>`<div class="event"><span class="ev-i">${catOf(i.b.cat).i}</span><span class="t"><b>${esc(i.b.name)}</b><small>${inr(i.b.amount)} · ${i.paid?'Paid':'Not paid yet'}</small></span><button class="paybtn ${i.paid?'on':''}" data-pay="${i.b.id}|${i.ym}">${i.paid?'✓ Paid':'Pay'}</button></div>`).join(''):''}
  ${tasks.length?`<div class="slot">To-do</div>`+tasks.map(x=>`<div class="event"><span class="ev-i">${x.done?'✅':'📝'}</span><span class="t"><b style="${x.done?'text-decoration:line-through;color:var(--ink-3)':''}">${esc(x.text)}</b><small>${x.done?'Done':'Open'}</small></span>${x.done?'':`<button class="paybtn" data-done="${x.id}">Done</button>`}</div>`).join(''):''}
  ${ex.length?`<div class="slot">Spent ${inr(sum(ex))}</div>`:''}
  ${!bs.length&&!tasks.length&&!ex.length?`<div class="empty">Nothing planned for ${esc(dayLabel(sel))}.</div>`:''}</section>`;
}
function familyCard(list){
  if(!S.members.length)return'';
  const m={};list.forEach(e=>{const k=e.by||'';m[k]=(m[k]||0)+(+e.amount||0)});
  const rows=S.members.map(x=>({n:x.name,i:x.icon,v:m[x.id]||0}));if(m[''])rows.push({n:'Not marked',i:'📝',v:m['']});
  const max=Math.max(1,...rows.map(r=>r.v));
  return`<section class="card"><div class="card-h"><h2>Family spending</h2><button class="link" data-go="family">Our family</button></div><div class="cats">${rows.sort((a,b)=>b.v-a.v).map(r=>`<div class="cat" style="--cc:var(--c-family)"><span class="ic" style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:18px;background:var(--surface-2)">${esc(r.i||'🧑')}</span><span class="nm">${esc(r.n)} added</span><span class="v">${inr(r.v)}</span><span class="track"><i style="width:${r.v/max*100}%"></i></span></div>`).join('')}</div></section>`;
}
function reminders(){
  const t=TODAY();const items=[];
  upcoming().filter(it=>it.b.reminder!==false).forEach(it=>{const n=daysBetween(t,it.date);if(n<=1)items.push({late:n<=0,html:`<b>${esc(it.b.name)}</b> ${n<0?'was due '+fmtDay(it.date):n===0?'is due today':'is due tomorrow'} · ${inr(it.b.amount)}`,act:`data-pay="${it.b.id}|${it.ym}"`,label:'Mark paid'})});
  S.tasks.filter(x=>!x.done&&x.due&&x.due<=t).forEach(x=>items.push({late:x.due<t,html:`To-do: <b>${esc(x.text)}</b> ${x.due<t?'was due '+fmtDay(x.due):'is due today'}`,act:`data-done="${x.id}"`,label:'Done'}));
  if(!items.length)return'';
  return`<div class="reminders" aria-label="Reminders">${items.slice(0,4).map(r=>`<div class="remind ${r.late?'late':''}"><span class="sp">${r.html}</span><button class="btn sm ghost" ${r.act}>${r.label}</button></div>`).join('')}</div>`;
}
function insights(){
  const cur=CUR(),prev=addMonths(cur,-1);const day=+TODAY().slice(8);
  const a=inMonth(cur),bAll=inMonth(prev);const b=bAll.filter(e=>+e.date.slice(8)<=day);
  if(!a.length)return[];
  const out=[];const ca=byCat(a),cb=byCat(b);
  const top=Object.entries(ca).sort((x,y)=>y[1]-x[1])[0];if(top)out.push(`Your biggest spending this month is <b>${esc(catOf(top[0]).l)}</b>, at ${inr(top[1])}.`);
  const avg={};const hist=[1,2,3].map(k=>addMonths(cur,-k)).filter(m=>inMonth(m).length);
  if(hist.length){hist.forEach(m=>{const c=byCat(inMonth(m));Object.entries(c).forEach(([k,v])=>avg[k]=(avg[k]||0)+v/hist.length)})}
  const diffs=Object.keys({...ca,...cb}).map(k=>({k,d:(ca[k]||0)-(cb[k]||0)})).filter(x=>Math.abs(x.d)>=500).sort((x,y)=>Math.abs(y.d)-Math.abs(x.d));
  if(b.length&&diffs[0]){const x=diffs[0];out.push(x.d>0?`You've spent ${inr(x.d)} more on ${esc(catOf(x.k).l)} than by this time last month.`:`You've spent ${inr(-x.d)} less on ${esc(catOf(x.k).l)} than by this time last month.`)}
  const higher=Object.entries(ca).filter(([k,v])=>avg[k]&&v>avg[k]*1.1&&v-avg[k]>=500).sort((x,y)=>(y[1]-avg[y[0]])-(x[1]-avg[x[0]]))[0];
  if(higher&&hist.length>=1)out.push(`${esc(catOf(higher[0]).l)} spending is higher than your usual monthly average of ${inr(avg[higher[0]])}.`);
  if(diffs[1]&&diffs[1].d<0)out.push(`You've spent less on ${esc(catOf(diffs[1].k).l)} so far compared with last month.`);
  const inc=+(S.settings||{}).income||0;if(inc&&b.length){const d=sum(b)-sum(a);if(Math.abs(d)>=500)out.push(d>0?`You have ${inr(d)} more available than at this point last month.`:`You have ${inr(-d)} less available than at this point last month.`)}
  return out.slice(0,4);
}
function expRow(e){
  const c=catOf(e.cat);const m=S.members.find(x=>x.id===e.by);
  const meta=[e.sub&&e.note&&e.note!==e.sub?e.sub:'',m?m.name:'',e.recurring?'Repeats monthly':''].filter(Boolean).join(' · ')||c.l;
  return`<div class="row" style="--cc:${cc(e.cat)}"><button class="rowbtn" data-edit="${e.id}" style="flex:1;min-width:0;display:flex;align-items:center;gap:12px" aria-label="Edit ${esc(e.note||e.sub||c.l)}"><span class="ic">${c.i}</span><span class="t"><b>${esc(e.note||e.sub||c.l)}</b><small>${esc(meta)}</small></span><span class="amt">${inr(e.amount)}</span></button><button class="x" data-delexp="${e.id}" aria-label="Delete">${I.x}</button></div>`;
}
function billRow(it,compact){
  const c=catOf(it.b.cat);
  return`<div class="bill" style="--cc:${cc(it.b.cat)}"><span class="ic" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:19px;background:color-mix(in srgb,${cc(it.b.cat)} 16%,transparent);flex:none">${c.i}</span>
  <span style="flex:1;min-width:0"><b style="display:block">${esc(it.b.name)}</b><span class="num" style="font-size:13.5px;color:var(--ink-3)">${inr(it.b.amount)}${compact?'':' · '+FREQ[it.b.every||1]+' · '+ordinal(it.b.dueDay)}</span></span>
  ${dueTag(it)}<button class="paybtn ${it.paid?'on':''}" data-pay="${it.b.id}|${it.ym}" aria-pressed="${it.paid}">${it.paid?'✓ Paid':'Mark paid'}</button></div>`;
}
const ordinal=n=>{n=+n;const s=['th','st','nd','rd'],v=n%100;return'Due '+n+(s[(v-20)%10]||s[v]||s[0])};
function capPreview(){
  const p=parseCapture(U.captureText);
  if(!p)return`<div class="hint">Try: "Paid 2200 electricity bill" · "Mom spent 850 on groceries yesterday" · "Petrol 2000"</div>`;
  if(!p.amount)return`<div class="chips"><span class="chip">Add an amount, like 450</span></div>`;
  const c=catOf(p.cat);const m=S.members.find(x=>x.id===p.by);
  return`<div class="chips"><span class="chip ok num">${inr(p.amount)}</span><span class="chip">${c.i} ${esc(c.l)}${p.sub?' · '+esc(p.sub):''}</span><span class="chip">${esc(dayLabel(p.date))}</span>${p.note?`<span class="chip">“${esc(p.note)}”</span>`:''}${m?`<span class="chip">${esc(m.icon)} ${esc(m.name)}</span>`:''}${p.bill?`<span class="chip ok">Marks ${esc(p.bill.name)} as paid</span>`:''}</div>`;
}

function vExpenses(){
  return`${topbar()}<div class="page-h"><div><h1>Expense History</h1><p>Every rupee written down, newest first.</p></div><button class="btn" data-act="add">+ Add expense</button></div>
  <div class="filters"><div class="search"><span>${I.search}</span><input class="inp" id="fq" placeholder="Search notes, like “milk” or “school”" value="${esc(U.f.q)}"></div>
  <div class="rowf"><div class="seg" role="group" aria-label="Date range">${[['month','This month'],['last','Last month'],['90','Last 3 months'],['all','All']].map(([k,l])=>`<button type="button" data-range="${k}" aria-pressed="${U.f.range===k}">${l}</button>`).join('')}</div>
  <select class="inp" id="fcat" aria-label="Category"><option value="">All categories</option>${allCats().map(c=>`<option value="${c.k}" ${U.f.cat===c.k?'selected':''}>${c.i} ${esc(c.l)}</option>`).join('')}</select>
  <input class="inp small" id="fmin" inputmode="numeric" placeholder="Min ₹" value="${esc(U.f.min)}" style="width:100px" aria-label="Minimum amount">
  <input class="inp small" id="fmax" inputmode="numeric" placeholder="Max ₹" value="${esc(U.f.max)}" style="width:100px" aria-label="Maximum amount"></div></div>
  <section class="card" id="exList">${expList()}</section>`;
}
function expList(){
  const f=U.f,cur=CUR(),t=TODAY();let list=S.expenses.slice();
  if(f.range==='month')list=list.filter(e=>ymOf(e.date)===cur);
  else if(f.range==='last')list=list.filter(e=>ymOf(e.date)===addMonths(cur,-1));
  else if(f.range==='90'){const from=ymd(new Date(now().getFullYear(),now().getMonth(),now().getDate()-90));list=list.filter(e=>e.date>=from)}
  if(f.cat)list=list.filter(e=>e.cat===f.cat);
  if(f.min)list=list.filter(e=>+e.amount>=+f.min);
  if(f.max)list=list.filter(e=>+e.amount<=+f.max);
  if(f.q){const q=f.q.toLowerCase();list=list.filter(e=>[e.note,e.sub,catOf(e.cat).l,(S.members.find(m=>m.id===e.by)||{}).name].join(' ').toLowerCase().includes(q))}
  list.sort((a,b)=>b.date.localeCompare(a.date)||(b.created||0)-(a.created||0));
  if(!list.length)return`<div class="empty">No expenses match. Try a different search or date range.</div>`;
  const groups={};list.forEach(e=>(groups[e.date]=groups[e.date]||[]).push(e));
  return`<div class="total-line" style="border:0;margin:0 0 6px;padding:0"><span class="muted" style="font-weight:600">${list.length} expense${list.length>1?'s':''}</span><span class="num">${inr(sum(list))}</span></div>`+Object.entries(groups).map(([d,es])=>`<div class="dayhead"><b>${esc(dayLabel(d))}</b><span>${inr(sum(es))}</span></div>`+es.map(expRow).join('')).join('');
}

function vBills(){
  const cur=CUR();const items=billItems(cur,1);const nextItems=billItems(addMonths(cur,1),1);
  const late=billItems(addMonths(cur,-1),1).filter(i=>!i.paid&&i.b.every);
  const tot=sum(items.map(i=>({amount:i.b.amount})));const paid=sum(items.filter(i=>i.paid).map(i=>({amount:i.b.amount})));
  return`${topbar()}<div class="page-h"><div><h1>My Bills</h1><p>Things I need to pay, and when.</p></div><button class="btn" data-act="addBill">+ Add bill</button></div>
  <div class="statrow" style="margin-bottom:16px"><div class="stat"><span>Bills in ${shortMonth(cur)}</span><b>${inr(tot)}</b></div><div class="stat"><span>Paid</span><b style="color:var(--good)">${inr(paid)}</b></div><div class="stat"><span>Still to pay</span><b>${inr(tot-paid)}</b></div></div>
  ${late.length?`<section class="card" style="margin-bottom:16px"><div class="card-h"><h2>Still open from ${MONTHS[+addMonths(cur,-1).slice(5)-1]}</h2></div>${late.map(i=>billRow(i)).join('')}</section>`:''}
  <section class="card" style="margin-bottom:16px"><div class="card-h"><h2>${monthName(cur)}</h2></div>${items.length?items.map(i=>billRow(i)).join(''):`<div class="empty">No bills this month. Add your electricity, internet, school fee or rent to get reminders.</div>`}</section>
  ${nextItems.length?`<section class="card" style="margin-bottom:16px"><div class="card-h"><h2>Next month</h2></div>${nextItems.map(i=>billRow(i)).join('')}</section>`:''}
  <section class="card"><div class="card-h"><h2>All my bills</h2><span class="muted">Tap to edit</span></div>${S.bills.length?S.bills.slice().sort((a,b)=>a.dueDay-b.dueDay).map(b=>`<button class="rowbtn row" data-editbill="${b.id}" style="--cc:${cc(b.cat)};gap:12px;align-items:center"><span class="ic">${catOf(b.cat).i}</span><span class="t"><b>${esc(b.name)}</b><small>${FREQ[b.every||1]} · ${ordinal(b.dueDay)}${b.reminder!==false?' · Reminder on':''}</small></span><span class="amt">${inr(b.amount)}</span></button>`).join(''):`<div class="empty">No bills yet.</div>`}</section>`;
}

function vMonth(){
  const ym=U.monthYm||CUR();const s=S.settings||{};const list=inMonth(ym);const spent=sum(list);const income=+s.income||0;const isCur=ym===CUR();
  const bc=byCat(list);const cats=allCats().map(c=>({...c,v:bc[c.k]||0}));const shown=cats.filter(c=>c.v>0).sort((a,b)=>b.v-a.v);
  const months=[5,4,3,2,1,0].map(k=>addMonths(ym,-k));const vals=months.map(m=>sum(inMonth(m)));const top=Math.max(income,...vals,1)*1.08;
  const budgets=s.budgets||{};const planned=Object.values(budgets).reduce((a,b)=>a+(+b||0),0);
  let donut='';{let acc=0;const R=15.9155;donut=shown.map(c=>{const p=spent?c.v/spent*100:0;const seg=`<circle r="${R}" cx="21" cy="21" fill="none" stroke="${cc(c.k)}" stroke-width="6" stroke-dasharray="${p} ${100-p}" stroke-dashoffset="${25-acc}"></circle>`;acc+=p;return seg}).join('')}
  return`${topbar()}<div class="page-h"><div><h1>My Month</h1><p>Your monthly plan, and how the month is going.</p></div>
  <div class="monthnav"><button class="iconbtn" data-mnav="-1" aria-label="Previous month">${I.chev('l')}</button><b style="font-family:var(--display);font-size:18px;min-width:150px;text-align:center">${monthName(ym)}</b><button class="iconbtn" data-mnav="1" aria-label="Next month" ${isCur?'disabled style="opacity:.4"':''}>${I.chev('r')}</button></div></div>
  <div class="statrow" style="margin-bottom:16px"><div class="stat"><span>Money in</span><b>${income?inr(income):'—'}</b></div><div class="stat"><span>Money out</span><b>${inr(spent)}</b></div><div class="stat"><span>${isCur?'Left':'Saved'}</span><b style="color:${income-spent<0?'var(--rose)':'var(--good)'}">${income?inrS(income-spent):'—'}</b></div></div>
  <div class="grid two">
  <section class="card"><div class="card-h"><h2>Spending</h2><span class="muted num">${inr(spent)}</span></div>
   ${shown.length?`<div class="donut-wrap"><svg viewBox="0 0 42 42" width="150" height="150" role="img" aria-label="Spending by category"><circle r="15.9155" cx="21" cy="21" fill="none" stroke="var(--surface-2)" stroke-width="6"></circle>${donut}<text x="21" y="20.5" text-anchor="middle" font-size="3.2" fill="var(--ink-3)" font-family="Plus Jakarta Sans,sans-serif">${shown.length} categories</text><text x="21" y="25" text-anchor="middle" font-size="4.4" font-weight="800" fill="var(--ink)" font-family="Outfit,sans-serif">${spent>=100000?'₹'+(spent/100000).toFixed(2)+'L':'₹'+Math.round(spent/1000)+'k'}</text></svg>
   <div class="legend">${shown.map(c=>`<div style="--cc:${cc(c.k)}"><i></i><span>${c.i} ${esc(c.l)}</span><b>${inr(c.v)}</b></div>`).join('')}</div></div>`:`<div class="empty">Nothing spent in ${monthName(ym)}.</div>`}</section>
  <section class="card"><div class="card-h"><h2>Last 6 months</h2><span class="muted" style="font-size:13px">Money out</span></div>
   <div class="cols">${income?`<div class="incline" style="bottom:${income/top*100}%"><span>Income ${inr(income)}</span></div>`:''}${months.map((m,i)=>`<div class="colw ${m===ym?'cur':''}"><em style="bottom:calc(${vals[i]/top*100}% + 4px)">${vals[i]?(vals[i]>=1000?Math.round(vals[i]/1000)+'k':vals[i]):''}</em><i style="height:${vals[i]/top*100}%"></i></div>`).join('')}</div>
   <div class="colx">${months.map(m=>`<span>${shortMonth(m)}</span>`).join('')}</div></section>
  <section class="card span2"><div class="card-h"><h2>Monthly plan</h2><span class="muted" style="font-size:13.5px">Optional. Leave blank to just track.</span></div>
   <form class="formrow" data-form="income" style="grid-template-columns:1fr auto;align-items:end;margin-bottom:10px"><div class="field"><label for="incomeInp">Monthly income</label><input class="inp" id="incomeInp" inputmode="numeric" value="${income||''}" placeholder="₹ e.g. 1,27,000"></div><button class="btn">Save</button></form>
   ${planned?`<div class="total-line" style="margin:4px 0 6px;border:0;padding:0"><span class="muted" style="font-weight:600">Planned ${inr(planned)} · Spent ${inr(spent)}</span><span class="num" style="color:${planned-spent<0?'var(--rose)':'var(--good)'}">${inrS(planned-spent)} remaining</span></div>`:''}
   <div>${cats.map(c=>{const lim=+budgets[c.k]||0;const rem=lim-c.v;return`<div class="plan-row" style="--cc:${cc(c.k)}"><span class="ic" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center;font-size:18px;background:color-mix(in srgb,${cc(c.k)} 16%,transparent)">${c.i}</span><span class="nm">${esc(c.l)}</span><span class="meta">Spent ${inr(c.v)}${lim?` · <b class="${rem<0?'over':'ok'}">${rem<0?inr(-rem)+' above plan':inr(rem)+' remaining'}</b>`:''}</span><input class="inp" id="bud-${c.k}" data-budget="${c.k}" inputmode="numeric" placeholder="No limit" value="${lim||''}" aria-label="${esc(c.l)} monthly limit"></div>`}).join('')}</div>
   <button class="link" data-act="addCat" style="margin-top:10px">+ Add a custom category</button></section>
  </div>`;
}

function vLists(){
  const tasks=S.tasks.slice().sort((a,b)=>(a.done-b.done)||(a.due||'9').localeCompare(b.due||'9'));
  const shop=S.shop.slice().sort((a,b)=>a.done-b.done);const est=sum(shop.filter(x=>!x.done).map(x=>({amount:x.price||0})));const t=TODAY();
  return`${topbar()}<div class="page-h"><div><h1>To-do & Shopping</h1><p>Small things that keep the home running.</p></div></div>
  <div class="grid two">
  <section class="card"><div class="card-h"><h2>Home to-do</h2><span class="muted">${S.tasks.filter(x=>!x.done).length} open</span></div>
   ${tasks.map(x=>`<div class="check"><input type="checkbox" id="tk-${x.id}" data-task="${x.id}" ${x.done?'checked':''}><label for="tk-${x.id}" class="t ${x.done?'done':''}">${esc(x.text)}${x.due?`<small class="${!x.done&&x.due<t?'late':''}">${x.due===t?'Today':dayLabel(x.due)}</small>`:''}</label><button class="x" style="opacity:.6;border:0;background:none;color:var(--ink-3)" data-deltask="${x.id}" aria-label="Delete">${I.x}</button></div>`).join('')||`<div class="empty">Nothing to do. Nice.</div>`}
   <form class="addline" data-form="task"><input class="inp" id="taskText" placeholder="Call plumber" aria-label="New task"><input class="inp date" id="taskDue" type="date" aria-label="Due date"><button class="btn sm">Add</button></form></section>
  <section class="card"><div class="card-h"><h2>Shopping list</h2>${S.shop.some(x=>x.done)?`<button class="link" data-act="clearBought">Clear bought</button>`:''}</div>
   ${shop.map(x=>`<div class="check"><input type="checkbox" id="sh-${x.id}" data-shop="${x.id}" ${x.done?'checked':''}><label for="sh-${x.id}" class="t ${x.done?'done':''}">${esc(x.text)}</label>${x.price?`<span class="num" style="font-weight:600;color:var(--ink-2)">${inr(x.price)}</span>`:''}<button class="x" style="opacity:.6;border:0;background:none;color:var(--ink-3)" data-delshop="${x.id}" aria-label="Delete">${I.x}</button></div>`).join('')||`<div class="empty">Your list is empty.</div>`}
   ${est?`<div class="total-line"><span>Estimated total</span><span class="num">${inr(est)}</span></div>`:''}
   <form class="addline" data-form="shop"><input class="inp" id="shopText" placeholder="Add item, like Bread" aria-label="New item"><input class="inp price" id="shopPrice" inputmode="numeric" placeholder="₹ price" aria-label="Estimated price"><button class="btn sm">Add</button></form>
   ${S.shop.some(x=>x.done&&x.price)?`<button class="btn ghost block" style="margin-top:12px" data-act="shopToExp">Add bought items as one expense</button>`:''}</section>
  </div>`;
}

function vGoals(){
  return`${topbar()}<div class="page-h"><div><h1>My Goals</h1><p>Money you're putting aside for something that matters.</p></div><button class="btn" data-act="addGoal">+ New goal</button></div>
  <div class="goals">${S.goals.map(g=>{const p=Math.min(100,Math.round((+g.saved||0)/(+g.target||1)*100));return`<section class="card goal"><div class="top"><span class="e">${esc(g.icon||'💰')}</span><h3>${esc(g.name)}</h3><div class="ring" style="--p:${p}"><span>${p}%</span></div></div>
  <div class="nums"><span class="muted">Saved<b style="color:var(--ink)">${inr(g.saved)}</b></span><span class="muted" style="text-align:right">Target<b style="color:var(--ink)">${inr(g.target)}</b></span></div>
  <div style="display:flex;gap:8px"><button class="btn sm" style="flex:1" data-save="${g.id}">+ Add money</button><button class="btn sm ghost" data-editgoal="${g.id}">Edit</button></div>
  ${p>=100?`<p style="margin:10px 0 0;color:var(--good);font-weight:700">Goal reached 🎉</p>`:`<p class="muted" style="margin:10px 0 0;font-size:13.5px">${inr(g.target-g.saved)} to go</p>`}</section>`}).join('')||`<div class="card empty">No goals yet. A school fee fund or a family trip is a good first one.</div>`}</div>`;
}

function vCalendar(){
  const ym=U.calYm||CUR();const[y,m]=ym.split('-').map(Number);const first=new Date(y,m-1,1);const startDow=first.getDay();const t=TODAY();
  const bills={};billItems(ym,1).forEach(i=>(bills[i.date]=bills[i.date]||[]).push(i));
  const ex={};inMonth(ym).forEach(e=>(ex[e.date]=ex[e.date]||[]).push(e));
  const tk={};S.tasks.filter(x=>x.due&&ymOf(x.due)===ym).forEach(x=>(tk[x.due]=tk[x.due]||[]).push(x));
  const sel=U.calDay&&ymOf(U.calDay)===ym?U.calDay:(ym===CUR()?t:ym+'-01');
  let cells='';for(let i=0;i<startDow;i++)cells+=`<span></span>`;
  for(let d=1;d<=dim(ym);d++){const ds=ym+'-'+pad(d);cells+=`<button class="day ${ds===t?'today':''}" data-day="${ds}" aria-pressed="${ds===sel}" aria-label="${fmtDay(ds)}"><span>${d}</span><span class="dots">${bills[ds]?'<i class="b"></i>':''}${ex[ds]?'<i class="e"></i>':''}${tk[ds]?'<i class="k"></i>':''}</span></button>`}
  const dayBills=bills[sel]||[],dayEx=ex[sel]||[],dayTk=tk[sel]||[];
  return`${topbar()}<div class="page-h"><div><h1>Calendar</h1><p>Bills, spending and to-dos, day by day.</p></div>
  <div class="monthnav"><button class="iconbtn" data-cnav="-1" aria-label="Previous month">${I.chev('l')}</button><b style="font-family:var(--display);font-size:18px;min-width:150px;text-align:center">${monthName(ym)}</b><button class="iconbtn" data-cnav="1" aria-label="Next month">${I.chev('r')}</button></div></div>
  <div class="grid hero"><section class="card"><div class="calgrid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w=>`<span class="wd">${w}</span>`).join('')}${cells}</div>
  <div class="calkey"><span><i style="background:var(--gold)"></i>Bill due</span><span><i style="background:var(--accent)"></i>Spending</span><span><i style="background:var(--c-family)"></i>To-do</span></div></section>
  <section class="card"><div class="card-h"><h2>${esc(parseD(sel).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}))}</h2></div>
  ${dayBills.map(i=>billRow(i,true)).join('')}
  ${dayTk.map(x=>`<div class="check"><input type="checkbox" id="ctk-${x.id}" data-task="${x.id}" ${x.done?'checked':''}><label for="ctk-${x.id}" class="t ${x.done?'done':''}">${esc(x.text)}<small>To-do</small></label></div>`).join('')}
  ${dayEx.length?`<div class="dayhead" style="margin-top:12px"><b>Spent</b><span>${inr(sum(dayEx))}</span></div>`+dayEx.map(expRow).join(''):''}
  ${!dayBills.length&&!dayTk.length&&!dayEx.length?`<div class="empty">Nothing on this day.</div>`:''}</section></div>`;
}

function vFamily(){
  const cur=CUR();const list=inMonth(cur);
  return`${topbar()}<div class="page-h"><div><h1>Our Family</h1><p>Optional. Add the people who share this notebook so everyone can write down what they spend.</p></div></div>
  <div class="grid two"><section class="card"><div class="card-h"><h2>Members</h2></div>
   <div class="members">${S.members.map(m=>`<span class="member"><span class="av">${esc(m.icon||'🧑')}</span>${esc(m.name)}<button data-delmember="${m.id}" aria-label="Remove ${esc(m.name)}">${I.x}</button></span>`).join('')||`<span class="empty" style="padding:4px 0">Just you for now.</span>`}</div>
   <form class="addline" data-form="member" style="margin-top:16px"><select class="inp" id="memIcon" style="width:74px;flex:none;font-size:20px" aria-label="Icon">${MEMBER_ICONS.map(i=>`<option>${i}</option>`).join('')}</select><input class="inp" id="memName" placeholder="Name, like Mom or Aarav" aria-label="Member name"><button class="btn sm">Add</button></form>
   ${S.members.length?`<div class="field" style="margin-top:18px"><span class="flabel">On this device, I am</span><div class="whopick">${S.members.map(m=>`<button class="subpick" data-me="${m.id}" aria-pressed="${me()===m.id}">${esc(m.icon)} ${esc(m.name)}</button>`).join('')}</div><span class="muted" style="font-size:13px">Expenses you add from here are marked with your name.</span></div>`:''}</section>
  ${familyCard(list)||`<section class="card"><div class="card-h"><h2>Family spending</h2></div><div class="empty">Add members to see who spent what this month.</div></section>`}</div>`;
}

function vSettings(){
  const t=getTheme();
  return`${topbar()}<div class="page-h"><div><h1>Settings</h1></div></div>
  <div class="stack"><section class="card"><div class="card-h"><h2>Appearance</h2></div><div class="seg" role="group" aria-label="Theme">${[['light','Light'],['dark','Dark'],['system','Match my device']].map(([k,l])=>`<button type="button" data-theme="${k}" aria-pressed="${t===k}">${l}</button>`).join('')}</div></section>
  <section class="card"><div class="card-h"><h2>Categories</h2><button class="link" data-act="addCat">+ Add category</button></div><div class="subs">${allCats().map(c=>`<span class="chip">${c.i} ${esc(c.l)}${c.custom?` <button class="x" style="opacity:1;width:auto;height:auto;border:0;background:none;color:var(--ink-3)" data-delcat="${c.k}" aria-label="Remove ${esc(c.l)}">${I.x}</button>`:''}</span>`).join('')}</div></section>
  ${S.mode==='sb'&&HHINFO?`<section class="card"><div class="card-h"><h2>${esc(HHINFO.name)}</h2><span class="muted" style="font-size:13px">${esc(USER_EMAIL)}</span></div>
   <p class="muted" style="margin:0 0 12px">Share this join code with your family. They sign in with their email, choose <b>Join a household</b> and enter it.</p>
   <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="joincode" id="joinCode">${esc(HHINFO.join_code)}</span><button class="btn sm ghost" data-act="copyCode">Copy code</button><button class="btn sm ghost" data-act="rotateCode">New code</button><button class="btn sm ghost" data-act="signout">Sign out</button></div>
   <p class="muted" style="margin:12px 0 0;font-size:13px">Getting a new code stops the old one from working. People already in your household stay in.</p></section>`:''}
  <section class="card"><div class="card-h"><h2>Your notebook</h2></div><p class="muted" style="margin:0 0 12px">${S.mode==='sb'?'Saved online and synced live to everyone in your household.':'Demo mode: saved in this browser only.'}</p>
   <div style="display:flex;gap:10px;flex-wrap:wrap">${S.settings&&S.settings.sample?`<button class="btn ghost" data-act="clearSample">Remove the example household</button>`:''}<button class="btn danger" data-act="wipe">Erase everything…</button>${S.mode==='local'&&SB?`<button class="btn" data-act="leaveDemo">Sign in to save my own household</button>`:''}</div></section>
  <section class="card"><div class="card-h"><h2>Shortcuts</h2></div><p class="muted" style="margin:0">Press <b>N</b> to add an expense, <b>/</b> to type one naturally, and <b>Esc</b> to close a panel.</p></section></div>`;
}

/* ---------- sheets ---------- */
let sheetOpen=false,lastFocus=null;
function openSheet(html,focusSel){
  lastFocus=document.activeElement;
  const sh=$('#sheet'),sc=$('#scrim');sh.innerHTML=`<div class="grab"></div>`+html;sh.hidden=false;sc.hidden=false;sheetOpen=true;
  requestAnimationFrame(()=>{sh.classList.add('show');sc.classList.add('show');const f=focusSel&&sh.querySelector(focusSel);if(f)f.focus()});
}
function closeSheet(){
  if(!sheetOpen)return;const sh=$('#sheet'),sc=$('#scrim');sh.classList.remove('show');sc.classList.remove('show');sheetOpen=false;
  setTimeout(()=>{if(!sheetOpen){sh.hidden=true;sc.hidden=true;sh.innerHTML=''}},230);if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
function catButtons(sel){return`<div class="catgrid" role="group" aria-label="Category">${allCats().map(c=>`<button type="button" class="catpick" data-pick="${c.k}" aria-pressed="${c.k===sel}" style="--cc:${cc(c.k)}"><span class="e">${c.i}</span>${esc(c.l)}</button>`).join('')}</div>`}
function subButtons(cat,sel){const c=catOf(cat);return c.subs.length?`<div class="subs" id="subs">${c.subs.map(s=>`<button type="button" class="subpick" data-sub="${esc(s)}" aria-pressed="${s===sel}">${esc(s)}</button>`).join('')}</div>`:'<div id="subs"></div>'}
function sheetExpense(e){
  const ed=!!e;e=e||{cat:'food',date:TODAY(),by:me()};
  openSheet(`<div class="sheet-h"><h2 id="sheetTitle">${ed?'Edit expense':'What did you spend?'}</h2><button class="iconbtn" data-act="close" aria-label="Close">${I.x}</button></div>
  <form data-form="expense" data-id="${ed?e.id:''}"><input type="hidden" id="exCat" value="${e.cat}"><input type="hidden" id="exSub" value="${esc(e.sub||'')}">
  <div class="amount-inp"><span>₹</span><input id="exAmt" inputmode="decimal" autocomplete="off" placeholder="0" value="${e.amount||''}" aria-label="Amount" required></div>
  <div class="field"><span class="flabel">What was it for?</span>${catButtons(e.cat)}</div>${subButtons(e.cat,e.sub)}
  <div class="formrow"><div class="field"><label for="exDate">Date</label><input class="inp" type="date" id="exDate" value="${e.date}" max="${ymd(new Date(now().getFullYear()+1,0,1))}"></div>
  <div class="field"><label for="exNote">Note <span class="muted" style="font-weight:500">(optional)</span></label><input class="inp" id="exNote" placeholder="Vegetables from market" value="${esc(e.note||'')}"></div></div>
  ${S.members.length?`<div class="field"><span class="flabel">Who spent it?</span><div class="whopick">${[{id:'',name:'Not sure',icon:'📝'},...S.members].map(m=>`<button type="button" class="subpick" data-who="${m.id}" aria-pressed="${(e.by||'')===m.id}">${esc(m.icon)} ${esc(m.name)}</button>`).join('')}</div><input type="hidden" id="exBy" value="${e.by||''}"></div>`:''}
  <label class="toggle"><input type="checkbox" id="exRec" ${e.recurring?'checked':''}> Repeats every month (rent, maid, fees…)</label>
  <button class="btn block">SAVE EXPENSE</button>
  ${ed?`<button type="button" class="btn danger block" data-delexp="${e.id}">Delete this expense</button>`:''}</form>`,'#exAmt');
}
function sheetBill(b){
  const ed=!!b;b=b||{name:'',amount:'',dueDay:5,every:1,cat:'bills',sub:'',reminder:true};
  openSheet(`<div class="sheet-h"><h2 id="sheetTitle">${ed?'Edit bill':'Add a bill'}</h2><button class="iconbtn" data-act="close" aria-label="Close">${I.x}</button></div>
  <form data-form="bill" data-id="${ed?b.id:''}"><input type="hidden" id="exCat" value="${b.cat}"><input type="hidden" id="exSub" value="${esc(b.sub||'')}">
  <div class="field"><label for="bName">Bill name</label><input class="inp" id="bName" required placeholder="Electricity" value="${esc(b.name)}"></div>
  <div class="formrow"><div class="field"><label for="bAmt">Amount</label><input class="inp" id="bAmt" inputmode="decimal" required placeholder="₹ 2,400" value="${b.amount}"></div>
  <div class="field"><label for="bDay">Due on day</label><input class="inp" id="bDay" type="number" min="1" max="31" required value="${b.dueDay}"></div></div>
  <div class="formrow"><div class="field"><label for="bEvery">How often</label><select class="inp" id="bEvery">${Object.entries(FREQ).map(([k,l])=>`<option value="${k}" ${+k===+(b.every||1)?'selected':''}>${l}</option>`).join('')}</select></div>
  <div class="field"><label for="bStart">Starting from</label><input class="inp" id="bStart" type="month" value="${esc(b.start||CUR())}"></div></div>
  <div class="field"><span class="flabel">Category</span>${catButtons(b.cat)}</div>${subButtons(b.cat,b.sub)}
  <label class="toggle"><input type="checkbox" id="bRem" ${b.reminder!==false?'checked':''}> Remind me the day before it's due</label>
  <button class="btn block">SAVE BILL</button>${ed?`<button type="button" class="btn danger block" data-delbill="${b.id}">Delete this bill</button>`:''}</form>`,'#bName');
}
function sheetGoal(g){
  const ed=!!g;g=g||{name:'',icon:'🎓',target:'',saved:0};
  openSheet(`<div class="sheet-h"><h2 id="sheetTitle">${ed?'Edit goal':'New goal'}</h2><button class="iconbtn" data-act="close" aria-label="Close">${I.x}</button></div>
  <form data-form="goal" data-id="${ed?g.id:''}"><div class="field"><span class="flabel">Pick an icon</span><div class="whopick">${GOAL_ICONS.map(i=>`<button type="button" class="subpick" style="font-size:20px;padding:6px 10px" data-gicon="${i}" aria-pressed="${g.icon===i}">${i}</button>`).join('')}</div><input type="hidden" id="gIcon" value="${esc(g.icon)}"></div>
  <div class="field"><label for="gName">Saving for</label><input class="inp" id="gName" required placeholder="Family trip" value="${esc(g.name)}"></div>
  <div class="formrow"><div class="field"><label for="gTarget">Target</label><input class="inp" id="gTarget" inputmode="numeric" required placeholder="₹ 80,000" value="${g.target}"></div><div class="field"><label for="gSaved">Saved so far</label><input class="inp" id="gSaved" inputmode="numeric" value="${g.saved||0}"></div></div>
  <button class="btn block">SAVE GOAL</button>${ed?`<button type="button" class="btn danger block" data-delgoal="${g.id}">Delete this goal</button>`:''}</form>`,'#gName');
}
function sheetSave(g){
  openSheet(`<div class="sheet-h"><h2 id="sheetTitle">Add to ${esc(g.name)}</h2><button class="iconbtn" data-act="close" aria-label="Close">${I.x}</button></div>
  <form data-form="saveGoal" data-id="${g.id}"><div class="amount-inp"><span>₹</span><input id="sgAmt" inputmode="numeric" placeholder="0" aria-label="Amount" required></div>
  <div class="subs">${[500,1000,2000,5000].map(v=>`<button type="button" class="subpick" data-quick="${v}">+ ${inr(v)}</button>`).join('')}</div><button class="btn block">ADD MONEY</button></form>`,'#sgAmt');
}
function sheetCat(){
  openSheet(`<div class="sheet-h"><h2 id="sheetTitle">New category</h2><button class="iconbtn" data-act="close" aria-label="Close">${I.x}</button></div>
  <form data-form="cat"><div class="formrow" style="grid-template-columns:80px 1fr"><div class="field"><label for="catIcon">Icon</label><input class="inp" id="catIcon" maxlength="4" value="🐾" style="font-size:20px;text-align:center"></div><div class="field"><label for="catName">Name</label><input class="inp" id="catName" required placeholder="Pets"></div></div><button class="btn block">ADD CATEGORY</button></form>`,'#catName');
}
function sheetMore(){
  openSheet(`<div class="sheet-h"><h2 id="sheetTitle">More</h2><button class="iconbtn" data-act="close" aria-label="Close">${I.x}</button></div>
  <div class="stack" style="gap:6px">${VIEWS.filter(v=>!TABS.includes(v[0])).map(([k,l,ic])=>`<button class="rowbtn row" data-go="${k}" style="padding:10px;gap:14px"><span class="ic" style="background:var(--surface-2);color:var(--ink-2)"><span style="width:20px;height:20px;display:block">${ic}</span></span><span class="t"><b>${l}</b></span></button>`).join('')}</div>`);
}
function sheetConfirm(title,body,label,fn){
  openSheet(`<h2 id="sheetTitle">${title}</h2><p class="muted" style="margin:-6px 0 18px">${body}</p><div style="display:flex;gap:10px"><button class="btn ghost" style="flex:1" data-act="close">Keep it</button><button class="btn danger" style="flex:1" id="confirmBtn">${label}</button></div>`);
  $('#confirmBtn').onclick=async()=>{closeSheet();await fn()};
}

/* ---------- theme ---------- */
function getTheme(){return ls.get('hf_theme')||'system'}
function applyTheme(){const t=getTheme();if(t==='system')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t)}

/* ---------- render ---------- */
function render(){
  if(!S.ready)return;
  nav();
  const v={home:vHome,expenses:vExpenses,bills:vBills,month:vMonth,lists:vLists,goals:vGoals,calendar:vCalendar,family:vFamily,settings:vSettings}[U.view]||vHome;
  $('#main').innerHTML=v();
}
let refreshQ=false;
function refresh(){
  if(refreshQ)return;refreshQ=true;
  requestAnimationFrame(()=>{refreshQ=false;if(!S.ready)return;
    const a=document.activeElement;const id=a&&a.id&&$('#main').contains(a)?a.id:null;let sel=null;try{sel=id?[a.selectionStart,a.selectionEnd]:null}catch(e){}
    if(U.view==='expenses'&&$('#exList')){$('#exList').innerHTML=expList();nav();return}
    const vals={};$('#main').querySelectorAll('input[id]').forEach(i=>{if(i.type!=='checkbox'&&i.value)vals[i.id]=i.value});
    render();
    Object.entries(vals).forEach(([k,v])=>{const el=document.getElementById(k);if(el&&el.type!=='checkbox'&&!el.dataset.budget&&k!=='incomeInp')el.value=v});
    if(id){const el=document.getElementById(id);if(el){el.focus();try{if(sel)el.setSelectionRange(sel[0],sel[1])}catch(e){}}}
  });
}
function go(v){U.view=v;closeSheet();render();window.scrollTo({top:0});ls.set('hf_view',v)}
let tt;function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2600)}
const num=v=>parseFloat(String(v||'').replace(/[^\d.]/g,''))||0;

/* ---------- events ---------- */
document.addEventListener('click',async ev=>{
  const b=ev.target.closest('button,[data-day]');if(!b)return;const d=b.dataset;
  if(d.go){go(d.go);return}
  if(d.act){const a=d.act;
    if(a==='add')sheetExpense();
    else if(a==='close')closeSheet();
    else if(a==='more')sheetMore();
    else if(a==='theme'){const t=getTheme();const dark=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);ls.set('hf_theme',dark?'light':'dark');applyTheme();render()}
    else if(a==='addBill')sheetBill();
    else if(a==='addGoal')sheetGoal();
    else if(a==='addCat')sheetCat();
    else if(a==='clearSample')sheetConfirm('Start your own notebook?','This removes the example household: its expenses, bills, lists, goals and family members. Your notebook will be empty and ready for your own entries.','Remove example',()=>wipe(false));
    else if(a==='wipe')sheetConfirm('Erase everything?','Every expense, bill, list, goal and family member in this notebook will be deleted for everyone who shares it. This cannot be undone.','Erase everything',()=>wipe(true));
    else if(a==='copyCode'){const c=HHINFO&&HHINFO.join_code;try{await navigator.clipboard.writeText(c);toast('Join code copied')}catch(e){const r=document.createRange();r.selectNodeContents($('#joinCode'));getSelection().removeAllRanges();getSelection().addRange(r);toast('Code selected. Copy it to share.')}}
    else if(a==='signout'){await SB.auth.signOut({scope:'local'});ls.set('hf_me','');location.reload()}
    else if(a==='rotateCode'){const {data,error}=await SB.rpc('rotate_join_code',{p_household:HH});if(error)return toast('Could not change the code. Try again.');HHINFO={...HHINFO,join_code:data};render();toast('New join code ready')}
    else if(a==='leaveDemo'){ls.set('hf_demo','');location.reload()}
    else if(a==='clearBought'){for(const x of S.shop.filter(x=>x.done))await del('shop',x.id);toast('Bought items cleared')}
    else if(a==='shopToExp'){const items=S.shop.filter(x=>x.done&&x.price);const tot=sum(items.map(x=>({amount:x.price})));await addExpense({amount:tot,cat:'food',sub:'Groceries',note:items.map(x=>x.text).join(', ').slice(0,80)});for(const x of items)await del('shop',x.id);toast(`${inr(tot)} added to expenses`)}
    return}
  if(d.pick){const f=b.closest('form');f.querySelector('#exCat').value=d.pick;f.querySelectorAll('.catpick').forEach(x=>x.setAttribute('aria-pressed',x===b));f.querySelector('#exSub').value='';f.querySelector('#subs').outerHTML=subButtons(d.pick,'');return}
  if(d.sub!==undefined&&b.classList.contains('subpick')){const f=b.closest('form');const on=b.getAttribute('aria-pressed')!=='true';f.querySelectorAll('[data-sub]').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed',on);f.querySelector('#exSub').value=on?d.sub:'';return}
  if(d.who!==undefined){const f=b.closest('form');f.querySelectorAll('[data-who]').forEach(x=>x.setAttribute('aria-pressed',x===b));f.querySelector('#exBy').value=d.who;return}
  if(d.gicon){const f=b.closest('form');f.querySelectorAll('[data-gicon]').forEach(x=>x.setAttribute('aria-pressed',x===b));f.querySelector('#gIcon').value=d.gicon;return}
  if(d.quick){const i=$('#sgAmt');i.value=num(i.value)+ +d.quick;return}
  if(d.edit){const e=S.expenses.find(x=>x.id===d.edit);if(e)sheetExpense(e);return}
  if(d.delexp){const e=S.expenses.find(x=>x.id===d.delexp);closeSheet();await del('expenses',d.delexp);if(e&&e.billId){const bl=S.bills.find(x=>x.id===e.billId);if(bl&&bl.paid&&bl.paid[e.bm]){const p={...bl.paid};delete p[e.bm];await put('bills',{...bl,paid:p})}}toast('Expense deleted');return}
  if(d.pay){const[id,ym]=d.pay.split('|');const bl=S.bills.find(x=>x.id===id);if(bl)await setBillPaid(bl,ym,!(bl.paid&&bl.paid[ym]));return}
  if(d.done){const x=S.tasks.find(t=>t.id===d.done);if(x){await put('tasks',{...x,done:true});toast('Marked done')}return}
  if(d.editbill){const bl=S.bills.find(x=>x.id===d.editbill);if(bl)sheetBill(bl);return}
  if(d.delbill){closeSheet();await del('bills',d.delbill);toast('Bill deleted');return}
  if(d.editgoal){const g=S.goals.find(x=>x.id===d.editgoal);if(g)sheetGoal(g);return}
  if(d.delgoal){closeSheet();await del('goals',d.delgoal);toast('Goal deleted');return}
  if(d.save){const g=S.goals.find(x=>x.id===d.save);if(g)sheetSave(g);return}
  if(d.deltask){await del('tasks',d.deltask);return}
  if(d.delshop){await del('shop',d.delshop);return}
  if(d.delmember){await del('members',d.delmember);return}
  if(d.delcat){await del('cats',d.delcat);return}
  if(d.me!==undefined){ls.set('hf_me',me()===d.me?'':d.me);render();return}
  if(d.theme){ls.set('hf_theme',d.theme);applyTheme();render();return}
  if(d.range){U.f.range=d.range;document.querySelectorAll('[data-range]').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#exList').innerHTML=expList();return}
  if(d.mnav){const ym=addMonths(U.monthYm||CUR(),+d.mnav);if(ym<=CUR()){U.monthYm=ym;render()}return}
  if(d.cnav){U.calYm=addMonths(U.calYm||CUR(),+d.cnav);U.calDay=null;render();return}
  if(d.day){U.calDay=d.day;render();return}
  if(d.wday){U.weekDay=d.wday;render();return}
});
$('#fab').onclick=()=>sheetExpense();
$('#scrim').onclick=closeSheet;
document.addEventListener('change',async ev=>{
  const el=ev.target;const d=el.dataset;
  if(d.task){const x=S.tasks.find(t=>t.id===d.task);if(x)await put('tasks',{...x,done:el.checked})}
  else if(d.shop){const x=S.shop.find(t=>t.id===d.shop);if(x)await put('shop',{...x,done:el.checked})}
  else if(d.budget){const budgets={...((S.settings||{}).budgets||{})};const v=num(el.value);if(v)budgets[d.budget]=v;else delete budgets[d.budget];await setSettings({budgets});toast('Plan updated')}
  else if(el.id==='fcat'){U.f.cat=el.value;$('#exList').innerHTML=expList()}
});
document.addEventListener('input',ev=>{
  const el=ev.target;
  if(el.id==='capture'){U.captureText=el.value;$('#capPreview').innerHTML=capPreview()}
  else if(el.id==='fq'){U.f.q=el.value;$('#exList').innerHTML=expList()}
  else if(el.id==='fmin'){U.f.min=el.value;$('#exList').innerHTML=expList()}
  else if(el.id==='fmax'){U.f.max=el.value;$('#exList').innerHTML=expList()}
});
document.addEventListener('submit',async ev=>{
  ev.preventDefault();const f=ev.target;const k=f.dataset.form;const g=s=>f.querySelector(s);
  if(k==='capture'){const p=parseCapture(U.captureText);if(!p||!p.amount){toast('Add an amount, like "Spent 450 on vegetables"');return}
    if(p.bill){const ym=CUR();await setBillPaid(p.bill,ym,true);const e=S.expenses.find(x=>x.billId===p.bill.id&&x.bm===ym);if(e&&e.amount!==p.amount)await put('expenses',{...e,amount:p.amount})}
    else{await addExpense({amount:p.amount,cat:p.cat,sub:p.sub,note:p.note,date:p.date,by:p.by||me()});toast(`${inr(p.amount)} added to ${catOf(p.cat).l}`)}
    U.captureText='';const c=$('#capture');if(c)c.value='';$('#capPreview').innerHTML=capPreview();return}
  if(k==='expense'){const amt=num(g('#exAmt').value);if(!amt){g('#exAmt').focus();toast('Enter how much you spent');return}
    const id=f.dataset.id;const old=id?S.expenses.find(x=>x.id===id):null;
    const e={...(old||{}),id:id||undefined,amount:amt,cat:g('#exCat').value,sub:g('#exSub').value,note:g('#exNote').value.trim(),date:g('#exDate').value||TODAY(),by:g('#exBy')?g('#exBy').value:(old?old.by:me())};
    const rec=g('#exRec').checked;
    if(old){const o={...old,...e};if(rec){o.recurring=true;o.rootId=old.rootId||old.id}else{delete o.recurring;delete o.rootId}await put('expenses',o)}
    else await addExpense({...e,recurring:rec});
    closeSheet();toast(old?'Expense updated':`${inr(amt)} saved`);return}
  if(k==='bill'){const id=f.dataset.id||'b'+uid();const old=S.bills.find(x=>x.id===id)||{};
    await put('bills',{...old,id,name:g('#bName').value.trim(),amount:num(g('#bAmt').value),dueDay:Math.min(31,Math.max(1,+g('#bDay').value||1)),every:+g('#bEvery').value,start:g('#bStart').value||CUR(),cat:g('#exCat').value,sub:g('#exSub').value,reminder:g('#bRem').checked,paid:old.paid||{}});
    closeSheet();toast('Bill saved');return}
  if(k==='goal'){const id=f.dataset.id||'g'+uid();await put('goals',{id,name:g('#gName').value.trim(),icon:g('#gIcon').value,target:num(g('#gTarget').value),saved:num(g('#gSaved').value)});closeSheet();toast('Goal saved');return}
  if(k==='saveGoal'){const x=S.goals.find(y=>y.id===f.dataset.id);const v=num(g('#sgAmt').value);if(x&&v){await put('goals',{...x,saved:(+x.saved||0)+v});closeSheet();toast(`${inr(v)} added to ${x.name}`)}return}
  if(k==='cat'){const name=g('#catName').value.trim();if(!name)return;await put('cats',{id:'c'+uid(),label:name,icon:g('#catIcon').value.trim()||'🏷️'});closeSheet();toast(`${name} added`);return}
  if(k==='income'){const inp=g('input');const v=num(inp.value);await setSettings({income:v});toast(v?`Monthly income set to ${inr(v)}`:'Income cleared');return}
  if(k==='task'){const t=g('#taskText').value.trim();if(!t)return;await put('tasks',{id:'t'+uid(),text:t,due:g('#taskDue').value||'',done:false});return}
  if(k==='shop'){const t=g('#shopText').value.trim();if(!t)return;await put('shop',{id:'i'+uid(),text:t,price:num(g('#shopPrice').value),done:false});return}
  if(k==='member'){const n=g('#memName').value.trim();if(!n)return;await put('members',{id:'m'+uid(),name:n,icon:g('#memIcon').value});return}
});
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'&&sheetOpen){closeSheet();return}
  const tag=(ev.target.tagName||'').toLowerCase();if(['input','textarea','select'].includes(tag)||sheetOpen||ev.metaKey||ev.ctrlKey||ev.altKey)return;
  if(ev.key==='n'||ev.key==='N'||ev.key==='+'){ev.preventDefault();sheetExpense()}
  else if(ev.key==='/'){ev.preventDefault();if(U.view!=='home')go('home');setTimeout(()=>{const c=$('#capture');if(c)c.focus()},30)}
});
async function wipe(all){
  if(S.mode==='sb'){const {error}=await SB.from('items').update({data:{_deleted:true},updated_at:new Date().toISOString()}).eq('household_id',HH).neq('col','settings');if(error)return sbErr(error);COLS.forEach(c=>S[c]=[])}
  else for(const c of COLS){for(const x of S[c].slice())await del(c,x.id)}
  await setSettings(all?{income:0,budgets:{},sample:false}:{income:0,budgets:{},sample:false});
  recurringDone=false;toast(all?'Notebook erased':'Example removed. Your notebook is ready.');go('home');
}

/* ---------- boot ---------- */
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(getTheme()==='system')render()});
const savedView=ls.get('hf_view');if(savedView&&VIEWS.some(v=>v[0]===savedView))U.view=savedView;

function startLocal(){
  S.mode='local';let data=null;try{data=JSON.parse(ls.get(LSKEY)||'null')}catch(e){}
  if(!data)data=makeSample(now());
  COLS.forEach(c=>S[c]=(data[c]||[]).map(x=>clean(c,x.id,x)).filter(Boolean));S.settings=cleanSettings(data.settings);S.ready=true;saveLocal();showChrome(true);render();runRecurring();
}
function showChrome(on){$('#tabbar').hidden=!on;$('#fab').hidden=!on;$('#side').hidden=!on;document.querySelector('.app').classList.toggle('gated',!on)}

/* ---------- sign-in gate ---------- */
let USER=null,USER_EMAIL='';
function gate(kind,msg){
  showChrome(false);
  const hero=`<div class="gate-hero"><div class="brand"><span class="mark">${I.logo}</span>HomeFlow</div>
   <h1>Know where your money goes.<br><span>Run your home with confidence.</span></h1>
   <p>A free, friendly notebook for your family's monthly money, daily expenses, bills, lists and savings goals.</p>
   <div class="gate-tiles"><span>🧾 Expenses in seconds</span><span>🗓️ Bill reminders</span><span>👨‍👩‍👧 Shared with family</span><span>🎯 Savings goals</span></div></div>`;
  let form='';
  if(kind==='login')form=`<h2>Sign in</h2><p class="muted">We'll email you a link. No password needed.</p>
   <form data-gate="login"><div class="field"><label for="gEmail">Your email</label><input class="inp" id="gEmail" type="email" required autocomplete="email" placeholder="you@example.com"></div><button class="btn block">Email me a sign-in link</button></form>
   <div class="or"><span>or</span></div><button class="btn ghost block" data-gate-act="demo">Try the demo household</button>`;
  else if(kind==='sent')form=`<h2>Check your email</h2><p class="muted">We sent a sign-in link to <b>${esc(msg)}</b>. Open it on this device to continue.</p><button class="btn ghost block" data-gate-act="back">Use a different email</button>`;
  else if(kind==='household')form=`<h2>Set up your home</h2><p class="muted">Start a new household, or join your family's with their code.</p>
   <form data-gate="create"><div class="field"><label for="gHome">Household name</label><input class="inp" id="gHome" required placeholder="The Sharma home" maxlength="60"></div><button class="btn block">Create my household</button></form>
   <div class="or"><span>or join one</span></div>
   <form data-gate="join" class="addline" style="margin:0"><input class="inp" id="gCode" required placeholder="Join code, like 7KQ2MX" maxlength="12" style="text-transform:uppercase" aria-label="Join code"><button class="btn">Join</button></form>
   <button class="link" data-gate-act="signout" style="margin-top:14px">Signed in as ${esc(USER_EMAIL)} · Sign out</button>`;
  else if(kind==='error')form=`<h2>Something went wrong</h2><p class="muted">${esc(msg)}</p><button class="btn block" data-gate-act="reload">Try again</button>`;
  $('#main').innerHTML=`<div class="gate fade">${hero}<section class="card gate-card">${form}${msg&&kind!=='sent'&&kind!=='error'?`<p class="gate-err">${esc(msg)}</p>`:''}</section></div>`;
  const f=$('#main').querySelector('input');if(f)f.focus();
}
document.addEventListener('submit',async ev=>{
  const f=ev.target;const k=f.dataset.gate;if(!k)return;ev.preventDefault();ev.stopImmediatePropagation();
  const btn=f.querySelector('button');if(btn){btn.disabled=true;btn.style.opacity=.6}
  try{
    if(k==='login'){const email=$('#gEmail').value.trim();const {error}=await SB.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;gate('sent',email)}
    else if(k==='create'){const {data,error}=await SB.rpc('create_household',{p_name:$('#gHome').value.trim()});if(error)throw error;await enter(USER)}
    else if(k==='join'){const {error}=await SB.rpc('join_household',{p_code:$('#gCode').value.trim().toUpperCase()});if(error)throw new Error(/too many/i.test(error.message)?'Too many tries. Wait an hour and try again.':/not found/i.test(error.message)?'That join code did not match a household. Check it and try again.':'Could not join. Please try again.');await enter(USER)}
  }catch(e){gate(k==='login'?'login':'household',e.message||'Please try again.')}
},true);
document.addEventListener('click',async ev=>{
  const b=ev.target.closest('[data-gate-act]');if(!b)return;const a=b.dataset.gateAct;
  if(a==='demo'){ls.set('hf_demo','1');startLocal()}
  else if(a==='back')gate('login');
  else if(a==='reload')location.reload();
  else if(a==='signout'){await SB.auth.signOut();gate('login')}
});

async function enter(session){
  USER=session&&session.user?session:USER;const u=USER.user;USER_EMAIL=u.email||'';
  const {data:mem,error}=await SB.from('household_members').select('household_id, households(id,name,join_code)').eq('user_id',u.id).order('joined_at',{ascending:true}).limit(1);
  if(error)return gate('error',error.message);
  if(!mem||!mem.length)return gate('household');
  HH=mem[0].household_id;HHINFO=mem[0].households;
  const {data:rows,error:e2}=await SB.from('items').select('col,id,data').eq('household_id',HH);
  if(e2)return gate('error',e2.message);
  COLS.forEach(c=>S[c]=[]);S.settings={};
  rows.forEach(r=>{if(r.col==='settings')S.settings=cleanSettings(r.data);else if(S[r.col]){const o=clean(r.col,r.id,r.data);if(o)S[r.col].push(o)}});
  S.mode='sb';S.ready=true;showChrome(true);render();runRecurring();
  if(CHANNEL)SB.removeChannel(CHANNEL);
  CHANNEL=SB.channel('hh-'+HH)
    .on('postgres_changes',{event:'*',schema:'public',table:'items',filter:'household_id=eq.'+HH},p=>applyChange(p))
    .subscribe();
}
function applyChange(p){
  const r=p.new;if(!r||r.household_id!==HH||!r.col)return;
  if(r.col==='settings'){S.settings=cleanSettings(r.data);return refresh()}
  if(!S[r.col])return;
  const o=clean(r.col,r.id,r.data);
  S[r.col]=S[r.col].filter(x=>x.id!==r.id);if(o)S[r.col].push(o);
  refresh();
}

(async()=>{
  const cfg=window.HOMEFLOW_CONFIG||{};
  const ok=cfg.supabaseUrl&&cfg.supabaseAnonKey&&!/YOUR_/.test(cfg.supabaseUrl+cfg.supabaseAnonKey)&&window.supabase;
  if(!ok){startLocal();return}
  SB=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,detectSessionInUrl:true,flowType:'pkce'}});
  let entered=false;
  SB.auth.onAuthStateChange((ev,session)=>{if(session&&!entered&&(ev==='SIGNED_IN'||ev==='INITIAL_SESSION')){entered=true;enter(session)}});
  const {data:{session}}=await SB.auth.getSession();
  if(session){if(!entered){entered=true;enter(session)}}
  else if(ls.get('hf_demo')==='1')startLocal();
  else gate('login');
})();
