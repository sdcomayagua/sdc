// fallback_image.js
window.SDC_FALLBACK_IMG = (() => {
  const svg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b0f14"/>
      <stop offset="1" stop-color="#121823"/>
    </linearGradient>
    <radialGradient id="r" cx="50%" cy="35%" r="65%">
      <stop offset="0" stop-color="rgba(37,211,102,.18)"/>
      <stop offset="1" stop-color="rgba(37,211,102,0)"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="400" cy="260" r="240" fill="url(#r)"/>
  <g fill="none" stroke="rgba(159,176,198,.45)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
    <rect x="170" y="210" width="460" height="360" rx="32"/>
    <path d="M240 500l120-140 90 90 90-110 120 160"/>
    <circle cx="320" cy="320" r="30"/>
  </g>
  <text x="50%" y="690" fill="rgba(159,176,198,.85)" font-size="34" font-family="system-ui,Segoe UI,Roboto" text-anchor="middle">
    Imagen no disponible
  </text>
</svg>
  `);
  const url = "data:image/svg+xml;charset=utf-8," + svg;
  return { url };
})();
