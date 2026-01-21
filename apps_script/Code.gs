/**
 * SDComayagua – Google Sheets backend (sin BD)
 * - doGet(): entrega catálogo completo para la tienda (JSON)
 * - doPost(): panel admin (CRUD) usando token
 *
 * IMPORTANTE:
 * 1) Publica como Web App (Ejecutar como: tú / Acceso: Cualquiera).
 * 2) En Properties (Project Settings > Script Properties):
 *    - ADMIN_TOKEN: (tu token secreto)
 *    - SPREADSHEET_ID: (ID de tu Google Sheets)
 *
 * Hojas esperadas (nombres recomendados):
 * - productos
 * - envios
 * - cupones
 * - municipios_hn
 * - zonas_comayagua_ciudad
 */
const SHEETS = {
  productos: "productos",
  envios: "envios",
  cupones: "cupones",
  municipios_hn: "municipios_hn",
  zonas_comayagua_ciudad: "zonas_comayagua_ciudad",
};

function doGet(_e){
  const data = readAll_();
  return respond_(200, data);
}

function doPost(e){
  try{
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = String(body.action || "").toLowerCase();

    // acciones admin
    if (["ping","list","upsert","delete"].indexOf(action) >= 0){
      requireAdmin_(e, body);
      const out = handleAdmin_(action, body);
      return respond_(200, out);
    }

    // fallback: si mandan algo raro, devolvemos catálogo
    return respond_(200, readAll_());
  }catch(err){
    return respond_(400, { ok:false, error: String(err) });
  }
}

/* -------------------- ADMIN -------------------- */
function handleAdmin_(action, body){
  if(action === "ping"){
    return { ok:true, message:"pong" };
  }

  if(action === "list"){
    return { ok:true, productos: readSheetObjects_(SHEETS.productos) };
  }

  if(action === "upsert"){
    const p = body.product || {};
    const clean = normalizeProduct_(p);
    if(!clean.id) throw new Error("Falta id");
    if(!clean.nombre) throw new Error("Falta nombre");
    if(!clean.categoria) throw new Error("Falta categoria");

    upsertById_(SHEETS.productos, "id", clean);
    return { ok:true, product: clean };
  }

  if(action === "delete"){
    const id = String(body.id || "").trim();
    if(!id) throw new Error("Falta id");
    deleteById_(SHEETS.productos, "id", id);
    return { ok:true, id:id };
  }

  throw new Error("Acción no soportada");
}

function requireAdmin_(e, body){
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("ADMIN_TOKEN");
  if(!token) throw new Error("ADMIN_TOKEN no configurado en Script Properties.");

  // Apps Script normaliza headers a minúsculas en e.parameter? no; usamos body.token + header X-ADMIN-TOKEN si está disponible
  const tBody = String(body.token || "").trim();
  let tHeader = "";
  try{
    // e.headers existe en algunos despliegues; si no, ignora
    tHeader = e && e.headers ? String(e.headers["X-ADMIN-TOKEN"] || e.headers["x-admin-token"] || "").trim() : "";
  }catch(_e){}
  const given = tHeader || tBody;

  if(given !== token) throw new Error("No autorizado.");
}

/* -------------------- CATÁLOGO (TIENDA) -------------------- */
function readAll_(){
  const out = {
    productos: readSheetObjects_(SHEETS.productos),
    envios: readSheetObjects_(SHEETS.envios),
    cupones: readSheetObjects_(SHEETS.cupones),
    municipios_hn: readSheetObjects_(SHEETS.municipios_hn),
    zonas_comayagua_ciudad: readSheetObjects_(SHEETS.zonas_comayagua_ciudad),
  };

  // Limpieza mínima para compatibilidad
  out.productos = (out.productos || []).map(function(p){
    return {
      id: str_(p.id),
      nombre: str_(p.nombre),
      precio: num_(p.precio),
      precio_anterior: num_(p.precio_anterior),
      stock: num_(p.stock),
      estado: str_(p.estado || "ACTIVO"),
      categoria: str_(p.categoria || "General"),
      subcategoria: str_(p.subcategoria || ""),
      subsubcategoria: str_(p.subsubcategoria || ""),
      variante: str_(p.variante || ""),
      descripcion: str_(p.descripcion || ""),
      imagen: str_(p.imagen || ""),
      galeria: str_(p.galeria || ""),
      video: str_(p.video || p.video_url || ""),
    };
  }).filter(function(p){ return p.id && p.nombre && p.estado !== "OCULTO"; });

  return out;
}

/* -------------------- SHEETS HELPERS -------------------- */
function ss_(){
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("SPREADSHEET_ID");
  if(!id) throw new Error("SPREADSHEET_ID no configurado en Script Properties.");
  return SpreadsheetApp.openById(id);
}

function getSheet_(name){
  const sh = ss_().getSheetByName(name);
  if(!sh) throw new Error("No existe la hoja: " + name);
  return sh;
}

function readSheetObjects_(sheetName){
  try{
    const sh = getSheet_(sheetName);
    const range = sh.getDataRange();
    const values = range.getValues();
    if(!values || values.length < 2) return [];
    const headers = values[0].map(function(h){ return String(h||"").trim(); });
    const out = [];
    for (var i=1;i<values.length;i++){
      var row = values[i];
      var obj = {};
      var empty = true;
      for (var c=0;c<headers.length;c++){
        var key = headers[c];
        if(!key) continue;
        obj[key] = row[c];
        if(String(row[c]||"").trim() !== "") empty = false;
      }
      if(!empty) out.push(obj);
    }
    return out;
  }catch(_e){
    return [];
  }
}

function ensureHeader_(sheetName, keyOrder){
  const sh = getSheet_(sheetName);
  const lastCol = Math.max(sh.getLastColumn(), 1);
  const headers = sh.getRange(1,1,1,lastCol).getValues()[0].map(str_);
  const have = {};
  headers.forEach(function(h){ if(h) have[h]=true; });
  const add = [];
  keyOrder.forEach(function(k){ if(!have[k]) add.push(k); });

  if(add.length){
    const newHeaders = headers.filter(Boolean).concat(add);
    sh.getRange(1,1,1,newHeaders.length).setValues([newHeaders]);
  }
  return sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(str_);
}

function upsertById_(sheetName, idKey, obj){
  const sh = getSheet_(sheetName);
  const keys = [
    "id","nombre","precio","precio_anterior","stock","estado",
    "categoria","subcategoria","subsubcategoria","variante",
    "imagen","galeria","video","descripcion"
  ];
  const headers = ensureHeader_(sheetName, keys);

  const id = str_(obj[idKey]);
  const lastRow = sh.getLastRow();
  if(lastRow < 2){
    sh.appendRow(headers.map(function(h){ return obj[h] !== undefined ? obj[h] : ""; }));
    return;
  }

  const idCol = headers.indexOf(idKey) + 1;
  if(idCol <= 0) throw new Error("No existe columna " + idKey);

  const ids = sh.getRange(2, idCol, lastRow-1, 1).getValues().map(function(r){ return str_(r[0]); });
  const idx = ids.indexOf(id);
  const rowIndex = idx >= 0 ? (idx + 2) : null;

  const row = headers.map(function(h){
    return obj[h] !== undefined ? obj[h] : "";
  });

  if(rowIndex){
    sh.getRange(rowIndex, 1, 1, headers.length).setValues([row]);
  }else{
    sh.appendRow(row);
  }
}

function deleteById_(sheetName, idKey, id){
  const sh = getSheet_(sheetName);
  const lastRow = sh.getLastRow();
  if(lastRow < 2) return;

  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(str_);
  const idCol = headers.indexOf(idKey) + 1;
  if(idCol <= 0) throw new Error("No existe columna " + idKey);

  const ids = sh.getRange(2, idCol, lastRow-1, 1).getValues().map(function(r){ return str_(r[0]); });
  const idx = ids.indexOf(str_(id));
  if(idx >= 0) sh.deleteRow(idx + 2);
}

/* -------------------- NORMALIZACIÓN -------------------- */
function normalizeProduct_(p){
  return {
    id: str_(p.id),
    nombre: str_(p.nombre),
    precio: num_(p.precio),
    precio_anterior: num_(p.precio_anterior),
    stock: num_(p.stock),
    estado: str_(p.estado || "ACTIVO"),
    categoria: str_(p.categoria || "General"),
    subcategoria: str_(p.subcategoria || ""),
    subsubcategoria: str_(p.subsubcategoria || ""),
    variante: str_(p.variante || ""),
    descripcion: str_(p.descripcion || ""),
    imagen: str_(p.imagen || ""),
    galeria: str_(p.galeria || ""),
    video: str_(p.video || ""),
  };
}

function str_(v){ return String(v||"").trim(); }
function num_(v){
  if(v === null || v === undefined || v === "") return 0;
  var n = Number(String(v).replace(/[^\d.]/g,""));
  return isNaN(n) ? 0 : n;
}

/* -------------------- RESPUESTA -------------------- */
function respond_(status, obj){
  const out = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  // CORS básico
  out.setHeader("Access-Control-Allow-Origin", "*");
  out.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  out.setHeader("Access-Control-Allow-Headers", "Content-Type, X-ADMIN-TOKEN");
  out.setHeader("Cache-Control", "no-store");
  return out;
}
