<template>
  <div class="task-video-dialog">
    <el-dialog v-model="isShowDialog" width="1000px" title="选择任务视频">
      <div class="dialog-content">
        <xm_search
          :searchComponents="searchComponents"
          useOwnReset
          @reset="searchList"
          @getData="searchList"
        ></xm_search>
        <el-tabs class="tab_box" v-model="chooseTab" @tab-click="changeTab">
          <template v-for="(tab, i) in tabList" :key="i">
            <el-tab-pane :label="tab.label" :name="tab.name">
              <template #label>
                <div class="tab_label">
                  {{ tab.label }}
                  <img
                    v-if="chooseTab == tab.name"
                    src="@/assets/images/content_center/tab_sort.png"
                    alt
                  />
                </div>
              </template>
            </el-tab-pane>
          </template>
        </el-tabs>
        <div class="task-list">
          <xm_table
            v-loading="loading"
            :data="list"
            :maxTableHeight="'350px'"
            v-model:page="page"
            :highlight-current-row="!selection"
            :pageSizes="[5, 10, 20]"
            @getTableData="getList"
            @current-change="handleCurrentChange"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              v-if="selection"
              type="selection"
              width="55"
              :reserve-selection="true"
            />
            <el-table-column prop="amount1" label="视频" min-width="200">
              <template v-slot="{ row }">
                <div class="video-cell" :style="row.videoUrl ? 'height: 80px;' : 'height: 60px;'">
                  <div v-if="row.videoUrl" @click="playVideo(row)" class="video-img">
                    <img
                      :src="row.videoCoverUrl"
                      style="width: 60px; height: 80px; object-fit: cover"
                      alt
                    />
                    <img class="play-icon" src="@/assets/images/operate/forPlay.png" alt />
                    <div class="platform_img">
                      <div :class="[`xm_platformIcon_${row.platform}`]"></div>
                    </div>
                  </div>
                  <div v-else>
                    <img
                      src="@/assets/images/operate/delete.png"
                      style="width: 60px; height: 60px"
                      alt
                    />
                  </div>

                  <div class="cell-text">
                    {{ row.videoTitle }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="员工信息" min-width="180">
              <template v-slot="{ row }">
                <table_column_matrix_account
                  :info="row"
                  showPhone
                  phone-key="phoneNum"
                  :showDyNum="false"
                  name="name"
                  :showLeaving="row.staffStatus && row.staffStatus == 2"
                ></table_column_matrix_account>
              </template>
            </el-table-column>
            <el-table-column label="关联任务" min-width="150">
              <template v-slot="{ row }">{{ row.taskName || '--' }}</template>
            </el-table-column>
            <el-table-column label="播放数" min-width="100">
              <template v-slot="{ row }">{{ wanSliceFormat(row.playCount || 0) }}</template>
            </el-table-column>
            <el-table-column label="点赞数" min-width="100">
              <template v-slot="{ row }">{{ wanSliceFormat(row.diggCount || 0) }}</template>
            </el-table-column>
          </xm_table>
        </div>
      </div>

      <template #footer>
        <div class="select-count" v-if="selection">
          已选中
          <span style="color: #364fcd">{{ multipleSelection.length }}</span>
          个视频
        </div>
        <span class="dialog-footer">
          <el-button @click="isShowDialog = false">取消</el-button>
          <el-button type="primary" @click="onConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <video-play v-model:show="showPlayVideo" :info="{ videoUrl: currentItem.url }"></video-play>
  </div>
</template>

<script setup>
import { getDetailVideoList } from '@/api/market/task'
import { getQuery } from '@/utils/get_query.js'
import VideoPlay from '@/views/market/miniprogram_operation/components/videoPlay.vue'
import { wanSliceFormat, isEmpty } from '@/utils/tools.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  selection: {
    // 开启多选
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:show', 'confirm'])
const isShowDialog = ref(false)

watch(
  () => props.show,
  value => {
    isShowDialog.value = value
  },
  {
    immediate: true
  }
)

watch(
  () => isShowDialog.value,
  value => {
    emit('update:show', value)
  }
)

const loading = ref(false)
const list = ref([])
const page = ref({
  index: 1,
  size: 5,
  total: 0
})
const searchComponents = ref([
  {
    type: 'input',
    label: '任务名称',
    val: '',
    filed: 'taskName'
  },
  {
    type: 'select',
    label: '视频发布方式',
    val: '',
    filed: 'videoPushMode',
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '相册上传发布',
        value: 1
      },
      {
        label: '创意模板发布',
        value: 3
      },
      {
        label: '一键转发',
        value: 4
      }
    ]
  },
  {
    type: 'dateRange',
    label: '任务时间',
    defaultVal: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],
    val: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],
    isDisEdit: true,
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange' // 查询字段名
  }
])

function searchList() {
  page.value.index = 1
  getList()
}

// 获取视频列表数据
function getList() {
  loading.value = true
  const data = {
    pageNum: page.value.index,
    pageSize: page.value.size
  }
  let condition = getQuery(searchComponents.value, ['startTime', 'endTime'])
  condition = Object.assign(condition, sortInfo)
  data.condition = condition
  data.condition.mediaType = 4
  getDetailVideoList(data)
    .then(res => {
      list.value = res.data.records || []
      page.value.total = res.data.total || 0
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

const chooseTab = ref('v.play_count')
const tabList = [
  {
    name: 'v.play_count',
    label: '播放数排序'
  },
  {
    name: 'v.digg_count',
    label: '点赞数排序'
  }
]
const sortInfo = reactive({
  orderBy: 0,
  orderByItem: 'v.play_count'
})
const changeTab = () => {
  page.value.index = 1
  sortInfo.orderByItem = chooseTab.value
  getList()
}
// 表格单选
let current = {}
const handleCurrentChange = item => {
  current = item
}

// 表格多选
const multipleSelection = ref([])

const handleSelectionChange = value => {
  multipleSelection.value = value
}
const onConfirm = () => {
  isShowDialog.value = false
  if (props.selection) {
    emit('confirm', multipleSelection.value)
  } else if (!isEmpty(current)) {
    emit('confirm', current)
  }
}

const showPlayVideo = ref(false)
const currentItem = ref({})
function playVideo(item) {
  currentItem.value = { url: item.videoUrl }
  showPlayVideo.value = true
}

getList()
</script>

<style lang="scss" scoped>
:deep(.el-table__row) {
  height: 62px;
}

.status-0 {
  background-color: rgba(54, 79, 205, 1);
}

:deep(.el-table__row) {
  height: 62px;
}

.status-0 {
  background-color: rgba(54, 79, 205, 1);
}

.status-1 {
  background-color: rgba(255, 172, 109, 1);
}

.status-2 {
  background-color: rgba(144, 147, 153, 1);
}

.status-3 {
  background-color: rgba(81, 248, 139, 1);
}

.status-4 {
  background-color: rgba(248, 81, 81, 1);
}

:deep .column_header {
  display: flex;
  align-items: center;
}

.task-video-dialog {
  .margin-right-12 {
    margin-right: 12px;
  }

  .dialog-content {
    .xm_search {
      padding: 0 0 8px 0;
    }

    :deep(.el-tabs__header) {
      padding: 0;
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

    :deep(.el-table__cell) {
      .video-cell {
        margin: 10px 0;
        position: relative;
        display: flex;
        align-items: center;

        .video-img {
          width: 60px;
          height: 80px;
          position: relative;

          .platform_img {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 18px;
            height: 18px;
            div {
              width: 18px;
              height: 18px;
            }
          }

          .play-icon {
            background: rgba(0, 0, 0, 0);
            cursor: pointer;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 30px;
            height: 30px;
          }
        }

        .cell-text {
          margin-left: 10px;
          width: 126px;
          @include mult_line(2);
        }
      }
    }

    .search-wrapper {
      margin-bottom: 16px;
    }
  }

  .select-count {
    text-align: left;
    padding-left: 16px;
    font-size: 14px;
    color: #909399;
  }
}
</style>
