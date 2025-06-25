import Layout from '@/layout/layout_index.vue'

const router = [
  {
    path: '/content_market',
    component: Layout,
    children: [
      {
        path: 'market_calendar/activityList',
        name: 'market_calendar_activityList',
        meta: {
          title: '活动数据'
        },
        component: () => import('@/views/market/market_calendar/activityList.vue')
      },
      {
        path: 'diyPrograme_page_decorate/detail',
        name: 'diyPrograme_page_decorate/detail',
        meta: {
          title: '装修页详情'
        },
        component: () => import('@/views/operation/page_decorate/detail.vue')
      },
      {
        path: 'create_task',
        name: 'create_task',
        meta: {
          title: '创建任务',
          parentMenu: '营销任务',
          parentModule: '任务列表'
        },
        component: () => import('@/views/market/marketing_task/create_task/index.vue')
      },
      {
        path: 'video_task/create_task',
        name: 'video_task_create',
        meta: {
          title: '新建/编辑视频任务',
          parentMenu: '营销任务',
          parentModule: '任务列表'
        },
        component: () => import('@/views/market/marketing_task/create_task/index.vue')
      },
      {
        path: 'imgText_task/create_task',
        name: 'imgText_task_create',
        meta: {
          title: '新建/编辑图文任务',
          parentMenu: '营销任务',
          parentModule: '任务列表'
        },
        component: () => import('@/views/market/marketing_task/create_task/index.vue')
      },
      {
        path: 'live_task/create_task',
        name: 'live_task_create',
        meta: {
          title: '新建/编辑直播任务',
          parentMenu: '营销任务',
          parentModule: '任务列表'
        },
        component: () => import('@/views/market/marketing_task/create_task/index.vue')
      },
      {
        path: 'collecting_task/create_task',
        name: 'collecting_task_create',
        meta: {
          title: '新建/编辑征集任务',
          parentMenu: '营销任务',
          parentModule: '任务列表'
        },
        component: () => import('@/views/market/marketing_task/create_task/index.vue')
      },
      {
        path: 'study_task/create_task',
        name: 'study_task_create',
        meta: {
          title: '新建/编辑学习任务',
          parentMenu: '营销任务',
          parentModule: '任务列表'
        },
        component: () => import('@/views/market/marketing_task/create_task/index.vue')
      },
      {
        path: 'video_task/video_task_details',
        name: 'video_task_details',
        meta: {
          title: '视频任务详情',
          parentMenu: '营销任务',
          parentModule: '视频任务'
        },
        component: () => import('@/views/market/marketing_task/task_details/index.vue')
      },
      {
        path: 'imgText_task/imgText_task_details',
        name: 'imgText_task_details',
        meta: {
          title: '图文任务详情',
          parentMenu: '营销任务',
          parentModule: '图文任务'
        },
        component: () => import('@/views/market/marketing_task/task_details/index.vue')
      },
      {
        path: 'live_task/live_task_details',
        name: 'live_task_details',
        meta: {
          title: '直播任务详情',
          parentMenu: '营销任务',
          parentModule: '直播任务'
        },
        component: () => import('@/views/market/marketing_task/task_details/index.vue')
      },
      {
        path: 'collecting_task/detail',
        name: 'collecting_task_detail',
        meta: {
          title: '征集任务详情',
          parentMenu: '营销任务',
          parentModule: '征集任务'
        },
        component: () => import('@/views/market/marketing_task/task_details/index.vue')
      },
      {
        path: 'growth_setting/detail',
        name: 'growth_task_detail',
        meta: {
          title: '成长任务详情',
          parentMenu: '成长体系',
          parentModule: '成长体系'
        },
        component: () => import('@/views/market/marketing_task/task_details/index.vue')
      },
      {
        path: 'growth_setting/create',
        name: 'growth_task_create',
        meta: {
          title: '新建/编辑成长任务',
          parentMenu: '成长体系',
          parentModule: '成长体系'
        },
        component: () => import('@/views/market/marketing_task/create_task/index.vue')
      },
      {
        path: 'study_task/detail',
        name: 'study_task',
        meta: {
          title: '学习任务详情',
          parentMenu: '学习任务',
          parentModule: '学习任务'
        },
        component: () => import('@/views/market/marketing_task/task_details/index.vue')
      },
      // { //
      //   path: 'homework_list',
      //   name: 'homework_list',
      //   meta: {
      //     title: '点评中心',
      //     parentMenu: '成长学院',
      //     parentModule: '策略中心'
      //   },
      //   component: () => import('@/views/market/marketing_task/homework_list/index.vue')
      // },
      {
        path: 'member_list/update_gold_log',
        name: 'update_gold_log',
        meta: {
          title: '金币变更记录',
          parentMenu: '成员管理',
          parentModule: '成员管理'
        },
        component: () => import('@/views/market/member_management/update_gold_log.vue')
      },
      {
        path: 'online_booking/create_activity',
        name: 'create_activity',
        meta: {
          title: '新建/编辑预约活动',
          parentMenu: '经营工具',
          parentModule: '在线预约'
        },
        component: () => import('@/views/market/business_tools/create_activity/index.vue')
      },
      {
        path: 'clues_management/detail',
        name: 'clues_management/detail',
        meta: {
          title: '线索详情',
          parentMenu: '经营工具',
          parentModule: '活动线索'
        },
        component: () => import('@/views/market/business_tools/clues_management/detail.vue')
      },
      {
        path: 'live_portal/detail',
        name: 'create_live_portal',
        meta: {
          title: '新建/编辑直播传送门',
          parentMenu: '经营工具',
          parentModule: '直播传送门'
        },
        component: () => import('@/views/market/business_tools/live_portal/live_portal_detail.vue')
      },
      {
        path: 'course_management/edit_course',
        name: 'edit_course',
        meta: {
          title: '新建/编辑学习课程',
          parentMenu: '学习中心',
          parentModule: '课程管理',
          useKeepAlive: true
        },
        component: () => import('@/views/market/study/course_management/edit_course.vue')
      },
      {
        path: 'course_management/edit_class',
        name: 'edit_class',
        meta: {
          title: '新建/编辑学习课节',
          parentMenu: '学习中心',
          parentModule: '课程管理',
          parentInfo: '新建/编辑学习课程'
        },
        component: () => import('@/views/market/study/course_management/edit_class.vue')
      },
      {
        path: 'course_management/course_detail',
        name: 'course_detail',
        meta: {
          title: '课程详情',
          parentMenu: '学习中心',
          parentModule: '课程管理'
        },
        component: () => import('@/views/market/study/course_management/course_detail.vue')
      },
      {
        path: 'finish_product_store/works_detail',
        name: 'works_detail_market',
        meta: {
          title: '素材详情'
        },
        component: () =>
          import('@/views/content_center/content_repository/work_library/works_detail.vue')
      },
      {
        path: 'finish_product_store/import_record',
        name: 'import_record_market',
        meta: {
          title: '导入记录'
        },
        component: () =>
          import('@/views/content_center/content_repository/import_record/import_record.vue')
      },
      {
        path: 'audit_center/KOS_detail',
        name: 'KOSDetail',
        meta: {
          title: '审核列表',
          // useKeepAlive: true
        },
        component: () => import('@/views/market/audit_center/video_audit/KOS_detail.vue')
      },
      {
        path: 'audit_center/KOS_record',
        name: 'KOSRecord',
        meta: {
          title: '审核记录',
          parentMenu: '审核列表',
          parentModule: '审核中心',
          parentInfo: '审核列表'
        },
        component: () => import('@/views/market/audit_center/video_audit/KOS_record.vue')
      }
    ]
  }
]
export default router
