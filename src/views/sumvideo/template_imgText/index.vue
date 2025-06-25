<template>
  <div class="sumvideo_page">
    <!-- 筛选条件 -->
    <xm_search
      ref="xmSearchRef"
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="querySearch"
      @reset="resetSearch"
    ></xm_search>
    <div class="page_content">
      <div class="page_btn">
        <el-button type="primary" @click="addFun">创作模板</el-button>
      </div>
      <div class="page_list">
        <imgTextListDOM
          style="width: 100%"
          pageSource="template_image_text"
          :tableForm="tableForm"
          :searchComponents="searchComponents"
          @loadMore="load"
          @toDetail="toDetail"
          @delFun="delFun"
          ref="cloudCardRef"
        />
        <!-- 列表 -->
        <!-- <template v-if="tableForm.listData && tableForm.listData.length > 0">
          <div
            class="scene_box"
            :infinite-scroll-delay="1000"
            v-infinite-scroll="load"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
          >
            <div
              class="one_scene"
              v-for="(item, index) in tableForm.listData"
              :key="index"
              :style="{
                width: `${oneWidth}px`,
                height: `${oneWidth}px`
              }"
              @click.stop="showDetailFun(item, index)"
            ></div>
          </div>
          <div
            class="loading_library"
            style="padding: 0 16px 20px 0px"
            v-if="tableForm.listData && tableForm.listData.length > 0"
          >
            <img
              src="/public/loading.gif"
              v-if="tableForm.loading && tableForm.page.index > 1"
              alt=""
            />
            {{
              tableForm.loading
                ? tableForm.page.index === 1
                  ? ''
                  : '加载中...'
                : tableForm.listData.length >= tableForm.page.total
                ? '已经到底了~'
                : '上拉加载更多~'
            }}
          </div>
        </template>
        <div v-else class="no_echart" style="padding-right: 16px">
          <img src="@/assets/images/content_center/no_activity.png" alt />
          暂无数据
        </div> -->
      </div>
    </div>
    <!-- 创建模板 -->
    <addDOM v-if="addDialog.show" :addDialog="addDialog" />
  </div>
</template>
<script setup>
import { page, deleteCreative } from '@/api/sumvideo/creative_mould.js'
import addDOM from './components/create_imgText_dialog.vue'
import { ElMessageBox } from 'element-plus'
import imgTextListDOM from '@/views/sumvideo/components/img_text_list.vue'
import { getQuery } from '@/utils/get_query.js'
import { throttle } from '@/utils/tools.js'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
const router = useRouter()
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
    type: 'dateRange', // 组件类型
    label: '模板创建时间', // label展示
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
    label: '模板创建人',
    val: '',
    placeholder: '请输入创建人用户名',
    filed: 'createUserName'
  },
  {
    type: 'select',
    label: '模板分类',
    val: null,
    defaultVal: null,
    placeholder: '请选择分类',
    filed: 'creativeStruct',
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    selects: [
      {
        label: '仅图片',
        value: 1
      },
      {
        label: '图片+文本',
        value: 2
      }
    ]
  }
])
// 表格的查询条件
const tableForm = reactive({
  loading: true,
  listData: [],
  newListData: [],
  page: {
    index: 1,
    size: 50,
    total: 0
  }
})

// --查询
// 查询的回调
const querySearch = throttle(function () {
  tableForm.page.index = 1
  tableForm.loading = true
  getList()
}, 500)
// 重置的回调
const resetSearch = throttle(function () {
  tableForm.loading = true
  tableForm.page = {
    index: 1,
    size: 50,
    total: 0
  }
  getList()
}, 500)
// 获取列表数据
function getList() {
  return new Promise((resolve, reject) => {
    // 判断是否可以发送请求
    // 处理请求参数
    const queryData = getQuery(searchComponents.value, ['startCreateTime', 'endCreateTime'])
    queryData.tag = 3
    tableForm.loading = true
    queryData.creativeStruct =
      queryData.creativeStruct && queryData.creativeStruct.length === 1
        ? queryData.creativeStruct[0]
        : null
    const param = {
      condition: queryData,
      pageNum: tableForm.page.index,
      pageSize: tableForm.page.size
    }
    // 发送请求
    page(param)
      .then(res => {
        if (res.code === 0) {
          if (tableForm.page.index === 1) {
            tableForm.listData = res.data.records || []
            tableForm.page.total = res.data.total || 0
          } else {
            tableForm.newListData = res.data.records || []
            tableForm.listData = tableForm.listData.concat(tableForm.newListData)
          }
        } else {
          if (tableForm.page.index === 1) {
            tableForm.listData = []
            tableForm.page.total = 0
          }
        }
        tableForm.loading = false
        resolve()
      })
      .catch(() => {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
          tableForm.page.total = 0
        }
        tableForm.loading = false
        resolve()
      })
  })
}
const load = throttle(function () {
  if (tableForm.loading) return
  tableForm.loading = true
  tableForm.page.index++
  getList()
}, 1000)
// --查询 end

const message = inject('$message')
// 去详情
function toDetail(item, index) {
  console.log('去详情', item, index)
  router.push(`/sumwhy_video/template_imgText/detail?id=${item.id}`)
}

// 删除
function delFun(item, index) {
  console.log('删除', item, index)
  ElMessageBox.confirm(
    `模板删除后无法找回，是否确认删除？<br/><span style="line-height: 30px;font-size:13px;color:#606266">注：已合成的素材不受影响</span>`,
    '删除模板',
    {
      closeOnClickModal: false,
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: '',
      customClass: 'xm_dialog_messageBox',
      dangerouslyUseHTMLString: true,
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '确定'
          deleteCreative({
            creativeId: item.id,
            addRecycleBin: false
          })
            .then(res => {
              if (res.code === 0) {
                querySearch()
                message.success('删除成功')
                done()
                setTimeout(() => {
                  instance.confirmButtonLoading = false
                }, 300)
              } else {
                done()
                setTimeout(() => {
                  instance.confirmButtonLoading = false
                }, 300)
              }
            })
            .catch(() => {
              done()
              setTimeout(() => {
                instance.confirmButtonLoading = false
              }, 300)
            })
        } else {
          done()
        }
      }
    }
  )
    .then(() => {})
    .catch(() => {})
}

// 创建模板
const addDialog = ref({
  show: false
})
const addFun = throttle(() => {
  addDialog.value = {
    show: true
  }
})
onMounted(() => {
  // resetSearch()
})
const srcollTop = ref(null)
const xmSearchRef = ref()
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  pageOnHide.value = false
  console.log("menuOfKeepAlive('judge')", menuOfKeepAlive('judge'))
  if (menuOfKeepAlive('judge')) {
    tableForm.loading = true
    nextTick(() => {
      if (xmSearchRef.value) {
        xmSearchRef.value?.reset()
      } else {
        resetSearch()
      }
    })
    menuOfKeepAlive('reset')
  } else {
    querySearch()
    if (srcollTop.value) {
      const el = document.querySelector('.el-main')
      el.scrollTop = srcollTop.value
    }
  }
  nextTick(() => {
    srcollTop.value = null
    tableForm.page.size = 50
  })
})
const pageOnHide = ref(false)
onBeforeRouteLeave((to, from) => {
  pageOnHide.value = true
  const leavePage = ['/sumwhy_video/template_imgText/']

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
    tableForm.page.size = 50
    srcollTop.value = 0
  }
})
</script>
<style lang="scss" scoped>
.page_content {
  margin-top: 16px;
  width: 100%;
  padding: 0;
  background: #ffffff;
  border-radius: 4px;
  .page_btn {
    width: calc(100% - 48px);
    margin-left: 24px;
    border-bottom: 1px solid #e8e8e8;
    padding: 22px 0 16px;
  }
  .page_list {
    width: 100%;
    :deep(.video_box) {
      min-height: 350px;
    }
    :deep(.one_item) {
      cursor: pointer;
    }
  }
}
</style>
