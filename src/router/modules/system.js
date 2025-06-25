import Layout from '@/layout/layout_index.vue'

const router = [
  {
    path: '/system_manage',
    component: Layout,
    children: [
      {
        path: 'section_set',
        name: 'section_set',
        meta: {
          title: '新建部门'
        },
        component: () => import('@/views/system/organization_framework/section_set.vue')
      },
      {
        path: 'role/per_config',
        name: 'per_config',
        meta: {
          title: '权限配置'
        },
        component: () => import('@/views/system/role/per_config.vue')
      },
      {
        path: 'user_detail',
        name: 'user_detail',
        component: () => import('@/views/system/child_account/user_detail.vue')
      },
      {
        path: 'content_config/edit_page',
        name: 'content_config',
        meta: {
          title: '新建/编辑知识库'
        },
        component: () => import('@/views/system/content_config/edit_page.vue')
      }
    ]
  },
  {
    path: '/account',
    component: Layout,
    children: []
  }
]
export default router
