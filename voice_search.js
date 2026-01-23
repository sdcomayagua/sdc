// voice_search.js
window.SDC_VOICE = (() => {
  function supported(){
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function injectBtn(){
    const q = document.getElementById("q");
    if (!q) return;
    const wrap = q.closest(".search");
    if (!wrap) return;

    // si no soporta, no mostramos
    if (!supported()) return;

    // si ya existe, listo
    if (document.getElementById("voiceBtn")) return;

    const b = document.createElement("button");
    b.id = "voiceBtn";
    b.type = "button";
    b.className = "voiceIn";
    b.textContent = "🎤";
    b.title = "Buscar por voz";

    wrap.appendChild(b);

    b.onclick = () => start();
  }

  function start(){
    if (!supported()) return;

    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Rec();
    rec.lang = "es-HN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    window.SDC_UTILS?.toast?.("🎤 Escuchando...");

    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript || "";
      const q = document.getElementById("q");
      if (!q) return;
      q.value = text;
      q.dispatchEvent(new Event("input", { bubbles:true }));
      window.SDC_UTILS?.toast?.("✅ " + text);
    };

    rec.onerror = () => window.SDC_UTILS?.toast?.("No se pudo usar voz");
    rec.start();
  }

  function init(){
    injectBtn();
  }

  return { init };
})();