<template>
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
      <el-table-column width="200" label="订单编号">
        <template #default="scope">{{ scope.row.orderId || '--' }}</template>
      </el-table-column>
      <el-table-column min-width="160" label="商品">
        <template #default="scope">
          <div class="good_box" style="display: flex">
            <img
              v-if="scope.row.productUrl"
              class="good_cover"
              :src="scope.row.productUrl"
              alt=""
            />
            <img
              v-else
              class="good_cover"
              src="https://tagvv-1256030678.file.myqcloud.com/img/video4296897723694437335.jpg"
              alt=""
            />
            <div class="good_content">
              <!-- <el-tooltip effect="dark" placement="top-start" v-if="scope.row.productName">
                <template #content>
                  <div style="max-width: 300px">
                    {{ scope.row.productName || '--' }}
                  </div>
                </template> -->
              <div class="content_text row_overflow2">
                {{ scope.row.productName || '--' }}
              </div>
              <!-- </el-tooltip>
              <div v-else>--</div> -->
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="110" label="付款金额">
        <template #default="scope">¥{{ scope.row.payAmount || 0 }}</template>
      </el-table-column>
      <el-table-column min-width="110" label="下单用户">
        <template #default="scope">
          <!-- <el-tooltip effect="dark" placement="top-start" v-if="scope.row.payUserName">
            <template #content>
              <div style="max-width: 300px">
                {{ scope.row.payUserName || '--' }}
              </div>
            </template> -->
          <div class="content_text row_overflow2">
            {{ scope.row.payUserName || '--' }}
          </div>
          <!-- </el-tooltip>
          <div v-else>--</div> -->
        </template>
      </el-table-column>
      <el-table-column width="180" label="下单时间">
        <template #default="scope">{{ scope.row.payTime || '--' }}</template>
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
          <div class="phone_box" v-if="scope.row.payTel">
            <div v-if="scope.row.showPhone">{{ scope.row.payTel }}</div>
            <div v-else>
              {{ scope.row.payTel.substring(0, 3) }}****{{ scope.row.payTel.substring(7) }}
            </div>
            <!-- <div class="eye_icon" @click="showPhoneFun(scope.row, scope.$index)">
              <img
                v-if="scope.row.showPhone"
                src="@/assets/images/content_center/yanjing_xianshi.png"
                alt=""
              />
              <img v-else src="@/assets/images/content_center/yanjing_yincang.png" alt="" />
            </div> -->
          </div>
          <div v-else>--</div>
        </template>
      </el-table-column>
      <el-table-column min-width="135" label="线索地址">
        <template #default="scope">
          <el-tooltip effect="dark" placement="top-start" v-if="scope.row.payUserName">
            <template #content>
              <div style="max-width: 300px">
                {{ scope.row.payUserName || '--' }}
              </div>
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
        <template #default="scope">{{ scope.row.payTime || '--' }}</template>
      </el-table-column>
    </xm_table>
  </div>
</template>
<script setup>
import { pageList } from '../../model/ecommerce_data/get_list.js'
const props = defineProps({
  roomId: {
    type: String,
    default: '',
    required: true
  }
})
// 订单详情
const { chooseRule, ruleList, tableForm, changeRule, getList, resetList, statusList } = pageList(
  props.roomId
)
resetList()
// function showPhoneFun(e, i) {
//   tableForm.listData[i].showPhone = !tableForm.listData[i].showPhone
// }
</script>
<style lang="scss" scoped>
@import '../../../components/css/page.scss';
.content_text {
  max-width: 100%;
  width: max-content;
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
.phone_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .eye_icon {
    width: 16px;
    height: 16px;
    margin-left: 8px;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
      display: flex;
    }
  }
}
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

        font-weight: 500;
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
}
</style>
