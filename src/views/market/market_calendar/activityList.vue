<template>
  <div class="account_wrapper">
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="reset"
    >
      <template #searchBtn>
        <!-- <el-button @click="exportFiles">导出</el-button>-->
        <exp_button :asyncFunc="exportFiles">导出</exp_button>
      </template>
    </xm_search>
    <div class="account_content">
      <xm_table
        class="pic_table"
        v-loading="loading"
        :data="listData"
        v-model:page="page"
        @getTableData="getList"
      >
        <el-table-column label="活动标题" min-width="150">
          <template #default="{ row }">
            {{ row.title || '--' }}
          </template>
        </el-table-column>
        <!--        <el-table-column v-if="judgeHWork()" label="所属波次" min-width="100">-->
        <!--          <template #default="{ row }">-->
        <!--            {{ row.haierWaveOrder || '&#45;&#45;' }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column label="活动时间" prop="createTime" min-width="180">
          <template #default="{ row }">
            {{ row.activityStartTime.slice(0, 10) }}&nbsp;至&nbsp;{{
              row.activityEndTime.slice(0, 10)
            }}
          </template>
        </el-table-column>
        <el-table-column label="活动状态" min-width="100">
          <template #default="{ row }">
            <span class="table_point" v-if="row.isEnable === 1">进行中</span>
            <span class="table_point gray" v-else-if="row.isEnable === 0">未开始</span>
            <span class="table_point gray" v-else>已结束</span>
          </template>
        </el-table-column>
        <el-table-column label="曝光量" min-width="140">
          <template #default="{ row }">
            <div v-if="row.exposure">
              {{ wanSliceFormat(row.exposure) }}/{{ wanSliceFormat(row.exposureTarget) }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column v-if="brandViewMode == 1" label="销售额" min-width="140">
          <template #default="{ row }">
            <div v-if="row.clue">
              {{ wanSliceFormat(row.payment / 100) }}/{{ wanSliceFormat(row.paymentTarget / 100) }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column v-if="brandViewMode == 2" label="线索数" min-width="140">
          <template #default="{ row }">
            <div v-if="row.clue">
              {{ wanSliceFormat(row.clue) }}/{{ wanSliceFormat(row.clueTarget) }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="视频数" min-width="100">
          <template #default="{ row }">
            {{ wanSliceFormat(row.singleCount) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="播放数" min-width="100">
          <template #default="{ row }">
            {{ wanSliceFormat(row.cgpPlayCount) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="点赞数" min-width="100">
          <template #default="{ row }">
            {{ wanSliceFormat(row.cgpDiggCount) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="分享数" min-width="100">
          <template #default="{ row }">
            {{ wanSliceFormat(row.cgpShareCount) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="评论数" min-width="100">
          <template #default="{ row }">
            {{ wanSliceFormat(row.commentCount) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="直播场次" min-width="100">
          <template #default="{ row }">
            {{ wanSliceFormat(row.liveCount) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="观看人次" min-width="100">
          <template #default="{ row }">
            {{ wanSliceFormat(row.liveViewNum) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="直播时长" min-width="130">
          <template #default="{ row }">
            {{ timeSecond(row.liveDuration / 1000 || 0) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="参与人数" min-width="100">
          <template #default="{ row }">
            {{ wanSliceFormat(row.joinCount) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="right" fixed="right">
          <template #default="{ row }">
            <el-link type="primary" class="ml_16" @click="toDetail(row)">查看详情</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { getQuery } from '@/utils/get_query'
import { wanSliceFormat } from '@/utils/tools'
import { exportListActivityReport, getActivityList } from '@/api/market/activity'
import { useRouter } from 'vue-router'
import { timeSecond } from '@/views/content_center/content_matrix/components/js/setCharts'
import { exportFileV2 } from '@/utils/exportFile'
import { useStore } from 'vuex'
const store = useStore()
const router = useRouter()
// 留资模式 1是兼容 2是留资
const brandViewMode = computed(() => store.state.user.brandViewMode)
// const judgeHWork = inject('$judgeHWork')

const searchComponents = ref([
  {
    type: 'input',
    label: '活动标题',
    val: '',
    placeholder: '请输入活动标题',
    filed: 'title'
  },
  {
    type: 'select',
    label: '活动状态',
    placeholder: '请选择活动状态',
    filed: 'enables',
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    val: null,
    defaultVal: null,
    selects: [
      {
        label: '已结束',
        value: -2
      },
      {
        label: '进行中',
        value: 1
      },
      {
        label: '未开始',
        value: 0
      }
    ]
  },
  {
    type: 'dateRange', // 组件类型
    label: '活动时间', // label展示
    val: '', // 响应式绑定
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange' // 查询字段名
  }
])
// const init = () => {
//   if (judgeHWork()) {
//     searchComponents.value.push({
//       type: 'input',
//       label: '所属波次',
//       val: '',
//       placeholder: '请输入所属波次',
//       filed: 'haierWaveOrder'
//     })
//   }
// }
// init()

const loading = ref(false)
const listData = ref([])
const page = ref({
  index: 1,
  size: 10,
  total: 10
})
const searchList = (params = {}) => {
  page.value.index = 1
  getList()
}

const getList = () => {
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  data.pageNumber = page.value.index
  data.pageSize = page.value.size
  loading.value = true
  getActivityList(data)
    .then(res => {
      listData.value = res.data.records || []
      page.value.total = res.data.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

const exportFiles = () => {
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  if (listData.value.length > 0) {
    return exportFileV2(exportListActivityReport, data, '线索信息', 'xlsx')
  } else {
    ElMessage.warning('当前无活动数据，不可导出')
  }
}

const toDetail = row => {
  router.push({
    path: '/content_market/market_calendar',
    query: {
      activityId: row.id,
      activityStartTime: row.activityStartTime
    }
  })
}
const reset = () => {
  page.value.index = 1
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.account_wrapper {
  .account_content {
    margin-top: 16px;
    padding: 24px;
    border-radius: 4px;
    background-color: #fff;
  }
}
</style>
