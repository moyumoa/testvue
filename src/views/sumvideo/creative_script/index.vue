<template>
  <div class="sumvideo_page sumvideo_page_xmy">
    <!-- 筛选项 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
      ref="xmSearchRef"
    ></xm_search>
    <!-- 页面 -->
    <div class="page_content">
      <!-- 创作+分类+回收站 -->
      <div class="content_top">
        <div class="content_top_left">
          <el-button type="primary" @click="showCreateDialogFun">创作剧本</el-button>
        </div>
        <div class="content_top_right">
          <el-button type="primary" @click="showCategoryDialogFun">分类管理</el-button>

          <el-button @click="toRecycle">
            <div class="btn_content">
              <span
                style="font-size: 20px; margin-right: 2px"
                class="iconfont icon-huishouzhan"
              ></span>
              回收站
            </div>
          </el-button>
        </div>
      </div>
      <div class="content_bottom">
        <swiperDOM
          :pageOnHide="pageOnHide"
          :tableForm="tableForm"
          :searchComponents="searchComponents"
          @loadSwiperFun="loadSwiperFun"
          @resetList="searchList"
          @openToResetList="openToResetList"
          @updateCategory="updateCategory"
          ref="cloudCardRef"
        ></swiperDOM>
      </div>
    </div>
    <!-- 分类管理 -->
    <categoryDOM
      v-if="categoryDialog.show"
      :categoryDialog="categoryDialog"
      @updateCategory="getCategoryList"
    />
    <!-- 创作剧本的弹窗 -->
    <createScriptDOM
      v-if="createDialog.show"
      :createDialog="createDialog"
      @updateList="searchList"
    />
  </div>
</template>
<script setup>
import createScriptDOM from './components/createScript_dialog.vue'
import categoryDOM from './components/category_dialog.vue'
import swiperDOM from './components/swiper.vue'
import { categoryList, page } from '@/api/sumvideo/creative_mould.js'
import { throttle } from '@/utils/tools.js'
import { getQuery } from '@/utils/get_query.js'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
const router = useRouter()
// 筛选条件
const searchComponents = ref([
  {
    type: 'input',
    label: '剧本名称',
    val: '',
    placeholder: '请输入剧本名称',
    filed: 'name'
  },
  {
    type: 'dateRange', // 组件类型
    label: '剧本创建时间', // label展示
    val: '', // 响应式绑定
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始日期', '结束日期'],
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    filed: 'dataTime' // 查询字段名
  },
  {
    type: 'input',
    label: '剧本创建人',
    val: '',
    placeholder: '请输入创建人用户名',
    filed: 'createUserName'
  },
  {
    type: 'selectByGroup',
    label: '剧本分类',
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
    size: 32,
    total: 0
  }
})
// 获取分类列表
function getCategoryList() {
  categoryList({ type: 2 }).then(res => {
    if (res.code === 0 && res.data && res.data.length > 0) {
      const index = searchComponents.value.findIndex(x => x.filed === 'categoryId')
      searchComponents.value[index].selects = res.data || []
    }
  })
}
getCategoryList()
// 获取筛选条件的数据
function getParam() {
  const data = getQuery(searchComponents.value, ['startCreateTime', 'endCreateTime'])
  console.log(data, 'data')
  data.type = 2
  data.categoryIds = data.categoryId ? [data.categoryId] : []
  const param = {
    pageNum: tableForm.page.index,
    pageSize: tableForm.page.size
  }
  param.condition = data
  param.condition.tag = 6 // 剧本模板标识
  return param
}
// 获取列表
function getList() {
  const param = getParam()
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
// 列表的滚动事件
function loadSwiperFun() {
  tableForm.loading = true
  tableForm.page.index++
  getList()
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

// 创作剧本
const createDialog = reactive({
  isCreate: true,
  origin: 'creative_mould',
  show: false
})
const showCreateDialogFun = throttle(() => {
  createDialog.show = true
}, 500)

// 显示分类管理的弹窗
const categoryDialog = reactive({
  show: false
})
const showCategoryDialogFun = throttle(() => {
  categoryDialog.show = true
}, 500)

// 修改当前的分类
function updateCategory(e) {
  tableForm.listData[e.index].categoryIdList = e.categoryIdList
}
console.log('updateCategory', updateCategory)

// 开启/关闭剧本触发的刷新列表
function openToResetList(notUseLoading) {
  if (!notUseLoading) {
    tableForm.loading = true
  }
  tableForm.page.index = 1
  getList()
}

// 打开回收站
const toRecycle = throttle(() => {
  router.push({
    path: '/sumwhy_video/creative_script/recycle_bin'
  })
}, 500)

const srcollTop = ref(null)
const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  pageOnHide.value = false
  if (menuOfKeepAlive('judge')) {
    if (xmSearchRef.value) {
      xmSearchRef.value?.reset()
    } else {
      resetSearch()
    }
  } else {
    tableForm.loading = true

    tableForm.page.index = 1
    getList()
    if (srcollTop.value) {
      const el = document.querySelector('.el-main')
      el.scrollTop = srcollTop.value
    }
  }
  nextTick(() => {
    srcollTop.value = null
  })
})
onMounted(() => {
  resetSearch()
})
const pageOnHide = ref(false)
onBeforeRouteLeave((to, from) => {
  pageOnHide.value = true
  const leavePage = ['/sumwhy_video/creative_script/']
  if (tableForm.tabIndex === 0) {
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
  }
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.page_content {
  margin-top: 16px;
  background: #ffffff;
  border-radius: 4px;
  padding: 16px 6px 16px 24px;
  .content_top {
    margin-bottom: 16px;
    padding-right: 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .content_top_left {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
    .content_top_right {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
    }
    :deep(.el-button + .el-button) {
      margin-left: 16px;
    }
  }
}
.btn_content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
