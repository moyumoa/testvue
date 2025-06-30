
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
  {
    path: '/template_select',
    name: 'template_select',
    meta: {
      title: '选择上传方式',
      blueHead: true,
    },
    component: () => import('@/views/template_select/template_select.vue')
  },
  // 上传素材模板
  {
    path: '/matter_template',
    name: 'matter_template',
    meta: {
      title: '',
      blueHead: true,
    },
    component: () => import('@/views/matter_template/matter_template.vue')
  },
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
    redirect: '/template_select'
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
