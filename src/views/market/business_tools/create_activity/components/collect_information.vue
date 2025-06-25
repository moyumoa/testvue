<template>
  <div class="setting_block">
    <div class="setting_title">活动信息收集</div>
    <div class="setting_main">
      <el-form-item prop="info" label-width="0%">
        <div class="info_all">
          <div class="info_box">
            <div :class="{ label: true, choose_label: activityInfo.info.length == 0 }">
              {{ activityInfo.info.length > 0 ? '已设置信息：' : '未设置信息：' }}
            </div>
            <div class="content" style="height: 32px; line-height: 30px">
              <el-link type="primary" @click="showModal" :disabled="activityInfo.disabled">
                {{ activityInfo.info.length > 0 ? '重新设置' : '设置' }}
              </el-link>
            </div>
          </div>
          <template v-if="activityInfo.info.length > 0">
            <template v-for="(item, index) in activityInfo.info" :key="index">
              <div class="info_box" v-if="item.configIsShow == 1">
                <div :class="{ label: true, choose_label: item.configIsMust == 1 }">
                  {{ item.configTitle }}
                </div>
                <div class="content">
                  <el-input
                    maxlength="20"
                    style="width: 264px"
                    disabled
                    :placeholder="
                      item.configType == 0
                        ? '请选择地理位置'
                        : item.configType == 1
                        ? '请输入手机号'
                        : '请输入' + item.configTitle
                    "
                  ></el-input>
                </div>
              </div>
            </template>
          </template>
        </div>
      </el-form-item>
    </div>
    <!-- 留资弹窗设置 -->
    <retentionModal @updateConfig="getConfigFun" v-if="modal.show" :modal="modal"></retentionModal>
  </div>
</template>

<script setup>
import retentionModal from './retention_modal.vue'
import { getListAppointmentConfig } from '@/api/market/business_tools.js'
const props = defineProps({
  activityInfo: Object
  // disabled: Boolean,
  // basicDisabled: Boolean
})
const { activityInfo } = reactive(toRefs(props))
const modal = reactive({
  show: false
})
onMounted(() => {
  getConfigFun()
})

// 展示设置留资信息的弹窗
function showModal() {
  modal.show = true
}

// 获取留资配置
function getConfigFun() {
  getListAppointmentConfig().then(res => {
    if (res.code === 0 && res.data && res.data.length > 0) {
      activityInfo.info = res.data
    }
  })
}
</script>

<style lang="scss" scoped>
.info_all {
  width: 100%;
  .info_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .label {
      width: 226px;
      text-align: right;
      font-size: 14px;
      color: #606266;
      line-height: 32px;
      padding-right: 14px;
    }
    .choose_label:before {
      content: '*';
      color: var(--el-color-danger);
      margin-right: 4px;
    }
    .content {
      // width: 80%;
      line-height: 32px;
    }
  }
  .info_box + .info_box {
    margin-top: 22px;
  }
}
</style>
