<template>
  <div class="his">
    <!-- <div class="his_title">跟进记录</div> -->
    <div class="his_content">
      <div>
        <el-steps direction="vertical">
          <el-step v-for="(item, index) in info" :key="index" :title="item.consultDatetime">
            <template v-slot:description>
              <div v-if="item.consultModifyFlag !== 4 && item.consultModifyFlag !== 5">
                <div class="title_tip" style="font-weight: bold">
                  <img
                    v-if="item.consultModifyFlag === 2"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230410j0h92.png"
                    class="title_tip_img"
                  />
                  {{ RECORD_TYPE.getCN(item.consultModifyFlag) }}
                  <!-- <span v-if="item.consultModifyFlag === 1" style="margin-left: 10px">
                    客户意向度：{{ CUSTOMER_INTENT_STATUS.getCN(item.clientIntentStatus) || '--' }}
                  </span> -->
                </div>
                <div class="u_content" v-if="item.consultModifyFlag !== '2'">
                  <!-- 新客户创建 跟重新分配一样 -->
                  <div
                    class="new_user"
                    v-if="item.consultModifyFlag === 1 || item.consultModifyFlag === 8"
                  >
                    <div class="mar_top8">
                      <span class="item_label">归属人：</span>
                      <span class="title_tip">{{ item.clientBelongedName || '--' }}</span>
                    </div>
                    <div class="mar_top8" style="margin-left: 66px">
                      <span class="item_label">联系方式：</span>
                      <span class="title_tip">
                        <table_column_phone :phone="item.clientBelongedPhone"></table_column_phone>
                      </span>
                    </div>
                  </div>
                  <!-- 客户留资 -->
                  <template v-if="item.consultModifyFlag === 2">
                    <div class="new_user">
                      <div class="mar_top8">
                        <span class="item_label">留资来源：</span>
                        <span class="title_tip" v-if="item.phoneSource == 2">手动录入</span>
                        <span class="title_tip" v-else>
                          {{ CUSTOMER_SOURCE.getCN(item.clientSource) || '--' }}
                        </span>
                      </div>
                      <div class="mar_top8" style="margin-left: 66px">
                        <span class="item_label">联系方式：</span>
                        <span class="title_tip">
                          <table_column_phone :phone="item.clientPhone"></table_column_phone>
                        </span>
                      </div>
                    </div>
                    <div class="mar_top8" v-if="item.attachments.length > 0">
                      <el-image
                        v-for="(item, indexImg) in item.attachments"
                        :key="indexImg"
                        class="f_his_img"
                        :src="item.coverUrl"
                        :preview-src-list="[item.coverUrl]"
                        fit="cover"
                      />
                    </div>
                  </template>

                  <!-- 跟进记录 -->
                  <div class="f_his" v-if="item.consultModifyFlag === 3">
                    <div class="mar_top8 follow_con">
                      <div class="item_label">跟进内容：</div>
                      <div class="title_tip">{{ item.consultContent || '' }}</div>
                    </div>
                    <div class="mar_top8" v-if="item.attachments.length > 0">
                      <el-image
                        v-for="(item, indexImg) in item.attachments"
                        :key="indexImg"
                        class="f_his_img"
                        :src="item.coverUrl"
                        :preview-src-list="[item.coverUrl]"
                        fit="cover"
                      />
                    </div>
                  </div>
                  <!-- 客户回收 -->
                  <div class="new_user" v-if="item.consultModifyFlag === 9">
                    <div class="mar_top8">
                      <span class="title_tip">原因：{{ recoveryReason(item.type) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="u_content" v-if="item.consultModifyFlag === 4">
                <div class="u_status_change bold_tip">
                  <div class="item_label">{{ '客户阶段变更' }}为：</div>
                  <div class="title_tip">
                    {{ CUSTOMER_STEP_STATUS.getCN(item.consultStage) || '未知' }}
                    <span
                      style="margin-left: 20px; font-weight: 400"
                      v-if="item.consultStage === CUSTOMER_STEP_STATUS.get('无效')"
                    >
                      原因：{{ invalidReason(item.consultFailStageType) }}
                    </span>
                  </div>
                </div>
                <!-- 已成交信息 -->
                <div class="" v-if="item.consultStage == 5 && item.clientDealDO">
                  <div class="flex_wrap">
                    <div class="u_status_change mar_top8">
                      <div class="item_label">客户姓名：</div>
                      <div class="title_tip">{{ item.clientDealDO.clientName || '--' }}</div>
                    </div>
                    <div class="u_status_change mar_top8">
                      <div class="item_label">客户手机号：</div>
                      <div class="title_tip">
                        <table_column_phone
                          :phone="item.clientDealDO.clientPhone"
                        ></table_column_phone>
                      </div>
                    </div>
                    <div class="u_status_change mar_top8">
                      <div class="item_label">成交金额：</div>
                      <div class="title_tip">
                        {{ item.clientDealDO.dealMoney ? item.clientDealDO.dealMoney / 100 : '--' }}
                      </div>
                    </div>
                    <div class="u_status_change mar_top8">
                      <div class="item_label">产品型号：</div>
                      <div class="title_tip">{{ item.clientDealDO.modelNum || '--' }}</div>
                    </div>
                    <div class="u_status_change mar_top8">
                      <div class="item_label">成交数量：</div>
                      <div class="title_tip">{{ item.clientDealDO.dealNum || '--' }}</div>
                    </div>
                  </div>
                  <div class="mar_top8" v-if="item.attachments.length > 0">
                    <el-image
                      v-for="(item, indexImg) in item.attachments"
                      :key="indexImg"
                      class="f_his_img"
                      :src="item.coverUrl"
                      :preview-src-list="[item.coverUrl]"
                      fit="cover"
                    />
                  </div>
                </div>
              </div>
              <!-- 意向变更 -->
              <div
                class="u_status_change bold_tip"
                v-if="item.consultModifyFlag === 5 || item.consultModifyFlag === 6"
              >
                <div class="item_label">{{ '客户意向变更' }}为：</div>
                <div class="title_tip">
                  {{ CUSTOMER_INTENT_STATUS.getCN(item.clientIntentStatus) || '--' }}
                  <span v-if="item.consultModifyFlag === 6">管理员后台操作</span>
                </div>
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  CUSTOMER_INTENT_STATUS,
  CUSTOMER_STEP_STATUS,
  RECORD_TYPE,
  CUSTOMER_SOURCE
} from '@/utils/dictionary/customer.js'

const props = defineProps({
  userInfo: { type: Array, default: () => [] },
  info: {
    type: Array,
    default: () => []
  }
})
const invalidReason = key => {
  if ([1, 2, 3, 4].indexOf(key) === -1) return '未知'
  const tempObj = {
    1: '电话未接通',
    2: '客户完全无意向',
    3: '非本区域客户无法跟进，放弃跟进',
    4: '其他原因'
  }
  return tempObj[key]
}
const recoveryReason = key => {
  if ([1, 3, 4].indexOf(key) === -1) return '员工因非本区域放弃'
  const tempObj = {
    1: '员工因非本区域放弃',
    3: '未跟进系统回收',
    4: '未跟进系统回收'
  }
  if (key === 3) {
    // 通过clientDetail.stage 判断，1 潜客回收 2留资回收
    if (userInfo.value && userInfo.value.stage && userInfo.value.stage === 1) {
      return '潜客未跟进回收'
    } else {
      return tempObj[key]
    }
  } else {
    return tempObj[key]
  }
}
const { info, userInfo } = toRefs(props)
</script>

<style lang="scss" scoped>
.his {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  // padding-top: 22px;
  background-color: #fff;

  .mar_top8 {
    margin-top: 8px;
  }

  .his_title {
    padding: 20px 24px 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #dcdee0;
  }

  .his_content {
    padding: 20px 24px;
    // 更改步骤条圆圈样式
    :deep(.is-text) {
      // 圆圈border
      border: unset;
    }
    :deep(.el-step__main) {
      margin-top: -4px;
      padding-left: 0;
      width: calc(100% - 24px);
    }
    :deep(.el-step__icon-inner) {
      // 隐藏数字
      display: none;
    }

    :deep(.el-step__line) {
      // 线
      width: 1px;
      left: 4px;
      top: 8px;
      background-color: $theme_color;
    }

    :deep(.el-step__icon) {
      // 圆
      width: 9px;
      height: 9px;
      background: $theme_color;
    }

    :deep(.el-step__title) {
      // 标题
      font-size: 14px;
      font-weight: 400;
      color: #909399;
    }

    :deep(.el-step__description) {
      // 内容区域
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      padding: 12px 16px;
      background: #f6f7f8;
      margin-bottom: 24px;

      .title_tip {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        word-break: break-all;
        line-break: anywhere;

        .title_tip_img {
          width: 20px;
          height: 20px;
          vertical-align: -4px;
          img {
            width: 20px;
            height: 20px;
          }
        }
      }

      .u_status_change {
        display: flex;
      }

      .item_label {
        display: inline-block;
        font-size: 14px;
        color: #606266;
        margin-right: 12px;
        text-align: end;
        white-space: nowrap;
      }

      .u_content {
        .new_user {
          display: flex;
        }

        .follow_con {
          display: flex;
        }

        .f_his_img {
          width: 64px;
          height: 64px;
          border-radius: 2px;
          margin-right: 12px;

          &:last-child {
            margin-right: unset;
          }
        }
      }
    }
  }
}
.flex_wrap {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .u_status_change {
    margin-right: 66px;
  }
}
.bold_tip {
  font-weight: 600 !important;
  .title_tip {
    font-weight: 600 !important;
  }
}
</style>
