export default  {
  bind: (el, binding) => {
    let throttleTime = binding.value; // 传入防抖时间
    if (!throttleTime) {
      throttleTime = 1000;
    }
    let timer;
    el.addEventListener('click', event => {
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
        }, throttleTime);
      } else {
        event && event.stopImmediatePropagation();
      }
    }, true);
  },
}