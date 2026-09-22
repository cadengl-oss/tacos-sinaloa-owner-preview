const copy={
  en:{menu:"Menu",call:"Call",call_now:"Call now ↗",directions:"Directions ↗",directions_short:"Directions",hours:"Hours",daily:"Monday — Sunday",location:"Location",phone:"Phone",call_menu:"Call for today's menu",intro_title:"Taquería & Carnicería",intro_copy:"Mexican food from the kitchen and a carnicería counter under one roof on Valley Blvd.",kitchen:"From the kitchen",menu_title:"Menu",menu_note:"Availability changes daily. Call to confirm today's menu.",today_menu:"Today's Menu",counter:"From the counter",counter_title:"Carnicería",counter_copy:"A neighborhood meat counter alongside the taquería. Call or stop in to ask about today's selection.",ask_counter:"Ask the counter ↗",visit:"Visit",visit_title:"Valley Blvd., Fontana"},
  es:{menu:"Menú",call:"Llamar",call_now:"Llamar ↗",directions:"Cómo llegar ↗",directions_short:"Direcciones",hours:"Horario",daily:"Lunes — Domingo",location:"Ubicación",phone:"Teléfono",call_menu:"Llama para confirmar el menú de hoy",intro_title:"Taquería y Carnicería",intro_copy:"Comida mexicana de la cocina y una carnicería bajo un mismo techo sobre Valley Blvd.",kitchen:"Desde la cocina",menu_title:"Menú",menu_note:"La disponibilidad cambia diariamente. Llama para confirmar el menú de hoy.",today_menu:"Menú de hoy",counter:"Desde el mostrador",counter_title:"Carnicería",counter_copy:"Una carnicería del barrio junto a la taquería. Llama o visítanos para preguntar por la selección de hoy.",ask_counter:"Pregunta en mostrador ↗",visit:"Visítanos",visit_title:"Valley Blvd., Fontana"}
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
