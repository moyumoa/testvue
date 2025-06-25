import Layout from '@/layout/layout_index.vue'

const router = [
  {
    path: '/sumwhy_video',
    component: Layout,
    children: [
      {
        path: 'Assemblyline/assemblyline_details',
        name: 'assemblyline_details',
        meta: {
          title: '流水线设置'
        },
        component: () =>
          import(
            '@/views/sumvideo/IntelligentFinish/AssemblylineComponents/AssemblylineDetails.vue'
          )
      },
      {
        path: 'Assemblyline/assemblyline_details/digitalPerson',
        name: 'digitalPerson',
        meta: {
          title: '添加形象',
          parentInfo: '流水线设置',
          parentMenu: '智能合成',
          parentModule: '流水线'
        },
        component: () =>
          import(
            '@/views/sumvideo/IntelligentFinish/AssemblylineComponents/AssemblylineDigitalPerson.vue'
          )
      },
      {
        path: 'Assemblyline/productList',
        name: 'productList',
        meta: {
          title: '素材详情'
        },
        component: () =>
          import(
            '@/views/sumvideo/IntelligentFinish/AssemblylineComponents/assemblylineProductList.vue'
          )
      },
      {
        path: 'Assemblyline/template_edit',
        name: 'template_edit1',
        meta: {
          title: '模板分镜'
        },
        component: () => import('@/views/sumvideo/creative_mould/templateSpectroscope.vue')
      },
      {
        path: 'videoFinish/job_detail',
        name: 'job_detail',
        meta: {
          title: '成品库'
        },
        component: () =>
          import('@/views/sumvideo/IntelligentFinish/videoFinishComponents/videoFinishDetails.vue')
      },
      {
        path: 'template_space/template_edit',
        name: 'template_edit_space',
        meta: {
          title: '模板分镜'
        },
        component: () => import('@/views/sumvideo/creative_mould/templateSpectroscope.vue')
      },
      {
        path: 'creative_mould/template_edit',
        name: 'template_edit_mould',
        meta: {
          title: '模板分镜'
        },
        component: () => import('@/views/sumvideo/creative_mould/templateSpectroscope.vue')
      },
      {
        path: 'creative_make/template_edit',
        name: 'template_edit_make',
        meta: {
          title: '模板分镜'
        },
        component: () => import('@/views/sumvideo/creative_mould/templateSpectroscope.vue')
      },
      {
        path: 'template_space/recycle_bin',
        name: 'recycle_bin',
        meta: {
          title: '回收站'
        },
        component: () => import('@/views/sumvideo/recycle_bin/recycle_bin.vue')
      },
      {
        path: 'template_space/titleLibrary',
        name: 'titleLibrary',
        meta: {
          title: '标题文案库',
          parentInfo: '模板分镜',
          parentMenu: '模板分镜',
          parentModule: '企业模板'
        },
        component: () => import('@/views/sumvideo/creative_mould/titleLibrary.vue')
      },
      {
        path: 'cloud_template_management/template_edit',
        name: 'template_edit_cloud_template_management',
        meta: {
          title: '模板分镜'
        },
        component: () => import('@/views/sumvideo/creative_mould/templateSpectroscope.vue')
      },
      {
        path: 'cloud_template/template_edit',
        name: 'template_edit_cloud_template',
        meta: {
          title: '模板分镜'
        },
        component: () => import('@/views/sumvideo/creative_mould/templateSpectroscope.vue')
      },
      {
        path: 'cloud_cover_management/detail',
        name: 'cloud_cover_make',
        meta: {
          title: '封面制作'
        },
        component: () => import('@/views/sumvideo/cover_make/index.vue')
      },
      {
        path: 'cover_management/detail',
        name: 'cover_make',
        meta: {
          title: '封面制作'
        },
        component: () => import('@/views/sumvideo/cover_make/index.vue')
      },
      {
        path: 'finish_product_store/works_detail',
        name: 'works_detail_sumvideo',
        meta: {
          title: '素材详情'
        },
        component: () =>
          import('@/views/content_center/content_repository/work_library/works_detail.vue')
      },
      {
        path: 'finish_product_store/import_record',
        name: 'import_record_sumvideo',
        meta: {
          title: '导入记录'
        },
        component: () =>
          import('@/views/content_center/content_repository/import_record/import_record.vue')
      },
      {
        path: 'synthesis_task/detail',
        name: 'synthesis_task_detail',
        meta: {
          title: '合成任务详情'
        },
        component: () => import('@/views/sumvideo/synthesis_task/detail.vue')
      },
      {
        path: 'matrix_manage/add_grouping',
        name: 'matrix_manage_add_grouping',
        meta: {
          title: '新建/编辑分组'
        },
        component: () => import('@/views/content_center/content_matrix/components/add_grouping.vue')
      },
      {
        path: 'matrix_distribute/create',
        name: 'batch_publish_create',
        meta: {
          title: '批量发布'
        },
        component: () =>
          import(
            '@/views/sumvideo/matrix_operations/matrix_distribute/batch_publish_create/index.vue'
          )
      },
      {
        path: 'matrix_distribute/success',
        name: 'batch_publish_create_success',
        meta: {
          title: '创建成功'
        },
        component: () =>
          import(
            '@/views/sumvideo/matrix_operations/matrix_distribute/batch_publish_create/success.vue'
          )
      },
      {
        path: 'inspiration_library/video_detail',
        name: 'sumwhy_library_detail',
        meta: {
          title: '灵感详情'
        },
        component: () =>
          import('@/views/content_center/content_repository/video_library/video_detail.vue')
      },
      {
        path: 'inspiration_library/brandVideo_detail',
        name: 'sumwhy_library_brandDetail',
        meta: {
          title: '灵感详情'
        },
        component: () =>
          import('@/views/content_center/content_repository/video_library/brandVideo_detail.vue')
      },
      {
        path: 'template_imgText/detail',
        name: 'template_imgText_detail',
        meta: {
          title: '创作模板'
        },
        component: () => import('@/views/sumvideo/template_imgText/detail.vue')
      },
      {
        path: 'creative_script/detail',
        name: 'creative_script_detail',
        meta: {
          title: '剧本分镜'
        },
        component: () => import('@/views/sumvideo/creative_script/detail.vue')
      },
      {
        path: 'creative_script/recycle_bin',
        name: 'creative_script_recycle',
        meta: {
          title: '回收站'
        },
        component: () => import('@/views/sumvideo/creative_script/recycle_bin.vue')
      },
    ]
  }
]
export default router
