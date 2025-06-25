<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="灵感视频选择"
      width="820px"
      custom-class="rule_setting_dialog hide_footer_line"
      :before-close="handleClose"
    >
      <div class="dialog_content">
        <xm_search
          :searchComponents="searchComponents"
          @getData="querySearch"
          @reset="resetSearch"
          ref="xmSearchRef"
        />
        <div class="loading_warp" v-loading="tableForm.loading && tableForm.page.index === 1"></div>
        <div
          class="list_warp"
          ref="listWarpRef"
          :infinite-scroll-delay="1000"
          v-infinite-scroll="loadFun"
          :infinite-scroll-distance="50"
          :infinite-scroll-immediate="false"
          :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
        >
          <template v-if="tableForm.listData.length > 0">
            <div
              class="video_item"
              v-for="item in tableForm.listData"
              :key="item.id"
              @click.stop="previewFun(item)"
            >
              <img :src="item.videoCoverUrl" alt="" class="cover" />
              <div class="video_black">
                <div class="info_top">
                  <div class="platform_warp" v-if="item.platform">
                    <div
                      :class="`xm_platformIcon_${item.platform}`"
                      style="left: 4px; bottom: 3px; width: 16px; height: 16px"
                    ></div>
                    {{ `${PLATFORM.getCN(item.platform) || '抖音'}灵感` }}
                  </div>
                  <div class="time_box">
                    <img
                      class="icon_time"
                      src="https://tagvv-1256030678.file.myqcloud.com/20221206hh7q6.png"
                      alt=""
                    />
                    {{ getTimeFun(item.videoDuration) }}
                  </div>
                </div>
                <div
                  class="title_box line-hidden2"
                  v-if="item.videoTitle"
                  :title="item.videoTitle || ''"
                >
                  {{ item.videoTitle || '' }}
                </div>
                <div class="radio_box" @click.stop="beforeSelect(item)">
                  <div class="radio_choose" v-if="currentItem.id === item.id"></div>
                  <div class="radio_unchooose" v-else></div>
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
                  ? tableForm.listData.length > 5
                    ? '已经到底了~'
                    : ''
                  : '上拉加载更多~'
              }}
            </div>
          </template>

          <div class="xm_noneData" v-if="tableForm.listData.length === 0">
            <img src="@/assets/images/content_center/no_activity.png" alt />
            暂无数据
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="saveLoading" @click="closeDialog">取消</el-button>
          <el-button
            type="primary"
            :disabled="saveLoading || isEmpty(currentItem)"
            :saveLoading="saveLoading"
            @click="handleConfirm"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { inspirationVideoPage } from '@/api/content_center/video_library.js'
import { getQuery } from '@/utils/get_query.js'
import { throttle, isEmpty } from '@/utils/tools.js'
import { getTimeFun } from '@/views/content_center/content_repository/video_library/js/index.js'
import { PLATFORM } from '@/utils/dictionary/company.js'

const props = defineProps({
  inspirationDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.inspirationDialog, 'show')
const emits = defineEmits(['closeDialog', 'preview', 'select'])
const saveLoading = ref(false) // 按钮的确定Loading
const currentItem = ref({}) // 选择的那个
const listWarpRef = ref(null)
// 视频预览的弹窗
const videoDialog = reactive({
  show: false,
  url: ''
})

const searchComponents = ref([
  {
    type: 'select',
    label: '灵感来源',
    placeholder: '请选择灵感来源',
    filed: 'inspirationSource',
    val: -1,
    defaultVal: -1,
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '企业订阅',
        value: 1
      },
      {
        label: '员工订阅',
        value: 2
      },
      {
        label: '本地上传',
        value: 3
      }
    ]
  },
  {
    type: 'input',
    label: '灵感标题',
    val: '',
    placeholder: '请输入灵感标题',
    filed: 'videoTitle'
  },
  {
    type: 'select',
    label: '灵感状态',
    placeholder: '请选择灵感状态',
    filed: 'videoStatus',
    val: -1,
    defaultVal: -1,
    selectDefultName: ['id', 'name'],
    selects: [
      {
        name: '全部',
        id: -1
      },
      {
        id: 1,
        name: '可见'
      },
      {
        id: 0,
        name: '隐藏'
      }
    ]
  },
  {
    type: 'select',
    label: '所属平台',
    placeholder: '请选择平台',
    filed: 'platform',
    val: -1,
    defaultVal: -1,
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '抖音',
        value: 1
      },
      {
        label: '小红书',
        value: 3
      },
      {
        label: '快手',
        value: 4
      }
    ]
  }
])

const tableForm = reactive({
  loading: true,
  listData: [],
  newListData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})

// 选择
function beforeSelect(item) {
  currentItem.value = item
}

// 查看详情
const previewFun = throttle(function (e) {
  console.log('e', e)
  videoDialog.url = e.videoPlayUrl
  videoDialog.show = true
  emits('preview', videoDialog)
}, 700)

const loadFun = throttle(function () {
  tableForm.loading = true
  tableForm.page.index++
  getList()
}, 100)

function getList() {
  const data = getQuery(searchComponents.value)
  if (data.inspirationSource === 1) {
    data.source = 1
  } else if (data.inspirationSource === 2) {
    data.source = 2
  } else if (data.inspirationSource === 3) {
    data.uploadType = 1
  }
  data.mediaType = 4
  data.orderSetting = 'DESC:gmt_update'
  data.pageSize = tableForm.page.size
  data.pageNo = tableForm.page.index
  if (data.pageNo === 1) {
    listWarpRef.value?.scrollTo(0, 0)
  }
  inspirationVideoPage(data)
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
    })
    .catch(() => {
      if (tableForm.page.index === 1) {
        tableForm.listData = []
        tableForm.page.total = 0
      }
      tableForm.loading = false
    })
}

// 查询
function querySearch() {
  tableForm.loading = true
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

const handleConfirm = throttle(() => {
  const info = {
    url: currentItem.value.videoPlayUrl,
    name: currentItem.value.videoTitle
  }
  emits('select', info)
  handleClose()
})
function closeDialog() {
  dialog.value.handleClose()
}
function handleClose(done) {
  emits('closeDialog')
  done && done()
}
onMounted(() => {
  resetSearch()
})
</script>
<style lang="scss" scoped>
.dialog_content {
  // padding: 16px 16px 20px 16px;
  width: 100%;
  position: relative;
  :deep(.xm_search) {
    padding: 16px 16px 0 16px;
  }
  .loading_warp {
    width: 100%;
    height: 368px;
    position: absolute;
    bottom: 0;
    left: 0;
  }
  .list_warp {
    width: 100%;
    height: 368px;
    box-sizing: border-box;
    padding-left: 16px;
    padding-bottom: 12px;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    position: relative;

    .video_item {
      width: 147px;
      height: 210px;
      box-sizing: border-box;
      margin-right: 12px;
      margin-bottom: 12px;
      position: relative;
      cursor: pointer;
      .cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: flex;
      }
      .video_black {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        .info_top {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          flex-wrap: wrap;
          .platform_warp {
            border-radius: 4px;
            padding: 2px 4px 2px 22px;
            position: relative;
            background: rgba(0, 0, 0, 0.4);
            margin-right: 8px;
            font-size: 12px;
            font-family: PingFangSC, PingFang SC;
            font-weight: 400;
            color: #ffffff;
            line-height: 18px;
            white-space: nowrap;
            margin-bottom: 8px;
          }
          .time_box {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 4px;
            padding: 2px 4px;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            font-size: 14px;
            font-weight: 400;
            color: #ffffff;
            line-height: 18px;
            margin-bottom: 8px;

            .icon_time {
              width: 16px;
              height: 16px;
              object-fit: contain;
              margin-right: 1px;
            }
          }
          .time_box + .time_box {
            margin-left: 8px;
          }
        }
        .title_box {
          width: 100%;
          font-size: 14px;
          font-weight: 400;
          color: #ffffff;
          line-height: 20px;
        }
        .radio_box {
          z-index: 5;
          position: absolute;
          right: 12px;
          top: 12px;
          .radio_choose {
            cursor: pointer;
            width: 16px;
            height: 16px;
            border: 1px solid #364fcd;
            border-radius: 100%;
            background: #364fcd;
            position: relative;
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
            border: 1px solid #fff;
            border-radius: 100%;
            &:hover {
              border-color: #364fcd;
            }
          }
        }
      }
    }
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
    .xm_noneData {
      height: 100%;
    }
  }
}
</style>
