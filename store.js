window.SDC_UTILS = (() => {
  const $ = (id) => document.getElementById(id);

  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));

  const escAttr = (s) => String(s).replace(/"/g, "&quot;");

  const toast = (msg) => {
    const t = $("toast");
    if(!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1800);
  };

  const money = (n, currency) => `${currency}. ${Number(n||0).toFixed(2)}`;

  const fallbackImg = () =>
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>
        <rect width='100%' height='100%' fill='#0a0f17'/>
        <text x='50%' y='50%' fill='#9fb0c6' font-size='28' text-anchor='middle' dominant-baseline='middle'>Sin imagen</text>
      </svg>`
    );

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  return { $, esc, escAttr, toast, money, fallbackImg, fileToBase64 };
})();
