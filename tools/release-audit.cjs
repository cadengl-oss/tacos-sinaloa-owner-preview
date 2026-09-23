#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const PUPPETEER="/opt/pse-remote-commander/releases/3e784a178070e66d75cb54f58ecd9f3ddf10ab60/node_modules/puppeteer";
const puppeteer=require(PUPPETEER);

const base=(process.env.BASE_URL||"https://tacos.pilotsalesdistribution.com").replace(/\/$/,"");
const expectedRelease=process.env.EXPECTED_RELEASE||"v6.13";
const expectedAssetToken=process.env.EXPECTED_ASSET_TOKEN||"20260922-v613";
const outDir=process.env.AUDIT_OUT||path.resolve(process.cwd(),"audit-output");
const viewports=[
  ["mobile",390,844],
  ["tablet",768,1024],
  ["desktop",1440,1000]
];

function assert(cond,msg,failures){ if(!cond) failures.push(msg); }
function cleanFileName(s){ return String(s).replace(/[^a-z0-9._-]+/gi,"-"); }

(async()=>{
  fs.mkdirSync(outDir,{recursive:true});
  const failures=[];
  const summary={base,expectedRelease,expectedAssetToken,checkedAt:new Date().toISOString(),viewports:[],fallbacks:{}};

  const health=await fetch(base+"/healthz",{cache:"no-store"});
  assert(health.ok,"healthz HTTP "+health.status,failures);
  if(health.ok){
    const h=await health.json();
    summary.health=h;
    assert(h.status==="ok","healthz status is not ok",failures);
    assert(h.release===expectedRelease,"release mismatch: expected "+expectedRelease+" got "+h.release,failures);
  }

  const browser=await puppeteer.launch({
    headless:true,
    executablePath:"/usr/bin/chromium",
    args:["--no-sandbox","--disable-gpu"]
  });

  for(const [name,width,height] of viewports){
    const page=await browser.newPage();
    await page.setViewport({width,height,deviceScaleFactor:1});
    await page.setCacheEnabled(false);
    await page.emulateMediaFeatures([{name:"prefers-reduced-motion",value:"reduce"}]);
    const pageErrors=[],consoleErrors=[],requestFailures=[];
    page.on("pageerror",e=>pageErrors.push(e.message));
    page.on("console",m=>{ if(m.type()==="error") consoleErrors.push(m.text()); });
    page.on("requestfailed",r=>requestFailures.push({url:r.url(),error:r.failure()?.errorText||"failed"}));

    const response=await page.goto(base+"/",{waitUntil:"networkidle0",timeout:30000});
    assert(response&&[200,304].includes(response.status()),name+": page HTTP "+(response?response.status():"no response"),failures);
    await page.evaluate(async()=>{
      if(document.fonts&&document.fonts.ready) await document.fonts.ready;
      const status=document.getElementById("liveStatus");
      if(status) status.textContent="STATUS · 8 AM–8 PM";
      const step=Math.max(360,Math.floor(innerHeight*.75));
      for(let y=0;y<document.documentElement.scrollHeight;y+=step){
        scrollTo(0,y);
        await new Promise(r=>setTimeout(r,35));
      }
      scrollTo(0,0);
      await new Promise(r=>setTimeout(r,80));
    });

    const data=await page.evaluate(()=>{
      const q=s=>document.querySelector(s);
      const rect=a=>a?Math.round(a.getBoundingClientRect().height*100)/100:null;
      return {
        scrollWidth:document.documentElement.scrollWidth,
        viewport:innerWidth,
        htmlLang:document.documentElement.lang,
        menuState:q("#menuItems")?.dataset.menuState||null,
        reviewState:q("#reviewItems")?.dataset.reviewState||null,
        menuCount:document.querySelectorAll("#menuItems .menu-row").length,
        reviewCount:document.querySelectorAll("#reviewItems .review-item").length,
        reviewHeading:q("#reviews-heading")?.textContent.trim()||"",
        visitTargets:[...document.querySelectorAll(".visit-links a")].map(a=>({text:a.textContent.trim(),height:rect(a),href:a.getAttribute("href")})),
        brokenImages:[...document.images].filter(i=>!i.closest("[hidden]")&&i.currentSrc&&(!i.complete||i.naturalWidth<1)).map(i=>i.getAttribute("src")),
        styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.getAttribute("href")),
        scripts:[...document.scripts].map(x=>x.getAttribute("src")).filter(Boolean)
      };
    });

    assert(data.scrollWidth<=data.viewport,name+": horizontal overflow "+data.scrollWidth+" > "+data.viewport,failures);
    assert(data.menuState==="published",name+": menu state "+data.menuState,failures);
    assert(data.reviewState==="published",name+": review state "+data.reviewState,failures);
    assert(data.menuCount>=4,name+": expected >=4 menu rows",failures);
    assert(data.reviewCount>=3,name+": expected >=3 review records",failures);
    assert(data.brokenImages.length===0,name+": broken images "+data.brokenImages.join(","),failures);
    assert(data.visitTargets.length>=2,name+": missing visit targets",failures);
    for(const target of data.visitTargets) assert(target.height>=44,name+": visit target below 44px: "+target.text+"="+target.height,failures);
    assert(data.styles.some(x=>(x||"").includes("styles.css?v="+expectedAssetToken)),name+": stylesheet release token missing/stale",failures);
    assert(data.scripts.some(x=>(x||"").includes("script.js?v="+expectedAssetToken)),name+": script release token missing/stale",failures);
    assert(pageErrors.length===0,name+": page errors: "+pageErrors.join(" | "),failures);
    assert(consoleErrors.length===0,name+": console errors: "+consoleErrors.join(" | "),failures);
    assert(requestFailures.length===0,name+": failed requests: "+requestFailures.map(x=>x.url).join(","),failures);

    if(name==="mobile"){
      await page.click(".language-toggle");
      await new Promise(r=>setTimeout(r,60));
      const es=await page.evaluate(()=>({
        lang:document.documentElement.lang,
        reviewHeading:document.getElementById("reviews-heading")?.textContent.trim()||"",
        visit:[...document.querySelectorAll(".visit-links a")].map(a=>a.textContent.trim()),
        menu:[...document.querySelectorAll("#menuItems .menu-row strong")].map(x=>x.textContent.trim())
      }));
      data.spanish=es;
      assert(es.lang==="es","mobile: language toggle did not set es",failures);
      assert(/mencionan/i.test(es.reviewHeading),"mobile: Spanish review heading missing",failures);
      assert(es.visit.some(x=>/Llamar/.test(x)),"mobile: Spanish call CTA missing",failures);
      assert(es.menu.some(x=>/(Menú de hoy|Selección de hoy)/i.test(x)),"mobile: Spanish menu did not re-render",failures);

      await page.click("#tab-carniceria");
      await page.waitForFunction(()=>{
        const img=document.querySelector("#panel-carniceria img");
        return img&&img.complete&&img.naturalWidth>0;
      },{timeout:5000}).catch(()=>{});
      const tab=await page.evaluate(()=>{
        const img=document.querySelector("#panel-carniceria img");
        return {
          selected:document.getElementById("tab-carniceria")?.getAttribute("aria-selected"),
          hidden:document.getElementById("panel-carniceria")?.hidden,
          imageLoaded:!!(img&&img.complete&&img.naturalWidth>0)
        };
      });
      data.carniceriaTab=tab;
      assert(tab.selected==="true"&&tab.hidden===false,"mobile: Carnicería tab failed",failures);
      assert(tab.imageLoaded===true,"mobile: Carnicería image failed after tab activation",failures);
    }

    const shot=path.join(outDir,cleanFileName(name)+".png");
    await page.screenshot({path:shot,fullPage:true});
    data.screenshot=shot;
    data.pageErrors=pageErrors;
    data.consoleErrors=consoleErrors;
    data.requestFailures=requestFailures;
    summary.viewports.push({name,...data});
    await page.close();
  }

  async function fallbackCheck(resource,kind){
    const page=await browser.newPage();
    await page.setViewport({width:390,height:844});
    await page.setRequestInterception(true);
    page.on("request",req=>req.url().endsWith(resource)?req.respond({status:503,contentType:"application/json",body:"{}"}):req.continue());
    await page.goto(base+"/",{waitUntil:"networkidle0",timeout:30000});
    const data=await page.evaluate(k=>{
      if(k==="menu") return {
        state:document.getElementById("menuItems")?.dataset.menuState,
        count:document.querySelectorAll("#menuItems .menu-row").length
      };
      return {
        state:document.getElementById("reviewItems")?.dataset.reviewState,
        count:document.querySelectorAll("#reviewItems .review-item").length,
        display:getComputedStyle(document.getElementById("reviewItems")).display,
        links:[...document.querySelectorAll(".review-actions a")].map(x=>x.textContent.trim())
      };
    },kind);
    await page.close();
    return data;
  }

  summary.fallbacks.menu=await fallbackCheck("/content/menu.json","menu");
  assert(summary.fallbacks.menu.state==="fallback","menu fallback state failed",failures);
  assert(summary.fallbacks.menu.count>=4,"menu fallback rows missing",failures);

  summary.fallbacks.reviews=await fallbackCheck("/content/reviews.json","reviews");
  assert(summary.fallbacks.reviews.state==="fallback","reviews fallback state failed",failures);
  assert(summary.fallbacks.reviews.count===0,"reviews fallback should contain no review cards",failures);
  assert(summary.fallbacks.reviews.display==="none","reviews fallback body should be hidden",failures);
  assert(summary.fallbacks.reviews.links.length>=2,"reviews fallback external links missing",failures);

  await browser.close();
  summary.failures=failures;
  fs.writeFileSync(path.join(outDir,"audit.json"),JSON.stringify(summary,null,2));
  if(failures.length){
    console.error("RELEASE_AUDIT=FAIL");
    for(const f of failures) console.error(" - "+f);
    process.exit(1);
  }
  console.log("RELEASE_AUDIT=PASS");
  console.log("release="+expectedRelease+" viewports="+viewports.length+" output="+outDir);
})().catch(err=>{console.error("RELEASE_AUDIT=ERROR",err);process.exit(2);});
