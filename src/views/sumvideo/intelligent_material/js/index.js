// 更新进度
// onProgress：实时更新进度
// onComplete：进度完成时触发回调
// start：开始递增进度，如果提供了初始进度，则从该进度开始递增
// end：立即将进度更新至100%，并触发结束时的回调
// 递增的间隔设置为200毫秒，以实现每秒递增5次左右的效果
class ProgressUpdater {
  constructor(onProgress, onComplete) {
    this.progress = 0
    this.interval = null
    this.onProgress = onProgress
    this.onComplete = onComplete
  }

  start(initialProgress = 0) {
    if (initialProgress < 0 || initialProgress > 100) {
      initialProgress = 0
    }
    this.progress = initialProgress
    this.interval = setInterval(() => {
      if (this.progress < 99) {
        this.progress += 1 // 平滑递增
        this.onProgress(this.progress)
      } else {
        clearInterval(this.interval)
        this.interval = null
        this.progress = 99 // 停止在99
        this.onProgress(this.progress)
      }
    }, 200) // 每200毫秒递增一次，大约等于每秒递增5次
  }

  end(endProgress) {
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.progress = endProgress
    this.onProgress(this.progress)
    if (typeof this.onComplete === 'function') {
      this.onComplete()
    }
  }
}
export default ProgressUpdater
