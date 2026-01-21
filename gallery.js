window.SDC_GALLERY = (() => {
  function parseGallery(p) {
    const imgs = [];
    if (p.imagen) imgs.push(String(p.imagen).trim());

    if (p.galeria) {
      String(p.galeria).split(",").forEach(u => {
        const s = String(u || "").trim();
        if (s) imgs.push(s);
      });
    }

    for (let i = 1; i <= 8; i++) {
      const k = "galeria_" + i;
      if (p[k]) {
        const s = String(p[k]).trim();
        if (s) imgs.push(s);
      }
    }

    const unique = [];
    const seen = new Set();
    for (const u of imgs) {
      if (!u) continue;
      if (seen.has(u)) continue;
      seen.add(u);
      unique.push(u);
      if (unique.length >= 8) break;
    }
    return unique;
  }

  return { parseGallery };
})();
