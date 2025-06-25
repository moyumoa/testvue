<template>
  <div class="clue_data">
    <!-- 线索趋势 -->
    <div class="one_box">
      <div class="title">线索趋势</div>
      <div class="echart_box" v-loading="clueLoading">
        <lineChart
          :showLine="true"
          id="lineChartB"
          ref="lineChartB"
          type="线索趋势"
          :data="clueList"
          :showLegend="true"
        ></lineChart>
      </div>
    </div>
    <!-- 线索明细 -->
    <div class="one_box">
      <div class="top">
        <div class="title">线索明细</div>
        <el-button @click="exportData">导出</el-button>
      </div>
      <div class="clue_detail">
        <el-table
          v-loading="tableForm.loading"
          :data="tableForm.tableData"
          border
          scrollbar-always-on
        >
          <el-table-column label="昵称" prop="nickName" min-width="150">
            <template v-slot="{ row }">{{ row.dyNickname || '--' }}</template>
          </el-table-column>
          <el-table-column label="用户姓名" prop="userName" min-width="120">
            <template v-slot="{ row }">{{ row.userName || '--' }}</template>
          </el-table-column>
          <el-table-column label="手机号" width="160" prop="telephone">
            <template v-slot="{ row }">
              <table_column_phone :phone="row.phone"></table_column_phone>
            </template>
          </el-table-column>
          <el-table-column label="地区" prop="region" width="120">
            <template v-slot="{ row }">{{ row.area || '--' }}</template>
          </el-table-column>
          <el-table-column label="地址" prop="address" width="330">
            <template v-slot="{ row }">{{ row.address || '--' }}</template>
          </el-table-column>
          <el-table-column label="是否粉丝" prop="isFans" width="100">
            <template v-slot="{ row }">{{ row.isFans === 1 ? '是' : '否' }}</template>
          </el-table-column>
          <el-table-column label="来源组件类型" prop="sourceType" width="150">
            <template v-slot="{ row }">{{ row.sourceType || '--' }}</template>
          </el-table-column>
          <el-table-column label="留资时间" prop="liveroomRetentionTime" width="180">
            <template v-slot="{ row }">{{ row.liveroomRetentionTime || '--' }}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script setup>
import lineChart from '../../../components/line_chart.vue'
import { getClueChart } from '../../model/data_overview/get_clue_chart.js'
import { getLiveRoomClueInfo, exportLiveRoomClueInfo } from '@/api/content_center/live_center.js'
import { exportFile } from '@/utils/exportFile'
import { throttle } from '@/utils/tools.js'
defineComponent(lineChart)
// const vm = getCurrentInstance()
const props = defineProps({
  roomId: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  }
})
// 基础分析--
const { clueList, clueLoading, lineChartB } = getClueChart(props.roomId)
const tableForm = reactive({
  loading: false,
  tableData: []
})
// 获取表中的数据
async function getTableData() {
  const res = await getLiveRoomClueInfo({ roomId: props.roomId })
  if (res.code === 0) {
    tableForm.loading = true
    tableForm.tableData = res.data
  }
  tableForm.loading = false
}
getTableData()
// 导出
const exportData = throttle(() => {
  const param = {
    roomId: props.roomId
  }
  return exportFile(exportLiveRoomClueInfo, param, '线索明细', 'xlsx')
}, 700)
</script>
<style lang="scss" scoped>
@import '../../../components/css/page.scss';
.clue_data {
  .title {
    margin-bottom: 24px;
  }
  .one_box {
    margin-bottom: $content_margin;
    width: 100%;
    border-radius: $content_radius;
    background: #fff;
    padding: 22px 24px;
    .echart_box {
      margin: 20px 0 0;
      width: 100%;
      height: 300px;
    }
    .top {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
