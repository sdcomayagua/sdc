window.SDC_THEME = (() => {
  const KEY = "SDC_THEME"; // "dark" | "light"

  function getSaved() {
    const v = localStorage.getItem(KEY);
    return (v === "light" || v === "dark") ? v : null;
  }

  function setTheme(theme) {
    const t = (theme === "light") ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(KEY, t);
    syncLabels();
  }

  function toggle() {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(cur === "dark" ? "light" : "dark");
  }

  function init(defaultTheme = "dark") {
    setTheme(getSaved() || defaultTheme);
  }

  function syncLabels() {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const isDark = cur === "dark";
    const label = isDark ? "Modo: Noche" : "Modo: Día";
    const icon = isDark ? "🌙" : "☀️";

    const b1 = document.getElementById("themeBtn");
    const b2 = document.getElementById("bottomThemeBtn");
    if (b1) b1.innerHTML = `<span class="tIcon">${icon}</span><span class="tText">${label}</span>`;
    if (b2) b2.innerHTML = `<span class="tIcon">${icon}</span><span class="tText">${label}</span>`;
  }

  return { init, toggle, setTheme };
})();
