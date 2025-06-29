// 下载中心导出成功的遮罩回收监听屏幕宽度变化，如果改变了调用page_header.vue里的getDownLoadCenterToRight方法
class Bus {
  constructor() {
    this.list = {} // 收集订阅
  }

  // 订阅
  $on(name, fn) {
    this.list[name] = this.list[name] || []
    this.list[name].push(fn)
  }

  // 发布
  $emit(name, data) {
    // console.log('触发发布：this.list', this.list, 'name：', name, 'data：', data)
    if (this.list[name]) {
      this.list[name].forEach(fn => {
        fn(data)
      })
    }
  }

  // 取消订阅
  $off(name) {
    if (this.list[name]) {
      delete this.list[name]
    }
  }
}
export default new Bus()
