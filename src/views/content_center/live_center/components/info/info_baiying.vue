<template>
  <div>
    <div class="all_num" style="margin-top: 24px">
      <div class="title">
        流量数据
        <!-- <el-tooltip placement="right">
          <template #content>当数据显示为“-”，需授权百应获取查看</template>
          <i class="iconfont icon-wenhao"></i>
        </el-tooltip> -->
      </div>
      <div class="num_box">
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ convert(liveData.getBuyRoomInfo.roomWatchPv || 0) }}
            </div>
            <div class="num2">曝光人次</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ convert(liveData.getBuyRoomInfo.roomWatchPeople || 0) }}
            </div>
            <div class="num2">曝光人数</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ haveBy ? (liveData.getBuyRoomInfo.exposureIn || 0) + '%' : '-' }}
            </div>
            <div class="num2">直播进入率</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.watchTimes || 0) }}
            </div>
            <div class="num2">观看人次</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ convert(liveData.getBuyRoomInfo.onlineUserUcnt) }}
            </div>
            <div class="num2">观看人数</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ convert(liveData.getBuyRoomInfo.newGroupNum) }}
            </div>
            <div class="num2">新加团人数</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">{{ convert(liveData.getBuyRoomInfo.natureUv) }}</div>
            <div class="num2">直播自然UV</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">{{ convert(liveData.getBuyRoomInfo.payedUv) }}</div>
            <div class="num2">直播付费UV</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.maxOnlineNum || 0) }}
            </div>
            <div class="num2">人气峰值</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ convert(liveData.getBuyRoomInfo.onlineUserCnt) }}
            </div>
            <div class="num2">平均在线人数</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{
                haveBy
                  ? secondToDate(liveData.getBuyRoomInfo.avgWatchDuration || 0, 'm', false)
                  : '-'
              }}
            </div>
            <div class="num2">人均看播时长</div>
          </div>
        </div>
      </div>
    </div>
    <div class="all_num" v-if="statusInfo.shopAuth === 1">
      <div class="title">
        <!-- 销售数据 -->
        销售转化
        <!-- <el-tooltip placement="right">
          <template #content>当数据显示为“-”，需授权百应获取查看</template>
          <i class="iconfont icon-wenhao"></i>
        </el-tooltip> -->
      </div>
      <div class="num_box" v-if="liveData.sellAmount && liveData.sellAmount != '0.00'">
        <div class="one_num">
          <div class="num_o">
            <div class="num1">¥{{ wanSliceFormat(parseFloat(liveData.sellAmount || 0)) }}</div>
            <div class="num2">销售额</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.sellNum || 0) }}
            </div>
            <div class="num2">销售量</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.sellOrderNum || 0) }}
            </div>
            <div class="num2">订单数</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">{{ haveBy ? '¥' : '' }}{{ convert(liveData.getBuyRoomInfo.uv) }}</div>
            <div class="num2">UV价值</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ convert(liveData.getBuyRoomInfo.sellingGoodNum) }}
            </div>
            <div class="num2">在售商品</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.payedGoodsNum || 0) }}
            </div>
            <div class="num2">动销商品</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">¥{{ wanSliceFormat(parseFloat(liveData.gpm || 0)) }}</div>
            <div class="num2">千次观看成交额</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">¥{{ wanSliceFormat(parseFloat(liveData.hourAmount || 0)) }}</div>
            <div class="num2">单小时成交额</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">¥{{ wanSliceFormat(parseFloat(liveData.refundAmount || 0)) }}</div>
            <div class="num2">退款金额</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.refundNum || 0) }}
            </div>
            <div class="num2">退款件数</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ convert(liveData.getBuyRoomInfo.roomProductClickNum) }}
            </div>
            <div class="num2">商品点击人数</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ haveBy ? (liveData.getBuyRoomInfo.clickGoodsRateFrequency || 0) + '%' : '-' }}
            </div>
            <div class="num2">
              商品点击率
              <br />
              (次数)
            </div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ haveBy ? (liveData.getBuyRoomInfo.clickGoodsRatePeople || 0) + '%' : '-' }}
            </div>
            <div class="num2">
              商品点击率
              <br />
              (人数)
            </div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ haveBy ? (liveData.getBuyRoomInfo.kanBoChengJiaoRatePeople || 0) + '%' : '-' }}
            </div>
            <div class="num2">看播成交转化率</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ haveBy ? (liveData.getBuyRoomInfo.clickPayRatePeople || 0) + '%' : '-' }}
            </div>
            <div class="num2">点击成交转化率</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">¥{{ wanSliceFormat(parseFloat(liveData.keDanJia || 0)) }}</div>
            <div class="num2">客单价</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">¥{{ wanSliceFormat(parseFloat(liveData.avgProductPrice || 0)) }}</div>
            <div class="num2">件均价</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">{{ liveData.multiProductRate || 0 }}</div>
            <div class="num2">直播连带率</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ haveBy ? (liveData.getBuyRoomInfo.exposureDone || 0) + '%' : '-' }}
            </div>
            <div class="num2">曝光成交转化率</div>
          </div>
        </div>
      </div>
      <div class="none_box" v-else>
        <el-tooltip placement="right">
          <template #content>请确保账号直播售卖商品相关的小店已授权到系统中</template>
          <div class="none_tip">
            暂无销售数据
            <img src="https://tagvv-1256030678.file.myqcloud.com/20230609cffz6.png" alt="" />
          </div>
        </el-tooltip>
      </div>
    </div>
    <div class="all_num" v-if="false">
      <div class="title">线索数据</div>
      <div class="num_box">
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.appletsClueNum || 0) }}
            </div>
            <div class="num2">小程序</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.marketingComponent || 0) }}
            </div>
            <div class="num2">营销组件</div>
          </div>
        </div>
      </div>
    </div>
    <div class="all_num" v-if="statusInfo.byStatus === 1">
      <div class="title">
        投放数据
        <!-- <el-tooltip placement="right">
          <template #content>当数据显示为“-”，需授权百应获取查看</template>
          <i class="iconfont icon-wenhao"></i>
        </el-tooltip> -->
      </div>
      <div class="num_box">
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ haveBy ? ((launchData.num1 || 0) * 100).toFixed(2) + '%' : '-' }}
            </div>
            <div class="num2">付费流量占比</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ haveBy ? ((launchData.num2 || 0) * 100).toFixed(2) + '%' : '-' }}
            </div>
            <div class="num2">自然流量占比</div>
          </div>
        </div>
      </div>
    </div>
    <div class="all_num">
      <div class="title">留资转化</div>
      <div class="num_box">
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.clueCnt || 0) }}
            </div>
            <div class="num2">线索数</div>
          </div>
        </div>
      </div>
    </div>
    <div class="all_num">
      <div class="title">互动数据</div>
      <div class="num_box">
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.addFansNum || 0) }}
            </div>
            <div class="num2">涨粉数</div>
          </div>
        </div>
        <div class="one_num">
          <div class="num_o">
            <div class="num1">
              {{ wanSliceFormat(liveData.likeNum || 0) }}
            </div>
            <div class="num2">点赞数</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ convert(liveData.getBuyRoomInfo.roomCommentNum || 0) }}
            </div>
            <div class="num2">评论数</div>
          </div>
        </div>
        <div class="one_num" v-if="statusInfo.byStatus === 1">
          <div class="num_o">
            <div class="num1">
              {{ haveBy ? (liveData.getBuyRoomInfo.liveRoomInteractionRate || 0) + '%' : '-' }}
            </div>
            <div class="num2">互动率</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { wanSliceFormat, secondToDate } from '@/utils/tools'

const props = defineProps({
  haveBy: {
    type: Boolean,
    default: false
  },
  liveData: {
    type: Object,
    default: function () {
      return {}
    }
  },
  launchData: {
    type: Object,
    default: function () {
      return {}
    }
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
const launchData = toRef(props, 'launchData')
const liveData = toRef(props, 'liveData')
// 百应数据 未授权显示- 授权显示数值
function convert(num) {
  return props.haveBy ? wanSliceFormat(num || 0) : '-'
}
</script>
<style lang="scss" scoped>
@import '../../../components/css/qrcode.scss';
@import '../../../components/css/page.scss';
.detail_left {
  max-height: 100%;
  overflow-y: auto;
  padding: 0 24px;
  width: 320px;
  margin-right: $content_margin;
  border-radius: $content_radius;
  background: #fff;

  .one_left {
    padding: 22px 0 0;
  }
  .one_left + .one_left {
    border-top: 1px solid #e8e8e8;
    padding-top: 24px;
  }
  .left_title {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 16px;

    font-weight: 600;
    color: #303133;
    line-height: 22px;
    img {
      width: 20px;
      height: 20px;
      margin-right: 6px;
    }
  }
  .info_box {
    margin-top: 20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .info_head {
      margin-right: 10px;
      width: 66px;
      height: 66px;
      border-radius: 4px;
      position: relative;
      .live_img {
        width: 66px;
        height: 66px;
        border-radius: 4px;
        object-fit: cover;
      }
    }
    .info_content {
      max-width: calc(100% - 76px);
      .content1 {
        max-width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;

        font-weight: 500;
        color: #303133;
        line-height: 20px;
        .content_text {
          max-width: calc(100% - 24px);
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 6px;
          cursor: pointer;
        }
      }
      .content2 {
        margin-top: 6px;

        font-size: 12px;

        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
  .info_avatar {
    width: 48px;
    height: 48px;
    border-radius: 100%;
    object-fit: cover;
    margin-right: 12px;
  }
  .all_num {
    padding-top: 16px;
    border-top: 1px solid #e8e8e8;
  }
  .title {
    font-size: 14px;
    > .iconfont {
      font-size: 14px;
      color: #909399;
      margin-left: 4px;
    }
  }
  .num_box {
    padding: 24px 2px 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_num {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 33.33%;
      margin-bottom: 24px;
      .num_o {
        width: max-content;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .num1 {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        color: #333333;
        line-height: 22px;
      }
      .num2 {
        text-align: center;
        margin-top: 6px;
        font-size: 12px;

        font-weight: 400;
        color: #909399;
        line-height: 17px;
        span {
          font-size: 10px;
        }
      }
    }
    .one_num:nth-child(3n + 2) {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    .one_num:nth-child(3n + 3) {
      // justify-content: flex-end;
      // align-items: flex-end;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }
  .more_btn {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-bottom: 24px;
    .el-button {
      padding: 5px 14px;

      border-radius: 4px;
      border: 1px solid rgba(54, 79, 205, 0.5);
      font-size: 12px;

      font-weight: 400;
      color: $theme_color;
      line-height: 17px;
    }
  }
}
.none_box {
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding-bottom: 10px;
  color: #909399;
  font-weight: bold;
  font-size: 14px;
  .iconfont {
    font-size: 14px;
    font-weight: bold;
  }
}
.none_tip {
  color: #909399;
  font-size: 14px;
  font-weight: 400;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  img {
    width: 16px !important;
    height: 16px !important;
    object-fit: contain;
    display: flex;
    margin-left: 4px !important;
  }
}
</style>
