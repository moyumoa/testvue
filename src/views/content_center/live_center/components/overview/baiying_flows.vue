<template>
  <div class="baiying_video">
    <div class="title">流量占比</div>
    <template v-if="haveBy">
      <div class="user-ratio flex">
        <div class="ratio-left ratio-comm">
          <div class="ratio-comm-title">
            自然流量（{{ ((flowAnalysis.naturalFlows.value || 0) * 100).toFixed(2) }}%）
          </div>
          <div
            class="r-comm-list"
            v-if="
              flowAnalysis.naturalFlows.flow_list && flowAnalysis.naturalFlows.flow_list.length > 0
            "
          >
            <div
              class="r-comm-list-item flex align-center"
              v-for="(item, index) in flowAnalysis.naturalFlows.flow_list"
              :key="`many${index}`"
            >
              <div class="r-list-item-left flex align-center">
                <span>{{ index + 1 }}.</span>
                <el-tooltip effect="dark" placement="top">
                  <template #content>{{ item.display }}</template>
                  <div class="row_overflow">{{ item.display }}</div>
                </el-tooltip>
              </div>
              <div class="r-list-item-progress">
                <div
                  class="item-progress-bg"
                  :style="{ width: `${((item.value || 0) * 100).toFixed(2)}%` }"
                ></div>
              </div>
              <div class="r-list-item-fix">{{ ((item.value || 0) * 100).toFixed(2) }}%</div>
            </div>
          </div>
          <div
            class="r-comm-list"
            v-else
            style="
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;
              color: #909399;
            "
          >
            暂无数据
          </div>
        </div>
        <div class="ratio-right">
          <div class="ratio-left ratio-comm" style="width: 100%">
            <div class="ratio-comm-title">
              付费流量（{{ ((flowAnalysis.payFlows.value || 0) * 100).toFixed(2) }}%）
            </div>
            <div
              class="r-comm-list"
              v-if="flowAnalysis.payFlows.flow_list && flowAnalysis.payFlows.flow_list.length > 0"
            >
              <div
                class="r-comm-list-item flex align-center"
                v-for="(item, index) in flowAnalysis.payFlows.flow_list"
                :key="`pay${index}`"
              >
                <div class="r-list-item-left small flex align-center">
                  <span>{{ index + 1 }}.</span>

                  <el-tooltip effect="dark" placement="top">
                    <template #content>{{ item.display }}</template>
                    <div class="row_overflow">{{ item.display }}</div>
                  </el-tooltip>
                </div>
                <div class="r-list-item-progress">
                  <div
                    class="item-progress-bg"
                    :style="{ width: `${((item.value || 0) * 100).toFixed(2)}%` }"
                  ></div>
                </div>
                <div class="r-list-item-fix">{{ ((item.value || 0) * 100).toFixed(2) }}%</div>
              </div>
            </div>

            <div
              class="r-comm-list"
              v-else
              style="
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                color: #909399;
              "
            >
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="no_data">
        <img src="@/assets/images/content_center/no_data.png" alt="" />
        <p>授权百应查看更多数据</p>
      </div>
    </template>
  </div>
  <div class="baiying_video">
    <div class="title ratio-border m-top-40" style="margin-bottom: 24px">流量转化</div>
    <template v-if="haveBy">
      <div class="tool-manager flex align-center m-top-40 just-center">
        <div class="tool-manager-warpper flex align-center">
          <div class="tool-manager-list">
            <div class="tool-manager-l-item flex align-center">
              <div class="tool-manager-item-sub">直播间曝光人数</div>
              <el-tooltip effect="dark" placement="top">
                <template #content>直播间在各流量渠道曝光所看到的人数</template>
                <img class="tip_img" src="@/assets/images/content_center/tip_line.png" alt="" />
              </el-tooltip>
              <div class="tool-manager-item-number">
                {{ wanSliceFormat(flowConversion.exposureUcnt || 0) }}
              </div>
              <div class="tip-img"></div>
            </div>
            <div class="tool-manager-l-item flex align-center">
              <div class="tool-manager-item-sub">进入直播间人数</div>
              <div class="tool-manager-item-number">
                {{ wanSliceFormat(flowConversion.roomUcnt || 0) }}
              </div>
              <div class="tip-img"></div>
            </div>
            <div class="tool-manager-l-item flex align-center">
              <div class="tool-manager-item-sub">商品曝光人数</div>
              <div class="tool-manager-item-number">
                {{ wanSliceFormat(flowConversion.productShowUcnt || 0) }}
              </div>
              <div class="tip-img"></div>
            </div>
            <div class="tool-manager-l-item flex align-center">
              <div class="tool-manager-item-sub">商品点击人数</div>
              <div class="tool-manager-item-number">
                {{ wanSliceFormat(flowConversion.productClickUcnt || 0) }}
              </div>
              <div class="tip-img"></div>
            </div>
            <div class="tool-manager-l-item flex align-center">
              <div class="tool-manager-item-sub">创建订单人数</div>
              <div class="tool-manager-item-number">
                {{ wanSliceFormat(flowConversion.createOrderUcnt || 0) }}
              </div>
              <div class="tip-img"></div>
            </div>
            <div class="tool-manager-l-item flex align-center">
              <div class="tool-manager-item-sub">成交人数</div>
              <div class="tool-manager-item-number">
                {{ wanSliceFormat(flowConversion.payOrderUcnt || 0) }}
              </div>
              <div class="tip-img"></div>
            </div>
          </div>
          <div class="tool-manager-middle">
            <div class="tool-manager-middle-alias flex align-center">
              <div class="middle-alias-arrow"></div>
              <div class="middle-alias-info">
                <div class="middle-alias-info-sub">
                  {{ ((flowConversion.exposureIn || 0) * 100).toFixed(2) }}%
                </div>
                <div class="middle-alias-info-text">曝光-进入转换率</div>
              </div>
            </div>
            <div class="tool-manager-middle-alias flex align-center">
              <div class="middle-alias-arrow"></div>
              <div class="middle-alias-info">
                <div class="middle-alias-info-sub">
                  {{ ((flowConversion.inExposure || 0) * 100).toFixed(2) }}%
                </div>
                <div class="middle-alias-info-text">进入-曝光转换率</div>
              </div>
            </div>
            <div class="tool-manager-middle-alias flex align-center">
              <div class="middle-alias-arrow"></div>
              <div class="middle-alias-info">
                <div class="middle-alias-info-sub">
                  {{ ((flowConversion.exposureClick || 0) * 100).toFixed(2) }}%
                </div>
                <div class="middle-alias-info-text">曝光-点击转换率</div>
              </div>
            </div>
            <div class="tool-manager-middle-alias flex align-center">
              <div class="middle-alias-arrow"></div>
              <div class="middle-alias-info">
                <div class="middle-alias-info-sub">
                  {{ ((flowConversion.clickOrder || 0) * 100).toFixed(2) }}%
                </div>
                <div class="middle-alias-info-text">点击-生单转换率</div>
              </div>
            </div>
            <div class="tool-manager-middle-alias flex align-center">
              <div class="middle-alias-arrow"></div>
              <div class="middle-alias-info">
                <div class="middle-alias-info-sub">
                  {{ ((flowConversion.orderDone || 0) * 100).toFixed(2) }}%
                </div>
                <div class="middle-alias-info-text">生单-成交转换率</div>
              </div>
            </div>
          </div>
          <div class="tool-manager-right flex align-center">
            <div class="tool-manager-right-arrow"></div>
            <div class="middle-alias-info">
              <div class="middle-alias-info-sub">
                {{ ((flowConversion.exposureDone || 0) * 100).toFixed(2) }}%
              </div>
              <div class="middle-alias-info-text">曝光-成交转换率</div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="no_data">
        <img src="@/assets/images/content_center/no_data.png" alt="" />
        <p>授权百应查看更多数据</p>
      </div>
    </template>
  </div>
</template>
<script setup>
import { wanSliceFormat } from '@/utils/tools.js'
const props = defineProps({
  flowAnalysis: {
    type: Object,
    default() {
      return {}
    }
  },
  flowConversion: {
    type: Object,
    default() {
      return {}
    }
  },
  haveBy: {
    type: Boolean,
    default: false
  }
})
const flowAnalysis = toRef(props, 'flowAnalysis')
const flowConversion = toRef(props, 'flowConversion')
</script>
<style lang="scss" scoped>
$ratio-color: #37383a;
@import './flex.css';
@import '../../../components/css/page.scss';
.m-top-40 {
  margin-top: 0;
}
.ivu-progress-inner {
  height: 15px;
}
.baiying_video {
  margin-bottom: 16px;
  width: 100%;
  border-radius: 4px;
  background: #fff;
  padding: 22px 24px;
  .user-ratio {
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  .ratio-left {
    margin-top: 24px;
    width: 48%;
    @media screen and(max-width:1300px) {
      flex: 100%;
    }
  }
  .ratio-right {
    width: 48%;
    @media screen and(max-width:1300px) {
      flex: 100%;
    }
    .r-comm-list {
      .r-comm-list-item {
        // height: 72.67px !important;
        display: flex;
        align-items: flex-start;
        padding-top: 12px;
      }
    }
  }
  .ratio-comm {
    .ratio-comm-title {
      margin-bottom: 20px;
      color: #303133;
      font-weight: 600;
      font-size: 14px;
    }
    .r-comm-list {
      min-height: 400px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: inherit;

      .r-comm-list-item {
        height: 40px;
        .r-list-item-left {
          line-height: 1;
          max-width: 140px;
          width: 100%;
          padding-right: 10px;
          // color: $ratio-color;
          overflow: hidden;
          font-size: 14px;
          font-weight: 400;
          color: #37383a;

          // &.small {
          //   width: 135px;
          // }
          .row_overflow {
            max-width: 100%;
            width: max-content;
          }
        }
        .r-list-item-progress {
          width: 65%;
          height: 15px;
          border-radius: 8px;
          background: #f5f6fa;
          overflow: hidden;
          @media screen and(min-width:1300px) and (max-width: 1600px) {
            width: 46%;
          }
          .item-progress-bg {
            background: #889cff;
            width: 30%;
            height: 100%;
            border-radius: 8px;
            transition: all 0.2s linear;
          }
        }
        .r-list-item-fix {
          width: 20%;
          padding-left: 24px;
          overflow: hidden;
          @media screen and(min-width:1300px) and (max-width: 1700px) {
            padding-left: 15px;
          }
        }
      }
    }
  }
  .user-ratio-manager {
    padding: 0 0 0 55px;
    .manager-item {
      height: 108px;
      width: 25%;
      border: 1px solid #dcdfe6;
      padding: 16px;
      border-radius: 4px;
      overflow: hidden;
      margin-right: 52px;
      .manager-img {
        width: 76px;
        height: 76px;
        overflow: hidden;
        margin-right: 10px;
        img {
          height: 100%;
        }
      }
      .manager-sub {
        padding-top: 6px;
        .sub-title {
          font-size: 14px;
          color: #909399;
        }
        .sub-text {
          margin-top: 4px;
          line-height: 40px;
          font-size: 28px;
          color: $ratio-color;
        }
      }
    }
  }
  .tool-manager-warpper {
    position: relative;
    width: 834px;
    @media screen and(max-width:1500px) {
      width: 780px;
    }
    .tool-manager-list {
      width: 500px;
      @media screen and(max-width:1500px) {
        width: 460px;
      }
      .tool-manager-l-item {
        position: relative;
        width: 100%;
        height: 60px;
        padding: 20px 0 20px 16px;
        background: #f2f5fe;
        margin-bottom: 8px;
        .tool-manager-item-sub {
          color: $ratio-color;
          font-size: 14px;
        }
        .tool-manager-item-number {
          font-size: 16px;
          color: $ratio-color;
          margin-left: 16px;
        }
        .tip-img {
          height: 100%;
          position: absolute;
          top: 0;
          right: 0;
          &:hover {
            opacity: 0.7;
          }
        }
        &:nth-child(1) {
          .tip-img {
            width: 231px;
            background: url('@/assets/images/content_center/1.svg');
            background-size: 100% 100%;
          }
        }
        &:nth-child(2) {
          .tip-img {
            width: 212px;
            background: url('@/assets/images/content_center/2.svg');
            background-size: 100% 100%;
          }
        }
        &:nth-child(3) {
          .tip-img {
            width: 191px;
            background: url('@/assets/images/content_center/3.svg');
            background-size: 100% 100%;
          }
        }
        &:nth-child(4) {
          .tip-img {
            width: 170px;
            background: url('@/assets/images/content_center/4.svg');
            background-size: 100% 100%;
          }
        }
        &:nth-child(5) {
          .tip-img {
            width: 149px;
            background: url('@/assets/images/content_center/5.svg');
            background-size: 100% 100%;
          }
        }
        &:nth-child(6) {
          .tip-img {
            width: 128px;
            background: url('@/assets/images/content_center/6.svg');
            background-size: 100% 100%;
          }
        }
      }
    }
    .tool-manager-middle {
      margin-left: 5px;
      height: 358px;
      .tool-manager-middle-alias {
        height: 68px;
        .middle-alias-arrow {
          width: 40px;
          height: 100%;
          background: url('@/assets/images/content_center/small.svg');
          background-size: 100% 100%;
        }
        .middle-alias-info {
          margin-left: 17px;
          .middle-alias-info-sub {
            font-size: 14px;
            color: $ratio-color;
            margin-bottom: 2px;
          }
          .middle-alias-info-text {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
    .tool-manager-right {
      position: absolute;
      left: 503px;
      top: 15px;
      height: 358px;
      @media screen and(max-width:1500px) {
        left: 463px;
      }
      .tool-manager-right-arrow {
        width: 200px;
        height: 358px;
        background: url('@/assets/images/content_center/big.svg');
        @media screen and(max-width:1500px) {
          width: 216px;
        }
      }
      .middle-alias-info {
        margin-left: 17px;
        .middle-alias-info-sub {
          font-size: 16px;
          margin-bottom: 2px;
          color: $ratio-color;
        }
        .middle-alias-info-text {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}
@keyframes active-proress {
  0% {
    opacity: 0.3;
    width: 0;
  }
  100% {
    opacity: 0;
    width: 100%;
  }
}
.loading-tip {
  width: 100%;
  height: 300px;
  background: #fff;

  .no-data {
    img {
      width: 183px;
    }
  }
}
.tip_img {
  width: 16px;
  height: 16px;
  display: flex;
  margin-left: 8px;
}
.no_data {
  padding: 68px 0 46px 0;
  text-align: center;
  > img {
    width: 75px;
    height: 54px;
  }
  > p {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    color: #303133;
    line-height: 20px;
  }
}
</style>
