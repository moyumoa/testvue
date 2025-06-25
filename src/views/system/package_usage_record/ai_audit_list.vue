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
        <el-table-column label="审核信息" min-width="135px">
          <template #default="{ row }">
            {{ row.remark || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="提交人" min-width="135px">
          <template #default="{ row }">
            <div class="member_info">
              <img
                class="avatar_icon"
                :src="row.submitUserAvatar ? row.submitUserAvatar : avatarImg"
                alt
              />
              <div class="name_mobile">
                <div class="name">
                  {{ row.submitUserName || '--' }}
                  <div
                    class="xm_depart"
                    style="display: inline-block"
                    v-if="row.staffStatus && row.staffStatus == 2"
                  ></div>
                </div>
                <table_column_phone :phone="row.submitUserPhone" size="small"></table_column_phone>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="智能审核时间" min-width="135px">
          <template #default="{ row }">
            <div>{{ row.gmtCreate || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="智能风险得分" min-width="135px" v-if="false">
          <template #default="{ row }">
            {{ isNotEmpty(row.auditScore) ? row.auditScore : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="消耗星力值" min-width="135px">
          <template #default="{ row }">
            {{ row.changeNum || '--' }}
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { isNotEmpty } from '@/utils/tools.js'
import { getQuery } from '@/utils/get_query.js'
import { getVideoRecord, statExportV2 } from '@/api/system_setting/brand_info'
import { exportFileV2 } from '@/utils/exportFile'
import avatarImg from '@/assets/images/content_center/default_user.png'

const $data = reactive({
  searchComponents: [
    {
      type: 'input',
      label: '审核信息',
      val: null,
      placeholder: '请输入审核信息（任务标题）',
      filed: 'taskName'
    },
    {
      type: 'input',
      label: '提交人',
      val: null,
      placeholder: '请输入姓名或手机号',
      filed: 'submitUserName'
    },

    {
      type: 'dateRange',
      label: '智能审核时间', // label展示
      val: '', // 响应式绑定
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    }
    // {
    //   type: 'input',
    //   label: '审核人',
    //   val: null,
    //   filed: 'operateUserName',
    //   placeholder: '请输入审核人姓名'
    // }
  ],
  tableData: [],
  loading: false,
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
// 导出
function exportFiles() {
  const params = getQuery($data.searchComponents, ['startTime', 'endTime'])
  params.pageNo = $data.page.index
  params.pageSize = $data.page.size
  params.orderSetting = 'DESC:gmt_create'
  params.tags = [11] //
  return exportFileV2(statExportV2, params, '智能审核记录', 'xlsx')
}
function getList() {
  $data.loading = true
  const params = getQuery($data.searchComponents, ['startTime', 'endTime'])
  params.pageNo = $data.page.index
  params.pageSize = $data.page.size
  params.orderSetting = 'DESC:gmt_create'
  params.tags = [11] //
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

<style lang="scss" scoped>
.member_info {
  display: flex;
  align-items: center;
  .avatar_icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }
  .name_mobile {
    margin-left: 12px;
    .mobile {
      font-size: 12px;
      color: #909399;
      line-height: 17px;
    }
  }
}
</style>
