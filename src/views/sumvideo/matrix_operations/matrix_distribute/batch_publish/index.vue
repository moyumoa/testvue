<template>
  <div class="batch_publish">
    <xm_search :searchComponents="searchComponents" @getData="querySearch" @reset="resetSearch">
      <template #searchBtn>
        <exp_button :asyncFunc="exportFun">导出</exp_button>
      </template>
    </xm_search>
    <div class="table_warp" v-loading="tableForm.loading">
      <div class="top_info">
        <el-button type="primary" @click="toCreate">批量发布</el-button>
      </div>
      <xm_table
        tableType="avatar"
        class="matrix_table"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="beforeGetList"
      >
        <el-table-column label="ID" min-width="120">
          <template #default="{ row }">
            <div>{{ row.id || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="任务名称" min-width="120">
          <template #default="{ row }">
            <div>{{ row.name || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="发布账号" min-width="180">
          <template #default="{ row }">
            <accountEllipsis
              v-if="row.accounts && row.accounts.length > 0"
              :infinite="true"
              :getListTime="'openAll'"
              :showNum="3"
              :total="row.accountTotal"
              :id="row.id"
              :platFormIcon="true"
              :platFormIconWidth="16"
              :list="row.accounts"
            />
          </template>
        </el-table-column>
        <el-table-column label="任务状态" min-width="120">
          <template #default="{ row }">
            <el-tooltip
              :disabled="row.status !== 0 && row.status !== 4 && row.status !== 3"
              popper-class="tooltip-class tooltip_group_list"
              placement="right"
            >
              <template #content>
                <div style="max-width: 400px; max-height: 400px; overflow-y: auto">
                  <div v-if="row.status == 0">
                    定时发布：将在{{ row.planToPublishTime || '--' }}发布
                  </div>
                  <div v-if="row.status == 4 || row.status == 3">
                    {{ row.status == 4 ? '部分' : '' }}发布失败，请在【发布记录】中查看更多信息
                  </div>
                </div>
              </template>
              <div class="xm_status_content" style="width: max-content">
                <div
                  :class="'status_circle ' + BATCHPUBLISH_TASKSTATUS.getCN(row.status).class"
                ></div>
                <div>{{ BATCHPUBLISH_TASKSTATUS.getCN(row.status).label }}</div>
                <img
                  v-if="row.status == 4 || row.status == 3"
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 16px; height: 16px; margin-left: 4px"
                />
                <img
                  v-if="row.status == 0"
                  src="https://tagvv-1256030678.file.myqcloud.com/20240411zob8n.png"
                  style="width: 16px; height: 16px; margin-left: 4px"
                />
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="任务数据" min-width="250">
          <template #default="{ row }">
            <taskDataNum :info="row" />
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ row.submitTime || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="140" align="right" fixed="right">
          <template #default="{ row }">
            <div class="btn_box">
              <el-link type="primary" @click="choseTask(row)" v-if="row.status === 0">关闭</el-link>
              <el-link type="primary" @click="toDet(row)">详情</el-link>
              <el-link type="primary" @click="toRecords(row)" v-if="row.status !== 0">
                发布记录
              </el-link>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import taskDataNum from '../../components/task_data_num.vue'

import accountEllipsis from '../components/account_ellipsis.vue'
import { exportFileV2 } from '@/utils/exportFile'
import Track from '@/utils/tracking/index.js'
import { getQuery } from '@/utils/get_query.js'
import { throttle } from '@/utils/tools.js'
import { useRouter } from 'vue-router'
import { BATCHPUBLISH_TASKSTATUS } from '@/utils/dictionary/sumvideo.js'
import {
  listPublishTask,
  closeTask,
  exportPublishTaskRecord
} from '@/api/sumvideo/content_distribute.js'

const router = useRouter()

const $confirm = inject('$confirm')
const message = inject('$message')

const emits = defineEmits(['changeTab'])
const searchComponents = ref([
  {
    type: 'input',
    label: '任务名称',
    val: '',
    placeholder: '请输入关联批量发布任务名称',
    filed: 'name'
  },
  {
    type: 'dateRange',
    label: '提交时间',
    val: '',
    disabledDate(time) {
      return time.getTime() > Date.now()
    },
    isDisEdit: true,
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange'
  }
])

const tableForm = reactive({
  loading: false,
  listData: [], // 素材列表
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
function beforeGetList() {
  tableForm.loading = true
  getList()
}
function commonParams() {
  const data = getQuery(searchComponents.value, ['submitTimeMin', 'submitTimeMax'])
  return data
}
// 导出
const exportFun = () => {
  Track.clickBtn(209)
  return exportFileV2(exportPublishTaskRecord, commonParams(), '批量发布', 'xlsx')
}
function getList() {
  const params = {
    ...commonParams(),
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size
  }
  listPublishTask(params)
    .then(res => {
      console.log('获取列表返回', res)
      tableForm.loading = false
      if (res.code === 0) {
        tableForm.page.total = res.data?.total || 0
        tableForm.listData = res.data?.records || []
      }
    })
    .catch(() => {
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
// 关闭发布
function choseTask(row) {
  if (!row.id) return
  $confirm({
    title: '系统提醒',
    content: '确定关闭此任务？',
    success() {
      closeTask({
        id: row.id
      }).then(res => {
        if (res.code === 0) {
          message.success('操作成功！')
          getList()
        }
      })
    }
  })
}
// 去详情
const toDet = throttle(function (e) {
  router.push({
    path: '/sumwhy_video/matrix_distribute/create',
    query: {
      id: e.id || 1
    }
  })
})
// 去详情
function toRecords(row) {
  emits('changeTab', 2, row)
}
// 去创建批量发布
const toCreate = throttle(function () {
  message.warning('平台接口调整，功能不可使用')
  // router.push({
  //   path: '/sumwhy_video/matrix_distribute/create',
  //   query: {}
  // })
})
onMounted(() => {
  tableForm.loading = true
})
defineExpose({
  getList
})
</script>

<style lang="scss" scoped>
.batch_publish {
  :deep(.acc_ellipsis) {
    margin-top: 0;
  }
  .table_warp {
    margin-top: 16px;
    border-radius: 4px;
    padding: 22px 24px;
    background: #fff;
    .top_info {
      margin-bottom: 16px;
    }
  }
}
.btn_box {
  .el-link + .el-link {
    margin-left: 16px;
  }
}
</style>
