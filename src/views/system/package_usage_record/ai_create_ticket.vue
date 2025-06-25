<template>
  <div>
    <xm_search
      :searchComponents="$data.searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    >
      <template #searchBtn v-if="false">
        <exp_button :asyncFunc="exportFiles" :isExport="true">导出</exp_button>
      </template>
    </xm_search>
    <div class="page_main mt_16">
      <xm_table
        tableType="avatar"
        v-loading="$data.loading"
        :data="$data.tableData"
        v-model:page="$data.page"
        @getTableData="getList"
      >
        <el-table-column label="关联信息" min-width="135px">
          <template #default="{ row }">
            <div class="creativeName">
              {{ row.bizType == 2 ? row.remark || '--' : row.creativeName || '--' }}
              <el-tooltip
                effect="dark"
                placement="top"
                v-if="row.creativeIsDel == 1 && row.bizType !== 2"
              >
                <template #content>
                  <div>模板已被删除</div>
                </template>
                <img
                  src="https://tagvv-1256030678.file.myqcloud.com/20230830iva2v.png"
                  style="width: 14px; height: 14px; margin-left: 4px"
                  alt=""
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创作类型" min-width="135px">
          <template #default="{ row }">{{ getCreateType(row.creationType) || '--' }}</template>
        </el-table-column>
        <!-- <el-table-column label="消耗场景" min-width="135px">
          <template #default="{ row }">{{ row.remark ? '终端' : '后台' }}</template>
        </el-table-column> -->
        <el-table-column label="消耗创作券" min-width="135px">
          <template #default="{ row }">{{ row.useNum || '0' }}张</template>
        </el-table-column>
        <el-table-column label="操作时间" min-width="135px">
          <template #default="{ row }">{{ row.gmtCreate || '--' }}</template>
        </el-table-column>
        <el-table-column label="操作人" min-width="135px">
          <template #default="{ row }">{{ row.operateUserName || '--' }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { getQuery } from '@/utils/get_query.js'
import { listCreationTicketLog, statExportV2 } from '@/api/sumvideo/creative_ai_title'
import { exportFileV2 } from '@/utils/exportFile'

const $data = reactive({
  searchComponents: [
    {
      hiddenItem: true,
      type: 'chooseDept',
      label: '组织架构',
      val: [],
      filed: 'orgIds',
      multiple: true,
      isUsePermission: true
    },
    {
      hiddenItem: true,
      type: 'select',
      label: '消耗场景',
      placeholder: '请选择消耗场景',
      val: -1,
      defaultVal: -1,
      filed: 'consumeScene',
      selects: [
        {
          value: -1,
          label: '全部'
        },
        {
          label: '后台',
          value: 2
        },
        {
          label: '终端',
          value: 1
        }
      ]
    },
    {
      type: 'dateRange',
      label: '操作时间',
      val: '',
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange'
    }
  ],
  tableData: [],
  loading: false,
  page: {
    index: 1,
    size: 10,
    total: 10
  }
})

// 导出
function exportFiles() {
  const params = getQuery($data.searchComponents, ['startTime', 'endTime'])
  params.pageNo = $data.page.index
  params.pageSize = $data.page.size
  params.orderSetting = 'DESC:gmt_create'
  return exportFileV2(statExportV2, params, 'AI文案创作记录', 'xlsx')
}
function getList() {
  $data.loading = true
  const params = getQuery($data.searchComponents, ['startTime', 'endTime'])
  params.pageNo = $data.page.index
  params.pageSize = $data.page.size
  params.orderSetting = 'DESC:gmt_create'
  listCreationTicketLog(params)
    .then(res => {
      $data.tableData = res.data.records || []
      $data.page.total = res.data.total
    })
    .finally(() => {
      $data.loading = false
    })
}

function searchList() {
  $data.page.index = 1
  getList()
}
function resetSearch() {
  $data.page.index = 1
  $data.page.size = 10
  getList()
}

function getCreateType(type) {
  const obj = {
    1: '小红书文案',
    2: '抖音标题',
    0: '通用标题',
    3: '快手标题',
    4: '视频号标题'
    // 5: '终端-AI文案专家'
  }
  return obj[type] || null
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.creativeName {
  display: flex;
  align-items: center;
}
</style>
