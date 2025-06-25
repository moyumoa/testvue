<template>
  <el-dialog
    custom-class="upgrade_dialog"
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="upgradeInfo.show"
    width="560px"
    :show-close="false"
  >
    <template #title>
      <div class="head_box">
        <img
          class="back_img"
          src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/ef92328809aa4d7abeaa2967df37cdb2_1682476700115.png"
        />
        <img
          class="top_img"
          src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/864113216485464292d41a4dd131ff6c编组 18@2x.png"
        />
        <div class="top_text">系统公告</div>
        <el-icon @click="closeDialog" class="close_icon"><i-close /></el-icon>
      </div>
    </template>
    <div class="content_box">{{ upgradeInfo.content }}</div>
    <template #footer>
      <div class="footer_box">
        <el-button type="primary" @click="knowDialog">知道了</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { readMsg } from '@/api/main/home'
import { useStore } from 'vuex'
const store = useStore()
const upgradeInfo = computed(() => {
  const brandId = localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : null
  if (brandId && brandId === 101) {
    return {
      show: false
    }
  } else {
    return store.state.system.upgradeInfo
  }
})
const dialog = ref(null) // ==this.$refs.dialog
function knowDialog() {
  closeDialog()
}
function closeDialog() {
  readMsg({
    ids: upgradeInfo.value.ids || []
  }).finally(() => {
    store.commit('system/setShowUpgrade', {
      show: false,
      content: ''
    })
  })
}
</script>
<style lang="scss" scoped>
.head_box {
  width: 100%;
  height: 168px;
  border-radius: 4px 4px 0px 0px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: 500;
  color: #ffffff;
  line-height: 28px;
  .back_img {
    position: absolute;
    z-index: 0;
    height: 168px;
  }
  .top_img {
    width: 78px;
    height: 78px;
    margin-bottom: 11px;
    margin-top: 9px;
    z-index: 1;
  }
  .top_text {
    font-size: 24px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #1e0d65;
    line-height: 34px;
    z-index: 1;
  }
  .close_icon {
    font-size: 18px;
    color: #646566;
    position: absolute;
    top: 16px;
    right: 16px;
  }
}
.content_box {
  padding: 18px 27px 8px;
  min-height: 136px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 14px;
  font-weight: 400;
  color: #606266;
  line-height: 24px;
  white-space: pre-line;
  display: inline-block;
  word-break: break-all;
}
.footer_box {
  padding: 8px 0 16px;
  text-align: center;
}
</style>
