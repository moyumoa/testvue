import Layout from '@/layout/layout_index.vue'

const router = [
  {
    path: '/scrm',
    component: Layout,
    children: [
      {
        path: 'policy_template/create',
        name: 'create_policy_template',
        meta: {
          title: '新建/编辑策略模板',
          parentMenu: '智能互动',
          parentModule: '策略模板'
        },
        component: () =>
          import('@/views/scrm/interactive_messages/create_policy_template/index.vue')
      },
      {
        path: 'customer_management/details',
        name: 'customer_management_details',
        meta: {
          title: '客户详情',
          parentMenu: '客户管理',
          parentModule: '客户管理'
        },
        component: () =>
          import(
            '@/views/scrm/customer_management/customer_management_details/customer_management_details.vue'
          )
      },
      {
        path: 'potential_customer_list/potential_details',
        name: 'potential_customer_details',
        meta: {
          title: '客户详情'
        },
        component: () =>
          import(
            '@/views/scrm/customer_management/customer_management_details/customer_management_details.vue'
          )
      }
      // // 触达记录二级页面取消
      // {
      //   path: 'Interaction_record',
      //   name: 'Interaction_record',
      //   meta: {
      //     title: '触达记录'
      //   },
      //   component: () => import('@/views/scrm/interactive_messages/Interaction_record/index.vue')
      // }
    ]
  },
  {
    path: '/account',
    component: Layout,
    children: []
  }
]
export default router
