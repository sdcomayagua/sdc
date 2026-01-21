window.SDC_UTILS = (() => {
  const $ = (id) => document.getElementById(id);

  const toast = (msg) => {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1800);
  };

  const money = (n, currency = "Lps") => `${currency}. ${Number(n || 0).toFixed(2)}`;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));

  const escAttr = (s) => String(s ?? "").replace(/"/g, "&quot;");

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  return { $, toast, money, esc, escAttr, fileToBase64 };
})();
