export const page = reactive(
  new Map([
    ['home', { name: '首页', url: '/pages/index/index' }],
    ['category', { name: '分类页', url: '/pages/category/index' }],
    ['brand', { name: '品牌号', url: '/pages/brand/index' }],
    ['mine', { name: '我的', url: '/pages/mine/index' }],
    ['diyPage', { name: '微页面', url: '/pages/diypage/index', query: 'id' }]
  ])
)
