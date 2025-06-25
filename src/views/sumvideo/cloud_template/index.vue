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
      </div>
      <div class="page_bottom">
        <cloudCard
          :pageOnHide="pageOnHide"
          :industryLoading="industryLoading"
          :tableForm="tableForm"
          @loadSwiperFun="loadSwiperFun"
          @resetList="searchList"
          origin="cloud_template"
          ref="cloudCardRef"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import cloudCard from '../cloud_template_management/components/cloud_card.vue'
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
import { page } from '@/api/sumvideo/creative_mould.js'
import industrySearch from '../cloud_template_management/components/industry_search.vue'
import { onBeforeRouteLeave } from 'vue-router'
import { findTrades } from '@/api/sumvideo/cloud_template_management.js'
const industryList = ref([]) // 行业列表
const industryLoading = ref(true) // 行业列表的Loading
const chooseIndustry = ref(null) // 选中的行业列表
// 获取所有行业分类
function getAllIndustry() {
  industryLoading.value = true
  findTrades({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : ''
  })
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
  chooseIndustry.value = e
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
      status: 2,
      videoStatus: 2,
      isCloudOpen: 1
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

const srcollTop = ref(null)
const cloudCardRef = ref(null)
const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  pageOnHide.value = false
  if (menuOfKeepAlive('judge')) {
    chooseIndustry.value = []
    resetSearch()
    // menuOfKeepAlive('reset')
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
onMounted(() => {
  resetSearch()
})
const pageOnHide = ref(false)
onBeforeRouteLeave((to, from) => {
  pageOnHide.value = true
  const leavePage = ['/sumwhy_video/template_space/']

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
  width: 100%;
}
</style>
