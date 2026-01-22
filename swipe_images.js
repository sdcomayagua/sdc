// swipe_images.js
window.SDC_SWIPE_IMAGES = (() => {
  function init(){
    const img = document.getElementById("pmMainImg");
    if (!img) return;

    let startX=0, endX=0;

    img.addEventListener("touchstart", (e)=>{
      startX = e.touches[0].clientX;
      endX = startX;
    }, { passive:true });

    img.addEventListener("touchmove", (e)=>{
      endX = e.touches[0].clientX;
    }, { passive:true });

    img.addEventListener("touchend", ()=>{
      const dx = endX - startX;
      if (Math.abs(dx) < 50) return;

      // usa un hook global si existe
      if (dx < 0) window.SDC_GALLERY_NAV?.next?.();
      else window.SDC_GALLERY_NAV?.prev?.();
    });
  }

  return { init };
})();