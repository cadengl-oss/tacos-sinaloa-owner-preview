const copy={
en:{menu:"Menu",call:"Call",hours:"Hours",daily:"Monday — Sunday",phone:"Phone",call_today:"Call for today's menu & counter selection",story_title:"one roof.<br/><em>two counters.</em>",story_copy:"A neighborhood taquería and carnicería together on Valley Blvd — food from the kitchen, fresh cuts from the counter, and one easy stop in Fontana.",directions:"Directions ↗",menu_title:"today's<br/><em>favorites.</em>",menu_note:"Menu items and preparation can change. Call to confirm today's selection.",today_selection:"Today's menu",counter_kicker:"From the counter",counter_title:"carni<br/><em>cería.</em>",counter_copy:"Fresh cuts and prepared meats are available from the counter. Call or stop in for today's selection.",ask_counter:"Ask the counter",visit:"Visit",visit_title:"see you<br/><em>on valley.</em>",directions_short:"Directions"},
es:{menu:"Menú",call:"Llamar",hours:"Horario",daily:"Lunes — Domingo",phone:"Teléfono",call_today:"Llama para confirmar el menú y la selección del mostrador",story_title:"un lugar.<br/><em>dos mostradores.</em>",story_copy:"Taquería y carnicería juntas sobre Valley Blvd — comida de la cocina, cortes frescos del mostrador y una sola parada en Fontana.",directions:"Cómo llegar ↗",menu_title:"favoritos<br/><em>de hoy.</em>",menu_note:"Los platillos y preparaciones pueden cambiar. Llama para confirmar la selección de hoy.",today_selection:"Menú de hoy",counter_kicker:"Desde el mostrador",counter_title:"carni<br/><em>cería.</em>",counter_copy:"Cortes frescos y carnes preparadas están disponibles en el mostrador. Llama o visítanos para conocer la selección de hoy.",ask_counter:"Pregunta en mostrador",visit:"Visítanos",visit_title:"nos vemos<br/><em>en valley.</em>",directions_short:"Direcciones"}
};
let lang="en";
const toggle=document.querySelector(".language-toggle");
function renderLanguage(){
  document.documentElement.lang=lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{const v=copy[lang][el.dataset.i18n];if(v)el.innerHTML=v});
  toggle.innerHTML=lang==="en"?'<span class="lang-active">EN</span><i>/</i><span>ES</span>':'<span>EN</span><i>/</i><span class="lang-active">ES</span>';
  toggle.setAttribute("aria-pressed",lang==="es"?"true":"false");
  toggle.setAttribute("aria-label",lang==="en"?"Cambiar a español":"Switch to English");
}
toggle.addEventListener("click",()=>{lang=lang==="en"?"es":"en";renderLanguage()});
const reveals=[...document.querySelectorAll(".reveal")];
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");io.unobserve(e.target)}}),{threshold:.04,rootMargin:"0px 0px 90px"});
reveals.forEach(el=>io.observe(el));
setTimeout(()=>reveals.forEach(el=>el.classList.add("is-visible")),1400);
const hero=document.querySelector(".hero");
if(hero){
  const barObserver=new IntersectionObserver(([entry])=>document.body.classList.toggle("bar-visible",!entry.isIntersecting),{threshold:.08});
  barObserver.observe(hero);
}
document.getElementById("year").textContent=new Date().getFullYear();

const nav=document.querySelector(".site-nav");
const themedSections=[...document.querySelectorAll("[data-nav]")];
function updateNavTheme(){
  if(!nav||!themedSections.length)return;
  const probe=Math.min(innerHeight-1,nav.getBoundingClientRect().bottom+4);
  const section=themedSections.find(el=>{
    const r=el.getBoundingClientRect();
    return r.top<=probe && r.bottom>probe;
  }) || themedSections[0];
  nav.classList.toggle("nav-light",section.dataset.nav==="light");
  nav.classList.toggle("nav-dark",section.dataset.nav==="dark");
}
let navTick=false;
addEventListener("scroll",()=>{
  if(navTick)return;
  navTick=true;
  requestAnimationFrame(()=>{updateNavTheme();navTick=false});
},{passive:true});
addEventListener("resize",updateNavTheme);
updateNavTheme();
