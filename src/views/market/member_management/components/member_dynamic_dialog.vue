<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="成员动态"
    width="820px"
    custom-class="rule_setting_dialog rule_setting_form_dialog 90 hide_footer_line"
  >
    <div class="dialog_content">
      <!-- <xm_search
      :searchComponents="data.searchComponents"
      @getData="searchList"
      @reset="resetSearch"
      :useOwnReset="true"
    ></xm_search> -->
      <div class="search_box">
        <div class="search_label">参与时间</div>
        <el-date-picker
          :clearable="false"
          v-model="data.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          unlink-panels
          :editable="false"
          :disabled-date="disabledDate"
          @change="searchList"
        ></el-date-picker>
      </div>
      <xm_table
        :maxTableHeight="450"
        v-loading="data.loading"
        :data="data.listData"
        v-model:page="data.page"
        @getTableData="getList"
      >
        <el-table-column label="任务类型" prop="type" min-width="170">
          <template #default="{ row }">
            <template v-if="row.type != 1">
              {{ row.type == 6 ? '图文' : TASK_TYPE.getCN(row.type) }}任务
            </template>
            <template v-else>
              {{ TASK_TYPE.getCN(row.type) }}任务{{
                row.videoPushMode == 1
                  ? '-相册上传发布'
                  : row.videoPushMode == 4
                  ? '-一键转发'
                  : row.videoPushMode == 3
                  ? '-创意模板发布'
                  : ''
              }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="任务名称" prop="name" min-width="200">
          <template #default="{ row }">{{ row.name || '--' }}</template>
        </el-table-column>
        <el-table-column label="参与时间" width="180">
          <template #default="{ row }">{{ changeTime(row.joinTaskTime) }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </el-dialog>
</template>
<script setup>
import { TASK_TYPE } from '@/utils/dictionary/task'

import { getTaskCenter } from '@/api/market/operate_analysis.js'
// import { getQuery } from '@/utils/get_query.js'

import { dateFormat } from '@/utils/tools.js'
const props = defineProps({
  dynamicDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const show = toRef(props.dynamicDialog, 'show')
const userId = toRef(props.dynamicDialog, 'userId')
function disabledDate(time) {
  return time.getTime() > Date.now()
} // 禁用日期
const data = reactive({
  loading: false,
  dateRange: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],

  // searchComponents: [
  //   {
  //     type: 'dateRange',
  //     label: '参与时间',
  //     placeholder: ['开始时间', '结束时间'],
  //     filed: 'dateRange',
  //     defaultVal: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],
  //     val: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()], // 默认是近七天的数据
  //     disabledDate(time) {
  //       return time.getTime() > Date.now()
  //     } // 禁用日期
  //   }
  // ],
  page: {
    index: 1,
    size: 10,
    total: 0
  },
  listData: []
})
// function resetSearch() {
//   data.loading = true
//   data.page.index = 1
//   getList()
// }
// 搜索
function searchList() {
  console.log('时间', data.dateRange)
  data.loading = true
  data.page.index = 1
  getList()
}
// 搜索
function getList() {
  // const searchForm = getQuery(data.searchComponents, ['startTime', 'endTime'])
  // Object.assign(searchForm, {
  //   pageNum: data.page.index,
  //   pageSize: data.page.size
  // })
  const searchForm = {
    joinEndTime:
      data.dateRange && data.dateRange.length > 0
        ? dateFormat(data.dateRange[1]) + ' 23:59:59'
        : '',
    joinStartTime:
      data.dateRange && data.dateRange.length > 0
        ? dateFormat(data.dateRange[0]) + ' 00:00:00'
        : '',
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : '',
    userId: userId.value,
    pageNo: data.page.index,
    pageSize: data.page.size,
    joinStatus: 4,
    webQuery: true
  }
  getTaskCenter(searchForm)
    .then(res => {
      if (res.code === 0) {
        const arr = res.data.records || []

        data.listData = arr
        data.page.total = res.data.total
      } else {
        data.listData = []
        data.page.total = 0
      }
      data.loading = false
    })
    .catch(() => {
      data.listData = []
      data.page.total = 0
      data.loading = false
    })
}
onMounted(() => {
  searchList()
})
function changeTime(e) {
  if (e) {
    return e.replace(/-/gi, '.')
  } else {
    return '--'
  }
}
</script>
<style lang="scss" scoped>
.dialog_content {
  padding: 16px;
}
.search_box {
  margin-bottom: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .search_label {
    padding-right: 14px;
  }
}
:deep(.el-pagination) {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}
</style>
