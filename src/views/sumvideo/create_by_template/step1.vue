<template>
  <div class="step1_page step_page">
    <div class="page_top">
      <stepsTitle :currentSteps="0" title="请选择一个模板">
        <template #rightBox>
          <xm_search
            :searchComponents="searchComponents"
            @getData="searchList"
            :useOwnReset="true"
            @reset="resetSearch"
            ref="xmSearchRef"
          />
        </template>
      </stepsTitle>
    </div>
    <div class="page_bottom sumvideo_page sumvideo_page_xmy">
      <!-- 图片列表 -->
      <swiperDOM
        style="width: 100%; min-height: 150px"
        :pageOnHide="false"
        pageSource="createByTemplate"
        :showRadio="true"
        :chooseTemplateInfo="chooseTemplateInfo"
        :tableForm="tableForm"
        :searchComponents="searchComponents"
        @loadSwiperFun="loadSwiperFun"
        @chooseTemplateFun="chooseTemplateFun"
        ref="cloudCardRef"
      ></swiperDOM>
    </div>
  </div>
</template>
<script setup>
import { categoryList, page } from '@/api/sumvideo/creative_mould.js'
import { getQuery } from '@/utils/get_query.js'
import stepsTitle from '@/views/sumvideo/components/step/steps_content_title.vue'
import swiperDOM from '@/views/sumvideo/creative_mould/components/swiper.vue'

const props = defineProps({
  chooseTemplateInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const { chooseTemplateInfo } = toRefs(props)
// 筛选条件
const searchComponents = ref([
  {
    type: 'input',
    label: '模板名称',
    val: '',
    placeholder: '请输入模板名称',
    filed: 'name'
  },
  {
    type: 'selectByGroup',
    label: '模板分类',
    val: null,
    defaultVal: null,
    placeholder: '请选择分类',
    filed: 'categoryId',

    selectDefultName: ['id', 'categoryName'],
    childName: 'childCategoryList',
    selects: []
  }
])
// 表格筛选
const tableForm = reactive({
  tabIndex: 0,
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
// 获取分类列表
function getCategoryList() {
  categoryList({}).then(res => {
    if (res.code === 0 && res.data && res.data.length > 0) {
      searchComponents.value[1].selects = res.data || []
    }
  })
}

// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 32
  getList()
}
// 图片列表的滚动事件
function loadSwiperFun() {
  tableForm.loading = true
  tableForm.page.index++
  getList()
}
function getList() {
  const data = getQuery(searchComponents.value, ['startCreateTime', 'endCreateTime'])
  console.log(data, 'data')
  data.type = 2
  data.status = 2
  data.categoryIds = data.categoryId ? [data.categoryId] : []
  data.videoStatus = 2
  const param = {
    pageNum: tableForm.page.index,
    pageSize: tableForm.page.size
  }
  param.condition = data
  console.log(param, 'param')
  page(param)
    .then(res => {
      if (res.code === 0) {
        if (tableForm.page.index === 1) {
          tableForm.listData = res.data.records || []
          tableForm.page.total = res.data.total || 0
        } else {
          const newListData = res.data.records || []
          tableForm.listData = tableForm.listData.concat(newListData)
        }
      } else {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
        }
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}
const emits = defineEmits(['chooseTemplateFun'])
// 模板选中
function chooseTemplateFun(e) {
  console.log('选中的模板信息', e)
  emits('chooseTemplateFun', e)
}
onMounted(() => {
  getCategoryList()
  resetSearch()
})
</script>
<style lang="scss" scoped>
@import './components/scss/step.scss';
.step1_page {
  .page_top {
    :deep(.steps_content_title) {
      padding-bottom: 20px;
      padding-top: 0px;
      align-items: center;
      // align-items: flex-start;
      .s_left {
        align-items: center;
        // align-items: flex-start;
        // padding-top: 4px;
      }
    }
    :deep(.xm_search) {
      padding: 0;
      .search_item {
        margin-bottom: 0;
      }
      .search_item:last-child {
        margin-right: 0;
      }
    }
  }
  .page_bottom {
    :deep(.video_box) {
      min-height: 300px;
    }
    :deep(.loading_library) {
      padding-bottom: 15px;
    }
    :deep(.all_video) {
      padding-left: 24px;
    }
    :deep(.animation_box) {
      width: calc(100% + 32px);
      left: -16px;
      top: -16px;
      height: calc(100% + 58px);
      .video_bottom {
        height: 58px;
      }
      .animation_video_box {
        height: calc(100% - 62px);
      }
    }
    :deep(.err_animation_box) {
      height: calc(100% + 62px);
    }
  }
}
</style>
