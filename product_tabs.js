// product_tabs.js
window.SDC_PRODUCT_TABS = (() => {
  const TABS = ["desc","specs","videos"];

  function setActive(tab){
    const t = TABS.includes(tab) ? tab : "desc";

    // buttons
    TABS.forEach(x=>{
      const b = document.getElementById("pmTabBtn_" + x);
      if (b) b.classList.toggle("active", x === t);
    });

    // panels
    TABS.forEach(x=>{
      const p = document.getElementById("pmTab_" + x);
      if (p) p.style.display = (x === t) ? "block" : "none";
    });
  }

  function init(){
    document.getElementById("pmTabBtn_desc")?.addEventListener("click", ()=>setActive("desc"));
    document.getElementById("pmTabBtn_specs")?.addEventListener("click", ()=>setActive("specs"));
    document.getElementById("pmTabBtn_videos")?.addEventListener("click", ()=>setActive("videos"));
    setActive("desc");
  }

  return { init, setActive };
})();
