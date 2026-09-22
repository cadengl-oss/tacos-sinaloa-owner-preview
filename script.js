const copy={
  en:{
    nav_menu:"Menu",call:"Call",call_now:"Call now",directions:"Directions ↗",directions_short:"Directions",
    hero_intro:"Kitchen + counter. One neighborhood stop on Valley Blvd.",
    kitchen_kicker:"FROM THE KITCHEN",kitchen_title:"COME<br/><em>HUNGRY.</em>",kitchen_copy:"A casual Fontana stop for tacos and Mexican comfort food. Call for today's menu and availability.",
    popular_kicker:"POPULAR PICKS",popular_note:"Public listings highlight these favorites. Call to confirm the current menu, preparation and availability.",
    counter_kicker:"FROM THE COUNTER",counter_title:"CARNI<br/><em>CERÍA.</em>",counter_copy:"Fresh cuts and prepared meats are available from the counter. Call or stop in for today's selection.",ask_counter:"Ask the counter",
    place_copy:"Taquería and carnicería under one roof — practical, casual, and built for repeat visits.",
    visit_kicker:"COME THROUGH",visit_title:"SEE YOU<br/><em>ON VALLEY.</em>",hours:"HOURS",daily:"DAYS",phone:"PHONE"
  },
  es:{
    nav_menu:"Menú",call:"Llamar",call_now:"Llámanos",directions:"Cómo llegar ↗",directions_short:"Direcciones",
    hero_intro:"Cocina + mostrador. Una sola parada sobre Valley Blvd.",
    kitchen_kicker:"DESDE LA COCINA",kitchen_title:"LLEGA CON<br/><em>HAMBRE.</em>",kitchen_copy:"Un lugar casual en Fontana para tacos y comida mexicana. Llama para confirmar el menú y disponibilidad de hoy.",
    popular_kicker:"FAVORITOS",popular_note:"Los listados públicos destacan estos favoritos. Llama para confirmar el menú, la preparación y disponibilidad.",
    counter_kicker:"DESDE EL MOSTRADOR",counter_title:"CARNI<br/><em>CERÍA.</em>",counter_copy:"Cortes frescos y carnes preparadas están disponibles en el mostrador. Llama o visítanos para conocer la selección de hoy.",ask_counter:"Pregunta en mostrador",
    place_copy:"Taquería y carnicería bajo un mismo techo — práctico, casual y para volver seguido.",
    visit_kicker:"VEN A VERNOS",visit_title:"NOS VEMOS<br/><em>EN VALLEY.</em>",hours:"HORARIO",daily:"DÍAS",phone:"TELÉFONO"
  }
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
const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");io.unobserve(entry.target)}}),{threshold:.04,rootMargin:"0px 0px 90px"});
reveals.forEach(el=>io.observe(el));
setTimeout(()=>reveals.forEach(el=>el.classList.add("is-visible")),1400);
const tacoBuild=document.querySelector(".taco-build");
const tacoIo=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("is-active")}),{threshold:.28});
if(tacoBuild)tacoIo.observe(tacoBuild);
document.getElementById("year").textContent=new Date().getFullYear();