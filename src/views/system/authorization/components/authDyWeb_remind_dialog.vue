<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="授权提醒"
      width="420px"
      custom-class="xm_element_dialog"
    >
      <div class="content_box">
        <div class="content1">
          系统暂未获取到矩阵号“{{ info.authAccountName || '' }}”的UID，无法完成获客互动能力授权
        </div>
        <div class="content2">
          <div style="color: rgba(48, 49, 51, 1)">解决方法：</div>
          1.请打开抖音新发布一条公开视频（未获取到之前，请勿删除或隐藏）
          <br />
          2.视频发布成功后，请等待一分钟再点击下方“我已发布”按钮，系统将进行获取（24小时内2次机会）
          <br />
          <br />
          除此之外，您也可以等待系统统一进行获取（每日0点、12点、20点）
          <br />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" :disabled="loading" :loading="loading" @click="showRemindFun">
            我已发布
          </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      ref="dialog1"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="showRemind"
      title="授权提醒"
      width="420px"
      custom-class="xm_element_dialog"
    >
      <div class="content_box">
        <div class="content1">确认已发布视频？</div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRemind = false">取消</el-button>
          <el-button type="primary" @click="publishFun">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { videoListForceSync, accountDyWebAuthLink } from '@/api/system_setting/authorization'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  remindDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.remindDialog, 'show')
const info = toRef(props.remindDialog, 'info')

const loading = ref(false)

const showRemind = ref(false)
const showRemindFun = throttle(() => {
  showRemind.value = true
}, 500)

const count = ref(12)
const timer = ref(null)
const message = inject('$message')
const emits = defineEmits(['updateRemindFun'])
function handleClose() {
  dialog.value.handleClose()
}
const publishFun = throttle(() => {
  showRemind.value = false
  loading.value = true
  videoListForceSync({ dyOpenId: info.value.openId })
    .then(res => {
      if (res.code === 0) {
        count.value = 12
        setTimer()
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
})
const setTimer = token => {
  console.log('请求loading', info.value)
  timer.value = setInterval(() => {
    if (count.value === 0) {
      message.warning('获取失败')
      clearTimer()
    } else {
      count.value--

      const authPromise = accountDyWebAuthLink({ id: info.value.operationId })
      authPromise.then(res => {
        // 0 初始化 1 扫码成功 2 授权成功 3授权错误
        if (res.code === 0) {
          emits('updateRemindFun')
          message.success('获取成功')
          clearTimer()
          handleClose()
        }
      })
    }
  }, 5000)
}
const clearTimer = () => {
  clearInterval(timer.value)
  timer.value = null

  loading.value = false
}
onBeforeUnmount(clearTimer)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_box {
  padding-bottom: 12px;
  .content1 {
    font-size: 14px;
    font-weight: 400;
    color: #323233;
    line-height: 20px;
  }
  .content2 {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 400;
    color: #606266;
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
