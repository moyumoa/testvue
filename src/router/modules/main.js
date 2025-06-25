import Layout from '@/layout/layout_index.vue'

const router = [
  // 登录
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录'
    },
    component: () => import('@/views/main/login/index.vue')
  },
  {
    path: '/cutShadow_login',
    name: 'cutShadow_login',
    meta: {
      title: '登录'
    },
    component: () => import('@/views/main/login/cutShadow_index.vue')
  },
  {
    path: '/choice_system',
    name: 'choice_system',
    meta: {
      title: '品牌内容运营工作台'
    },
    component: () => import('@/views/main/choice_system/index.vue')
  },
  // {
  //   path: '/system_manage/personal',
  //   name: 'personal',
  //   meta: {
  //     title: '个人信息'
  //   },
  //   component: () => import('@/views/system/personal/index.vue')
  // },
  {
    path: '/forget_password',
    name: 'forget_password',
    meta: {
      title: '忘记密码'
    },
    component: () => import('@/views/main/forget_password/index.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    component: Layout,
    // redirect: '/demo',
    children: [
      {
        path: 'demo',
        name: 'demo',
        component: () => import('@/views/demo/explain/index.vue')
      },
      {
        path: 'demo_crud',
        name: 'demo_crud',
        component: () => import('@/views/demo/crud/index.vue')
      },
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/main/home/index.vue')
      }
    ]
  },
  {
    path: '/fly_book_auth',
    name: 'fly_book_auth',
    meta: {
      title: '飞书登录'
    },
    component: () => import('@/views/main/fly_book_auth/index.vue')
  },
  {
    path: '/enterprise_wechart_auth',
    name: 'enterprise_wechart_auth',
    component: () => import('@/views/main/enterprise_wechart_auth/index.vue')
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/main/404.vue')
  },
  {
    path: '/loading',
    name: 'loading',
    meta: {
      title: ' '
    },
    component: () => import('@/views/main/loading.vue')
  },
  {
    path: '/loginTip',
    name: 'loginTip',
    meta: {
      title: ' '
    },
    component: () => import('@/views/main/login_to_tip.vue')
  } // iframe嵌套项目，登录报错跳转的页面 目前只有海尔无法匹配对应用户才跳这
]
export default router
