<template>
  <div class="customer-setting">
    <el-tabs class="tab_box hide_underline" v-model="chooseRule">
      <el-tab-pane label="分配规则设置" name="CustomerSettings">
        <FunctionSettingSwitch></FunctionSettingSwitch>
      </el-tab-pane>
      <el-tab-pane label="客户功能配置" name="noticeSettings">
        <MessageNotificationSwitchVue></MessageNotificationSwitchVue>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import FunctionSettingSwitch from './components/function_settings_switch.vue'
import MessageNotificationSwitchVue from './components/message_notification_switch.vue'

const chooseRule = ref('CustomerSettings')
</script>

<style lang="scss" scoped>
:deep(.el-tabs__header) {
  background: #fff;
  padding: 16px 0 0 24px;
  border-radius: 4px;
}

.customer-setting {
  min-height: calc(100% - 20px);
  // background: #ffffff;
  border-radius: 2px;

  .main-title {
    padding: 0 24px;
    line-height: 70px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #dcdee0;
  }

  .container {
    padding: 4px 24px;
    font-size: 14px;
    line-height: 30px;
    color: #606266;

    .module-title {
      margin-top: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;

      .switch {
        margin-left: 12px;
      }
    }
  }
}
</style>
