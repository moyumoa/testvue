<template>
  <div class="digital_model sumvideo_page_xmy">
    <!-- 客户端 -->
    <!-- <down-load-client></down-load-client> -->
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="searchList"
      @reset="resetSearch"
      @openChoseLabel="openChoseLabel"
    ></xm_search>
    <!-- 数据列表 -->
    <div class="manage_table">
      <div style="padding-right: 24px">
        <el-tabs class="tab_box" v-model="chooseTab" @tab-click="changeTab">
          <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.name">
            <template #label>
              <div class="tab_label">{{ tab.label }}</div>
            </template>
          </el-tab-pane>
        </el-tabs>
        <div class="action_btn">
          <el-button type="primary" @click="uploadFun(1)" v-if="chooseTab == 1">
            上传面部模型
          </el-button>
          <el-button type="primary" @click="uploadFun(2)" v-else>上传人物模型</el-button>
          <el-link type="primary" @click="recordFun" style="margin-left: 16px">上传记录</el-link>
        </div>
      </div>
      <div class="video_box" v-loading="tableForm.loading">
        <template v-if="tableForm.listData && tableForm.listData.length > 0">
          <div
            class="all_video"
            :infinite-scroll-delay="1000"
            v-infinite-scroll="loadFun"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
          >
            <div
              class="one_video"
              v-for="(item, index) in tableForm.listData"
              :key="index"
              :style="{
                width: `${oneWidth}px`,
                height: `calc(${oneWidth}px * 1.6 + 29)`
              }"
              @click="toDetail(item)"
            >
              <div
                class="one_box"
                :style="{
                  height: `calc(${oneWidth}px * 1.6)`
                }"
              >
                <img
                  class="video_cover"
                  :src="chooseTab == 1 ? item.coverUrl : item.shadeImg"
                  alt=""
                />

                <img
                  v-if="item.source === 3"
                  class="item_xm"
                  src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/6ba9eaa118b9428fa24f122d37835112_1684475629910.png"
                  alt=""
                />
                <el-tooltip
                  v-if="item.source != 3"
                  effect="dark"
                  content="编辑标签"
                  placement="top"
                >
                  <div class="item_tag" @click.stop="changeTagFun(item, index)">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                      alt=""
                    />
                  </div>
                </el-tooltip>
              </div>
              <div class="video_title line-hidden1">
                {{ item.name || '-' }}
              </div>
            </div>
          </div>
          <div class="loading_library">
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
        <div v-else class="no_echart">
          <img src="@/assets/images/content_center/no_activity.png" alt />
          暂无数据
        </div>
      </div>
    </div>
    <!-- 编辑标签的弹窗 -->
    <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
    <!-- 模型详情的弹窗 -->
    <detailDOM v-if="detailDialog.show" :detailDialog="detailDialog" @updateList="searchList" />
    <!-- 上传模型的弹窗 -->
    <uploadDOM v-if="uploadDialog.show" :uploadDialog="uploadDialog" />
    <!-- 上传记录 -->
    <recordDOM v-if="recordDialog.show" :recordDialog="recordDialog" />
  </div>
</template>
<script setup>
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'

import recordDOM from '@/views/sumvideo/digital_model/components/record_dialog.vue'
import uploadDOM from '@/views/sumvideo/digital_model/components/upload_dialog.vue'
import detailDOM from '@/views/sumvideo/digital_model/components/detail_dialog.vue'

import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'
import { listAllFaceModel } from '@/api/sumvideo/digital_model.js'

import { throttle, getCWidth } from '@/utils/tools.js'
import { getQuery } from '@/utils/get_query.js'
// const uploadLoading = ref(false) // 上传视频的loading
// 选择的tab
const chooseTab = ref(1)
const tabList = ref([
  {
    name: 1,
    label: '面部模型'
  },
  {
    name: 2,
    label: '人物模型'
  }
])
// 筛选条件
const searchComponents = ref([
  {
    type: 'input',
    label: '用户名',
    val: '',
    placeholder: '请输入用户名',
    filed: 'username'
  },
  {
    type: 'input',
    label: '模型名称',
    val: '',
    placeholder: '请输入模型名称',
    filed: 'name',
    hiddenItem: false
  },
  {
    type: 'input',
    label: '手机号',
    val: '',
    placeholder: '请输入手机号',
    filed: 'mobile'
  },
  {
    type: 'chooseDept',
    label: '来源部门',
    val: [],
    filed: 'depIds',
    multiple: true,
    isUsePermission: false
  },
  {
    type: 'dateRange', // 组件类型
    label: '合成时间', // label展示
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    val: null,
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange' // 查询字段名
  },

  {
    type: 'select',
    label: '模型来源',
    placeholder: '全部',
    filed: 'source',
    val: null,
    defaultVal: null,
    selects: [
      {
        label: '云模型',
        value: 1
      },
      {
        label: '品牌模型',
        value: 2
      }
    ]
  },
  {
    type: 'select',
    label: '模型状态',
    placeholder: '全部',
    filed: 'isBanned',
    val: 0,
    defaultVal: 0,
    selects: [
      {
        label: '启用',
        value: 0
      },
      {
        label: '禁用',
        value: 1
      }
    ]
  },
  {
    type: 'select',
    label: '可用范围',
    placeholder: '全部',
    filed: 'everyoneCanUse',
    val: null,
    defaultVal: null,
    selects: [
      {
        label: '全员可用',
        value: 1
      },
      {
        label: '个人可用',
        value: 0
      }
    ]
  },
  {
    type: 'newLabelFilter',
    label: '标签',
    val: [],
    placeholder: '请输入标签关键词',
    filed: 'tagIds'
  }
])
// 表格的查询条件
const tableForm = reactive({
  loading: true,
  listData: [],
  page: {
    index: 1,
    size: 50,
    total: 0
  }
})

const addTagDialog = reactive({
  show: false,
  id: null,
  hideTitleSpan: false,
  type: null,
  chooseTagList: [],
  index: [],
  source: null
})

const choseLabelList = ref([]) // 筛选项里选中的标签列表
// 打开选择标签弹窗
function openChoseLabel() {
  addTagDialog.type = 14
  addTagDialog.id = null
  addTagDialog.hideTitleSpan = false
  addTagDialog.index = []
  addTagDialog.source = null
  addTagDialog.chooseTagList = choseLabelList.value || []
  addTagDialog.show = true
}
// 打开设置标签弹窗
function changeTagFun(e, index) {
  addTagDialog.type = 4
  addTagDialog.hideTitleSpan = true
  addTagDialog.id = e.modelId
  addTagDialog.index = [index]
  addTagDialog.source = 0
  addTagDialog.chooseTagList = e.tagList || []
  addTagDialog.show = true
}
// 更新标签
function updateTag(e) {
  if (addTagDialog.type === 4) {
    tableForm.listData[addTagDialog.index[0]].tagList = e
  } else {
    choseLabelList.value = e
    // 传值给search组件
    const arr = ref([])
    choseLabelList.value.forEach(item => {
      arr.value.push(item.id)
    })
    searchComponents.value[8].val = arr.value
  }
}
// tab切换
function changeTab() {
  tableForm.loading = true
  tableForm.listData = []
  // searchComponents.value[1].val = ''
  // searchComponents.value[1].hiddenItem = chooseTab.value === 2
  searchList()
}
// 重置
function resetSearch() {
  // 重置的时候将已选择的标签全部清空
  choseLabelList.value = []
  tableForm.loading = true
  tableForm.page = {
    index: 1,
    size: 50,
    total: 0
  }
  getList()
}
resetSearch()
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
function getList() {
  const data = getQuery(searchComponents.value, ['modelCreateStartTime', 'modelCreateEndTime'])
  data.modelType = chooseTab.value
  data.searchCount = true
  data.isSearchModelLibrary = true
  data.orderSetting = 'DESC:model_create_time'
  data.pageNo = tableForm.page.index
  data.pageSize = tableForm.page.size
  listAllFaceModel(data)
    .then(res => {
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
const loadFun = throttle(function () {
  console.log('滚动到底了')
  tableForm.loading = true
  tableForm.page.index++
  getList()
}, 1000)
const cLen = ref(8)
const listWidth = ref()
const oneWidth = ref(200)
function getWidth() {
  listWidth.value = getCWidth() - 32 - 24 - 7
  init()
}
getWidth()
function init() {
  cLen.value = Math.floor((getCWidth() - 32 - 24 - 140) / 200)
  oneWidth.value = Math.floor(listWidth.value / cLen.value) - 1
}
onMounted(() => {
  window.onresize = () => {
    getWidth()
  }
})
onUnmounted(() => {
  window.onresize = null
})
const detailDialog = reactive({
  show: false
})
// 打开详情的弹窗
const toDetail = throttle(item => {
  detailDialog.modelId = item.modelId
  detailDialog.info = item
  detailDialog.type = chooseTab.value
  detailDialog.show = true
})
// 上传模型的弹窗
const uploadDialog = reactive({
  show: false,
  type: null
})
const uploadFun = throttle(type => {
  uploadDialog.type = type
  uploadDialog.show = true
})
// 上传记录
const recordDialog = reactive({
  show: false,
  type: null
})
const recordFun = throttle(type => {
  recordDialog.type = chooseTab.value
  recordDialog.show = true
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.manage_table {
  border-radius: 4px;
  padding: 30px 0 30px 24px;
  background: #fff;
  margin-top: 10px;
  position: relative;
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
  :deep(.el-tabs__header) {
    padding: 0 !important;
  }
  .batch-operation {
    position: absolute;
    top: 15px;
    right: 400px;
    display: flex;
    > div {
      height: 32px;
      line-height: 32px;
      margin-right: 16px;
    }
  }
  .action_btn {
    position: absolute;
    top: 0px;
    right: 24px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    height: 65px;
    line-height: 32px;
  }
  .tab_box {
    background: #fff;
    .tab_label {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      img {
        display: flex;
        width: 14px;
        height: 14px;
      }
    }
  }
}
// 列表

.loading_library {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 15px;

  img {
    height: 25px;
    margin-right: 4px;
  }
}

.video_box {
  width: 100%;
  background: #ffffff;
}

.all_video {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
}

.one_video {
  padding: 0 20px 20px 0;
  cursor: pointer;
  .one_box {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    position: relative;

    .video_cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }

    .item_xm {
      width: 52px;
      height: 52px;
      position: absolute;
      transform: rotate(270deg);
      left: 0;
      top: 0;
    }
    .item_tag {
      opacity: 0;
      position: absolute;
      right: 12px;
      top: 12px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      background: rgba(0, 0, 0, 0.4);
      img {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }
    }
  }
  .video_title {
    margin-top: 12px;
    width: 100%;
    text-align: center;
    font-size: 12px;
    font-weight: 400;
    color: #303133;
    line-height: 17px;
  }
}
.one_video:hover {
  .item_tag {
    opacity: 1 !important;
  }
}
.no_echart {
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #8f939a;
  line-height: 20px;
  img {
    width: 70px;
    height: 70px;
    object-fit: cover;
    margin-bottom: 7px;
  }
}
</style>
