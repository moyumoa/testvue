<template>
  <div class="auth_one_warp">
    <template v-if="authStep == 'init'">
      <div
        class="code_loading"
        style="width: 180px; height: 180px; margin: 0 auto"
        v-loading="showAuthReqLoading"
        element-loading-background="rgba(0,0,0,0.05)"
      >
        <div
          v-if="codeUrl"
          class="code_img"
          v-loading="scan"
          element-loading-text="授权验证中"
          custom-class="loading_box"
        >
          <img v-if="codeUrl" :src="codeUrl" alt />
          <div v-if="(count === 0 || authErr) && !scan" class="mask flex_center">
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20230719zhvs7.png"
              alt
              @click="getAuthReq"
              class="fail_icon"
            />
          </div>
          <div v-if="scan" class="mask">
            <div class="success flex_center">
              <i class="iconfont icon-wancheng wc_icon"></i>
              <p>扫码成功</p>
            </div>
          </div>
        </div>
      </div>
      <!-- 倒计时和提示 -->
      <div class="text" style="margin-bottom: 0" v-if="!scan && codeUrl">
        <template v-if="count > 0">
          <span style="color: #364fcd; font-weight: 500">{{ count }}S</span>
          后失效
        </template>
        <template v-else>已失效，点击重新加载</template>
      </div>
      <div class="use_tip" @click="toUseTip">不知道用哪个抖音号？点这里</div>
    </template>
    <!-- 选择 -->
    <div class="select_warp" v-if="authStep == 'select'">
      <!-- <img src="/public/loading_2.gif" alt="" class="em_loading" /> -->
      <span class="select_text">此抖音号绑定了多个抖音来客商家</span>
      <el-select
        multiple
        filterable
        v-model="bindBusiness"
        placeholder="请选择本次需要授权的商家"
        style="width: 100%"
        clearable
        :disabled="continueAuthStatus"
        @change="businessChange"
      >
        <el-option
          v-for="(item, index) in businessList"
          :label="item.account_name"
          :value="item.account_id"
          :key="index"
        />
      </el-select>
    </div>

    <!-- 等待中 -->
    <div class="wait_warp flex" v-if="authStep == 'wait'">
      <img src="/public/loading_2.gif" alt="" class="em_loading" />
      <div class="status_tip">授权中，请耐心等待</div>
    </div>
    <!-- 授权成功、授权失败、部分授权失败 状态 -->
    <div
      class="status_warp flex"
      v-if="authStep == 'success' || authStep == 'fail' || authStep == 'partFail'"
    >
      <img :src="iconList[authStep]" alt="" class="status_icon" />
      <div class="status_tip" v-if="authStep == 'success'">授权成功</div>
      <!-- 授权失败 -->
      <div class="fail_tip_war" v-if="authStep !== 'success'">
        <template v-if="authStep == 'fail'">
          <div class="status_tip">授权失败</div>
          <div class="fail_tip" v-if="failMsgList3.length <= 0">{{ failMsg || '授权失败' }}</div>
          <template v-else>
            <div class="fail_tip" v-for="(item, index) in failMsgList3" :key="index">
              {{ `商家名称${item.accountName || '--'}：${item.authFailReason || '--'}` }}
            </div>
          </template>
        </template>

        <template v-if="authStep == 'partFail'">
          <div class="status_tip">部分授权失败</div>
          <div class="fail_tip" v-for="(item, index) in failMsgList" :key="index">
            {{ `商家名称${item.accountName || '--'}：${item.authFailReason || '--'}` }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { throttle } from '@/utils/tools.js'
import {
  getLifeAuthGuid,
  getLifeAuthStatus,
  continueLifeAuth
} from '@/api/content_center/content_guest_data.js'

const emits = defineEmits(['updateSteps', 'updateSelect', 'updateBtnLoading'])
const authStep = ref('init') // 授权进行到哪一步了 init扫码成功 select多个商家选择 wait授权等待 success授权成功 fail授权失败 partFail部分授权失败
// 请求接口的Loading
const show = ref(true)
const showAuthReqLoading = ref(false)
const scan = ref(false) // 是否扫码成功
const codeUrl = ref(null) // 二维码地址
const timer = ref(null) // 倒计时的定时器
const count = ref(300) // 倒计时-授权码过期时间
const authErr = ref(false) // 授权是否失败
// const authErrReason = ref('') // 授权失败的原因
const bindBusiness = ref([]) // 绑定的商家
const scanAuth = ref(false) // 是否扫码验证中
const authToken = ref(null)
const continueAuthStatus = ref(false) // 是否是选择完多商家继续
let businessInfo = reactive({}) // 多商家信息

const businessList = ref([]) // 绑定商家列表
const failMsg = ref('') // =3失败的原因
const failMsgList3 = ref([]) // =3失败原因可能是多个-接口对接完毕上到测试环境后端才说，不做=4兼容显示，直接独立显示了
const failMsgList = ref([]) // =4失败的原因

const iconList = {
  success: 'https://tagvv-1256030678.file.myqcloud.com/202401046u6m6.png', // 成功
  fail: 'https://tagvv-1256030678.file.myqcloud.com/20240104l8jjb.png', // 失败
  partFail: 'https://tagvv-1256030678.file.myqcloud.com/20240104l8jjb.png' // 失败
}

function businessChange() {
  if (bindBusiness.value.length === 0) {
    emits('updateSelect', false)
  } else {
    emits('updateSelect', true)
  }
}
// 设置倒计时
const setTimeCount = (val = 300) => {
  count.value = val
}
// 选择来客商家后继续授权
function continueLifeAuthFn() {
  if (bindBusiness?.value.length === 0 || !bindBusiness) return
  continueAuthStatus.value = true
  businessInfo.businessListDTOS = (businessList.value || []).filter(item =>
    bindBusiness.value.includes(item.account_id)
  )
  continueLifeAuth(businessInfo)
    .then(res => {
      if (res.code === 0) {
        setTimer(true)
      } else {
        // 授权失败
        updateAuthStep('fail')
      }
    })
    .catch(() => {
      updateAuthStep('fail')
    })
}

// 选择来客商家继续
function nextFn() {
  clearTimer()
  continueLifeAuthFn()
}
// 选择来客商家返回 - 上一步
function backFn() {
  clearTimer()
  setTimeCount(0) // 重置定时器时间
  scan.value = false
  authToken.value = null
  bindBusiness.value = []
  continueAuthStatus.value = false
  emits('updateBtnLoading', false)
  updateAuthStep('init')
}

// 设置定时器
const setTimer = (next = false) => {
  timer.value = setInterval(() => {
    if (count.value === 0) {
      // emits('update:disabled', false)
      scan.value = false
      scanAuth.value = false
      clearTimer()
    } else {
      count.value--
      if (count.value % 3 === 0) {
        getLifeAuthStatus({ token: authToken.value }).then(res => {
          // res.data - 0等待扫码 1授权中 2授权成功 3授权失败 4部分授权失败
          // 0-获取授权二维码
          // 1-授权二维码扫描成功；获取抖音来客有效商户信息（大于1个）；获取抖音来客有效商户信息（1个）；发起服务商应用授权；根据商户id搜索授权能力列表；
          // 2-批量同意服务商应用授权成功
          // 3-授权过程异常中断
          // 4-多个商家授权结果
          if (res.code === 0) {
            // res.data = '4'
            // res.msg = JSON.stringify({ 1: '1' })
            switch (res.data) {
              case '0':
                console.log('授权状态返回- 0 - 等待扫码')
                break
              case '1': {
                console.log('授权状态返回- 1 - 授权中')
                scan.value = true
                scanAuth.value = false
                const isMany = isJSONString(res?.msg)
                console.log('是否是多平台', isMany)
                if (isMany && !next) {
                  updateAuthStep('select')
                  scan.value = false
                  scanAuth.value = true
                  businessInfo = JSON.parse(res.msg)
                  console.log('返回的多商家信息', businessInfo)
                  businessList.value = businessInfo?.businessListDTOS || []
                  // 停止轮询
                  clearTimer()
                } else {
                  console.log('不是多平台，或者多平台继续授权，不需要显示选择，直接到等待')
                  updateAuthStep('wait')
                  scan.value = false
                  scanAuth.value = true
                }
                break
              }
              case '2':
                console.log('授权状态返回- 2 - 授权成功')
                updateAuthStep('success')
                clearTimer()
                break
              case '3':
                {
                  const isJson = isJSONString(res?.msg)
                  console.log('授权状态返回- 3 - 授权失败 - 是否是多失败原因-', isJson)
                  if (isJson) {
                    // 可能有多个原因
                    failMsg.value = ''
                    failMsgList3.value = JSON.parse(res.msg)
                  } else {
                    failMsg.value = res.msg || null
                    failMsgList3.value = []
                  }
                  updateAuthStep('fail')
                  clearTimer()
                }
                break
              case '4': {
                console.log('授权状态返回- 4 - 部分授权失败 ')
                const isJson = isJSONString(res?.msg)
                if (isJson) {
                  failMsgList.value = JSON.parse(res.msg)
                } else {
                  failMsgList.value = []
                }
                updateAuthStep('partFail')
                clearTimer()
                break
              }
              default:
                break
            }
          }
        })
      }
    }
  }, 1000)
}
// 清空定时器
const clearTimer = () => {
  clearInterval(timer.value)
  timer.value = null
}

// 获取二维码
function getLifeAuthGuidFn(info) {
  const brandId = localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : ''
  const state =
    info && info.type === 'reAuth'
      ? JSON.stringify({ brandId, accountId: info.accountId })
      : JSON.stringify({ brandId })
  getLifeAuthGuid({ state }).then(res => {
    if (res.code === 0) {
      showAuthReqLoading.value = false
      codeUrl.value = res.data.qrCode ? `data:image/jpg;base64,${res.data.qrCode}` : ''
      authToken.value = res?.data.token
      count.value = res?.data.expireIn || 300
      // 开启倒计时
      setTimeCount(count.value)
      if (show.value) {
        setTimer(false)
      }
    }
  })
}
// 判断是否是json字符串 - （data = 1）多商户信息放在msg中，只要判断msg是json字符串，那就一定是多商户；（data=4）是json就是部分失败要显示的信息
function isJSONString(str) {
  if (typeof str !== 'string') {
    return false
  }

  try {
    const obj = JSON.parse(str)
    return typeof obj === 'object' && obj !== null
  } catch (e) {
    return false
  }
}

// 获取授权信息
const getAuthReq = throttle(() => {
  showAuthReqLoading.value = true
  codeUrl.value = null
  authToken.value = null
  getLifeAuthGuidFn()
}, 500)
function toUseTip() {
  window.open(
    'https://sumwhy0902.feishu.cn/docx/ZAdMdtNdKocsxwxJSr3cvY6hnKg?from=from_copylink',
    '_blank'
  )
}
// 更新当前步骤
function updateAuthStep(val) {
  authStep.value = val
  nextTick(() => {
    emits('updateSteps', authStep.value)
  })
}

onMounted(() => {
  // scan.value = true
  updateAuthStep('init')
  showAuthReqLoading.value = true

  // codeUrl.value = 'https://tagvv-1256030678.file.myqcloud.com/202401046u6m6.png'

  // setTimeout(() => {
  //   scan.value = false
  //   // authErr.value = true
  // }, 2500)
})

function initFn(info) {
  getLifeAuthGuidFn(info)
}

// 弹窗关闭时，清空定时器
onBeforeUnmount(() => {
  show.value = false
  clearTimer()
  setTimeCount()
})
defineExpose({ backFn, nextFn, initFn })
</script>

<style lang="scss" scoped>
.auth_one_warp {
  .code_loading {
    background: #d8d8d8;
    border-radius: 1px;
    .code_img {
      position: relative;
      margin: 0 auto;
      width: 180px;
      height: 180px;
      > img {
        width: 100%;
      }
      .mask {
        width: 100%;
        height: 100%;
        background-color: rgba($color: #fff, $alpha: 0.9);
        position: absolute;
        left: 0;
        top: 0;
        > img {
          width: 36px;
          height: 36px;
          cursor: pointer;
        }
        > .success {
          height: 100%;
          flex-direction: column;
          color: #7fe2a1;
          > .wc_icon {
            margin-bottom: 8px;
            font-size: 36px;
          }
        }
      }
    }
  }
  .flex {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  .use_tip {
    font-size: 14px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    color: #364fcd;
    line-height: 20px;
    margin-top: 16px;
    text-align: center;
    cursor: pointer;
  }
  .text {
    text-align: center;
    margin-top: 12px;
    line-height: 20px;
  }

  .select_warp {
    display: flex;
    flex-direction: column;
    align-items: center;

    .select_text {
      width: 100%;
      display: inline-block;
      font-size: 14px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      color: #323233;
      line-height: 20px;
      margin-bottom: 12px;
    }
  }
  .wait_warp {
    margin-top: 48px;
    .status_tip {
      font-size: 14px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
      margin-top: 20px;
      text-align: center;
    }
  }
  .em_loading {
    width: 48px;
    height: 48px;
    opacity: 0.5;
  }
  .status_warp {
    margin-top: 48px;
    .status_icon {
      width: 48px;
      height: 48px;
    }
    .status_tip {
      font-size: 16px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 500;
      color: #323233;
      line-height: 20px;
      margin-top: 20px;
    }
    .fail_tip_war {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .fail_tip {
      font-size: 14px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
      margin-top: 12px;
    }
  }
}
</style>
