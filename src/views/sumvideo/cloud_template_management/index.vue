<template>
  <div class="sumvideo_page sumvideo_page_xmy">
    <!-- 客户端 -->
    <!-- <down-load-client></down-load-client> -->
    <!-- 页面 -->
    <div class="cloud_page sumvideo_page_content" v-loading="industryLoading">
      <div class="page_top">
        <div class="page_top_left">
          <industrySearch
            v-if="!industryLoading"
            :industryList="industryList"
            @updateIndustry="updateIndustry"
            ref="xmSearchRef"
          />
        </div>
        <div class="page_top_right">
          <el-button type="primary" @click="showCreateDialogFun">创作云模板</el-button>
          <el-button type="primary" @click="openSumvideoClint">剪映导入</el-button>
        </div>
      </div>
      <div class="page_bottom">
        <cloudCard
          :pageOnHide="pageOnHide"
          :industryLoading="industryLoading"
          :tableForm="tableForm"
          @loadSwiperFun="loadSwiperFun"
          @resetList="searchList"
          @updateOneInfo="updateOneInfo"
          origin="cloud_template_management"
          ref="cloudCardRef"
        />
      </div>
    </div>
    <!-- 创作模板的弹窗 -->
    <copyTemplateDOM
      v-if="createDialog.show"
      :copyDialog="createDialog"
      @updateList="searchList"
    ></copyTemplateDOM>
  </div>
</template>
<script setup>
import copyTemplateDOM from '../creative_mould/components/template/copyTemplate_dialog.vue'
import { onBeforeRouteLeave } from 'vue-router'
import cloudCard from './components/cloud_card.vue'
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
import { page } from '@/api/sumvideo/creative_mould.js'
import { ElMessage } from 'element-plus'
import { throttle } from '@/utils/tools.js'
import industrySearch from './components/industry_search.vue'
import { findTrades } from '@/api/sumvideo/cloud_template_management.js'
const industryList = ref([]) // 行业列表
const industryLoading = ref(true) // 行业列表的Loading
const chooseIndustry = ref([]) // 选中的行业列表
// 获取所有行业分类
function getAllIndustry() {
  industryLoading.value = true
  findTrades({})
    .then(res => {
      if (res.code === 0) {
        industryList.value = res.data || []
      }
      industryLoading.value = false
    })
    .catch(() => {
      industryLoading.value = false
    })
}
getAllIndustry()
// 行业列表选中事件
function updateIndustry(e) {
  chooseIndustry.value = e || []
  resetSearch()
}
// 表格筛选
const tableForm = reactive({
  tabIndex: 0,
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 32,
    total: 0
  }
})
// 图片列表的滚动事件
function loadSwiperFun() {
  tableForm.loading = true
  tableForm.page.index++
  getList()
}
function getList() {
  const param = {
    pageNum: tableForm.page.index,
    pageSize: tableForm.page.size,
    condition: {
      tradeIds: chooseIndustry.value,
      type: 1,
      tags: [1, 5] // 仅搜索普通模版 和图集模板
    }
  }
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
// resetSearch()
// 模板保存之后需要更新单条数据
function updateOneInfo(i, id, updateType) {
  // 如果适用行业有更新，那就重刷列表。否则就刷单条数据
  if (updateType === 'tradeType') {
    searchList()
    return
  }
  page({
    pageNum: 1,
    pageSize: tableForm.page.size,
    condition: {
      creativeId: id
    }
  })
    .then(res => {
      if (res.code === 0) {
        const data =
          res.data && res.data.records && res.data.records.length > 0 ? res.data.records : []
        if (data && data.length > 0) {
          tableForm.listData[i] = data[0]
        }
      }
    })
    .catch(() => {})
}
// 创作云模板
const createDialog = reactive({
  type: 'cloud',
  origin: 'cloud_template_management',
  isCreate: true,
  show: false
})
const showCreateDialogFun = throttle(() => {
  createDialog.show = true
}, 500)

// 剪映导入
const openSumvideoClint = throttle(() => {
  ElMessage({
    type: 'warning',
    message: '未下载客户端，请下载客户端'
  })
  location.href = 'sumvideo-client://'
}, 500)

const srcollTop = ref(null)
const cloudCardRef = ref(null)
const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  pageOnHide.value = false
  // getKey('content', 'content')
  if (menuOfKeepAlive('judge')) {
    chooseIndustry.value = []
    resetSearch()
    menuOfKeepAlive('reset')
  } else {
    searchList()
    if (srcollTop.value) {
      const el = document.querySelector('.el-main')
      el.scrollTop = srcollTop.value
    }
  }
  nextTick(() => {
    srcollTop.value = null
    cloudCardRef.value?.desotryMouse()
  })
})
const pageOnHide = ref(false)
onBeforeRouteLeave((to, from) => {
  pageOnHide.value = true
  const leavePage = ['/sumwhy_video/cloud_template_management/']

  if (leavePage.findIndex(x => to.path.indexOf(x) > -1) > -1) {
    // 当前加载了多少条
    tableForm.page.size =
      tableForm.listData.length > tableForm.page.size
        ? tableForm.listData.length
        : tableForm.page.size
    // 滚动条的滚动距离
    srcollTop.value =
      document.querySelector('.el-main').scrollTop ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop
  } else {
    tableForm.page.size = 32
    srcollTop.value = 0
  }
})
</script>
<style lang="scss" scoped>
.page_top_left {
  width: calc(100% - 250px);
}
</style>
