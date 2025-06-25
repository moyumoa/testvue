<template>
  <div class="message_not" :style="isHideTopMenu ? 'min-height:calc(100vh - 65px)' : ''">
    <div class="container">
      <div class="module-title">
        客户分配消息通知开关
        <el-switch
          class="switch"
          v-model="switchValue"
          :before-change="beforeChange"
          @change="setSetting"
        />
      </div>
      <div class="subtitle">开启后，客户被分配后，将会给员工发送一条消息通知</div>
    </div>
    <div class="container">
      <div class="module-title">留资客户未跟进回收设置</div>
      <div class="func_wrapper">
        <div class="func_wrapper_item">
          未跟进
          <el-input-number
            :min="2"
            :max="72"
            v-model="inputValue.recoveryStep"
            class="input-number"
            controls-position="right"
            @change="saveRecoveryStep"
          ></el-input-number>
          个小时后回收
        </div>
        <div class="func_wrapper_item">
          回收前
          <el-input-number
            :min="1"
            :max="noticeStepMax"
            v-model="inputValue.noticeStep"
            class="input-number"
            controls-position="right"
            @change="saveNoticeStep"
          ></el-input-number>
          个小时发送通知提醒
        </div>
      </div>
      <!-- <div class="bottom-btn">
        <el-button @click="cancel" :disabled="btnDisabled">取消</el-button>
        <el-button type="primary" :loading="loading" :disabled="btnDisabled" @click="submit">
          保存
        </el-button>
      </div> -->
    </div>
    <div class="container">
      <div class="module-title">
        潜客未跟进回收设置
        <el-switch
          class="switch"
          v-model="potentialNotFollowUp.switchValue"
          :loading="potentialNotFollowUp.switchLoading"
          :before-change="potentialBeforeChange"
          @change="potentialSwitchChange"
        />
      </div>
      <div class="func_wrapper">
        <div class="func_wrapper_item">
          未跟进
          <el-input-number
            :disabled="potentialNotFollowUp.switchValue"
            :min="1"
            :max="72"
            v-model="potentialNotFollowUp.recoveryStep"
            class="input-number"
            controls-position="right"
            @change="savePotentialRecoveryStep"
          ></el-input-number>
          个小时后回收
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  // followingUpSetting,
  getCustomerSetting,
  setClueDispatch
  // setFollowingUpSetting
} from '@/api/scrm/customer.js'
import { debounce } from '@/utils/tools'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useStore } from 'vuex'
const store = useStore()
const isHideTopMenu = store.getters.isHideTopMenu
// 客户分配消息通知开关  begin --
const switchValue = ref(false)

const getSetting = () => {
  getCustomerSetting({ type: 4 }).then(res => {
    if (res.code === 0) {
      switchValue.value = res?.data === 1
    }
  })
}
getSetting()
const beforeChange = () => {
  return ElMessageBox.confirm(`确定${switchValue.value ? '关闭' : '开启'}？`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
}

const setSetting = () => {
  const data = {
    val: switchValue.value ? 1 : 0,
    type: 4
  }
  setClueDispatch(data).then(res => {
    if (res.code === 0) {
      getSetting()
    }
  })
}
// 客户分配消息通知开关  end --
// 留资客户未跟进回收设置 begin --
// const loading = ref(false)
// 回收
const initialValue = reactive({
  recoveryStep: 72,
  noticeStep: 24
})
const inputValue = reactive({
  recoveryStep: 72,
  noticeStep: 24
})
const noticeStepMax = computed(() => {
  const max = inputValue.recoveryStep - 1
  if (max < inputValue.noticeStep) {
    inputValue.noticeStep = max
  }
  return max
})
// type=41 是留资客户未跟进设置-未跟进 type=42留资客户未跟进设置-回收前
// const getFollowingUpSetting = () => {
//   Promise.all([
//     getCustomerSetting({
//       type: 41
//     }),
//     getCustomerSetting({
//       type: 42
//     })
//   ]).then(resList => {
//     const [res1, res2] = resList
//     if (res1.code === 0 && res2.code === 0) {
//       initialValue.recoveryStep = res1.data || 72
//       initialValue.noticeStep = res2.data || 24
//       inputValue.recoveryStep = initialValue.recoveryStep
//       inputValue.noticeStep = initialValue.noticeStep
//     }
//   })
// }
// getFollowingUpSetting()
// // 没有更新禁用下方按钮
// const btnDisabled = computed(() => {
//   const { recoveryStep: recoveryStepOld, noticeStep: noticeStepOld } = initialValue
//   const { recoveryStep: recoveryStepNew, noticeStep: noticeStepNew } = inputValue
//   return recoveryStepOld === recoveryStepNew && noticeStepOld === noticeStepNew
// })
// const submit = () => {
//   return ElMessageBox.confirm(
//     `修改后，未跟进的留资客户将在${inputValue.recoveryStep}小时后回收，并在回收前${inputValue.noticeStep}个小时发送通知提醒`,
//     '更改设置确认',
//     {
//       confirmButtonText: '确定',
//       cancelButtonText: '取消'
//     }
//   ).then(res => {
//     Promise.all([
//       setClueDispatch({
//         val: inputValue.recoveryStep,
//         type: 41
//       }),
//       setClueDispatch({
//         val: inputValue.noticeStep,
//         type: 42
//       })
//     ]).then(resList => {
//       const [res1, res2] = resList
//       if (res1.code === 0 && res2.code === 0) {
//         ElMessage.success('操作成功')
//         getFollowingUpSetting()
//       }
//     })
//   })
// }
// const cancel = () => {
//   ElMessageBox.confirm(`编辑未保存，确定退出吗？`, '温馨提示', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消'
//   }).then(res => {
//     inputValue.recoveryStep = initialValue.recoveryStep
//     inputValue.noticeStep = initialValue.noticeStep
//   })
// }

const saveRecoveryStep = debounce(() => {
  setClueDispatch({
    val: inputValue.recoveryStep,
    type: 41
  }).then(res => {
    if (res.code === 0) {
      ElMessage.success('修改成功')
      getRecoveryStep()
    }
  })
}, 700)
const saveNoticeStep = debounce(() => {
  setClueDispatch({
    val: inputValue.noticeStep,
    type: 42
  }).then(res => {
    if (res.code === 0) {
      ElMessage.success('修改成功')
      getNoticeStep()
    }
  })
}, 700)
// 留资客户未跟进设置
function getRecoveryStep() {
  getCustomerSetting({
    type: 41
  }).then(res => {
    if (res.code === 0) {
      initialValue.recoveryStep = res.data || 72
      inputValue.recoveryStep = initialValue.recoveryStep
    }
  })
}
// 留资客户未跟进设置
function getNoticeStep() {
  getCustomerSetting({
    type: 42
  }).then(res => {
    if (res.code === 0) {
      initialValue.noticeStep = res.data || 24
      inputValue.noticeStep = initialValue.noticeStep
    }
  })
}
getRecoveryStep()
getNoticeStep()
// 客户分配消息通知开关  end --

// 潜客未跟进回收设置  begin --
const potentialNotFollowUp = reactive({
  switchValue: false,
  switchLoading: false,
  recoveryStep: 72
})

const potentialBeforeChange = () => {
  return ElMessageBox.confirm(`确定${potentialNotFollowUp.switchValue ? '关闭' : '开启'}？`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
}
const potentialSwitchChange = () => {
  const data = {
    val: potentialNotFollowUp.switchValue ? 1 : 0,
    type: 431
  }
  setClueDispatch(data).then(res => {
    if (res.code === 0) {
      getPotentialSwitchInfo()
    }
  })
}
function getPotentialSwitchInfo() {
  getCustomerSetting({ type: 431 }).then(res => {
    if (res.code === 0) {
      potentialNotFollowUp.switchValue = res?.data === 1
    }
  })
}
function getPotentialStepInfo() {
  getCustomerSetting({ type: 43 }).then(res => {
    if (res.code === 0) {
      potentialNotFollowUp.recoveryStep = res.data || 72
    }
  })
}
getPotentialSwitchInfo()
getPotentialStepInfo()
const savePotentialRecoveryStep = debounce(() => {
  setClueDispatch({
    val: potentialNotFollowUp.recoveryStep,
    type: 43
  }).then(res => {
    if (res.code === 0) {
      ElMessage.success('修改成功')
      getPotentialStepInfo()
    }
  })
}, 700)
// 潜客未跟进回收设置  end --
</script>

<style lang="scss" scoped>
.message_not {
  min-height: calc(100vh - 180px);
  border-radius: 2px;
  //margin-top: 16px;

  .container {
    padding: 20px 24px;
    font-size: 14px;
    line-height: 30px;
    color: #606266;
    margin-bottom: 16px;
    background: #ffffff;
    border-radius: 4px;

    .module-title {
      //margin-top: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;

      .switch {
        margin-left: 12px;
      }
    }

    .func_wrapper {
      .func_wrapper_item {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
        margin-top: 20px;

        .input-number {
          width: 100px;
        }
      }
    }

    .bottom-btn {
      height: 56px;
      box-sizing: border-box;
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: #ffffff;
      box-shadow: 0px 0px 7px 0px rgba(224, 224, 224, 0.5);
      border-radius: 0px 0px 4px 4px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }

  .last-one {
    min-height: calc(100vh - 300px);
  }
}
</style>
