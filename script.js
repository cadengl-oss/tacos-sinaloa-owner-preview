const copy={
  en:{signature_eyebrow:"FROM THE TAQUERÍA",signature_title:"Food first.",signature_copy:"A focused look at the food before anything else. Call for today’s menu and availability.",see_highlights:"See menu highlights ↓",menu_eyebrow:"CURRENTLY FEATURED",shop_eyebrow:"THE SHOP",shop_title:"At the shop",shop_copy:"Food and carnicería highlights from the Valley Blvd shop.",shop_tacos:"From the taquería",shop_kitchen:"From the kitchen",shop_counter:"Carnicería",shop_counter_note:"From the counter",choose_counter:"Choose your counter",choose_title:"Taquería / Carnicería",availability_short:"Call to confirm today’s menu and availability.",call_kitchen:"Call restaurant ↗",today_selection:"Today’s counter selection",counter_short:"Call or stop in to ask what’s available today.",call_counter:"Call restaurant ↗",reviews_eyebrow:"CUSTOMER NOTES",reviews_title:"What customers mention",reviews_copy:"Recent public feedback with the source and date shown.",reviews_note:"Review text is paraphrased. No aggregate rating is stored on this site.",service_note:"Dine-in · Takeout · Open daily 8 AM–8 PM",call_phone:"Call · (909) 823-6253",menu:"Menu",call:"Call",call_now:"Call now ↗",directions:"Directions ↗",directions_short:"Directions",hours:"Hours",daily:"Monday — Sunday",location:"Location",phone:"Phone",call_menu:"Call for today's menu",intro_title:"Taquería & Carnicería",intro_copy:"Mexican food from the kitchen and a carnicería counter under one roof on Valley Blvd.",kitchen:"From the kitchen",menu_title:"Kitchen highlights",menu_note:"A few highlights. Call for today’s full menu and availability.",today_menu:"Today’s selection ↗",counter:"From the counter",counter_title:"Carnicería",counter_copy:"A neighborhood meat counter alongside the taquería. Call or stop in to ask about today's selection.",ask_counter:"Ask the counter ↗",visit:"Visit",visit_title:"Valley Blvd., Fontana"},
  es:{signature_eyebrow:"DESDE LA TAQUERÍA",signature_title:"Primero, la comida.",signature_copy:"Una mirada directa a la comida. Llama para confirmar el menú y la disponibilidad de hoy.",see_highlights:"Ver destacados del menú ↓",menu_eyebrow:"DESTACADOS DE HOY",shop_eyebrow:"EL LOCAL",shop_title:"En el local",shop_copy:"Comida y detalles de la carnicería del local de Valley Blvd.",shop_tacos:"Desde la taquería",shop_kitchen:"Desde la cocina",shop_counter:"Carnicería",shop_counter_note:"Desde el mostrador",choose_counter:"Elige tu mostrador",choose_title:"Taquería / Carnicería",availability_short:"Llama para confirmar el menú y la disponibilidad de hoy.",call_kitchen:"Llamar al restaurante ↗",today_selection:"Selección de hoy",counter_short:"Llama o visítanos para preguntar qué hay disponible hoy.",call_counter:"Llamar al restaurante ↗",reviews_eyebrow:"NOTAS DE CLIENTES",reviews_title:"Lo que mencionan los clientes",reviews_copy:"Comentarios públicos recientes con la fuente y la fecha indicadas.",reviews_note:"El texto de las reseñas está parafraseado. Este sitio no guarda una calificación promedio.",service_note:"Comer aquí · Para llevar · Abierto diario 8 AM–8 PM",call_phone:"Llamar · (909) 823-6253",menu:"Menú",call:"Llamar",call_now:"Llamar ↗",directions:"Cómo llegar ↗",directions_short:"Direcciones",hours:"Horario",daily:"Lunes — Domingo",location:"Ubicación",phone:"Teléfono",call_menu:"Llama para confirmar el menú de hoy",intro_title:"Taquería y Carnicería",intro_copy:"Comida mexicana de la cocina y una carnicería bajo un mismo techo sobre Valley Blvd.",kitchen:"Desde la cocina",menu_title:"Destacados de la cocina",menu_note:"Algunos destacados. Llama para confirmar el menú completo y la disponibilidad de hoy.",today_menu:"Selección de hoy ↗",counter:"Desde el mostrador",counter_title:"Carnicería",counter_copy:"Una carnicería del barrio junto a la taquería. Llama o visítanos para preguntar por la selección de hoy.",ask_counter:"Pregunta en mostrador ↗",visit:"Visítanos",visit_title:"Valley Blvd., Fontana"}
};
let lang="en";
const toggle=document.querySelector(".language-toggle");

const menuRoot=document.getElementById("menuItems");
let publishedMenu=null;

function renderPublishedMenu(){
  if(!menuRoot||!publishedMenu||publishedMenu._publication_status!=="PUBLISHED"||!Array.isArray(publishedMenu.items)||!publishedMenu.items.length)return;
  const fragment=document.createDocumentFragment();
  publishedMenu.items.forEach((item,index)=>{
    const row=document.createElement("a");
    row.className="menu-row menu-chip is-visible"+(item.kind==="call_cta"?" menu-call-card":"");
    row.href="tel:+19098236253";
    row.dataset.menuId=String(item.id||index);
    const number=document.createElement("span");
    number.textContent=item.kind==="call_cta"?"CALL":String(index+1).padStart(2,"0");
    const label=document.createElement("strong");
    label.textContent=lang==="es"?(item.name_es||item.name_en||""):(item.name_en||item.name_es||"");
    row.append(number,label);
    fragment.append(row);
  });
  menuRoot.replaceChildren(fragment);
  menuRoot.dataset.menuState="published";
}

async function loadPublishedMenu(){
  if(!menuRoot)return;
  try{
    const response=await fetch("./content/menu.json",{cache:"no-cache"});
    if(!response.ok)throw new Error("menu HTTP "+response.status);
    const data=await response.json();
    if(data&&data._publication_status==="PUBLISHED"&&Array.isArray(data.items)&&data.items.length){
      publishedMenu=data;
      renderPublishedMenu();
    }
  }catch(error){
    menuRoot.dataset.menuState="fallback";
  }
}


const reviewRoot=document.getElementById("reviewItems");
let publishedReviews=null;

function formatReviewDate(value){
  const date=new Date(String(value||"")+"T12:00:00Z");
  if(Number.isNaN(date.getTime()))return String(value||"");
  return new Intl.DateTimeFormat(lang==="es"?"es-US":"en-US",{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"}).format(date);
}

function renderPublishedReviews(){
  if(!reviewRoot||!publishedReviews||publishedReviews._publication_status!=="PUBLISHED"||!Array.isArray(publishedReviews.items)||!publishedReviews.items.length)return;
  const fragment=document.createDocumentFragment();
  publishedReviews.items.slice(0,3).forEach(item=>{
    const article=document.createElement("article");
    article.className="review-item";
    const text=document.createElement("p");
    text.textContent=lang==="es"?(item.text_es||item.text_en||""):(item.text_en||item.text_es||"");
    const meta=document.createElement("div");
    meta.className="review-meta";
    const reviewer=document.createElement("span");
    reviewer.textContent=String(item.reviewer||"Customer");
    const time=document.createElement("time");
    time.dateTime=String(item.source_date||"");
    time.textContent=formatReviewDate(item.source_date);
    const source=document.createElement("a");
    source.href=String(item.source_url||"#");
    source.target="_blank";
    source.rel="noreferrer";
    source.textContent=String(item.source||"Google")+" ↗";
    meta.append(reviewer,time,source);
    article.append(text,meta);
    fragment.append(article);
  });
  reviewRoot.replaceChildren(fragment);
  reviewRoot.dataset.reviewState="published";
}

async function loadPublishedReviews(){
  if(!reviewRoot)return;
  try{
    const response=await fetch("./content/reviews.json",{cache:"no-cache"});
    if(!response.ok)throw new Error("reviews HTTP "+response.status);
    const data=await response.json();
    if(data&&data._publication_status==="PUBLISHED"&&Array.isArray(data.items)&&data.items.length){
      publishedReviews=data;
      renderPublishedReviews();
    }
  }catch(error){
    reviewRoot.dataset.reviewState="fallback";
  }
}
function renderLanguage(){
  document.documentElement.lang=lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{const v=copy[lang][el.dataset.i18n];if(v)el.innerHTML=v});
  toggle.innerHTML=lang==="en"?'<span class="lang-active">EN</span><i>/</i><span>ES</span>':'<span>EN</span><i>/</i><span class="lang-active">ES</span>';
  toggle.setAttribute("aria-pressed",lang==="es"?"true":"false");
  toggle.setAttribute("aria-label",lang==="en"?"Cambiar a español":"Switch to English");
  if(counterTabList)counterTabList.setAttribute("aria-label",lang==="en"?"Choose Taquería or Carnicería":"Elige Taquería o Carnicería");
  renderPublishedMenu();
  renderPublishedReviews();
}
toggle.addEventListener("click",()=>{lang=lang==="en"?"es":"en";renderLanguage()});
loadPublishedMenu();
loadPublishedReviews();
document.getElementById("year").textContent=new Date().getFullYear();
const hero=document.querySelector(".hero");
if(hero){
  const barObserver=new IntersectionObserver(([entry])=>{
    document.body.classList.toggle("bar-visible",!entry.isIntersecting);
  },{threshold:.08});
  barObserver.observe(hero);
}

const motionQuery=matchMedia("(prefers-reduced-motion: reduce)");
const motionOK=!motionQuery.matches;
if(motionOK){
  document.documentElement.classList.add("motion-ready");
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.add("hero-entered")));

  const motionItems=[...document.querySelectorAll("[data-motion]")];
  const motionObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        motionObserver.unobserve(entry.target);
      }
    });
  },{threshold:.08,rootMargin:"0px 0px -7% 0px"});
  motionItems.forEach((el,i)=>{
    el.style.transitionDelay=(Math.min((i%4)*55,165))+"ms";
    motionObserver.observe(el);
  });

  const sections=[...document.querySelectorAll("[data-motion-section]")];
  const sectionObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("is-motion-visible");
        sectionObserver.unobserve(entry.target);
      }
    });
  },{threshold:.02,rootMargin:"0px 0px -12% 0px"});
  sections.forEach(el=>sectionObserver.observe(el));

  const heroCore=document.querySelector(".hero-core");
  let ticking=false;
  const updateHeroMotion=()=>{
    ticking=false;
    if(!heroCore)return;
    const y=Math.max(0,scrollY);
    const shift=Math.min(y*.028,18);
    const scale=1-Math.min(y/14000,.022);
    heroCore.style.transform="translate3d(0,"+shift+"px,0) scale("+scale+")";
  };
  addEventListener("scroll",()=>{
    if(!ticking){
      ticking=true;
      requestAnimationFrame(updateHeroMotion);
    }
  },{passive:true});
  updateHeroMotion();

  setTimeout(()=>{
    motionItems.forEach(el=>el.classList.add("is-visible"));
    sections.forEach(el=>el.classList.add("is-motion-visible"));
  },1800);
}

const counterTabs=[...document.querySelectorAll(".counter-tab")];
const counterPanels=[...document.querySelectorAll(".counter-panel")];
const counterTabList=document.querySelector(".counter-tabs");

function setCounter(index,focus=false){
  const previous=counterTabs.findIndex(tab=>tab.getAttribute("aria-selected")==="true");
  if(previous===index){
    if(focus)counterTabs[index].focus();
    return;
  }
  counterTabs.forEach((tab,i)=>{
    const active=i===index;
    tab.classList.toggle("is-active",active);
    tab.setAttribute("aria-selected",active?"true":"false");
    tab.tabIndex=active?0:-1;
  });
  counterPanels.forEach((panel,i)=>{
    panel.hidden=i!==index;
    panel.classList.toggle("is-active",i===index);
    if(i===index)panel.querySelectorAll("[data-motion]").forEach(el=>el.classList.add("is-visible"));
  });
  if(counterTabList)counterTabList.dataset.active=String(index);

  const panel=counterPanels[index];
  const motionAllowed=!matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(panel&&motionAllowed&&previous!==-1){
    const direction=index>previous?1:-1;
    const media=panel.querySelector(".counter-panel-media");
    const copy=panel.querySelector(".counter-panel-copy");
    panel.classList.add("is-switching-in");
    if(media)media.animate([
      {clipPath:direction>0?"inset(0 0 0 100%)":"inset(0 100% 0 0)"},
      {clipPath:"inset(0 0 0 0)"}
    ],{duration:360,easing:"cubic-bezier(.65,0,.25,1)",fill:"both"});
    if(copy)copy.animate([
      {opacity:.35,transform:"translateY(7px)"},
      {opacity:1,transform:"translateY(0)"}
    ],{duration:300,easing:"cubic-bezier(.2,.7,.2,1)"});
    setTimeout(()=>panel.classList.remove("is-switching-in"),380);
  }
  if(focus)counterTabs[index].focus();
}
counterTabs.forEach((tab,index)=>{
  tab.addEventListener("click",()=>setCounter(index));
  tab.addEventListener("keydown",e=>{
    if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
      e.preventDefault();
      const delta=e.key==="ArrowRight"?1:-1;
      const next=(index+delta+counterTabs.length)%counterTabs.length;
      setCounter(next,true);
    }
    if(e.key==="Home"){e.preventDefault();setCounter(0,true)}
    if(e.key==="End"){e.preventDefault();setCounter(counterTabs.length-1,true)}
  });
});
setCounter(0);

function renderStatus(){
  const el=document.getElementById("liveStatus");
  if(!el)return;
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
  const hour=Number(parts.find(p=>p.type==="hour")?.value||0);
  const minute=Number(parts.find(p=>p.type==="minute")?.value||0);
  const mins=hour*60+minute;
  const open=mins>=480&&mins<1200;
  if(lang==="es")el.textContent=open?"ABIERTO AHORA · HASTA LAS 8 PM":"CERRADO · ABRE A LAS 8 AM";
  else el.textContent=open?"OPEN NOW · UNTIL 8 PM":"CLOSED · OPENS AT 8 AM";
}
renderStatus();
setInterval(renderStatus,60000);
addEventListener("focus",renderStatus);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)renderStatus()});
const oldRenderLanguage=renderLanguage;
renderLanguage=function(){oldRenderLanguage();renderStatus()};
