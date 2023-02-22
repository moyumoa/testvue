
// 单个页面
let singleRouter = [
  // 登录
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录',
    },
    component: () => import('@/views/login/login.vue')
  },
  // 登陆后选择公司中间页
  {
    path: '/login_company',
    name: 'login_company',
    meta: {
      title: '选择公司',
      blueHead: true,
    },
    component: () => import('@/views/login_company/login_company.vue')
  },
  // 上传页面
  {
    path: '/home',
    name: 'home',
    meta: {
      title: '首页',
      blueHead: true,
    },
    component: () => import('@/views/home/home.vue')
  },
  {
    path: '*',
    redirect: '/home'
  },
  // 404
  {
    path: '/404',
    name: 'error_404',
    meta: {
      isBackNav: true
    },
    component: () => import('@/views/common/404.vue')
  },
]
// 废弃路由
// let bandonedRouter = []
export default [...singleRouter]
