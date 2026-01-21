window.SDC_MEDIA = (() => {
  function normalizeUrl(url) {
    const s = String(url || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("//")) return "https:" + s;
    return "https://" + s;
  }

  function detectPlatform(url) {
    const u = String(url || "").toLowerCase();
    if (!u) return "generic";
    if (u.includes("tiktok.com")) return "tiktok";
    if (u.includes("youtu.be") || u.includes("youtube.com")) return "youtube";
    if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
    return "generic";
  }

  function bestVideo(p) {
    const tiktok = normalizeUrl(p.video_tiktok || "");
    const youtube = normalizeUrl(p.video_youtube || "");
    const facebook = normalizeUrl(p.video_facebook || "");
    const generic = normalizeUrl(p.video_url || p.video || "");

    if (!tiktok && !youtube && !facebook && generic) {
      const plat = detectPlatform(generic);
      if (plat === "tiktok") return { tiktok: generic, youtube: "", facebook: "", generic: "" };
      if (plat === "youtube") return { tiktok: "", youtube: generic, facebook: "", generic: "" };
      if (plat === "facebook") return { tiktok: "", youtube: "", facebook: generic, generic: "" };
      return { tiktok: "", youtube: "", facebook: "", generic };
    }

    return { tiktok, youtube, facebook, generic };
  }

  return { normalizeUrl, detectPlatform, bestVideo };
})();
