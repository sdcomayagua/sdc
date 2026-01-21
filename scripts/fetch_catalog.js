/**
 * Descarga el catálogo desde Apps Script (que lee Google Sheets)
 * y lo guarda como catalog.json en el repo para que GitHub Pages cargue rápido.
 */
const fs = require("fs");

const API_URL = process.env.API_URL;
if(!API_URL){
  console.error("Falta API_URL (env).");
  process.exit(1);
}

async function main(){
  const res = await fetch(API_URL, { cache: "no-store" });
  if(!res.ok){
    console.error("HTTP", res.status);
    process.exit(1);
  }
  const data = await res.json();

  // Normaliza estructura mínima
  const out = {
    productos: Array.isArray(data.productos) ? data.productos : [],
    envios: Array.isArray(data.envios) ? data.envios : [],
    cupones: Array.isArray(data.cupones) ? data.cupones : [],
    municipios_hn: Array.isArray(data.municipios_hn) ? data.municipios_hn : [],
    zonas_comayagua_ciudad: Array.isArray(data.zonas_comayagua_ciudad) ? data.zonas_comayagua_ciudad : [],
    _generated_at: new Date().toISOString(),
  };

  fs.writeFileSync("catalog.json", JSON.stringify(out, null, 2));
  console.log("OK -> catalog.json", out.productos.length, "productos");
}

main().catch(err=>{
  console.error(err);
  process.exit(1);
});
