<template>
  <div
    class="charts-tips"
    :style="{
      left: chartsTipsData.left + 'px',
      'min-height': isLive ? '120px' : '240px',
      width: '200px'
    }"
    v-if="chartsTipsData.show"
  >
    <div class="tips-at-time normal bottom">时间：{{ chartsTipsData.time }}</div>
    <div class="chart_legend" :style="{ display: 'block' }">
      <div class="ffll flex align-center">
        <div class="pie ffll-b"></div>
        <div class="normal left">
          付费流量：{{ wanSliceFormat((chartsTipsData.ffll || 0).toFixed(2)) }}
        </div>
      </div>
      <div class="jcrs flex align-center">
        <div class="pie jcrs-b"></div>
        <div class="normal left">进场人数：{{ wanSliceFormat(chartsTipsData.jcrs || 0) }}</div>
      </div>
      <div class="zxrs flex align-center">
        <div class="pie zxrs-b"></div>
        <div class="normal left">在线人数：{{ wanSliceFormat(chartsTipsData.zxrs || 0) }}</div>
      </div>
      <div class="zhl flex align-center">
        <div class="pie zhl-b"></div>
        <div class="normal left">
          自然流量：{{ wanSliceFormat((chartsTipsData.zrll || 0).toFixed(2)) }}
        </div>
      </div>
      <div class="uvjz flex align-center">
        <div class="pie uvjz-b"></div>
        <div class="normal left">
          UV价值：{{ wanSliceFormat((chartsTipsData.uvjz || 0).toFixed(2)) }}
        </div>
      </div>
      <div class="zfl flex align-center">
        <div class="pie zfl-b"></div>
        <div class="normal left">
          转粉率：{{ wanSliceFormat((chartsTipsData.zfl || 0).toFixed(2)) }}%
        </div>
      </div>
      <div class="hdl flex align-center">
        <div class="pie hdl-b"></div>
        <div class="normal left">
          互动率：{{ wanSliceFormat((chartsTipsData.hdl || 0).toFixed(2)) }}%
        </div>
      </div>
      <div class="cjje flex align-center">
        <div class="pie cjje-b"></div>
        <div class="normal left">
          付款金额：￥{{ wanSliceFormat((chartsTipsData.fkje || 0).toFixed(2)) }}
        </div>
      </div>
      <div class="zbqjzfdds flex align-center">
        <div class="pie zbqjzfdds-b"></div>
        <div class="normal left">付款件数：{{ wanSliceFormat(chartsTipsData.fkjs || 0) }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { wanSliceFormat } from '@/utils/tools'

const props = defineProps({
  isLive: {
    type: Boolean,
    default: false
  },
  chartsTipsData: {
    type: Object,
    default() {
      return {}
    }
  }
})
console.log(props)
</script>
<style lang="scss" scoped>
.hidden {
  overflow: hidden;
}
.re {
  position: relative;
}
.line-hidden {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.two-hidden {
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.flex {
  display: flex;
}
.warp {
  flex-wrap: wrap;
}
.col {
  flex-direction: column;
}
.just-center {
  justify-content: center;
}
.just-start {
  justify-content: flex-start;
}
.just-end {
  justify-content: flex-end;
}
.just-a {
  justify-content: space-around;
}
.just-b {
  justify-content: space-between;
}
.align-center {
  align-items: center;
}
.align-end {
  align-items: flex-end;
}
.charts-tips {
  position: absolute;
  width: 380px;
  padding: 12px 8px;
  min-height: 240px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  left: 0;
  top: 130px;
  z-index: 53;
  .normal {
    font-size: 14px;
    color: #fff;
  }
  .bottom {
    margin-bottom: 5px;
  }
  .left {
    margin-left: 5px;
  }
  .chart_legend {
    display: flex;
    flex-wrap: wrap;
    > div {
      &:nth-child(n) {
        flex-basis: 46%;
      }
      &:nth-child(2n) {
        flex-basis: 54%;
      }
    }
  }
  .pie {
    width: 10px;
    height: 10px;
    border-radius: 100%;
    &.jcrs-b {
      background: #1966ff;
    }
    &.ffll-b {
      background: #ff4797;
    }
    &.zxrs-b {
      background: #ff6666;
    }
    &.fkje-b {
      background: #ffa666;
    }
    &.fkjs-b {
      background: #65f48a;
    }
    &.uvjz-b {
      background: #22caff;
    }
    &.zhl-b {
      background: #ff66eb;
    }
    &.zfl-b {
      background: #ffde66;
    }
    &.hdl-b {
      background: #a347ff;
    }
    &.xzfss-b {
      background: #65f48a;
    }
    &.dzs-b {
      background: #35574c;
    }
    &.cjje-b {
      background: #ffa666;
    }
    &.zbqjzfdds-b {
      background: #0bd7f2;
    }
  }
}
</style>
