import Layout from '@/layout/layout_index.vue'

const router = [
  {
    path: '/operation',
    component: Layout,
    children: [
      {
        path: 'page_decorate/detail',
        name: 'page_decorate/detail',
        meta: {
          title: '装修页详情'
        },
        component: () => import('@/views/operation/page_decorate/detail.vue')
      }
    ]
  }
]
export default router
