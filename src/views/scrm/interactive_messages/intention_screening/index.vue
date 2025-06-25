<template>
  <div class="customer-setting">
    <el-tabs class="tab_box hide_underline" v-model="chooseRule" @tab-click="changeTab">
      <el-tab-pane label="高意向关键词" name="highKeyword">
        <HighKeyword v-if="chooseRule === 'highKeyword'" />
      </el-tab-pane>
      <el-tab-pane label="负面关键词" name="lowKeyword">
        <LowKeyword v-if="chooseRule === 'lowKeyword'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import HighKeyword from './components/high_keyword.vue'
import LowKeyword from './components/low_keyword.vue'

const chooseRule = ref('highKeyword')

function changeTab(val) {
  console.log(val, 'val')
  chooseRule.value = val.props.name
}
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
