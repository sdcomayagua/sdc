window.SDC_THANKS = (() => {
  const $ = (id)=>document.getElementById(id);

  function open(){
    $("thanksModal")?.classList.add("open");
  }
  function close(){
    $("thanksModal")?.classList.remove("open");
  }

  function init(){
    $("thanksClose")?.addEventListener("click", close);
    $("thanksContinue")?.addEventListener("click", () => {
      close();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    $("thanksModal")?.addEventListener("click", (e)=>{
      if (e.target.id === "thanksModal") close();
    });
  }

  return { init, open, close };
})();