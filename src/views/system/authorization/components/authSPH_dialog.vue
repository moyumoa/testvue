<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="视频号授权"
      width="420px"
      custom-class="info_dialog hide_footer_line"
      :before-close="handleClose"
    >
      <!-- 机构号选择 -->
      <div class="select_warp padding16 min_height_212" v-if="authSteps == 'select'">
        <div
          class="select_show"
          :class="{ select_show_active: selectOpen, isSelect: !selectWxCurrent }"
        >
          <div class="label_warp">
            <span>{{ selectWxCurrent ? selectWxCurrent.wxMcnName : '请选择一个机构号绑定' }}</span>
            <span class="public_mark" v-if="selectWxCurrent && selectWxCurrent.brandId == 0">
              公共
            </span>
          </div>

          <!-- 箭头 -->
          <div class="indicate" :class="{ indicate_180: selectOpen }">
            <el-icon><i-arrow-down /></el-icon>
          </div>
        </div>

        <el-select
          v-model="organNum"
          placeholder="请选择一个机构号绑定"
          style="width: 100%"
          @visible-change="handleVisibleChange"
        >
          <el-option
            v-for="item in organNumList"
            :label="item.wxMcnName"
            :value="item.wxMcnId"
            :key="item.id"
          >
            <template v-if="item.brandId == 0">
              <span>{{ item.wxMcnName }}</span>
              <span class="public_mark">公共</span>
            </template>
          </el-option>
        </el-select>
      </div>
      <!-- 视频号筛选 -->
      <div
        class="search_warp padding16 min_height_212"
        v-if="authSteps == 'search'"
        v-loading="wxSearch"
      >
        <el-input v-model="searchWxVal" placeholder="请输入视频号名称" @keyup.enter="searchWxFn">
          <template #suffix>
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20240126unu75.png"
              alt=""
              class="search_icon"
              @click="searchWxFn"
            />
          </template>
        </el-input>
        <div class="wx_list_warp" v-if="wxList.length > 0">
          <div class="err_tip" v-if="wxList.length == 1 && wxList[0].errorMsg && isGetWxList">
            {{ wxList[0].errorMsg }}
          </div>
          <template v-else>
            <div
              class="wx_list_item"
              :class="{
                wx_list_item_select:
                  selectedWxInfo.encryptedUsername == item.encryptedUsername &&
                  selectedWxInfo.encryptedUsername
              }"
              v-for="(item, index) in wxList"
              :key="index"
              @click="selectWxFn(item)"
            >
              <img :src="item.headImage" alt="" class="ava" />
              <div class="info_warp">
                <div class="name">{{ item.nickname || '--' }}</div>
                <div class="info">
                  {{
                    `${item.sex == 1 ? '男' : item.sex == 2 ? '女' : '未知'} ${
                      item.province ? item.province : ''
                    } ${item.city ? item.city : ''}`
                  }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <!-- 二维码 -->
      <div class="invite_code padding16 min_height_212" v-if="authSteps == 'code'">
        <div class="code">
          <p style="margin-bottom: 16px">请使用微信扫码加入</p>

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
              <!-- <qrcode-vue v-if="codeUrl" :value="codeUrl" :size="180" level="H" :margin="6" /> -->
              <!-- 失效 -> 点击已扫码没有获取到授权动作 -->
              <div
                v-if="confirmBtnClick && !scan"
                class="mask flex_center confirm_tip_warp"
                @click="getAuthReq"
              >
                <span class="confirm_tip">未检测到授权动作请重试</span>
              </div>
              <!-- <div v-if="scan" class="mask">
                <div class="success flex_center">
                  <i class="iconfont icon-wancheng wc_icon"></i>
                  <p>扫码成功</p>
                </div>
              </div> -->
            </div>
          </div>

          <el-button
            type="primary"
            style="margin-top: 24px"
            v-if="!confirmBtnClick && !showAuthReqLoading && codeUrl"
            @click="confirmScanCode"
          >
            已扫码确认
          </el-button>
          <!-- 占位 -->
          <div v-else style="height: 56px"></div>
        </div>
      </div>
      <!-- 授权成功 -->
      <div class="success_warp padding16" v-if="authSteps == 'success'">
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/202401046u6m6.png"
          alt=""
          class="status_icon"
        />
        <div class="status_tip">授权成功</div>
      </div>
      <!-- 授权失败 -->
      <div class="fail_warp padding16" v-if="authSteps == 'fail'">
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20240104l8jjb.png"
          alt=""
          class="status_icon"
        />
        <div class="status_tip">授权失败</div>
        <div class="fail_reason" v-if="authErrReason">失败原因：{{ authErrReason }}</div>
      </div>

      <template
        #footer
        v-if="
          authSteps == 'select' ||
          (authSteps == 'search' && wxList.length > 0 && !wxList[0].errorMsg)
        "
      >
        <span class="dialog-footer">
          <el-button
            type="primary"
            :class="{
              no_select:
                (authSteps == 'select' && !organNum) ||
                (authSteps == 'search' && isEmpty(selectedWxInfo))
            }"
            @click="beforeNextFn"
          >
            {{ authSteps == 'select' ? '下一步' : '确定' }}
          </el-button>
        </span>
      </template>
      <div
        style="height: 58px"
        v-if="
          authSteps == 'search' && (wxList.length == 0 || (wxList.length > 0 && wxList[0].errorMsg))
        "
      ></div>
    </el-dialog>
  </div>
</template>
<script setup>
import {
  confirmWxOpenAuth,
  getAuthGuidStatusV1,
  listWxMcnAuths,
  searchWxOpenByNickname,
  confirmQrCodeScanned,
  getAuthRecord
} from '@/api/system_setting/authorization.js'
import { throttle, isEmpty } from '@/utils/tools.js'

const props = defineProps({
  authDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const emits = defineEmits(['updateFun'])
const dialog = ref()
const show = toRef(props.authDialog, 'show')
// 请求接口的Loading
const showAuthReqLoading = ref(false)
//  邀请码相关数据
const authErr = ref(false) // 授权是否失败
const authErrReason = ref('') // 授权失败的原因
const codeUrl = ref(null) // 二维码地址
const authToken = ref(null) // 授权token
const timer = ref(null) // 倒计时的定时器
const scan = ref(false) // 是否扫码成功
const getTimes = ref(0) // 获取次数，10秒1次获取10次
const confirmBtnClick = ref(false) // 确认扫码按钮是否显示 false显示 true隐藏
const recordTimes = ref(0) // 根据authno获取状态的次数 1秒一次获取60次
const recordTimer = ref(null) // 根据authno获取状态的定时器
const authNo = ref('')

const message = inject('$message')
const authSteps = ref('') // select选择机构号 search视频号筛选 code显示二维码 success成功 fail失败
const organNumList = ref([]) // 机构号列表
const organNum = ref(null) // 选中的机构号
const searchWxVal = ref('') // 输入的视频号信息
const wxSearch = ref(false) // 视频号搜索的loading
const isGetWxList = ref(false) // 是否调用过获取视频号列表接口
const wxList = ref([]) // 视频号列表
const selectedWxInfo = ref({}) // 选中的视频号信息
const selectOpen = ref(false)

// 根据authNo获取状态的定时器
function clearRecordTimer() {
  recordTimes.value = 0
  recordTimer.value && clearInterval(recordTimer.value)
  recordTimer.value = null
}
function getRecordFun() {
  clearTimer()
  if (recordTimer.value) return
  recordTimer.value = setInterval(() => {
    if (recordTimes.value >= 60) {
      // 60次定时器到了，就清空，不再轮询
      clearRecordTimer()
    } else {
      recordTimes.value++
      getAuthRecord({
        authNo: authNo.value
      })
        .then(res => {
          if (res.code === 0) {
            // authStatus   1待授权 2授权成功 3授权失败
            if (res.data.authStatus === 2) {
              clearRecordTimer()
              message.success('授权成功')
              authSteps.value = 'success'
              scan.value = false
              emits('updateFun', true)
            } else if (res.data.authStatus === 3) {
              clearRecordTimer()
              authErrReason.value = res.data.errorMsg || ''
              authSteps.value = 'fail'
              scan.value = false
            }
          }
        })
        .catch(() => {
          emits('updateFun')
          clearRecordTimer()
        })
    }
  }, 1000)
}
function handleVisibleChange(visible) {
  selectOpen.value = visible
}

const selectWxCurrent = computed(() => {
  const item = organNumList.value.find(x => x.wxMcnId === organNum.value)
  return item || null
})

// 点击确认扫码授权
const confirmScanCode = throttle(function () {
  clearTimer()
  confirmBtnClick.value = true
  scan.value = true
  const params = {
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : null,
    nickname: selectedWxInfo.value.nickname,
    encryptedUsername: selectedWxInfo.value.encryptedUsername,
    wxMcnId: organNum.value
  }
  confirmQrCodeScanned({ state: JSON.stringify(params) }).then(res => {
    if (res.code === 0) {
      if (res.data.status === '0') {
        scan.value = false // 未检测到授权状态只用改这个就行
      }
      if (res.data.status === '2') {
        // message.success('授权成功')
        // authSteps.value = 'success'
        // scan.value = false
        // emits('updateFun', true)
        authNo.value = res.data?.authNo || ''
        getRecordFun()
      }
      if (res.data.status === '3') {
        authErrReason.value = res.msg
        authSteps.value = 'fail'
        scan.value = false
      }
    }
  })
}, 500)

// 选中视频号
const selectWxFn = throttle(function (item) {
  selectedWxInfo.value = item
})

// 搜索视频号
const searchWxFn = throttle(function () {
  // console.log('organNum.value', organNum.value)
  if (!searchWxVal.value) return
  selectedWxInfo.value = {}
  wxSearch.value = true
  isGetWxList.value = false
  wxList.value = []
  searchWxOpenByNickname({
    nickname: searchWxVal.value,
    wxMcnId: organNum.value
  })
    .then(res => {
      if (res.code === 0) {
        if (res?.data.errorMsg) {
          wxList.value = [res.data]
        } else {
          wxList.value = res?.data?.infoVOList || [{ errorMsg: '暂无数据' }]
        }
        isGetWxList.value = true
      }
    })
    .finally(() => {
      wxSearch.value = false
    })
}, 500)

// 点击确定
const beforeNextFn = throttle(function () {
  if (authSteps.value === 'select') {
    nextFn()
  } else if (authSteps.value === 'search') {
    selectWx()
  }
}, 500)

// 机构选选择确定
function nextFn() {
  if (!organNum.value) return
  authSteps.value = 'search'
}
// 确定选择的视频号
function selectWx() {
  if (isEmpty(selectedWxInfo.value)) return
  getAuthReq()
}

// 设置定时器
const setTimer = () => {
  timer.value = setInterval(() => {
    if (getTimes.value >= 10) {
      // scan.value = false // 码不会失效，只不过不轮训状态了
      clearTimer()
    } else {
      console.log('轮询 getTimes', getTimes.value)
      getTimes.value++
      getAuthGuidStatusV1({ token: authToken.value }).then(res => {
        if (res.code === 0) {
          console.log('轮询', res)
          switch (res.data) {
            case '0': {
              console.log('初始化-相当于获取二维码成功但是还未扫码')
              break
            }
            case '1': {
              console.log('扫码成功-授权验证中')
              scan.value = true
              confirmBtnClick.value = true // 隐藏已确认按钮
              break
            }
            case '2': {
              console.log('授权成功')
              // message.success('授权成功')
              // authSteps.value = 'success'
              // scan.value = false
              clearTimer()
              // emits('updateFun', true)
              getRecordFun()
              break
            }
            case '3': {
              console.log('授权失败')
              authErrReason.value = res.msg
              authSteps.value = 'fail'
              scan.value = false
              clearTimer()
              break
            }
            // case '4': {

            //   break
            // }
          }
        }
      })
    }
  }, 10000)
}
// 清空定时器
const clearTimer = () => {
  setTimeCount()
  clearInterval(timer.value)
  timer.value = null
}
// 设置倒计时
const setTimeCount = () => {
  getTimes.value = 0
}
// 获取授权信息
const getAuthReq = throttle(() => {
  authSteps.value = 'code'
  confirmBtnClick.value = false
  showAuthReqLoading.value = true
  authErr.value = false
  authErrReason.value = ''
  clearTimer()
  clearRecordTimer()
  codeUrl.value = ''
  scan.value = false
  const params = {
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : null,
    nickname: selectedWxInfo.value.nickname,
    encryptedUsername: selectedWxInfo.value.encryptedUsername,
    wxMcnId: organNum.value
  }
  confirmWxOpenAuth({ state: JSON.stringify(params) })
    .then(res => {
      console.log('获取二维码返回')
      if (res.code === 0) {
        if (res.data?.status === '2') {
          // 正在授权已授权的视频号直接成功
          // authSteps.value = 'success'
          // message.success('授权成功')
          // emits('updateFun', true)
          authNo.value = res.data?.authNo || ''
          getRecordFun()
        } else if (res.data?.status === '3') {
          showAuthReqLoading.value = false
          authErrReason.value = res.data.errorMessage
          authSteps.value = 'fail'
        } else {
          showAuthReqLoading.value = false
          // 生成二维码开启轮询
          codeUrl.value = res.data?.tokenUrl || ''
          authToken.value = res.data?.token || ''
          authNo.value = res.data?.authNo || ''
          setTimeCount()
          setTimer()
        }
      } else {
        showAuthReqLoading.value = false
      }
    })
    .catch(() => {
      emits('updateFun')
      showAuthReqLoading.value = false
    })
}, 500)

// 获取机构号列表
function listWxMcnAuthsFn() {
  listWxMcnAuths({
    authStatus: 0,
    pageNo: 1,
    pageSize: 999,
    showDefaultMcn: true
  }).then(res => {
    if (res.code === 0) {
      organNumList.value = res.data?.records
      if (res?.data.total === 1) {
        organNum.value = organNumList.value[0]?.wxMcnId // 如果只有一个机构号就跳过选择机构号步骤
        nextFn()
      } else {
        authSteps.value = 'select'
      }
    }
  })
}

onMounted(() => {
  listWxMcnAuthsFn()
  isGetWxList.value = false
})
// 百应授权弹窗关闭时，清空定时器
function handleClose(done) {
  clearTimer()
  clearRecordTimer()
  setTimeCount()
  done()
}
</script>
<style lang="scss" scoped>
.no_select {
  opacity: 0.6;
}
.padding16 {
  padding: 20px 16px 16px;
}
.min_height_212 {
  min-height: 212px;
}
.select_warp {
  box-sizing: border-box;
  :deep(.el-input) {
    opacity: 0;
  }
  .select_show {
    width: 388px;
    height: 32px;
    position: absolute;
    top: 72px;
    left: 16px;
    box-sizing: border-box;
    border: 1px solid #dcdee0;
    padding-left: 11px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;
    overflow: hidden;
    color: #606266;
    .label_warp {
      display: flex;
      align-items: center;
    }
  }
  .select_show_active {
    border-color: #364fcd;
  }
  .isSelect {
    color: #c0c4cc;
  }
  .indicate {
    padding: 0 9px;
    transition: all 0.3s;
    color: #c0c4cc;
  }
  .indicate_180 {
    transform: rotate(-180deg);
  }
}
.search_warp {
  :deep(.el-input__suffix) {
    cursor: pointer;
    right: 0;
  }
  .search_icon {
    width: 16px;
    height: 16px;
    padding: 8px 12px 8px 3px;
  }
  .wx_list_warp {
    margin-top: 8px;
    max-height: 144px;
    overflow-y: auto;
    .wx_list_item {
      background: #f7f8fa;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border: 1px solid transparent;
      box-sizing: border-box;
      cursor: pointer;
      user-select: none;
      .ava {
        width: 40px;
        min-width: 40px;
        height: 40px;
        background: #d8d8d8;
        border-radius: 50%;
      }
      .info_warp {
        margin-left: 8px;
        .name {
          font-size: 14px;
          font-family: PingFangSC, PingFang SC;
          font-weight: 500;
          color: #303133;
          line-height: 20px;
        }
        .info {
          font-size: 12px;
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          color: #909399;
          line-height: 18px;
          margin-top: 2px;
        }
      }
    }
    .wx_list_item + .wx_list_item {
      margin-top: 8px;
    }
    .wx_list_item_select {
      border-color: #364fcd;
    }
  }
  .err_tip {
    font-size: 14px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    color: #df4545;
    line-height: 20px;
  }
}

.success_warp,
.fail_warp {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 64px;

  .status_icon {
    width: 48px;
    height: 48px;
  }
  .status_tip {
    font-size: 16px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 600;
    color: #323233;
    line-height: 20px;
    margin-top: 20px;
  }
  .fail_reason {
    margin-top: 12px;
    font-size: 14px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
  }
}
.fail_warp {
  padding-bottom: 108px;
}
.success_warp {
  padding-bottom: 140px;
}

.confirm_tip_warp {
  cursor: pointer;
  .confirm_tip {
    color: #ff0000;
    text-align: center;
    padding: 0 32px;
    line-height: 20px;
  }
}

.invite_code {
  .code {
    text-align: center;
    .code_img {
      position: relative;
      margin: 0 auto;
      width: 180px;
      height: 180px;
      overflow: hidden;
      > img {
        // width: 100%;
        width: 260px;
        height: 260px;
        margin: -40px;
        display: flex;
      }
      .mask {
        width: 100%;
        height: 100%;
        background-color: rgba($color: #000, $alpha: 0.8);
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
    // .text {
    //   color: #909399;
    //   font-size: 14px;
    //   margin: 10px 0 22px 0;
    // }
  }
}
</style>
