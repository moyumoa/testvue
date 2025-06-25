<template>
  <div>
    <xm_search
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="searchList"
      @reset="resetSearch"
      ref="xmSearchRef"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportFun">导出</exp_button>
      </template>
    </xm_search>

    <div class="page_content">
      <xm_table
        class="pic_table"
        tableType="default"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="140" label="任务名称">
          <template #default="{ row }">{{ row.jobName || '--' }}</template>
        </el-table-column>
        <el-table-column min-width="110" label="合成方式">
          <template #default="{ row }">
            <div>{{ SYNTHESISTASK_TYPE.getCN(row.pipelineType || 1) }}</div>
          </template>
        </el-table-column>
        <el-table-column min-width="110" label="任务状态">
          <template #default="{ row }">
            <el-tooltip
              :disabled="row.status != 4 || (row.status == 4 && !row.errorLog)"
              popper-class="tooltip-class tooltip_group_list"
              placement="right"
            >
              <template #content>
                <div style="max-width: 400px; max-height: 400px; overflow-y: auto">
                  {{ row.errorLog || '--' }}
                </div>
              </template>
              <div class="xm_status_content" style="width: max-content">
                <div
                  :class="
                    'status_circle ' +
                    SYNTHESISTASK_STATUS.getCN(isPreview(row) ? row.mergeStatus : row.status || 0)
                      .class
                  "
                ></div>
                <div>
                  {{
                    SYNTHESISTASK_STATUS.getCN(isPreview(row) ? row.mergeStatus : row.status || 0)
                      .label
                  }}
                </div>
                <img
                  v-if="row.status == 4 && row.errorLog"
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 13px; height: 13px; margin-left: 8px"
                />
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column min-width="110" label="合成素材数">
          <template #default="{ row }">
            <span v-if="isPreviewSysthesising(row)">
              {{ row.successNum || 0 }}/{{ row.previewNumber || 0 }}
            </span>
            <span v-else>{{ row.successNum || 0 }}/{{ row.submitNum || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column width="200" label="提交时间">
          <template #default="{ row }">
            {{ row.createTime ? String(row.createTime).replace(/T/, ' ') : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="right" header-align="right">
          <template #default="{ row }">
            <div class="link_warp">
              <!-- :disabled="row.status === 4" 终止情况下：一条都没合成成功就隐藏了，有合成成功时候就显示 -->
              <el-link
                v-if="
                  row.pipelineType !== 6 &&
                  (row.status !== 4 || (row.status == 4 && row.successNum > 0))
                "
                type="primary"
                @click="toDetail(row)"
              >
                详情
              </el-link>
              <!-- 只有企业版才有图文任务 -->
              <div v-else-if="systemVersion == 3 && row.pipelineType == 6">
                <el-link
                  type="primary"
                  @click="toDetail(row)"
                  v-if="row.status !== 4 || (row.status == 4 && row.successNum > 0)"
                >
                  详情
                </el-link>
                <span v-else>-</span>
              </div>

              <div class="clone_label" v-if="row.pipelineType !== 6">
                <el-link
                  type="primary"
                  :disabled="row.hasDeletedCreative"
                  @click="beforeCopyTask(row)"
                >
                  克隆任务
                </el-link>
                <el-tooltip effect="dark" v-if="row.hasDeletedCreative" placement="top-end">
                  <template #content>原视频模板被损坏</template>
                  <img
                    src="@/assets/images/content_center/tip_line.png"
                    style="width: 14px; height: 14px; margin-left: 5px"
                    alt
                  />
                </el-tooltip>
              </div>
              <el-link type="primary" v-if="isPreview(row)" @click="beforeContinueCreate(row)">
                继续合成
              </el-link>
              <el-link type="primary" v-if="isPreview(row)" @click="beforeStopCreate(row.id)">
                终止
              </el-link>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { exportFileV2 } from '@/utils/exportFile'
import Track from '@/utils/tracking/index.js'
import { SYNTHESISTASK_STATUS, SYNTHESISTASK_TYPE } from '@/utils/dictionary/sumvideo.js'
import { throttle } from '@/utils/tools.js'
import { useRouter } from 'vue-router'
import {
  page,
  exportBatchTask,
  finishProduce,
  proceedProduce,
  copyBatchTask,
  pipelineDelete
} from '@/api/sumvideo/syntesis_task.js'
import { getQuery } from '@/utils/get_query.js'
import { useStore } from 'vuex'
import { ElMessageBox } from 'element-plus'
import { getProductGoodsPrice } from '@/api/system_setting/brand_info'

const store = useStore()

const systemVersion = computed(() => store.state.user.systemVersion)
const tipAndConfirmDialog = reactive({
  show: false,
  type: '', // copy克隆 continue继续合成 stop停止合成
  title: '提示',
  content: '',
  showCancel: true
})

// 筛选条件
const searchComponents = ref([
  {
    type: 'select',
    label: '合成方式',
    val: -1,
    defaultVal: -1,
    placeholder: '请选择合成方式',
    filed: 'piplineType',
    selects: getPiplineTypeSelects()
  },
  {
    type: 'input',
    label: '任务名称',
    val: '',
    placeholder: '请输入合成任务名称',
    filed: 'jobName'
  },

  {
    type: 'dateRange', // 组件类型
    label: '任务创建时间', // label展示
    val: '', // 响应式绑定
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange' // 查询字段名
  }
])
const oneCouponNum = ref(10)
// 获取普通视频合成需要消耗的数量
function getPrice() {
  return new Promise(resolve => {
    getProductGoodsPrice()
      .then(res => {
        if (res.code === 0) {
          oneCouponNum.value = res.data?.proudctConfig?.videoCost || 1
          console.log('获取到的消耗', res, oneCouponNum.value)
        }
      })
      .finally(() => {
        resolve()
      })
  })
}
getPrice()

// 是否是预览中全部合成成功
function isPreview(row) {
  return (
    row.mergeStatus === 10 &&
    row.finishNum === row.previewNumber &&
    row.finishNum > 0 &&
    row.pipelineType !== 6
  )
}

// 是否是预览中 合成过程中 显示 0/3 1/3 2/3
function isPreviewSysthesising(row) {
  // 有预览的合成中，或合成中，还没合成完一条的时候
  return (
    (row.mergeStatus === 10 && row.finishNum < row.previewNumber) ||
    (row.mergeStatus === 0 && row.finishNum === 0 && row.previewNumber > 0)
  )
}

function getPiplineTypeSelects() {
  const list = [
    {
      label: '全部',
      value: -1
    },
    {
      label: '模板式生成',
      value: 2
    },
    {
      label: '剧本式生成',
      value: 3
    },
    {
      label: '流水线生成',
      value: 1
    },
    {
      label: '智能混剪',
      value: 4
    },
    {
      label: '图文合成',
      value: 6
    }
  ]

  let hideItem = []
  if (systemVersion.value === 2) {
    hideItem = [1, 4, 5]
  } else if (systemVersion.value === 1 || systemVersion.value === 4) {
    hideItem = [1, 5]
  }

  return list.filter(x => !hideItem.includes(x.value))
}
// 表格的查询条件
const tableForm = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})

// 显示二次提示弹窗 info: id||row
function showTips(id, data) {
  ElMessageBox.confirm(tipAndConfirmDialog.content, tipAndConfirmDialog.title, {
    closeOnClickModal: false,
    closeOnPressEscape: false,
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: tipAndConfirmDialog.showCancel,
    type: '',
    customClass: 'xm_dialog_messageBox',
    dangerouslyUseHTMLString: tipAndConfirmDialog.type === 'continue'
  })
    .then(() => {
      const { type } = tipAndConfirmDialog
      const functionSet = {
        copy: continueCopy,
        continue: continueCreate,
        stop: stopCreate
      }
      functionSet[type](id, data)
    })
    .catch(err => {
      const { type } = tipAndConfirmDialog
      if (type === 'copy' && err === 'cancel') {
        cancelCopy(data)
      }
    })
}

// 克隆任务
const beforeCopyTask = throttle(function (row) {
  tableForm.loading = true
  copyTask(row.id)
}, 500)

// 弹窗提示
function copyTips(id, data) {
  tipAndConfirmDialog.type = 'copy'
  tipAndConfirmDialog.title = '克隆任务'
  tipAndConfirmDialog.content = `原视频生成任务中部分原料被删除，是否继续克隆任务`
  tipAndConfirmDialog.showCancel = true
  tableForm.loading = false
  showTips(id, data)
}
// 继续克隆
function continueCopy(id, data) {
  copySuccess(data)
}
// 取消克隆
function cancelCopy(data) {
  pipelineDelete(data?.pipelineId)
    .then(res => {})
    .catch(() => {})
    .finally(() => {
      tableForm.loading = false
    })
}

// 跳转
function copySuccess(data) {
  tableForm.loading = false
  const { pipelineId, pipelineName, pipelineType, step } = data
  const jumpPageSet = {
    1: `Assemblyline/assemblyline_details?id=${pipelineId}&name=流水线设置&namelabel=${pipelineName}`,
    2: `create_by_template`,
    3: `create_by_script`,
    4: `create_by_foolish`
  }

  if (pipelineType === 1) {
    router.push(`/sumwhy_video/${jumpPageSet[pipelineType]}`)
  } else {
    router.push({
      path: `/sumwhy_video/${jumpPageSet[pipelineType]}`,
      query: {
        pipelineId,
        step
      }
    })
  }
}
// 克隆
function copyTask(id) {
  copyBatchTask({ batchId: id })
    .then(res => {
      if (res.code === 0) {
        const { hasDeletedMaterial } = res.data
        if (hasDeletedMaterial) {
          copyTips(id, res.data)
        } else {
          copySuccess(res.data)
        }
      }
    })
    .catch(() => {
      tableForm.loading = false
    })
}

// 继续合成
const beforeContinueCreate = throttle(function (row) {
  tipAndConfirmDialog.type = 'continue'
  tipAndConfirmDialog.title = '提示'
  // const continueNum = (row.productNum || 0) - (row.finishNum || 0)
  // const useIntegral = (oneCouponNum.value || 10) * continueNum
  tipAndConfirmDialog.content = `本次任务合成每分钟将消耗<span style="color: #364fcd">10</span>AI智能合成星力值，是否确认合成？<br /><span style="color: #8f939a">（扣减数额稍后查看“套餐使用记录”）</span>`
  tipAndConfirmDialog.showCancel = true
  showTips(row.id)
}, 500)

function continueCreate(id) {
  proceedProduce({ batchId: id }).then(res => {
    if (res.code === 0) {
      // message.success('操作成功')
      getList()
    }
  })
}

// 停止合成
const beforeStopCreate = throttle(function (id) {
  tipAndConfirmDialog.type = 'stop'
  tipAndConfirmDialog.title = '终止任务'
  tipAndConfirmDialog.content = `终止任务后将无法继续合成剩下的视频，是否确认终止`
  tipAndConfirmDialog.showCancel = true
  showTips(id)
}, 500)

function stopCreate(id) {
  finishProduce({ batchId: id })
    .then(res => {
      if (res.code === 0) {
        // message.success('操作成功')
        getList()
      }
    })
    .catch(() => {})
}

// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}

// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}

function commonParams() {
  return {
    condition: getQuery(searchComponents.value, ['startTime', 'endTime'])
  }
}
// 导出
const exportFun = () => {
  Track.clickBtn(212)
  return exportFileV2(exportBatchTask, commonParams().condition, '合成任务', 'xlsx')
}
function getList() {
  const param = {
    ...commonParams(),
    pageNum: tableForm.page.index,
    pageSize: tableForm.page.size
  }
  page(param)
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
resetSearch()
const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  if (menuOfKeepAlive('judge')) {
    if (xmSearchRef.value) {
      xmSearchRef.value?.reset()
    } else {
      resetSearch()
    }
    menuOfKeepAlive('reset')
  } else {
    const refresh = sessionStorage.getItem('refresh')
    if (refresh) {
      sessionStorage.removeItem('refresh')
      resetSearch()
    } else {
      getList()
    }
  }
})

const router = useRouter()
// 跳转详情页
const toDetail = throttle(function (row) {
  const isImgText = row.pipelineType === 6
  const url = isImgText
    ? `/sumwhy_video/synthesis_task/detail?id=${row.id}&isImgText=${isImgText}`
    : `/sumwhy_video/synthesis_task/detail?id=${row.id}`
  router.push(url)
}, 500)
</script>
<style lang="scss" scoped>
.page_content {
  margin-top: 16px;
  background: #ffffff;
  border-radius: 4px;
  padding: 16px 16px 16px 24px;
}
:deep(.el-link.el-link--primary.is-disabled) {
  color: #bfc4cd;
}
.link_warp {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .clone_label {
    display: flex;
    align-items: center;
    margin-left: 16px;
  }
  .el-link {
    margin-left: 16px;
    &:first-child {
      margin-left: 0;
    }
  }
}
</style>
