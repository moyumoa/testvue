
// 设置 rem 函数
function setRem () {
  const htmlWidth = document.documentElement.clientWidth || document.body.clinentWidth;
  const htmlDom = document.documentElement;
  htmlDom.style.fontSize = htmlWidth / 10 + "px"
  document.body.style.fontSize = 14 + 'px'
  // 设置页面根节点字体大小
}
// 初始化
setRem()
// 改变窗口大小时重新设置 rem
window.onresize = function () {
  setRem()
  // location.reload()
}