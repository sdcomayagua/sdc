// theme.js
window.SDC_THEME = (() => {
  const KEY = "SDC_THEME"; // "dark" | "light"

  function getSaved(){
    const v = localStorage.getItem(KEY);
    return (v === "light" || v === "dark") ? v : null;
  }

  function set(theme){
    const t = (theme === "light") ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(KEY, t);
    syncButtons();
  }

  function toggle(){
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    set(cur === "dark" ? "light" : "dark");
  }

  function syncButtons(){
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const isDark = cur === "dark";

    const icon = isDark ? "🌙" : "☀️";
    const text = isDark ? "Modo: Noche" : "Modo: Día";

    const top = document.getElementById("themeBtn");
    const bottom = document.getElementById("bottomThemeBtn");

    if (top) top.innerHTML = `<span class="tIcon">${icon}</span><span class="tText">${text}</span>`;
    if (bottom) bottom.innerHTML = `<span class="tIcon">${icon}</span>`;
  }

  function init(defaultTheme="dark"){
    set(getSaved() || defaultTheme);
  }

  return { init, toggle, set };
})();