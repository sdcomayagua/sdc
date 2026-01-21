(() => {
  const CFG = window.SDC_CONFIG;
  const U = window.SDC_UTILS;

  const API_URL = CFG.API_URL;
  const LOCAL_ALLOW = new Set(CFG.LOCAL_ALLOW || []);

  let DATA = null;
  let products = [];
  let categories = [];
  let subcatsByCat = new Map();
  let cart = new Map(); // id -> {p, qty}
  let activeCat = "Todas";
  let activeSub = "Todas";

  const isLocal = (dep, mun) => LOCAL_ALLOW.has(`${dep}|${mun}`);

  function updateCartCount() {
    let count = 0;
    for (const it of cart.values()) count += it.qty;
    U.$("cartCount").textContent = count;
  }

  async function loadCatalog() {
    U.$("statusPill").textContent = "Cargando catálogo...";
    const res = await fetch(`${API_URL}?action=catalog`, { cache: "no-store" });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "No se pudo cargar");
    DATA = json;

    products = (json.productos || []).filter(p => p && p.nombre && p.categoria);
    products.sort((a, b) => {
      const sa = (Number(a.stock) > 0) ? 0 : 1;
      const sb = (Number(b.stock) > 0) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      const oa = Number(a.orden || 0), ob = Number(b.orden || 0);
      if (oa !== ob) return oa - ob;
      return String(a.nombre).localeCompare(String(b.nombre));
    });

    const cats = new Set(products.map(p => p.categoria || ""));
    categories = ["Todas", ...Array.from(cats).filter(Boolean).sort((a, b) => a.localeCompare(b))];

    subcatsByCat = new Map();
    for (const p of products) {
      const c = p.categoria || "";
      const s = p.subcategoria || "";
      if (!subcatsByCat.has(c)) subcatsByCat.set(c, new Set());
      if (s) subcatsByCat.get(c).add(s);
    }

    renderTabs();
    renderSubTabs();
    renderGrid();
    initLocationSelectors();

    U.$("statusPill").textContent = `Catálogo listo (${products.length} productos)`;
  }

  function renderTabs() {
    const el = U.$("catTabs");
    el.innerHTML = "";
    categories.forEach(c => {
      const d = document.createElement("div");
      d.className = "tab" + (c === activeCat ? " active" : "");
      d.textContent = c;
      d.onclick = () => { activeCat = c; activeSub = "Todas"; renderTabs(); renderSubTabs(); renderGrid(); };
      el.appendChild(d);
    });
  }

  function renderSubTabs() {
    const el = U.$("subTabs");
    el.innerHTML = "";
    let subs = [];
    if (activeCat === "Todas") {
      const all = new Set();
      for (const set of subcatsByCat.values()) for (const s of set) all.add(s);
      subs = ["Todas", ...Array.from(all).sort((a, b) => a.localeCompare(b))];
    } else {
      const set = subcatsByCat.get(activeCat) || new Set();
      subs = ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }
    subs.forEach(s => {
      const d = document.createElement("div");
      d.className = "tab" + (s === activeSub ? " active" : "");
      d.textContent = s;
      d.onclick = () => { activeSub = s; renderSubTabs(); renderGrid(); };
      el.appendChild(d);
    });
  }

  function renderGrid() {
    const q = (U.$("q").value || "").trim().toLowerCase();
    let list = products;

    if (activeCat !== "Todas") list = list.filter(p => p.categoria === activeCat);
    if (activeSub !== "Todas") list = list.filter(p => p.subcategoria === activeSub);
    if (q) list = list.filter(p => (p.nombre || "").toLowerCase().includes(q) || (p.tags || "").toLowerCase().includes(q));

    const el = U.$("grid");
    el.innerHTML = "";
    list.forEach(p => {
      const inStock = Number(p.stock || 0) > 0;
      const card = document.createElement("div");
      card.className = "card";

      const img = document.createElement("img");
      img.className = "img";
      img.loading = "lazy";
      img.src = p.imagen || "";
      img.alt = p.nombre || "";
      img.onerror = () => {
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><rect width='100%' height='100%' fill='#0a0f17'/><text x='50%' y='50%' fill='#9fb0c6' font-size='28' text-anchor='middle' dominant-baseline='middle'>Sin imagen</text></svg>`
        );
      };

      const box = document.createElement("div");
      box.className = "p";
      box.innerHTML = `
        <div class="name">${U.esc(p.nombre || "")}</div>
        <div class="mut">${U.esc(p.categoria || "")}${p.subcategoria ? (" • " + U.esc(p.subcategoria)) : ""}</div>
        <div class="price">${U.money(p.precio, CFG.CURRENCY)}</div>
      `;

      const badge = document.createElement("div");
      badge.className = "badge " + (inStock ? "off" : "out");
      badge.textContent = inStock ? `Stock: ${Number(p.stock)}` : "AGOTADO";

      const btn = document.createElement("button");
      btn.className = "btn acc";
      btn.style.width = "100%";
      btn.style.marginTop = "10px";
      btn.textContent = inStock ? "Añadir al carrito" : "No disponible";
      btn.disabled = !inStock;
      btn.onclick = () => addToCart(p);

      box.appendChild(badge);
      box.appendChild(btn);
      card.appendChild(img);
      card.appendChild(box);
      el.appendChild(card);
    });
  }

  function addToCart(p) {
    const id = p.id || p.nombre;
    const cur = cart.get(id);
    const stock = Number(p.stock || 0);
    const next = (cur ? cur.qty : 0) + 1;
    if (next > stock) { U.toast("No hay stock suficiente"); return; }
    cart.set(id, { p, qty: next });
    updateCartCount();
    U.toast("Agregado al carrito");
  }

  function openCart() {
    U.$("cartModal").classList.add("open");
    renderCart();
    computeSummary();
  }
  function closeCart() {
    U.$("cartModal").classList.remove("open");
  }

  function renderCart() {
    const el = U.$("cartItems");
    el.innerHTML = "";
    if (cart.size === 0) { el.innerHTML = `<div class="note">Tu carrito está vacío.</div>`; return; }

    for (const [id, it] of cart.entries()) {
      const p = it.p;
      const row = document.createElement("div");
      row.className = "cartItem";
      row.innerHTML = `
        <img src="${U.escAttr(p.imagen || "")}" alt="">
        <div style="flex:1">
          <div style="font-weight:900">${U.esc(p.nombre || "")}</div>
          <div class="mut">${U.esc(p.categoria || "")}${p.subcategoria ? (" • " + U.esc(p.subcategoria)) : ""}</div>
          <div style="margin-top:6px;font-weight:900">${U.money(p.precio, CFG.CURRENCY)} <span class="mut">x ${it.qty}</span></div>
        </div>
        <div class="qty">
          <button class="mini" data-act="minus" data-id="${U.escAttr(id)}">-</button>
          <div style="min-width:22px;text-align:center;font-weight:900">${it.qty}</div>
          <button class="mini" data-act="plus" data-id="${U.escAttr(id)}">+</button>
          <button class="mini" data-act="del" data-id="${U.escAttr(id)}">🗑</button>
        </div>
      `;
      row.querySelectorAll("button").forEach(b => {
        b.onclick = () => {
          const act = b.getAttribute("data-act");
          const pid = b.getAttribute("data-id");
          const item = cart.get(pid);
          if (!item) return;
          const stock = Number(item.p.stock || 0);

          if (act === "minus") item.qty = Math.max(1, item.qty - 1);
          if (act === "plus") {
            if (item.qty + 1 > stock) { U.toast("No hay stock suficiente"); return; }
            item.qty += 1;
          }
          if (act === "del") { cart.delete(pid); updateCartCount(); renderCart(); computeSummary(); return; }

          cart.set(pid, item);
          updateCartCount();
          renderCart();
          computeSummary();
        };
      });
      el.appendChild(row);
    }
  }

  function initLocationSelectors() {
    const deps = new Set((DATA.municipios || []).map(x => x.departamento).filter(Boolean));
    const depSel = U.$("dep");
    depSel.innerHTML = "";
    Array.from(deps).sort((a, b) => a.localeCompare(b)).forEach(d => {
      const o = document.createElement("option");
      o.value = d; o.textContent = d;
      depSel.appendChild(o);
    });
    depSel.onchange = fillMunicipios;
    U.$("mun").onchange = updateDelivery;
    U.$("payType").onchange = () => { toggleCashBox(); computeSummary(); };
    U.$("cashAmount").oninput = computeSummary;
    fillMunicipios();
  }

  function fillMunicipios() {
    const dep = U.$("dep").value;
    const munSel = U.$("mun");
    munSel.innerHTML = "";
    const list = (DATA.municipios || []).filter(x => x.departamento === dep).map(x => x.municipio);
    list.sort((a, b) => a.localeCompare(b)).forEach(m => {
      const o = document.createElement("option");
      o.value = m; o.textContent = m;
      munSel.appendChild(o);
    });
    updateDelivery();
  }

  function updateDelivery() {
    const dep = U.$("dep").value;
    const mun = U.$("mun").value;
    const local = isLocal(dep, mun);

    const sel = U.$("deliveryType");
    sel.innerHTML = "";
    const o = document.createElement("option");
    o.value = local ? "local" : "empresa";
    o.textContent = local ? "ENTREGA LOCAL (Comayagua y alrededores)" : "ENVÍO NACIONAL (C807 / Cargo Expreso / Forza)";
    sel.appendChild(o);

    U.$("deliveryNote").textContent = local ? "Entrega local: pagar al recibir." : "Envío nacional: contra entrega o prepago.";
    if (local) U.$("payType").value = "pagar_al_recibir";

    toggleCashBox();
    computeSummary();
  }

  function toggleCashBox() {
    const dep = U.$("dep").value;
    const mun = U.$("mun").value;
    const local = isLocal(dep, mun);
    const pay = U.$("payType").value;

    U.$("cashBox").style.display = (local && pay === "pagar_al_recibir") ? "block" : "none";

    U.$("payNote").textContent = local
      ? "PAGAR AL RECIBIR: se confirma monto para cambio."
      : (pay === "prepago"
        ? `PREPAGO: deposita producto + envío (${U.money(CFG.NATIONAL_PREPAGO, CFG.CURRENCY)}).`
        : `CONTRA ENTREGA: paga a la empresa producto + envío (${U.money(CFG.NATIONAL_CONTRA_ENTREGA, CFG.CURRENCY)}).`);
  }

  function computeSummary() {
    const sum = U.$("summary");
    if (cart.size === 0) { sum.innerHTML = `<div class="note">Agrega productos para ver el total.</div>`; return; }

    const dep = U.$("dep").value;
    const mun = U.$("mun").value;
    const local = isLocal(dep, mun);
    const pay = U.$("payType").value;

    let subtotal = 0;
    for (const it of cart.values()) subtotal += Number(it.p.precio || 0) * it.qty;

    let shipping = 0;
    if (!local) shipping = (pay === "prepago") ? CFG.NATIONAL_PREPAGO : CFG.NATIONAL_CONTRA_ENTREGA;

    const totalNow = subtotal + ((!local && pay === "prepago") ? shipping : 0);

    const cash = Number((U.$("cashAmount").value || "").replace(/[^\d.]/g, "") || 0);
    const change = (local && pay === "pagar_al_recibir" && cash > 0) ? Math.max(0, cash - subtotal) : 0;

    sum.innerHTML = `
      <div class="sum"><div>Subtotal</div><div>${U.money(subtotal, CFG.CURRENCY)}</div></div>
      <div class="sum"><div>Envío</div><div>${(!local && pay === "prepago") ? U.money(shipping, CFG.CURRENCY) : "Se paga a empresa / coordina"}</div></div>
      <div class="sum total"><div>Total a pagar ahora</div><div>${U.money(totalNow, CFG.CURRENCY)}</div></div>
      ${local && pay === "pagar_al_recibir" ? (cash > 0
        ? `<div class="note" style="margin-top:8px">Paga con: ${U.money(cash, CFG.CURRENCY)} → Cambio estimado: ${U.money(change, CFG.CURRENCY)}</div>`
        : `<div class="note" style="margin-top:8px">Para calcular cambio, escribe “¿con cuánto pagará?”</div>`) : ""}
    `;
  }

  function buildWhatsAppMessage() {
    const dep = U.$("dep").value;
    const mun = U.$("mun").value;
    const local = isLocal(dep, mun);
    const pay = U.$("payType").value;

    const name = U.$("name").value.trim();
    const phone = U.$("phone").value.trim();
    const addr = U.$("addr").value.trim();

    const lines = [];
    lines.push("🛒 *PEDIDO - Soluciones Digitales Comayagua*");
    lines.push(`📍 *Ubicación:* ${dep} - ${mun}`);
    lines.push(`🚚 *Entrega:* ${local ? "Entrega Local" : "Envío Nacional (Empresa)"}`);
    lines.push(`💳 *Pago:* ${pay === "prepago" ? "PREPAGO" : "PAGAR AL RECIBIR"}`);

    if (local && pay === "pagar_al_recibir") {
      const cash = (U.$("cashAmount").value || "").trim();
      if (cash) lines.push(`💵 *Paga con:* ${cash}`);
    } else if (!local) {
      lines.push("📦 *Empresa:* C807 / Cargo Expreso / Forza");
      lines.push(`💰 *Envío:* ${pay === "prepago" ? U.money(CFG.NATIONAL_PREPAGO, CFG.CURRENCY) : U.money(CFG.NATIONAL_CONTRA_ENTREGA, CFG.CURRENCY)} (${pay === "prepago" ? "incluido en depósito" : "pagado a empresa"})`);
    }

    lines.push("");
    lines.push("🧾 *Productos:*");
    let subtotal = 0;
    for (const it of cart.values()) {
      const line = Number(it.p.precio || 0) * it.qty;
      subtotal += line;
      lines.push(`• ${it.qty} x ${it.p.nombre} — ${U.money(line, CFG.CURRENCY)}`);
    }
    lines.push(`Subtotal: ${U.money(subtotal, CFG.CURRENCY)}`);

    if (!local && pay === "prepago") lines.push(`Total a depositar: ${U.money(subtotal + CFG.NATIONAL_PREPAGO, CFG.CURRENCY)}`);
    else lines.push(`Total producto: ${U.money(subtotal, CFG.CURRENCY)}`);

    lines.push("");
    lines.push("👤 *Cliente:*");
    if (name) lines.push(`Nombre: ${name}`);
    if (phone) lines.push(`Tel: ${phone}`);
    if (addr) lines.push(`Dirección: ${addr}`);

    return lines.join("\n");
  }

  function sendWhatsApp() {
    if (cart.size === 0) { U.toast("Carrito vacío"); return; }
    const msg = buildWhatsAppMessage();
    const phone = (DATA && DATA.whatsapp) ? DATA.whatsapp : CFG.DEFAULT_WHATSAPP;
    window.open("https://wa.me/" + phone.replace(/[^\d]/g, "") + "?text=" + encodeURIComponent(msg), "_blank");
  }

  // EVENTS
  U.$("q").addEventListener("input", renderGrid);
  U.$("cartBtn").onclick = openCart;
  U.$("closeCart").onclick = closeCart;
  U.$("cartModal").onclick = (e) => { if (e.target.id === "cartModal") closeCart(); };
  U.$("sendWA").onclick = sendWhatsApp;

  loadCatalog().catch(err => {
    console.error(err);
    U.$("statusPill").textContent = "Error cargando catálogo";
    U.toast("Error: " + (err.message || err));
  });
})();
