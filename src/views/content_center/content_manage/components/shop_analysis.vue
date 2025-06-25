<template>
  <div class="shop_analysis">
    <!-- 数据概览 -->
    <div class="one_box">
      <div class="title_box">
        <div class="title">数据概览</div>
      </div>
      <div class="title_mark">视频带货表现</div>
      <div class="num_box">
        <div class="one_num">
          <div class="num1">
            <!-- {{ Number(wanSliceFormat(dateOBj.commerceCount / 100 || 0)).toFixed(2) }} -->
            {{ wanSliceFormat((dateOBj.commerceCount / 100 || 0).toFixed(2)) }}
          </div>
          <div class="num2">销售额(元)</div>
        </div>
        <div class="one_num">
          <div class="num1">{{ wanSliceFormat(dateOBj.saleCount || 0) }}</div>
          <div class="num2">销售量</div>
        </div>
        <div class="one_num">
          <div class="num1">{{ wanSliceFormat(dateOBj.clueCount || 0) }}</div>
          <div class="num2">线索数</div>
        </div>
      </div>
    </div>
    <!-- 订单详情 -->
    <div class="one_box">
      <div class="title_box" style="margin-bottom: 24px">
        <div class="title">订单详情</div>
        <div class="rule_box">
          <div
            @click="changeRule(item.name)"
            :class="{ one_rule: true, choose_rule: item.name == chooseRule }"
            v-for="(item, index) in ruleList"
            :key="index"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      <!-- 抖店订单 -->
      <xm_table
        v-if="chooseRule == 'store'"
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="150" label="订单编号">
          <template #default="scope">{{ scope.row.orderNo || '--' }}</template>
        </el-table-column>
        <el-table-column min-width="120" label="商品">
          <template #default="scope">
            <div class="good_box" style="display: flex">
              <img v-if="scope.row.cover" class="good_cover" :src="scope.row.cover" alt />
              <img
                v-else
                class="good_cover"
                src="https://tagvv-1256030678.file.myqcloud.com/img/video4296897723694437335.jpg"
                alt
              />
              <div class="good_content">
                <el-tooltip effect="dark" placement="top-start" v-if="scope.row.wareName">
                  <template #content>
                    <div style="max-width: 300px">{{ scope.row.wareName || '--' }}</div>
                  </template>
                  <div class="content_text row_overflow">{{ scope.row.wareName || '--' }}</div>
                </el-tooltip>
                <div v-else>--</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="120" label="付款金额">
          <template #default="scope">¥{{ scope.row.orderMoney || 0 }}</template>
        </el-table-column>
        <el-table-column min-width="135" label="下单用户">
          <template #default="scope">
            <el-tooltip effect="dark" placement="top-start" v-if="scope.row.nickname">
              <template #content>
                <div style="max-width: 300px">{{ scope.row.nickname || '--' }}</div>
              </template>
              <div class="content_text row_overflow">{{ scope.row.nickname || '--' }}</div>
            </el-tooltip>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column min-width="160" label="下单时间">
          <template #default="scope">{{ scope.row.createTime || '--' }}</template>
        </el-table-column>
        <el-table-column min-width="110" label="订单状态">
          <template #default="scope">
            <div class="status_content">
              <div
                v-if="scope.row.orderStatus"
                :class="'status_circle ' + statusList.get(scope.row.orderStatus || 0).class"
              ></div>
              <div>{{ statusList.get(scope.row.orderStatus || 0).label }}</div>
            </div>
          </template>
        </el-table-column>
      </xm_table>
      <!-- 线索明细 -->
      <xm_table
        v-else
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="135" label="线索手机">
          <template #default="scope">
            <div class="phone_box" v-if="scope.row.phone">
              <div v-if="scope.row.showPhone">{{ scope.row.phone }}</div>
              <div v-else>
                {{ scope.row.phone.substring(0, 3) }}****{{ scope.row.phone.substring(7) }}
              </div>
              <!-- <div class="eye_icon" @click="showPhoneFun(scope.row, scope.$index)">
                <img
                  v-if="scope.row.showPhone"
                  src="@/assets/images/content_center/yanjing_xianshi.png"
                  alt
                />
                <img v-else src="@/assets/images/content_center/yanjing_yincang.png" alt />
              </div> -->
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column min-width="135" label="线索地址">
          <template #default="scope">
            <el-tooltip effect="dark" placement="top-start" v-if="scope.row.payUserName">
              <template #content>
                <div style="max-width: 300px">{{ scope.row.payUserName || '--' }}</div>
              </template>
              <div class="content_text row_overflow">
                {{ scope.row.payUserName || '浙江省-杭州市' }}
              </div>
            </el-tooltip>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column min-width="150" label="线索来源">
          <template #default="scope">{{ scope.row.orderId || '--' }}</template>
        </el-table-column>
        <el-table-column min-width="150" label="来源信息">
          <template #default="scope">
            <el-tooltip effect="dark" placement="top-start" v-if="scope.row.payUserName">
              <template #content>
                <div v-if="true" style="max-width: 300px">
                  <div class="content_text row_overflow">
                    {{ scope.row.payUserName || '组件名字' }}
                  </div>
                  <div class="content_text row_overflow">
                    组件ID：{{ scope.row.payUserName || '--' }}
                  </div>
                </div>
                <div v-else class="content_text row_overflow" style="max-width: 300px">
                  {{ scope.row.payUserName || '商品名字' }}
                </div>
              </template>
              <div v-if="true">
                <div class="content_text row_overflow">
                  {{ scope.row.payUserName || '组件名字' }}
                </div>
                <div class="content_text row_overflow">
                  组件ID：{{ scope.row.payUserName || '--' }}
                </div>
              </div>
              <div v-else class="content_text row_overflow">
                {{ scope.row.payUserName || '商品名字' }}
              </div>
            </el-tooltip>
            <div v-else>--</div>
          </template>
        </el-table-column>

        <el-table-column min-width="160" label="留资时间">
          <template #default="scope">{{ scope.row.retentionTime || '--' }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { wanSliceFormat } from '@/utils/tools.js'
import { pageData } from '../model/shop_analysis/get_data.js'
import { pageList } from '../model/shop_analysis/get_list.js'
const props = defineProps({
  videoForm: {
    type: Object,
    default: () => {
      return {
        itemId: '',
        brandId: '',
        platform: null
      }
    },
    required: true
  },
  dateOBj: {
    type: Object,
    default: () => {
      return {
        clueCount: '',
        commerceCount: '',
        saleCount: null
      }
    },
    required: true
  }
})
// 数据概览
const { getData } = pageData(props.videoForm)
getData()

// 订单详情
const { chooseRule, ruleList, tableForm, changeRule, getList, resetList, statusList } = pageList(
  props.videoForm
)
resetList()
// function showPhoneFun(e, i) {
//   tableForm.listData[i].showPhone = !tableForm.listData[i].showPhone
// }
</script>
<style lang="scss" scoped>
@import '../../components/css/page.scss';
.shop_analysis {
  .one_box {
    background: #fff;
    border-radius: $content_radius;
    border-radius: 4px;
    padding: 22px 24px;
    margin-bottom: $content_margin;
    .title_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .rule_box {
        flex: 1;

        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        .one_rule {
          padding-left: 8px;
          cursor: pointer;
          font-size: 14px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 600;
          color: #909399;
          line-height: 20px;
          &:first-child {
            padding-right: 8px;
          }
        }
        .one_rule + .one_rule {
          border-left: 1px solid #e8e8e8;
        }
        .choose_rule {
          color: $theme_color;
        }
      }
    }
    .title_mark {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
      margin: 16px 0;
    }
    .num_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      .one_num {
        width: calc((100% - 32px) / 3);
        padding: 20px 0;

        background: #f6f7f8;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .num1 {
          font-size: 18px;
          font-family: DIN-Bold, DIN;
          font-weight: bold;
          color: #333333;
          line-height: 22px;
        }
        .num2 {
          margin-top: 6px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
        }
      }
    }
    .good_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      .good_cover {
        width: 60px;
        height: 60px;
        border-radius: 4px;
        object-fit: cover;
        margin-right: 6px;
      }
      .good_content {
        width: calc(100% - 66px);
      }
    }
  }
}
.content_text {
  max-width: 100%;
  width: max-content;
}
.phone_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .eye_icon {
    width: 20px;
    height: 20px;
    margin-left: 2px;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
      display: flex;
    }
  }
}
</style>
