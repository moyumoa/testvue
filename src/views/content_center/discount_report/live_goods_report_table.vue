<template>
  <!-- 筛选条件 -->
  <xm_search
    :class="props.type === 'dialog' ? 'dialog_search' : ''"
    :searchComponents="searchComponents"
    @getData="searchList"
    :useOwnReset="true"
    @reset="resetSearch"
  />
  <div :class="props.type === 'dialog' ? '' : 'table_box'">
    <div class="table_top" v-if="props.type !== 'dialog'">
      <div class="mark">
        直播场次：
        <span style="color: rgba(48, 49, 51, 1); margin-right: 25px">{{ tableForm.total }}场</span>
        <el-tooltip
          content="标价折扣为商品销售价格/划线价格，非实际售出价格，不考虑使用优惠券、秒杀、团购等优惠活动"
          :style="{ 'margin-left': '4px' }"
        >
          <img
            src="@/assets/images/operate/tip_line.png"
            style="width: 12px; height: 12px; margin-right: 4px"
          />
        </el-tooltip>
        平均标价折扣：
        <span style="color: rgba(48, 49, 51, 1)">
          {{
            tableForm.totalAvgDiscount
              ? parseFloat(Math.floor(tableForm.totalAvgDiscount * 1000)) / 100 + '折'
              : '--'
          }}
        </span>
      </div>
      <!-- <el-button type="primary" @click="exportFun">导出</el-button> -->
    </div>

    <xm_table
      class="pic_table"
      tableType="live"
      v-loading="tableForm.loading"
      :data="tableForm.listData"
      :tableHeight="props.type === 'dialog' ? 500 : null"
      v-model:page="tableForm.page"
      @getTableData="getList"
    >
      <el-table-column min-width="220" label="直播信息">
        <template #default="scope">
          <div class="live_box">
            <router-link :to="toDetail(scope.row.roomId)">
              <div class="live_img_box">
                <img v-if="scope.row.roomPhoto" :src="scope.row.roomPhoto" class="live_img" />
                <img
                  class="live_img"
                  v-else
                  src="@/assets/images/content_center/default_cover.png"
                  alt
                />
                <liveAnimation v-if="scope.row.roomStatus == 1"></liveAnimation>
              </div>
            </router-link>

            <div class="live_content">
              <div class="content1">
                <router-link
                  :to="toDetail(scope.row.roomId)"
                  :style="
                    scope.row.roomStatus == 1
                      ? 'max-width:calc(100% - 26px) !important'
                      : 'max-width:calc(100% - 0px) !important'
                  "
                >
                  <div class="content_text row_overflow">{{ scope.row.roomTitle || '--' }}</div>
                </router-link>

                <el-popover
                  v-if="scope.row.roomStatus == 1"
                  placement="bottom"
                  popper-class="qrcode_popper"
                  width="154px"
                  trigger="click"
                >
                  <template #reference>
                    <img src="@/assets/images/content_center/qrcode.png" alt />
                  </template>
                  <div class="qrcode_box" v-if="scope.row.roomId">
                    <qrcode-vue
                      :value="localOrign + '/sumflyh5/activity?roomId=' + scope.row.roomId"
                      :size="126"
                      level="H"
                    />
                    <div class="qr_mark">
                      <img
                        src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                        alt
                      />
                      抖音扫码观看
                    </div>
                  </div>
                  <div v-else class="qrcode_box">
                    <div class="qr_mark">暂未找到相关地址</div>
                  </div>
                </el-popover>
              </div>

              <div class="content2" @click="toDetail(scope.row.roomId)">
                时长：{{ Math.floor(scope.row.liveDurationTime / 60000) || '--' }}分钟
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="200" label="矩阵号">
        <template #default="scope">
          <!-- <router-link :to="toUserDetail(scope.row.dyOpenId)"> -->
          <div class="user_box">
            <img v-if="scope.row.avatar" :src="scope.row.avatar" class="user_head" alt />
            <img
              v-else
              src="@/assets/images/content_center/default_user.png"
              class="user_head"
              alt
            />
            <div class="user_content">
              <div class="content1">
                <div class="content_text row_overflow">{{ scope.row.nickname || '--' }}</div>

                <img
                  v-if="scope.row.platform == 1"
                  src="@/assets/images/content_center/dy.png"
                  alt
                />
                <img
                  v-if="scope.row.platform == 2"
                  src="@/assets/images/content_center/ks.png"
                  alt
                />
                <img
                  v-if="scope.row.platform == 3"
                  src="@/assets/images/content_center/sph.png"
                  alt
                />
                <img
                  src="@/assets/images/content_center/change.png"
                  v-if="scope.row.xuserType == 2"
                  alt
                />
                <img
                  src="@/assets/images/content_center/fs.png"
                  v-if="scope.row.xuserType == 3"
                  alt
                />
              </div>
            </div>
          </div>
          <!-- </router-link> -->
        </template>
      </el-table-column>
      <el-table-column min-width="180" label="开播时间">
        <template #default="scope">{{ scope.row.liveStartTime || '--' }}</template>
      </el-table-column>
      <el-table-column min-width="110" label="平均标价折扣">
        <template #default="scope">
          {{
            scope.row.avgDiscount
              ? parseFloat(Math.floor(scope.row.avgDiscount * 1000)) / 100 + '折'
              : '--'
          }}
        </template>
      </el-table-column>
    </xm_table>
  </div>
</template>

<script setup>
import { pageList } from './model/get_list.js'
import liveAnimation from '../components/live_animation.vue'
import qrcodeVue from 'qrcode.vue'

const props = defineProps({
  type: String,
  accountId: Number
})

const { searchComponents, tableForm, searchList, resetSearch, toDetail, getList, getMatrixList } =
  pageList(props)
const localOrign = location.origin

watch(
  () => props.accountId,
  val => {
    resetSearch()
  }
)

onMounted(() => {
  resetSearch()
  getMatrixList()
})
</script>

<style lang="scss" scoped>
@import '../components/css/page.scss';
@import '../components/css/qrcode.scss';

@import '../components/css/page.scss';
@import '../components/css/qrcode.scss';

.table_box {
  margin-top: $content_margin;
  border-radius: $content_radius;
  width: 100%;
  background: #fff;
  padding: 22px 24px;
  .table_top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    .mark {
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
      display: flex;
      align-items: center;
    }
  }
  .live_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .live_img_box {
      cursor: pointer;
      width: 60px;
      height: 60px;
      border-radius: 4px;
      margin-right: 10px;
      position: relative;
    }
    .live_img {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      object-fit: cover;
    }
    .live_content {
      width: calc(100% - 70px);
      height: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;

        font-weight: 500;
        color: #303133;
        line-height: 20px;
        a {
          max-width: calc(100% - 26px) !important;
        }
        .content_text {
          cursor: pointer;
          max-width: 100%;
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 8px;
          cursor: pointer;
        }
      }
      .content2 {
        cursor: pointer;
        margin-top: 8px;
        font-size: 12px;

        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
  .user_box {
    cursor: pointer;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .user_head {
      width: 36px;
      height: 36px;
      border-radius: 100%;
      margin-right: 4px;
    }
    .user_content {
      width: calc(100% - 40px);
      min-height: 36px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;

        font-weight: 500;
        color: #303133;
        line-height: 20px;
        .content_text {
          width: max-content;
          max-width: calc(100% - 40px);
        }
        img {
          width: 16px;
          height: 16px;
          margin-left: 4px;
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
}
.dialog_search {
  padding: 0 !important;
}
</style>
