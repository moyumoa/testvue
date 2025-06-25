<template>
  <div class="sumvideo_page sumvideo_page_xmy">
    <!-- 客户端 -->
    <!-- <down-load-client></down-load-client> -->
    <!-- 页面 -->
    <div class="creative_page">
      <!-- 筛选条件 -->
      <xm_search
        :searchComponents="searchComponents"
        @getData="searchList"
        :useOwnReset="true"
        @reset="resetSearch"
        ref="xmSearchRef"
      >
        <template #labelTip>
          <el-tooltip class="item" effect="dark" content="" placement="bottom">
            <template #content>
              <div style="max-width: 400px">
                开启开关后，模板及模板批量合成的视频将在小程序首页“发视频”模块内开放给员工直接跟拍发布或转发视频到平台
              </div>
            </template>
            <img
              src="@/assets/images/content_center/tip_line.png"
              style="width: 14px; height: 14px; margin-left: 5px"
              alt
            />
          </el-tooltip>
        </template>
        <template #searchBtn>
          <el-button @click="showExportFun" v-if="tableForm.tabIndex == 1">导出</el-button>
        </template>
      </xm_search>
      <!-- 页面 -->
      <div class="page_content">
        <!-- 导出+列表显示 -->
        <div class="content_top">
          <div class="content_top_left">
            <el-button type="primary" @click="showCreateDialogFun">创作模板</el-button>
            <el-button type="primary" @click="openSumvideoClint">剪映导入</el-button>
          </div>
          <div class="content_top_right">
            <el-button type="primary" @click="showCategoryDialogFun">分类管理</el-button>

            <el-button @click="toRecycle">
              <div class="btn_content">
                <!-- <img src="https://tagvv-1256030678.file.myqcloud.com/20230309tixys.png" alt="" /> -->
                <span
                  style="font-size: 20px; margin-right: 2px"
                  class="iconfont icon-huishouzhan"
                ></span>
                回收站
              </div>
            </el-button>

            <div class="search_choice">
              <template v-for="(item, index) in choiceList" :key="index">
                <el-tooltip effect="dark" placement="top">
                  <template #content>
                    <div style="max-width: 300px">
                      {{ index ? '列表模式' : '卡片模式' }}
                    </div>
                  </template>
                  <div
                    :class="{
                      choice_tab_box: true,
                      choice_tab_choice: tableForm.tabIndex == index
                    }"
                    @click="changeTab(index)"
                  >
                    <img :src="item.image" v-show="index == tableForm.tabIndex" alt />
                    <img :src="item.image2" v-show="index !== tableForm.tabIndex" alt />
                  </div>
                </el-tooltip>
              </template>
            </div>
          </div>
        </div>
        <div class="content_bottom">
          <!-- 图片列表 -->
          <swiperDOM
            :pageOnHide="pageOnHide"
            v-if="tableForm.tabIndex == 0"
            :tableForm="tableForm"
            :searchComponents="searchComponents"
            @loadSwiperFun="loadSwiperFun"
            @openDetail="openDetail"
            @resetList="searchList"
            @openToResetList="openToResetList"
            @updateCategory="updateCategory"
            ref="cloudCardRef"
          ></swiperDOM>
          <!-- 表格列表 -->
          <div class="content_table" v-else style="padding-right: 16px">
            <xm_table
              :data="tableForm.listData"
              v-model:page="tableForm.page"
              v-loading="tableForm.loading"
              tableType="video"
              @getTableData="getList"
              @sort-change="handleSortChange"
              :default-sort="{ prop: 'mergeVideoNum', order: 'descending' }"
              rowKey="id"
            >
              <el-table-column label="创意模板" min-width="240">
                <template #default="scope">
                  <div class="tem_info" @click="openDetail(scope.row.id, scope.$index)">
                    <div
                      v-if="scope.row.videoStatus === 1 || scope.row.videoStatus === 0"
                      class="cover_img"
                      v-loading="scope.row.videoStatus === 1 || scope.row.videoStatus === 0"
                      element-loading-text="正在合成中"
                      element-loading-background="rgba(255, 255, 255, 0)"
                    ></div>
                    <div
                      class="cover_img"
                      v-else-if="scope.row.videoStatus === 3"
                      style="background-color: #000"
                    >
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20250113fovzk.png"
                        class="fail_icon"
                        alt=""
                      />
                      <p class="fail_text">合成失败</p>
                    </div>
                    <div class="cover_img_box" v-else>
                      <img class="cover_img" :src="scope.row.coverUrl" alt="" />
                      <!-- 开放模板 -->
                      <div
                        class="public_icon"
                        v-if="scope.row.videoStatus === 2 && scope.row.isOpenTemplate"
                      >
                        开放模板
                      </div>
                    </div>
                    <!-- 数字人标识 -->
                    <img
                      v-if="scope.row.tag == 2"
                      class="digital_icon"
                      src="https://tagvv-1256030678.file.myqcloud.com/20230309l1jh0.png"
                      alt=""
                    />
                    <div class="tem_box">
                      <div class="tem_box--item">{{ scope.row.name || '-' }}</div>
                      <div class="tem_box--item tem_box--half">
                        分类：{{ scope.row.categoryNames || '-' }}
                      </div>
                      <div class="tem_box--item">时长：{{ timFilter(scope.row.duration) }}</div>
                      <div class="tem_box--item">制作者：{{ scope.row.createUserName || '-' }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="mergeVideoNum" label="合成视频数" min-width="130" sortable>
                <template #default="{ row }">
                  {{ wanSliceFormat(row.mergeVideoNum) || '-' }}
                </template>
              </el-table-column>
              <el-table-column
                prop="task_publish_num"
                label="发布视频数（任务发布）"
                min-width="210"
                sortable="custom"
                column-key="task_publish_num"
              >
                <template #default="{ row }">
                  {{ wanSliceFormat(row.taskPublishNum) || '-' }}
                </template>
              </el-table-column>
              <el-table-column
                prop="index_publish_num"
                label="发布视频数（发视频）"
                min-width="210"
                sortable="custom"
                column-key="index_publish_num"
              >
                <template #default="{ row }">
                  {{ wanSliceFormat(row.indexPublishNum) || '-' }}
                </template>
              </el-table-column>
              <el-table-column
                v-if="[3, 4].includes(systemVersion)"
                prop="batch_task_publish_num"
                label="发布视频数（批量发布）"
                min-width="210"
                sortable="custom"
                column-key="batch_task_publish_num"
              >
                <template #default="{ row }">
                  {{ wanSliceFormat(row.batchTaskPublishNum) || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="watchNum" label="播放数" min-width="100" sortable>
                <template #default="{ row }">{{ wanSliceFormat(row.watchNum) || '-' }}</template>
              </el-table-column>
              <el-table-column prop="likeNum" label="点赞数" min-width="100" sortable>
                <template #default="{ row }">{{ wanSliceFormat(row.likeNum) || '-' }}</template>
              </el-table-column>
              <el-table-column prop="shareNum" label="分享数" min-width="100" sortable>
                <template #default="{ row }">{{ wanSliceFormat(row.shareNum) || '-' }}</template>
              </el-table-column>
              <el-table-column prop="commentNum" label="评论数" min-width="100" sortable>
                <template #default="{ row }">{{ wanSliceFormat(row.commentNum) || '-' }}</template>
              </el-table-column>
              <!--              <el-table-column prop="useNum" label="使用次数" min-width="120" sortable>-->
              <!--                <template #default="{ row }">{{ wanSliceFormat(row.useNum) || '-' }}</template>-->
              <!--              </el-table-column>-->
            </xm_table>
          </div>
        </div>
      </div>
      <basicinfoDOM
        :activeComponents="activeComponents"
        v-if="basicInfoDialog.show"
        :infoDialog="basicInfoDialog"
        @changeName="changeName"
        @resetList="searchList"
      ></basicinfoDOM>
      <el-dialog
        custom-class="export_dialog choose_part_dialog"
        destroy-on-close
        title="导出任务"
        width="444px"
        @close="exportDialog.show = false"
        v-model="exportDialog.show"
      >
        <div class="block">
          <span class="label_text">作品创建时间</span>
          <el-tooltip
            class="item"
            effect="dark"
            content="作品创建时间范围内的模板数据"
            placement="top"
          >
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20230304n3g24.png"
              alt=""
              class="export-tips-img"
            />
          </el-tooltip>
          <el-date-picker
            size="small"
            class="export_date_picker"
            v-model="exportDialog.exportDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </div>

        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="exportFun">提交</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <!-- 下载动画 -->
    <expAnmation
      v-if="showExportAnmation"
      :dialogTableVisible="showExportAnmation"
      @closeAnmation="closeAnmation"
    ></expAnmation>
    <!-- 分类管理的弹窗 -->
    <categoryDOM
      v-if="categoryDialog.show"
      :categoryDialog="categoryDialog"
      @updateCategory="getCategoryList"
    />
    <!-- 创作模板的弹窗 -->
    <copyTemplateDOM
      v-if="createDialog.show"
      :copyDialog="createDialog"
      @updateList="searchList"
    ></copyTemplateDOM>
  </div>
</template>

<script setup>
import copyTemplateDOM from './components/template/copyTemplate_dialog.vue'
import categoryDOM from './components/category_dialog.vue'
import expAnmation from '@/components/exp_button/anmation_dialog.vue'
import { exportFileV2 } from '@/utils/exportFile'
import { ElMessage } from 'element-plus'
import { wanSliceFormat, throttle, dateFormat } from '@/utils/tools.js'
import card from '@/assets/images/content_center/card_white.png'
import table from '@/assets/images/content_center/line_white.png'
import card2 from '@/assets/images/content_center/card_gray.png'
import table2 from '@/assets/images/content_center/line_gray.png'
import basicinfoDOM from './components/basicInfo_dialog.vue'
import swiperDOM from './components/swiper.vue'
import {
  categoryList,
  page,
  pageTemplateCountList,
  exportExcel
} from '@/api/sumvideo/creative_mould.js'
import { getQuery } from '@/utils/get_query.js'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useStore } from 'vuex'
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
const router = useRouter()
const activeComponents = ref('company') // sumvideo在方法里有用到 但是没找到修改他的方法
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

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
    type: 'selectByGroup',
    label: '模板分类',
    val: null,
    defaultVal: null,
    placeholder: '请选择分类',
    filed: 'categoryId',

    selectDefultName: ['id', 'categoryName'],
    childName: 'childCategoryList',
    selects: []
  },
  {
    showLabelTip: true,
    type: 'select',
    label: '开放模板',
    placeholder: '请选择是否为开放模板',
    val: -1,
    defaultVal: -1,
    filed: 'isOpenTemplate',
    selects: [
      {
        value: -1,
        label: '全部'
      },
      {
        label: '是',
        value: 1
      },
      {
        label: '否',
        value: 0
      }
    ]
  }
])
const choiceList = [
  {
    image: card,
    image2: card2
  },
  {
    image: table,
    image2: table2
  }
]
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
      searchComponents.value[3].selects = res.data || []
    }
  })
}
getCategoryList()
// 获取列表
function getList() {
  console.log('getlist', tableForm)
  if (tableForm.tabIndex === 0) {
    tableForm.page.size = 32
    // 图片列表
    getListOfWiper()
  } else {
    tableForm.page.size = 10
    // 表格
    getListOfTable()
  }
}
// 图片列表的滚动事件
function loadSwiperFun() {
  tableForm.loading = true
  tableForm.page.index++
  getListOfWiper()
}
function getListOfWiper() {
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
  // getRoomList(data)
  //   .then(res => {
  //     if (res.code === 0) {
  //       tableForm.listData = res.data.records || []
  //       tableForm.page.total = res.data.total || 0
  //     } else {
  //       if (tableForm.page.index === 1) {
  //         tableForm.listData = []
  //       }
  //     }
  //     tableForm.loading = false
  //   })
  //   .catch(() => {
  //     tableForm.loading = false
  //   })
}
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
  return param
}
const sortInfo = ref({})
function handleSortChange(value) {
  console.log('排序value', value)
  // ascending  descending
  sortInfo.value = {
    orderBy: value.order === 'descending' ? 2 : 1,
    orderItem: value.prop
  }
  getList()
}
// 表格列表的请求
function getListOfTable() {
  tableForm.loading = true
  const param = getParam()
  console.log(param, 'param')
  // 加上表格排序参数
  param.condition = Object.assign(
    param.condition,
    sortInfo.value && sortInfo.value.orderItem
      ? sortInfo.value
      : {
          orderBy: 2,
          orderItem: 'mergeVideoNum' // 默认合成数量排序
        }
  )
  pageTemplateCountList(param)
    .then(res => {
      console.log('表格数据', res)
      if (res.code === 0) {
        tableForm.listData = res.data.records || []
        tableForm.page.total = res.data.total || 0
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
//
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
// 开启/关闭模板触发的刷新列表
function openToResetList(notUseLoading) {
  if (!notUseLoading) {
    tableForm.loading = true
  }
  tableForm.page.index = 1
  getList()
}
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}

// 表格切换
function changeTab(e) {
  tableForm.tabIndex = e
  resetSearch()
}
function timFilter(ms) {
  // 微秒
  return ms ? parseInt(ms / 1000000) + 's' : 0
}

// 基本信息弹窗
const basicInfoDialog = reactive({
  id: null,
  show: false
})
const openDetail = throttle((id, index) => {
  basicInfoDialog.id = id
  basicInfoDialog.index = index
  basicInfoDialog.show = true
}, 500)
function changeName(name, index) {
  tableForm.listData[index].name = name
}
// 导出
const exportDialog = reactive({
  show: false,
  exportDateRange: []
})
const showExportFun = throttle(() => {
  exportDialog.exportDateRange = [
    dateFormat(new Date(new Date().setMonth(new Date().getMonth() - 1, new Date().getDate()))),
    dateFormat(new Date(new Date().setDate(new Date().getDate() - 1)))
  ]
  exportDialog.show = true
}, 500)
const showExportAnmation = ref(false)
function closeAnmation() {
  showExportAnmation.value = false
}
// 导出接口
const exportFun = throttle(() => {
  console.log('daochu', exportDialog.exportDateRange)
  if (!(exportDialog.exportDateRange && exportDialog.exportDateRange.length > 0)) {
    ElMessage({
      message: '请选择导出时间范围',
      type: 'warning'
    })
  } else {
    const param = getParam()
    const data = {
      videoDataStartCreateTime: exportDialog.exportDateRange[0] + ' 00:00:00',
      videoDataEndCreateTime: exportDialog.exportDateRange[1] + ' 23:59:59',
      categoryIds: param.condition.categoryIds || [],
      startCreateTime: param.condition.startCreateTime,
      endCreateTime: param.condition.endCreateTime,
      name: param.condition.name
    }

    return exportFileV2(exportExcel, data, '作品维度导出数据', 'xlsx')
      .then(() => {
        exportDialog.show = false
        showExportAnmation.value = true
        //
      })
      .catch(() => {
        exportDialog.show = false
        showExportAnmation.value = true
        //
      })
  }
}, 500)

// 打开回收站
const toRecycle = throttle(() => {
  router.push({
    path: '/sumwhy_video/template_space/recycle_bin'
  })
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

// 创作模板
const createDialog = reactive({
  isCreate: true,
  origin: 'creative_mould',
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

const cloudCardRef = ref(null)
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
    if (tableForm.tabIndex === 0) {
      tableForm.page.index = 1
      getListOfWiper()
      if (srcollTop.value) {
        const el = document.querySelector('.el-main')
        el.scrollTop = srcollTop.value
      }
    } else {
      getList()
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
  const leavePage = ['/sumwhy_video/template_space/', '/sumvideo/editing_project_web']
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
    .search_choice {
      margin-left: 16px;
    }
    :deep(.el-button + .el-button) {
      margin-left: 16px;
    }
  }
}

.tem_info {
  cursor: pointer;
  margin: 12px 0;
  display: flex;
  align-items: center;

  .digital_icon {
    position: absolute;
    left: 14px;
    top: 12px;
    width: 46px;
    height: 46px;
  }
  .public_icon {
    position: absolute;
    bottom: 0;
    left: 0px;
    width: 60px;
    height: 18px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 0px 0px 2px 2px;
    font-size: 12px;
    font-weight: 400;
    color: #ffffff;
    line-height: 18px;
    text-align: center;
  }
  .cover_img_box {
    width: 60px;
    height: 80px;
    position: relative;
  }
  .cover_img {
    object-fit: cover;
    cursor: pointer;
    overflow: hidden;
    flex-shrink: 0;
    width: 60px;
    height: 80px;
    border-radius: 2px;
    margin-right: 10px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    fail_text {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 14px;
    }

    .fail_icon {
      width: 30px;
      height: 30px;
    }
  }

  .tem_box {
    margin-left: 12px;
    flex-basis: 250px;
    display: inline-block;

    .tem_box--half {
      width: 150px;
    }

    .tem_box--item {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      word-break: break-all;
      line-break: anywhere;
      font-size: 12px;
      font-weight: 400;
      color: #909399;
      line-height: 17px;
      margin-bottom: 2px;
      &:first-child {
        margin-bottom: 5px;
        font-size: 14px;
        font-weight: 400;
        color: #323233;
        line-height: 20px;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
.export_dialog {
  .block {
    display: flex;
    align-items: center;
    padding: 30px 20px;
    .label_text {
      font-size: 15px;
      margin-right: 5px;
    }
    .export_date_picker {
      width: 280px;
    }
    .export-tips-img {
      margin-right: 14px;
      width: 16px;
      height: 16px;
    }
  }
}
.btn_content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
    margin-right: 4px;
  }
}
</style>
