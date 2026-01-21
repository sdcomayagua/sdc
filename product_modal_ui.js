window.SDC_PRODUCT_MODAL_UI = (() => {
  const U = window.SDC_UTILS;
  const SHARE = window.SDC_SHARE;

  function setChips(p){
    const el = document.getElementById("pmChips");
    if (!el) return;
    el.innerHTML = "";

    const chips = [];
    if (p.marca) chips.push({ t:`Marca: ${p.marca}` });
    if (p.modelo) chips.push({ t:`Modelo: ${p.modelo}` });
    if (p.garantia) chips.push({ t:`Garantía: ${p.garantia}` });
    if (p.condicion) chips.push({ t:`Condición: ${p.condicion}` });

    chips.forEach(c => {
      const s = document.createElement("span");
      s.className = "chip mini";
      s.textContent = c.t;
      el.appendChild(s);
    });

    el.style.display = chips.length ? "flex" : "none";
  }

  function setSpecs(p){
    const el = document.getElementById("pmSpecs");
    if (!el) return;

    const items = [];
    if (p.compatibilidad) items.push({ k:"Compatibilidad", v:p.compatibilidad });
    if (p.marca) items.push({ k:"Marca", v:p.marca });
    if (p.modelo) items.push({ k:"Modelo", v:p.modelo });

    el.innerHTML = "";
    if (!items.length){
      el.style.display = "none";
      return;
    }
    el.style.display = "grid";

    items.forEach(it => {
      const card = document.createElement("div");
      card.className = "specCard";
      card.innerHTML = `<div class="specK">${escapeHtml(it.k)}</div><div class="specV">${escapeHtml(it.v)}</div>`;
      el.appendChild(card);
    });
  }

  async function copyLink(p){
    const link = SHARE.shareLinkFor(p);
    const ok = await SHARE.copyToClipboard(link);
    U.toast(ok ? "Link copiado ✅" : "No se pudo copiar");
  }

  function waShare(p){
    const link = SHARE.shareLinkFor(p);
    const txt = `Hola, mira este producto:\n${p.nombre}\n${link}`;
    window.open("https://wa.me/?text=" + encodeURIComponent(txt), "_blank");
  }

  function setActions({p, video}){
    const el = document.getElementById("pmActions");
    if (!el) return;

    // video: {tiktok,youtube,facebook,generic}
    const btns = [];

    if (video.tiktok) btns.push({ label:"TikTok", icon:"🎵", href:video.tiktok });
    if (video.youtube) btns.push({ label:"YouTube", icon:"▶️", href:video.youtube });
    if (video.facebook) btns.push({ label:"Facebook", icon:"📘", href:video.facebook });
    if (!video.tiktok && !video.youtube && !video.facebook && video.generic) {
      btns.push({ label:"Video", icon:"🎬", href:video.generic });
    }

    el.innerHTML = "";

    btns.forEach(b => {
      const a = document.createElement("a");
      a.className = "btn ghost pmIconBtn";
      a.href = b.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = `<span class="pmI">${b.icon}</span><span class="pmL">Ver en ${b.label}</span>`;
      el.appendChild(a);
    });

    const copy = document.createElement("button");
    copy.className = "btn ghost pmIconBtn";
    copy.type = "button";
    copy.innerHTML = `<span class="pmI">🔗</span><span class="pmL">Copiar link</span>`;
    copy.onclick = () => copyLink(p);
    el.appendChild(copy);

    const w = document.createElement("button");
    w.className = "btn acc pmIconBtn";
    w.type = "button";
    w.innerHTML = `<span class="pmI">💬</span><span class="pmL">Compartir WhatsApp</span>`;
    w.onclick = () => waShare(p);
    el.appendChild(w);

    el.style.display = "flex";
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
  }

  return { setChips, setSpecs, setActions };
})();
