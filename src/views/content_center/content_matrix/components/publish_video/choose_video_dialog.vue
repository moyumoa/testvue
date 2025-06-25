<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :title="`选择${
        pageSource == 'batchPublishCreate' && subSource == 'batchPublishImgtext' ? '图文' : '视频'
      }`"
      :width="820"
      custom-class="rule_setting_dialog"
    >
      <div class="dialog_content sumvideo_page">
        <xm_search
          :searchComponents="searchComponents"
          :useOwnReset="true"
          @getData="querySearch"
          @reset="resetSearch"
          ref="xmSearchRef"
          @openChoseLabel="openChoseLabel"
        />
        <div class="switch_box">
          <span style="margin-right: 8px">
            {{
              `过滤已使用的${
                pageSource == 'batchPublishCreate' && subSource == 'batchPublishImgtext'
                  ? '图文'
                  : '视频'
              }`
            }}
          </span>
          <el-switch
            :loading="tableForm.switchLoading"
            @change="querySearch"
            v-model="tableForm.switch"
            inline-prompt
            :width="45"
            :active-value="1"
            :inactive-value="0"
          ></el-switch>
          <div class="top_btn" v-if="multiple">
            <el-button @click="cancelChooseAll">取消全选</el-button>
            <el-button type="primary" style="margin-left: 24px" @click="chooseAll">
              全选本页
            </el-button>
          </div>
        </div>
        <div class="video_box2" v-loading="tableForm.loading">
          <div class="video_box" :class="{ video_box_multiple: multiple }">
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
                    height: `calc((${oneWidth}px - 12px) * 1.778 + 12px + 32px)`
                  }"
                >
                  <div
                    class="one_box"
                    @mouseenter="enter($event, item)"
                    @mouseleave="leave($event, item)"
                    @click.stop="beforeSelect(item)"
                  >
                    <div class="animation_box" v-if="mouseId == item.id">
                      <!-- 视频区域 -->
                      <div class="animation_video_box">
                        <!-- 视频 合成成功-->
                        <video
                          class="video_self"
                          :src="item.url"
                          :poster="item.coverUrl"
                          playsinline
                          autoplay
                          loop
                          muted
                          v-if="
                            !pageSource ||
                            (pageSource === 'batchPublishCreate' &&
                              subSource === 'batchPublishVideo')
                          "
                        ></video>
                        <img
                          v-else
                          :src="item.thumbCoverUrl || item.coverUrl"
                          alt=""
                          class="video_self"
                        />
                        <el-tooltip :content="item.name" placement="top">
                          <div class="video_title line-hidden1">
                            {{ item.name || '--' }}
                          </div>
                        </el-tooltip>
                      </div>
                    </div>
                    <div v-else class="origin_box">
                      <img
                        class="video_cover"
                        :src="item.thumbCoverUrl || item.coverUrl || defaultCover"
                        alt
                      />
                      <div class="video_title line-hidden1">
                        {{ item.name || '--' }}
                      </div>
                    </div>
                    <!-- 单选框 -->
                    <div class="radio_box" @click.stop="beforeSelect(item)">
                      <template v-if="multiple">
                        <div class="radio_choose" v-if="chooseIds.includes(item.id)"></div>
                        <div class="radio_unchooose" v-else></div>
                      </template>
                      <template v-else>
                        <div class="radio_choose" v-if="chooseInfo.id === item.id"></div>
                        <div class="radio_unchooose" v-else></div>
                      </template>
                    </div>
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
                    ? tableForm.listData.length > 12
                      ? '已经到底了~'
                      : ''
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
      </div>
      <template #footer>
        <div class="footer_warp">
          <div class="choose_num" v-if="showChooseNum">
            已选择
            <span class="num_span">
              {{ multiple ? chooseVideoList.length || 0 : isEmpty(chooseInfo) ? 0 : 1 }}
            </span>
            个
          </div>
          <div v-else></div>
          <span class="dialog-footer">
            <el-button @click="closeDialog">取消</el-button>
            <el-button
              type="primary"
              :disabled="
                (isEmpty(chooseInfo) && !multiple) || (multiple && chooseVideoList.length <= 0)
              "
              @click="handleConfirm"
            >
              确定
            </el-button>
          </span>
        </div>
      </template>
    </el-dialog>
    <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
  </div>
</template>
<script setup>
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'
import { getQuery } from '@/utils/get_query.js'

import { getWorkLibraryListV2 } from '@/api/content_center/content_repository.js'

import { throttle, isNotEmpty, isEmpty } from '@/utils/tools.js'
const props = defineProps({
  chooseDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  },
  pageSource: {
    type: String,
    default: '' // 引用的页面 batchPublishCreate批量发布
  },
  subSource: {
    type: String,
    default: 'batchPublishVideo' // 引用补充类别区分 batchPublishVideo 批量发布选择视频 batchPublishImgtext 批量发布选择图文
  },
  multiple: {
    type: Boolean,
    default: false
  }, // 是否多选
  showChooseNum: {
    type: Boolean,
    default: false
  } // 是否显示已选数量
})
const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')

const dialog = ref()
const show = toRef(props.chooseDialog, 'show')
const { multiple, showChooseNum, pageSource, subSource } = toRefs(props)

const chooseInfo = ref({}) // 选中的数据
const chooseVideoList = ref([]) // 多选时选中的列表ids
const oneWidth = ref(132)
// 筛选条件
const searchComponents = ref([
  {
    type: 'dateRange', // 组件类型
    label: `${
      pageSource.value === 'batchPublishCreate' && subSource.value === 'batchPublishImgtext'
        ? '图文'
        : '视频'
    }创建时间`, // label展示
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    defaultVal: [new Date(new Date().setDate(new Date().getDate() - 2)), new Date()],
    val: [new Date(new Date().setDate(new Date().getDate() - 2)), new Date()], // 默认是近七天的数据
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange' // 查询字段名
  },
  {
    type: 'input',
    label: '合成任务',
    val: '',
    placeholder: '请输入合成任务名称',
    filed: 'pipelineTaskName'
  },
  {
    type: 'newLabelFilter',
    label: '素材标签',
    val: [],
    placeholder: '请输入标签关键词',
    filed: 'tags1'
  },
  {
    type: 'input',
    label: '模板名称',
    val: '',
    placeholder: '请输入模板名称',
    filed: 'templateName'
  },
  {
    type: 'fail',
    label: '文件夹',
    val: {}, // 已选择的
    filed: 'folderIds',
    placeholder: `请选择${
      pageSource.value === 'batchPublishCreate' && subSource.value === 'batchPublishImgtext'
        ? '素材'
        : '视频'
    }所属文件夹`,
    failType: 'listCreationTagFolder', // 从素材库选择
    hiddenItem: true
  },
  {
    type: 'input',
    label: `${
      pageSource.value === 'batchPublishCreate' && subSource.value === 'batchPublishImgtext'
        ? '图文'
        : '视频'
    }名称`,
    val: '',
    placeholder: `请输入${
      pageSource.value === 'batchPublishCreate' && subSource.value === 'batchPublishImgtext'
        ? '图文'
        : '视频'
    }名称`,
    filed: 'name'
  }
])

const tableForm = reactive({
  switchLoading: false, // 过滤的Loading
  loading: false,
  tags1: [], // 选择的标签
  switch: 1, // 是否过滤
  listData: [],
  page: {
    index: 1,
    size: 24,
    total: 0
  }
})
// function switchChange(){
//   querySearch()
// }
const addTagDialog = reactive({
  show: false,
  id: null,
  hideTitleSpan: false,
  type: null,
  chooseTagList: [],
  index: [],
  source: null
})

// 已选则的ids
const chooseIds = computed(() => {
  return chooseVideoList.value.map(x => x.id)
})
// 多选
function chooseMultiple(item) {
  console.log('多选', item)
  // 如果选中列表有就去除，没有就添加
  if (chooseIds.value.includes(item.id)) {
    chooseVideoList.value = chooseVideoList.value.filter(x => x.id !== item.id)
    item.checked = false
  } else {
    chooseVideoList.value.push(item)
    item.checked = true
  }
}
// 单选
function chooseOne(item) {
  chooseInfo.value = item
}
// 选择一个
const beforeSelect = throttle(function (item) {
  if (multiple.value) {
    chooseMultiple(item)
  } else {
    chooseOne(item)
  }
}, 500)
function batchRemoveFun(dataList) {
  dataList.forEach(x => {
    if (x.checked) {
      x.checked = false
    }
  })
  // const getId2 = dataList.map(item => item.id)
  // const list2 = chooseVideoList.value.filter(x => !getId2.includes(x.id))

  // chooseVideoList.value = list2
}
// 清空全选
const cancelChooseAll = throttle(function () {
  chooseVideoList.value = []
  batchRemoveFun(tableForm.listData)
}, 500)
// 全选当页
const chooseAll = throttle(function () {
  console.log('点击去选')
  // 判断当前是否有数据 没有就return
  if (tableForm.listData.length === 0) return
  // 判断当前是否有未选择的数据 有就是把那些未选择都改成选择 否则 就是取消当前页面的所有数据
  const unCheckList = tableForm.listData.filter(x => !x.checked)
  if (unCheckList && unCheckList.length > 0) {
    // 把未选中的都改成选中状态 并且把ID添加到chooseIds里
    const list = []
    tableForm.listData.forEach(x => {
      if (!x.checked) {
        x.checked = true
        list.push(x)
      }
    })
    chooseVideoList.value = chooseVideoList.value.concat(list)
  } else {
    console.log('逻辑上没有去除全选，只有选中，所以只添加即可')
  }
}, 500)
// 去除某一页的全选
// const unSelectPage(){
// const ids2 = []
// tableForm.listData.forEach(x => {
//   x.checked = false
//   ids2.push(x.openId)
// })
// chooseVideoList.value = compareAndRemoveDuplicatesV2(chooseVideoList.value, ids2)
// }
// 去除选择的视频
// function compareAndRemoveDuplicatesV2(list, ids) {
//   const result = list.filter(x => !ids.includes(x.openId))
//   return result
// }

// 打开设置标签弹窗
function openChoseLabel() {
  addTagDialog.type = 12
  addTagDialog.hideTitleSpan = true
  addTagDialog.id = null
  addTagDialog.index = []
  addTagDialog.source = null
  addTagDialog.chooseTagList = tableForm.tags1 || []
  addTagDialog.show = true
}
// 查询的回调
function querySearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
// 更新标签
function updateTag(e) {
  tableForm.tags1 = e
  const arr = ref([])
  tableForm.tags1.forEach(item => {
    arr.value.push(item.id)
  })
  searchComponents.value[2].val = arr.value
}

// 重置的回调
function resetSearch() {
  tableForm.tags1 = []
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 24
  querySearch()
}
resetSearch()
function getList() {
  tableForm.page.loading = true
  // 处理请求参数
  const data = getQuery(searchComponents.value, ['createTimeMin', 'createTimeMax'])
  data.pageNo = tableForm.page.index
  data.pageSize = tableForm.page.size
  data.useTimesMax = tableForm.switch === 1 ? 0 : ''
  data.type = [1] // // 1视频 99图文
  data.isDelete = 0
  if (pageSource.value === 'batchPublishCreate' && subSource.value === 'batchPublishImgtext') {
    data.source = 16
    data.type = [99]
  }
  // 发送请求
  getWorkLibraryListV2(data)
    .then(res => {
      if (res.code === 0) {
        const { records: list = [] } = res.data
        const resultList = list.map(x => {
          let checked = false
          if (chooseIds.value.includes(x.id)) {
            checked = true
          }
          return {
            ...x,
            checked: checked
          }
        })
        if (tableForm.page.index === 1) {
          tableForm.listData = resultList
          tableForm.page.total = res.data.total || 0
        } else {
          tableForm.listData = tableForm.listData.concat(resultList)
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
const loadFun = throttle(function () {
  tableForm.loading = true
  tableForm.page.index++
  getList()
}, 1000)
const emits = defineEmits(['updateChooseFun'])
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  if (isNotEmpty(chooseInfo.value) && !multiple.value) {
    emits('updateChooseFun', chooseInfo.value)
  }
  if (multiple.value && chooseVideoList.value.length > 0) {
    emits('updateChooseFun', chooseVideoList.value)
  }

  dialog.value.handleClose()
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}

const mouseTimer = ref(null) // 鼠标悬停的定时器
const mouseId = ref(null) // 鼠标悬停放大显示的ID
// 鼠标移入
function enter(e, x) {
  if (!mouseTimer.value) {
    mouseTimer.value = window.setTimeout(() => {
      mouseTimer.value = null
      mouseId.value = x.id
    }, 200) // 停顿一秒
  }
}
// 鼠标挪走
function leave(e) {
  mouseId.value = null
  window.clearTimeout(mouseTimer.value)
  mouseTimer.value = null
}

onMounted(() => {
  if (pageSource.value === 'batchPublishCreate') {
    // 显示筛选项
    searchComponents.value.forEach(item => {
      if (item.type === 'fail') {
        item.hiddenItem = false
      }
    })
  }
})

// 页面销毁时清空ID和放大的定时器
onBeforeMount(() => {
  desotryMouse()
})
function desotryMouse() {
  mouseId.value = null
  window.clearTimeout(mouseTimer.value)
  mouseTimer.value = null
}
</script>
<style lang="scss" scoped>
.dialog_content {
  padding: 16px 0 0px 0px;
  :deep(.xm_search) {
    padding: 0 0 0 16px;
  }
}
.switch_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  // margin: 0px 0 0px 8px;
  padding-left: 16px;
  font-weight: 400;
  font-size: 14px;
  color: #303133;
  line-height: 20px;
  padding-right: 16px;
  .top_btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
.video_box2 {
  width: 100%;
}
.video_box {
  width: 100%;
  max-height: 380px;
  padding-bottom: 12px;
  padding-left: 16px;
  padding-top: 14px;
  overflow-y: auto;
  overflow-x: hidden;
  .loading_library {
    padding-bottom: 12px;
  }
  .no_echart {
    height: 340px;
  }
  :deep(.one_video) {
    position: relative;
    padding: 0 12px 12px 0;
    .one_box {
      min-width: 120px;
      min-height: 213px;
    }
    .radio_box {
      z-index: 5;
      position: absolute;
      right: 8px;
      bottom: 40px;
      .radio_choose {
        cursor: pointer;
        width: 16px;
        height: 16px;
        border: 1px solid #364fcd;
        border-radius: 100%;
        background: #364fcd;
        &::after {
          width: 4px;
          height: 4px;
          border-radius: 100%;
          background-color: var(--el-color-white);
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) scale(1);
          transition: transform 0.15s ease-in;
        }
      }
      .radio_unchooose {
        cursor: pointer;
        width: 16px;
        height: 16px;
        border: 1px solid #dcdfe6;
        border-radius: 100%;
        &:hover {
          border-color: #364fcd;
        }
      }
    }
    .origin_box {
      position: relative;
      .video_cover {
        height: calc(100% - 32px);
      }
    }
    .animation_box {
      width: calc(100% + 24px);
      height: calc(100% + 24px);
      left: -12px;
      top: -12px;
      padding: 12px;
      box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.2);
      .animation_video_box {
        width: 100%;
        height: 100%;

        .video_self {
          background: rgb(51, 51, 51);
          width: 100%;
          height: calc(100% - 32px);
          object-fit: contain;
        }
      }
    }
  }
}
.video_box_multiple {
  padding-top: 0;
  margin-top: 14px;
}
.video_title {
  line-height: 32px;
  overflow: hidden;
  width: 100%;
  text-align: center;
}
.footer_warp {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .choose_num {
    display: flex;
    align-items: center;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: #909399;
    .num_span {
      padding: 0 4px;
      color: #364fcd;
    }
  }
}
</style>
