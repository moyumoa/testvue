<template>
  <div>
    <xm_search
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="querySearch"
      @reset="resetSearch"
    ></xm_search>
    <div class="table_warp">
      <xm_table
        tableType="avatar"
        class="matrix_table"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        v-loading="tableForm.loading"
        @getTableData="beforeGetList"
      >
        <el-table-column label="模板名称" min-width="160">
          <template #default="{ row }">
            <div>{{ row.creativeName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="发布形式" min-width="140">
          <template #default="{ row }">
            <div>{{ row.bizType ? bizTypeMap.get(row.bizType) : '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建人" min-width="140">
          <template #default="{ row }">
            <div>{{ row.userBrandName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="关联任务" min-width="140">
          <template #default="{ row }">
            <div>{{ row.bizName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template #header>
            <div class="column_header">
              <span>时间</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <div style="max-width: 400px">
                    <p>任务发布：任务开始时间</p>
                    <p>批量发布：任务开始时间</p>
                    <p>发视频：视频发布成功时间</p>
                  </div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div>{{ row.bizTime ? row.bizTime.replace('T', ' ') : '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="视频数量" min-width="120">
          <template #default="{ row }">
            <div>{{ row.videoCount || 0 }}/{{ row.videoTotalCount || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column label="播放数" min-width="120">
          <template #default="{ row }">
            <div>{{ wanSliceFormat(row.playCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="点赞数" min-width="120">
          <template #default="{ row }">
            <div>{{ wanSliceFormat(row.diggCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="分享数" min-width="120">
          <template #default="{ row }">
            <div>{{ wanSliceFormat(row.shareCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="评论数" min-width="120">
          <template #default="{ row }">
            <div>{{ wanSliceFormat(row.commentCount || 0) }}</div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { wanSliceFormat } from '@/utils/tools.js'

import { getQuery } from '@/utils/get_query.js'
import { listTemplatePublishDetail } from '@/api/sumvideo/creative_mould.js'
import { useRoute } from 'vue-router'

const route = useRoute()
const bizTypeMap = new Map([
  [1, '任务发布'],
  [3, '发视频'],
  [2, '批量发布']
])
const searchComponents = ref([
  {
    type: 'input',
    label: '模板名称',
    val: '',
    placeholder: '请输入模板名称',
    filed: 'creativeName'
  },
  {
    type: 'select',
    label: '发布形式',
    val: null,
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    placeholder: '全部',
    filed: 'bizTypes',
    selects: [
      {
        label: '任务发布',
        value: 1
      },
      {
        label: '发视频',
        value: 3
      },
      {
        label: '批量发布',
        value: 2
      }
    ]
  },
  {
    type: 'input',
    label: '创建人',
    val: '',
    placeholder: '请输入创建人名称',
    filed: 'userBrandName'
  },
  {
    type: 'input',
    label: '关联任务',
    val: '',
    placeholder: '请输入任务名称',
    filed: 'bizName'
  },
  {
    type: 'dateRange',
    label: '时间',
    disabledDate(time) {
      return time.getTime() > Date.now()
    },
    defaultVal: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
    val: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()], // 默认是近七天的数据
    isDisEdit: true,
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange'
  }
])

const tableForm = reactive({
  taskId: null, // 任务ID
  loading: false,
  listData: [], // 素材列表
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
// 获取列表
function getList() {
  const data = getQuery(searchComponents.value, ['bizTimeMin', 'bizTimeMax'])
  const params = {
    bizId:
      tableForm.taskId &&
      data.bizName &&
      data.bizName === sessionStorage.getItem('taskTemplateName')
        ? tableForm.taskId
        : null,
    ...data,
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    orderSetting: 'DESC:biz_time'
  }
  listTemplatePublishDetail(params)
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

onMounted(() => {
  if (route.query.id) {
    tableForm.taskId = route.query.id
    const index = searchComponents.value.findIndex(item => item.filed === 'bizName')
    searchComponents.value[index].val = sessionStorage.getItem('taskTemplateName') || ''
    tableForm.loading = true
    nextTick(() => {
      resetSearch()
    })
  } else {
    resetSearch()
  }
})
</script>
<style lang="scss" scoped>
.table_warp {
  margin-top: 16px;
  border-radius: 4px;
  padding: 22px 24px;
  background: #fff;
}
:deep .column_header {
  display: flex;
  align-items: center;
}
</style>
