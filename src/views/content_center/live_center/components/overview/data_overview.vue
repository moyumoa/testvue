<template>
  <div class="dataOverview">
    <!-- 图表 -->
    <div class="one_box" style="padding-bottom: 0">
      <div class="title">基础分析</div>
      <div v-loading="pageLoading">
        <div class="rule_box">
          <div class="left_rule">
            <div
              @click="changeRule(item.name, 'left')"
              :class="{ one_rule: true, choose_rule: item.name == chooseLeftTab }"
              v-for="(item, index) in leftTabList"
              :key="index"
            >
              {{ item.label }}
            </div>
          </div>
          <!-- <div class="right_rule">
            <div
              @click="changeRule(item.name, 'right')"
              :class="{ one_rule: true, choose_rule: item.name == chooseRightTab }"
              v-for="(item, index) in rightTabList"
              :key="index"
            >
              {{ item.label }}
            </div>
          </div> -->
        </div>
        <div class="echart_box">
          <lineChart
            :showLine="showTabData == 'dataOverview'"
            ref="lineChart"
            :type="
              chooseLeftTab == 'play' ? '观看人次' : chooseLeftTab == 'digg' ? '点赞数' : '涨粉数'
            "
            :data="echartList"
          ></lineChart>
        </div>
      </div>
    </div>
    <!-- 表格 -->
    <div class="one_box">
      <div class="title">数据详情</div>
      <xm_table
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="160" label="更新时间">
          <template #default="scope">{{ scope.row.recordTime || '--' }}</template>
        </el-table-column>
        <el-table-column min-width="120" label="观看人次">
          <template #default="scope">{{ wanSliceFormat(scope.row.watchTimes || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="120" label="人气峰值">
          <template #default="scope">{{ wanSliceFormat(scope.row.onlineNum || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="120" label="点赞数">
          <template #default="scope">{{ wanSliceFormat(scope.row.likeNum || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="120" label="粉丝数">
          <template #default="scope">{{ wanSliceFormat(scope.row.fansNum || 0) }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script>
import lineChart from '../../../components/line_chart.vue'
import { pageChart } from '../../model/data_overview/get_chart.js'
import { pageList } from '../../model/data_overview/get_list.js'
import { wanSliceFormat } from '@/utils/tools.js'
export default {
  name: 'dataOverview',
  components: {
    lineChart
  },
  props: {
    roomId: {
      type: String,
      default: ''
    },
    showTab: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    // 基础分析--
    const {
      pageLoading,
      lineChart,
      leftTabList,
      chooseLeftTab,
      chooseRightTab,
      echartList,
      changeRule,
      getChartInfo
    } = pageChart(props.roomId)
    // 图表的数据
    const showTabData = toRef(props, 'showTab')
    function getCharData() {
      lineChart.value.chartLoading()
      getChartInfo()
    }

    // 数据详情--
    const { tableForm, getList, resetList } = pageList(props.roomId)

    onMounted(() => {
      getCharData()
      resetList()
    })
    return {
      showTabData,
      pageLoading,
      lineChart,
      echartList,
      getCharData,
      leftTabList,
      chooseLeftTab,
      chooseRightTab,
      changeRule,
      tableForm,
      getList,
      wanSliceFormat
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../../components/css/page.scss';
.dataOverview {
  .title {
    margin-bottom: 24px;
  }
  .one_box {
    margin-bottom: $content_margin;
    width: 100%;
    border-radius: $content_radius;
    background: #fff;
    padding: 22px 24px;
    .rule_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .one_rule {
        cursor: pointer;
        font-size: 14px;

        font-weight: 500;
        color: #909399;
        line-height: 20px;
      }
      .one_rule + .one_rule {
        border-left: 1px solid #e8e8e8;
      }
      .choose_rule {
        color: $theme_color;
      }
      .left_rule {
        flex: 1;

        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .one_rule {
          padding-right: 8px;
        }
        .one_rule + .one_rule {
          padding-left: 8px;
        }
      }
      .right_rule {
        flex: 1;

        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        .one_rule {
          padding-left: 8px;
        }
        .one_rule:first-child {
          padding-right: 8px;
        }
      }
    }
    .echart_box {
      margin: 20px 0 0;
      width: 100%;
      height: 300px;
    }
  }
}
</style>
