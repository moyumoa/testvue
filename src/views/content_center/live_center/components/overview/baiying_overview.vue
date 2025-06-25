<template>
  <div class="baiying_overview">
    <!-- 流量趋势 -->
    <div class="one_box">
      <div class="title">流量趋势</div>
      <div class="echart_box" style="height: auto" v-loading="flowSalesLoading">
        <slot></slot>

        <lineChart
          v-show="statusInfo.byStatus !== 1"
          :showLine="true"
          id="lineChartA"
          ref="lineChartA"
          type="在线人数"
          :data="onLineList"
          :showLegend="true"
        ></lineChart>
      </div>
    </div>
    <!-- 销售趋势 -->
    <div class="one_box" v-if="statusInfo.shopAuth === 1">
      <div class="title">销售趋势</div>
      <div class="echart_box" v-loading="flowSalesLoading">
        <lineMoreChart
          :showLine="props.showTab == 'dataOverview'"
          :dataLen="salesData"
          ref="lineMoreChartB"
          id="lineMoreChartB"
          :data="salesList"
        ></lineMoreChart>
      </div>
    </div>
    <!-- 互动趋势 -->
    <div class="one_box" style="padding-bottom: 0">
      <div class="title">互动趋势</div>
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
          :showLine="props.showTab == 'dataOverview'"
          ref="lineChartDom"
          :type="
            chooseLeftTab == 'play' ? '观看人次' : chooseLeftTab == 'digg' ? '点赞数' : '涨粉数'
          "
          :data="echartList"
        ></lineChart>
      </div>
    </div>
  </div>
</template>
<script setup>
import baiyingVideoTable from './baiying_vedeo_table.vue'
import baiyingFlows from './baiying_flows.vue'
import lineMoreChart from '../../../components/line_moreLeng_chart.vue'
import lineChart from '../../../components/line_chart.vue'
import { pageInteractiveChart } from '../../model/data_overview/get_by_Interactive_chart.js'
import { pageFlowTrendChart } from '../../model/data_overview/get_by_flowTrend_chart.js'

defineComponent(lineChart, lineMoreChart, baiyingFlows, baiyingVideoTable)
const props = defineProps({
  roomId: {
    type: String,
    default: ''
  },
  showTab: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  haveBy: {
    type: Boolean,
    default: false
  },
  statusInfo: {
    type: Object,
    default: function () {
      return {
        byStatus: 0, // 0未授权 1已授权 2授权失效
        shopAuth: 0 // 0未授权 1已授权 2授权失效
      }
    }
  }
})
// flowData, flowList
const { flowSalesLoading } = pageFlowTrendChart(props.roomId)
// 基础分析--
const {
  lineChartA,
  onLineList,
  lineChartDom,
  leftTabList,
  chooseLeftTab,
  echartList,
  changeRule,
  salesData,
  salesList
} = pageInteractiveChart(props.roomId)
</script>
<style lang="scss" scoped>
@import '../../../components/css/page.scss';
.baiying_overview {
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
