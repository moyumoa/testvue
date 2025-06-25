// 计算字幕入参时的坐标信息(375 * 667)相对于1080*1920
export function getTextPoint(x, y) {
  x = x || 0
  const previewInfo = {
    w: 375,
    h: 667
  }
  const finX = (x / previewInfo.w) * 1080
  const finY = y === undefined ? undefined : (y / previewInfo.h) * 1920
  return {
    finX,
    finY
  }
}
