// d_delivery_bus_presets.js
// D) Sugerencias de costo bus para municipios de Comayagua fuera de local.
// Puedes editar esta tabla.

window.SDC_BUS_PRESETS = (() => {
  const PRESETS = {
    "Comayagua|La Libertad": 90,
    "Comayagua|Ojos de Agua": 80,
    "Comayagua|San Jerónimo": 70,
    "Comayagua|La Unión": 85,
    "Comayagua|Minas de Oro": 95,
  };

  function key(dep, mun){ return `${dep}|${mun}`; }

  function apply(){
    const dep = document.getElementById("dep")?.value || "";
    const mun = document.getElementById("mun")?.value || "";
    const k = key(dep, mun);

    const mode = document.getElementById("dp_delivery")?.value || "auto";
    const busInput = document.getElementById("dp_bus_cost");

    // solo si bus visible
    if (!busInput) return;
    const busBlock = document.getElementById("dp_bus_block");
    if (!busBlock || busBlock.style.display === "none") return;

    // solo autollenar si el usuario no escribió nada
    if (String(busInput.value||"").trim()) return;

    if (PRESETS[k]){
      busInput.value = String(PRESETS[k]);
      busInput.dispatchEvent(new Event("input",{bubbles:true}));
    }
  }

  function init(){
    // cuando cambie ubicación o modo
    ["dep","mun","dp_delivery"].forEach(id=>{
      document.addEventListener("change",(e)=>{
        if (e.target && e.target.id === id) setTimeout(apply, 50);
      }, true);
    });
  }

  return { init };
})();