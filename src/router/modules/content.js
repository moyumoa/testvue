import Layout from '@/layout/layout_index.vue'

const router = [
  {
    path: '/content_center',
    component: Layout,
    children: [
      {
        path: 'content_matrix/details',
        name: 'content_matrix/details',
        meta: {
          title: '矩阵号详情'
        },
        component: () => import('@/views/content_center/content_matrix/details/index.vue')
      },
      {
        path: 'live_center/detail',
        name: 'live_center/detail',
        meta: {
          title: '直播数据详情'
        },
        component: () => import('@/views/content_center/live_center/detail.vue')
      },
      {
        path: 'content_manage/manage_detail',
        name: 'content_manage/manage_detail',
        meta: {
          title: '视频数据详情'
        },
        component: () => import('@/views/content_center/content_manage/manage_detail.vue')
      },
      {
        path: 'good_management',
        name: 'good_management',
        meta: {
          title: '商品管理'
        },
        component: () => import('@/views/content_center/good_management/index.vue')
      },
      {
        path: 'good_retention/detail',
        name: 'good_retention/detail',
        meta: {
          title: '留资商品详情'
        },
        component: () => import('@/views/content_center/good_retention/detail.vue')
      },
      {
        path: 'clue_manage/detail',
        name: 'clue_manage/detail',
        meta: {
          title: '线索详情'
        },
        component: () => import('@/views/content_center/clue_manage/detail.vue')
      },
      {
        path: 'work_library/works_detail',
        name: 'works_detail',
        meta: {
          title: '作品详情'
        },
        component: () =>
          import('@/views/content_center/content_repository/work_library/works_detail.vue')
      },
      {
        path: 'content_repository/material_library/material_detail',
        name: 'material_detail',
        meta: {
          title: '素材详情'
        },
        component: () =>
          import('@/views/content_center/content_repository/material_library/material_detail.vue')
      },
      {
        path: 'content_matrix_group/add_grouping',
        name: 'content_matrix_group_add_grouping',
        meta: {
          title: '新建/编辑分组'
        },
        component: () => import('@/views/content_center/content_matrix/components/add_grouping.vue')
      },
      {
        path: 'work_library/import_record',
        name: 'import_record',
        meta: {
          title: '导入记录'
        },
        component: () =>
          import('@/views/content_center/content_repository/import_record/import_record.vue')
      },
      {
        path: 'inspiration_library/video_detail',
        name: 'library_detail',
        meta: {
          title: '灵感详情'
        },
        component: () =>
          import('@/views/content_center/content_repository/video_library/video_detail.vue')
      },
      {
        path: 'inspiration_library/brandVideo_detail',
        name: 'library_brandDetail',
        meta: {
          title: '灵感详情'
        },
        component: () =>
          import('@/views/content_center/content_repository/video_library/brandVideo_detail.vue')
      }
    ]
  }
]
export default router
