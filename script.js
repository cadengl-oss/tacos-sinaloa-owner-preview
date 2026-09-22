const copy={
  en:{menu:"Menu",call:"Call",call_now:"Call now ↗",directions:"Directions ↗",directions_short:"Directions",hours:"Hours",daily:"Monday — Sunday",location:"Location",phone:"Phone",call_menu:"Call for today's menu",intro_title:"Two counters.<br/>One neighborhood stop.",intro_copy:"Mexican food from the kitchen and a carnicería counter under one roof on Valley Blvd.",kitchen:"From the kitchen",menu_title:"Menu highlights",menu_note:"Public listings consistently mention these favorites. Call to confirm today's preparation and availability.",today_menu:"Today's Menu",counter:"From the counter",counter_title:"Carnicería",counter_copy:"A neighborhood meat counter alongside the taquería. Call or stop in to ask about today's selection.",ask_counter:"Ask the counter ↗",visit:"Visit",visit_title:"Valley Blvd.<br/>Fontana."},
  es:{menu:"Menú",call:"Llamar",call_now:"Llamar ↗",directions:"Cómo llegar ↗",directions_short:"Direcciones",hours:"Horario",daily:"Lunes — Domingo",location:"Ubicación",phone:"Teléfono",call_menu:"Llama para confirmar el menú de hoy",intro_title:"Dos mostradores.<br/>Una parada del barrio.",intro_copy:"Comida mexicana de la cocina y una carnicería bajo un mismo techo sobre Valley Blvd.",kitchen:"Desde la cocina",menu_title:"Favoritos del menú",menu_note:"Los listados públicos mencionan estos favoritos. Llama para confirmar la preparación y disponibilidad de hoy.",today_menu:"Menú de hoy",counter:"Desde el mostrador",counter_title:"Carnicería",counter_copy:"Una carnicería del barrio junto a la taquería. Llama o visítanos para preguntar por la selección de hoy.",ask_counter:"Pregunta en mostrador ↗",visit:"Visítanos",visit_title:"Valley Blvd.<br/>Fontana."}
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