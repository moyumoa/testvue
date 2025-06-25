<template>
  <div class="config_setting_wrapper" :class="{ flex_center: !isAuth }">
    <template v-if="isAuth">
      <div class="config_main">
        <slot></slot>
      </div>
      <div class="config_footer" :class="{ text: props.text !== '' }">
        <span class="tip">
          {{ props.text }}
        </span>
        <el-button type="primary" @click="onSave">保存</el-button>
      </div>
    </template>
    <template v-else>
      <div class="no_auth">
        <img src="@/assets/images/diy/logo.png" alt="" />
        <p>暂无绑定的抖音小程序</p>
        <el-button type="primary" @click="linkTo">立即授权</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  text: { type: String, default: '' }
})
const emits = defineEmits(['save'])
// 是否授权
const isAuth = inject('auth')

const onSave = () => {
  emits('save')
}
const linkTo = () => {
  window.open('/system_manage/tripartitlePlatform_auth?type=mini', '_blank')
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}
div::-webkit-scrollbar {
  width: 0;
  /**/
}
.config_setting_wrapper {
  box-sizing: border-box;
  width: 380px;
  position: relative;
  > .config_main {
    padding: 24px 16px;
    height: calc(100% - 56px);
    overflow-y: auto;
    .config_title {
      font-size: 18px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #323233;
      line-height: 20px;
      margin-bottom: 21px;
    }
    .config_item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      .label {
        color: #909399;
        line-height: 20px;
      }
      .content {
        flex: 1;
        text-align: right;
      }
    }
  }
  > .config_footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 12px 0;
    text-align: center;
    box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
    background-color: #fff;
    &.text {
      display: flex;
      padding: 12px 24px;
      justify-content: space-between;
      align-items: center;
    }
    .tip {
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      color: #909399;
      line-height: 17px;
    }
  }
  > .no_auth {
    text-align: center;
    > img {
      width: 64px;
      height: 64px;
    }
    > p {
      margin: 16px 0 36px 0;
    }
  }
}
</style>
