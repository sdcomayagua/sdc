window.SDC_PAGER = (() => {
  let pageSize = 24;
  let visible = 24;
  let key = "";

  function setPageSize(n){
    pageSize = Math.max(8, Number(n||24));
    visible = pageSize;
  }

  function reset(newKey){
    key = String(newKey||"");
    visible = pageSize;
  }

  function ensureKey(newKey){
    const k = String(newKey||"");
    if (k !== key) reset(k);
  }

  function loadMore(){
    visible += pageSize;
  }

  function slice(list){
    return list.slice(0, Math.min(visible, list.length));
  }

  function canLoadMore(total){
    return visible < Number(total||0);
  }

  return { setPageSize, ensureKey, loadMore, slice, canLoadMore };
})();
