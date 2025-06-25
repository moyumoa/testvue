<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="系统提醒"
      width="420px"
      custom-class="xm_element_dialog"
    >
      <template #title>
        <div class="dialog_title">
          <div class="title">系统提醒</div>
        </div>
      </template>
      <div class="content_box">
        <div class="content1">授权矩阵号后将自动获取数据</div>
        <div class="content2">
          1、获取数据将消耗1星力值/矩阵号/天
          <br />
          2、成功接入的矩阵号长期有效，可手动解除授权，授权失效状态下停止扣除星力值
          <br />
        </div>
      </div>
      <!-- <el-checkbox v-model="checked">以后不再提示</el-checkbox> -->
      <div class="radio_box" @click.stop="checked = !checked">
        <div class="xm_radio_box">
          <div class="radio_choose" v-if="checked"></div>
          <div class="radio_unChooose" v-else></div>
        </div>
        以后不再提示
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="confirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import { updateUserNoticeConfig } from '@/api/system_setting/notice.js'
import { useStore } from 'vuex'
const store = useStore()
const emit = defineEmits(['auth'])

const props = defineProps({
  // authFn:Function,
  dialogInfo: {
    type: Object,
    default: () => {
      return {
        type: null,
        target: null,
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.dialogInfo, 'show')
const checked = ref(false)
const confirm = throttle(() => {
  if (checked.value === true) {
    updateUserNoticeConfig({
      config: JSON.stringify({
        accountDataAuthHide: true
      })
    })
      .then(res => {
        console.log('updateUserNoticeConfig', res)
        if (res.code === 0) {
          store.commit('user/setAccountDataAuthHide', true)
          localStorage.setItem('accountDataAuthHide', '1')
        }
      })
      .catch(ex => {
        console.log('updateUserNoticeConfig err', ex)
      })
  }

  emit('auth')
  dialog.value.handleClose()
}, 500)

function handleClose() {
  dialog.value.handleClose()
}

// onBeforeUnmount()
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.radio_box {
  font-size: 12px;
  margin-top: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color:#86909c;
  .xm_radio_box {
    position: relative;
    margin-right: 8px;
    :deep(.radio_unChooose),:deep(.radio_choose) {
      width: 14px;
      height: 14px;
    }
  }
}
.content_box {
  // padding-bottom: 12px;
  .content1 {
    font-size: 14px;
    // font-weight: 600;
    color: #333;
    line-height: 20px;
  }
  .content2 {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    p + p {
      margin-top: 6px;
    }
    span {
      font-weight: 600;
    }
  }
}
</style>
