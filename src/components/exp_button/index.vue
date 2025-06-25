<template>
  <div>
    <el-button style="margin-left: 18px" :type="props.type" @click="apiRequest" @close="closeDia">
      <slot></slot>
    </el-button>
    <!-- :class="dialogTableVisible ? 'show_exp_button' : ''" -->
    <div class="exp_button" v-if="dialogTableVisible" ref="expButtonDom" @click.stop="closeDia">
      <div class="exp_button_con" ref="expButtonCon" @click.stop="true">
        <div class="close" @click.stop="closeDia">
          <el-icon>
            <i-close />
          </el-icon>
        </div>
        <div class="dia_content">
          <el-icon class="dia_icon"><i-circle-check /></el-icon>
          <div class="confirm_text">导出任务已提交！</div>
          <div class="confirm_tips">
            请点击页面右{{ judgeHWork() ? '下' : '上' }}角
            <span>下载中心</span>
            查看导出进度并下载
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Bus from '@/bus/bus.js'
import { ElMessageBox } from 'element-plus'

const downloadCenterOffsetLeft = ref(0)
const dialogTableVisible = ref(false)
const props = defineProps({
  type: String,
  isExport: Boolean,
  asyncFunc: Function
})
const judgeHWork = inject('$judgeHWork')
// 添加订阅
function addListener() {
  Bus.$on('getDownloadCenterOffsetLeft', ({ val }) => {
    downloadCenterOffsetLeft.value = Number(val)
  })
}

const downloadCenterOffsetLeftCss = ref('')
const downloadCenterOffsetLeftCssStage2 = ref('')

function apiRequest() {
  props
    .asyncFunc()
    .then(() => {
      // 每次都获取位置信息
      addListener()
      Bus.$emit('changeDownloadButtonDom')
      dialogTableVisible.value = true
      setTimeout(() => {
        closeDia()
      }, 1500)
    })
    .catch(err => {
      console.log(err)
    })
}
const expButtonDom = ref(null)
const expButtonCon = ref(null)
// 手动关闭弹窗
const closeDia = () => {
  if (!judgeHWork()) {
    downloadCenterOffsetLeftCss.value = downloadCenterOffsetLeft.value + 58 + 'px'
    downloadCenterOffsetLeftCssStage2.value = downloadCenterOffsetLeft.value - 100 + 'px'
    expButtonDom.value && expButtonDom.value.classList.add('close_exp_button')
    expButtonCon.value && expButtonCon.value.classList.add('close_exp_button_con')
  }
  setTimeout(() => {
    dialogTableVisible.value = false
    // 去除订阅
    Bus.$off('getDownloadCenterOffsetLeft')
  }, 1000)
}
// 出现温馨提示的弹窗
const showTipDialog = number => {
  Bus.$emit('changeDownloadButtonDom')
  ElMessageBox.confirm(
    `筛选时间跨度超出${number || 7}天，数据查询量较大，请导出报表查看`,
    '温馨提示',
    {
      confirmButtonText: '立即导出',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'drawer_systemBox drawer_systemBox2',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          //  不能查询的时候自动帮用户导出数据
          props
            .asyncFunc()
            .then(() => {
              done()
            })
            .catch(() => {
              done()
            })
        } else {
          done()
        }
      }
    }
  )
    .then(res => {
      console.log('res', res)
      // 每次都获取位置信息

      dialogTableVisible.value = true
      setTimeout(() => {
        closeDia()
      }, 1500)
    })
    .catch(err => {
      console.log('err', err)
    })
}
defineExpose({
  apiRequest,
  showTipDialog
})
</script>

<style lang="scss" scoped>
.exp_button {
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .exp_button_con {
    background: #fff;
    margin: 10% auto;
    z-index: 1000;
    width: 30%;
    min-width: 420px;
    border-radius: 4px;
    position: relative;
    .close {
      font-size: 16px;
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      padding: 18px 16px 0 16px;
      color: #909399;
      &:hover {
        color: #346fcd;
        cursor: pointer;
      }
    }

    .dia_content {
      height: 200px;
      padding: 22px 24px;
      text-align: center;
      .dia_icon {
        font-size: 48px;
        color: #31c16c;
      }
      .confirm_text {
        font-size: 16px;
        font-weight: 500;
        margin: 12px 0 20px 0;
      }
      .confirm_tips {
        font-size: 14px;
        color: #909399;
        span {
          color: #303133;
        }
      }
    }
  }
}
// 关闭时候
.close_exp_button {
  transition: all 0.8s;
  -webkit-animation: hideAni 0.6s 1 ease-in-out;
  animation-fill-mode: forwards;
}

@keyframes hideAni {
  0% {
    width: 100vw;
    height: 100vh;
    opacity: 1;
  }
  50% {
    width: 100px;
    height: 60px;
    opacity: 1;
    top: 80px;
    left: v-bind(downloadCenterOffsetLeftCssStage2);
    border-radius: 8px;
  }
  100% {
    width: 0px;
    height: 0px;
    top: 45px;
    left: v-bind(downloadCenterOffsetLeftCss);
    opacity: 0;
  }
}
.close_exp_button_con {
  transition: all 0.8s;
  -webkit-animation: closeMaskCon 0.8s 1 ease-in-out;
  animation-fill-mode: forwards;
}
@keyframes closeMaskCon {
  0% {
    opacity: 1;
  }
  1% {
    opacity: 0;
    height: 10%;
  }
  10% {
    height: 0px;
  }
  50% {
    opacity: 0;
  }
  100% {
    width: 0px;
    opacity: 0;
  }
}
</style>
