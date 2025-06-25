<template>
  <div class="batch_publish">
    <xm_search
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="querySearch"
      @reset="resetSearch"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportFun">导出</exp_button>
      </template>
    </xm_search>

    <div class="table_warp">
      <xm_table
        tableType="avatar"
        class="matrix_table"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        v-loading="tableForm.loading"
        @getTableData="beforeGetList"
      >
        <el-table-column label="二维码名称" min-width="160">
          <template #default="{ row }">
            <div>{{ row.name || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="发布账号" min-width="180">
          <template #default="{ row }">
            <accountEllipsis
              origin="qrcodePublish"
              v-if="row.accounts && row.accounts.length > 0"
              :infinite="true"
              :getListTime="'openAll'"
              :showNum="3"
              :total="row.accountTotal"
              :id="row.id"
              :platFormIcon="true"
              :platFormIconWidth="16"
              :list="row.accounts"
              :hideMore="true"
            />
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="二维码状态" min-width="120">
          <template #default="{ row }">
            <div class="xm_status_content" style="width: max-content">
              <div
                :class="
                  'status_circle ' + (QRCODE_PUBLISHSTATUS.getCN(row.status || 1)?.class || '')
                "
              ></div>
              <div>{{ QRCODE_PUBLISHSTATUS.getCN(row.status || 1)?.label || '' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="" min-width="220">
          <template #header>
            <div class="column_header">
              <span>发布数据</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <div style="max-width: 400px">变更二维码有效期后，历史产生的数据仍将保留</div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <taskDataNum :showList="['digg', 'collect', 'comment']" :info="row" />
          </template>
        </el-table-column>
        <el-table-column label="有效期" min-width="200">
          <template #default="{ row }">
            <span v-if="row.startTime || row.endTime">
              {{ row.startTime || '' }} ~ {{ row.endTime || '' }}
            </span>
            <span v-else>长期有效</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="110" align="right" fixed="right">
          <template #default="{ row }">
            <div class="btn_box">
              <el-link
                type="primary"
                v-if="row.status == 1 || row.status == 2"
                @click="editFun(row)"
              >
                编辑
              </el-link>
              <el-link
                type="primary"
                v-if="row.status == 2 || row.status == 3"
                @click="toDetail(row)"
              >
                详情
              </el-link>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 批量生成二维码的弹窗 -->
    <generateDOM v-if="generateDialog.show" :generateDialog="generateDialog" @close="getList" />
  </div>
</template>

<script setup>
import { exportFileV2 } from '@/utils/exportFile'
import Track from '@/utils/tracking/index.js'

import generateDOM from '@/views/content_center/content_repository/components/generate_dialog.vue'
import taskDataNum from '../../components/task_data_num.vue'

import accountEllipsis from '../components/account_ellipsis.vue'

import { QRCODE_PUBLISHSTATUS } from '@/utils/dictionary/sumvideo.js'
import { throttle } from '@/utils/tools.js' //

import { getQuery } from '@/utils/get_query.js'
import { listQrCode, exportQrCodePublishRecord } from '@/api/sumvideo/content_distribute.js'

const searchComponents = ref([
  {
    type: 'input',
    label: '二维码名称',
    val: '',
    placeholder: '请输入二维码名称',
    filed: 'name'
  },
  {
    type: 'select',
    label: '二维码状态',
    val: null,
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    placeholder: '全部',
    filed: 'status',
    selects: [
      {
        label: '未启用',
        value: 1
      },
      {
        label: '发布中',
        value: 2
      },
      {
        label: '已失效',
        value: 3
      }
    ]
  },
  {
    type: 'dateRange',
    label: '开始时间',
    disabledDate(time) {
      return time.getTime() > Date.now()
    },
    defaultVal: [],
    val: [], // 默认是近三天的数据
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

function commonParams() {
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  const params = {
    ...data,
    orderSetting: 'DESC:id'
  }
  return params
}
// 导出
const exportFun = () => {
  Track.clickBtn(211)
  const params = commonParams()
  return exportFileV2(exportQrCodePublishRecord, params, '二维码发布记录', 'xlsx')
}
// 获取列表
function getList() {
  const params = {
    ...commonParams(),
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size
  }
  listQrCode(params)
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
function beforeGetList() {
  tableForm.loading = true
  getList()
}
const generateDialog = ref({
  show: false
})
// 编辑
const editFun = throttle(e => {
  generateDialog.value = {
    qrId: e.qrId,
    info: e,
    show: true
  }
}, 300)

const emits = defineEmits(['toDetail'])
// 查看详情
const toDetail = throttle(e => {
  emits('toDetail', {
    qrId: e.qrId,
    status: e.status
  })
}, 500)

defineExpose({
  resetSearch
})
</script>

<style lang="scss" scoped>
@import '@/views/content_center/components/css/qrcode.scss';

.batch_publish {
  .table_warp {
    margin-top: 16px;
    border-radius: 4px;
    padding: 22px 24px;
    background: #fff;
  }
}

.btn_box {
  .el-link + .el-link {
    margin-left: 16px;
  }
}
:deep .column_header {
  display: flex;
  align-items: center;
}
:deep(.acc_ellipsis) {
  margin-top: 0 !important;
}
</style>
