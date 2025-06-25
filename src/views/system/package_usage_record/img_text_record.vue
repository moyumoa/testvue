<template>
  <div>
    <xm_search
      :searchComponents="$data.searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    >
      <template #searchBtn>
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
        <el-table-column label="场景" min-width="135px">
          <template #default="{ row }">
            {{ row.specificTypeStr || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="关联任务" min-width="135px">
          <template #default="{ row }">
            {{ row.bizName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="详细信息" min-width="135px">
          <template #default="{ row }">
            {{ row.source == 3 && row.pipelineType == 6 ? '--' : row.remark || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="消耗场景" min-width="135px">
          <template #default="{ row }">{{ consumeScene(row) }}</template>
        </el-table-column>
        <el-table-column label="消耗合成星力值" min-width="135px">
          <template #default="{ row }">
            {{ row.changeNum || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作时间" min-width="135px">
          <template #default="{ row }">
            <div>{{ row.gmtCreate || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作人" min-width="135px">
          <template #default="{ row }">{{ row.operateUser || '--' }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { getQuery } from '@/utils/get_query.js'
import { getVideoRecord, statExportV2 } from '@/api/system_setting/brand_info'
import { exportFileV2 } from '@/utils/exportFile'

const $data = reactive({
  searchComponents: [
    {
      type: 'chooseDept',
      label: '组织架构',
      val: [],
      filed: 'deptIds',
      multiple: true,
      isUsePermission: true
    },
    {
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
      label: '合成时间',
      val: '',
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange'
    },
    {
      type: 'input',
      label: '任务名称',
      val: '',
      filed: 'taskName'
    }
  ],
  tableData: [],
  loading: false,
  page: {
    index: 1,
    size: 10,
    total: 10
  },
  unHasDetList: [3, 4, 5]
})
/**
 * 消耗场景转化为字符串
 * @param row
 * @returns {string}
 */
const consumeScene = row => {
  const { consumeScene } = row
  if (consumeScene) {
    if (consumeScene === 1) {
      return '终端'
    } else if (consumeScene === 2) {
      return '后台'
    } else {
      return '--'
    }
  }
  return '--'
}
// 导出
function exportFiles() {
  const params = getQuery($data.searchComponents, ['startTime', 'endTime'])
  params.pageNo = $data.page.index
  params.pageSize = $data.page.size
  params.orderSetting = 'DESC:gmt_create'
  params.tags = [3, 4] // 1普通模板 2数字人模板 3图文模板 4
  return exportFileV2(statExportV2, params, '图文智能合成记录', 'xlsx')
}
function getList() {
  $data.loading = true
  const params = getQuery($data.searchComponents, ['startTime', 'endTime'])
  params.pageNo = $data.page.index
  params.pageSize = $data.page.size
  params.orderSetting = 'DESC:gmt_create'
  params.tags = [3, 4] // 1普通模板 2数字人模板 3图文模板 4
  getVideoRecord(params)
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
// 场景类型
// const sceneType = row => {
//   const { source, pipelineType, taskType } = row
//   if (source === 4) {
//     if (pipelineType === 6) return '图文生成（图文任务）'
//     return taskType === 3 ? '征集任务-创意模板合成' : '视频任务-创意模板发布'
//   } else if (source === 5) {
//     return pipelineType === 1 ? '模板式生成（AI终端）' : '--'
//   } else if (source === 3) {
//     const obj = {
//       1: 'sumvideo批量合成',
//       2: '模板式生成',
//       3: '剧本式生成',
//       4: '一键成片',
//       5: '一键成片（AI终端）',
//       6: '图文生成（后台批量合成）'
//     }
//     return obj[pipelineType] || '--'
//   } else if (source === 6) {
//     const obj = {
//       1: '终端-AI图片生成',
//       2: '终端-AI封面制作'
//     }
//     return obj[pipelineType] || '--'
//   }
//   return '--'
// }
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped></style>
