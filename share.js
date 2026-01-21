window.SDC_SHARE = (() => {
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch {
        return false;
      }
    }
  }

  function shareLinkFor(p) {
    const base = window.location.origin + window.location.pathname;
    const id = encodeURIComponent(String(p.id || p.nombre || "").trim());
    return `${base}#p=${id}`;
  }

  function getHashProductId() {
    const h = String(window.location.hash || "");
    const m = h.match(/^#p=(.+)$/);
    if (!m) return "";
    return decodeURIComponent(m[1] || "").trim();
  }

  return { copyToClipboard, shareLinkFor, getHashProductId };
})();
