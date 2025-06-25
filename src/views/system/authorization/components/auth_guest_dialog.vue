<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="抖音来客授权"
      width="420px"
      custom-class="rule_setting_dialog show_header_line hide_footer_line"
      :before-close="handleClose"
    >
      <div class="dialog_content" v-loading="$data.loading">
        <!-- 正常授权界面 -->
        <template v-if="showStatus == 1">
          <!-- tab -->
          <div class="tab_box" v-if="authStep == 'init'">
            <div
              @click="changeTab(item.value)"
              :class="{ one_tab: true, choose_tab: $data.chooseTab === item.value }"
              v-for="(item, index) in $data.tabList"
              :key="index"
              :style="disabled ? 'cursor: no-drop;' : ''"
            >
              {{ item.label || '' }}
            </div>
          </div>
          <!-- 单个授权 -->
          <template v-if="$data.chooseTab === 1">
            <div class="tab_tip" v-if="authStep == 'init'">请使用抖音APP扫码完成商家授权</div>
            <authGuestQrCode
              ref="authGuestQrCodeRef"
              @updateSelect="updateSelect"
              @updateSteps="updateSteps"
              @updateBtnLoading="updateBtnLoading"
            />
          </template>

          <!-- 批量授权 -->
          <template v-else>
            <authGuestBatch />
          </template>
        </template>
        <!-- 授权成功 -->
        <div class="authSuccess_box" v-if="showStatus == 2">
          <img src="https://tagvv-1256030678.file.myqcloud.com/202308285x4mf.png" alt="" />

          <div class="title">恭喜你！授权成功</div>
        </div>
      </div>
      <template #footer v-if="authStep == 'select'">
        <span class="dialog-footer">
          <el-button @click="backFn" :disabled="nextLoading">返回上一步</el-button>
          <el-button
            type="primary"
            :class="{ no_select: !businessSelect }"
            :loading="nextLoading"
            @click="nextFn"
          >
            选好了，下一步
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools'

import authGuestQrCode from './auth_guest_components/auth_guest_qrCode.vue'
import authGuestBatch from './auth_guest_components/auth_guest_batch.vue'

const props = defineProps({
  authDialog: {
    type: Object,
    default: () => {
      return {
        info: {},
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const disabled = ref(false) // 是否授权中
const info = ref({})
const dialog = ref()
const show = toRef(props.authDialog, 'show')
const useRefresh = ref(null) // 是否需要刷新页面
const showStatus = ref(null) // 1 正常授权界面[手机号验证码和二维码] 2 授权成功 3没有UID
const businessSelect = ref(false) // 是否选择了抖音号绑定的来客商家
const authStep = ref('init') // 授权进行到哪一步了
const authGuestQrCodeRef = ref(null)
const nextLoading = ref(false)

function updateSelect(val) {
  businessSelect.value = val
}
function updateSteps(val) {
  authStep.value = val
  if (val === 'success') {
    useRefresh.value = true
  } else {
    useRefresh.value = false
  }
}
function updateBtnLoading(val) {
  nextLoading.value = val
}

const nextFn = throttle(function () {
  if (!businessSelect.value) return
  nextLoading.value = true
  authGuestQrCodeRef.value && authGuestQrCodeRef.value.nextFn()
}, 500)

const backFn = throttle(function () {
  nextTick(() => {
    authGuestQrCodeRef.value && authGuestQrCodeRef.value.backFn()
  })
}, 500)
// 授权弹窗关闭时，清空定时器
function handleClose(done) {
  emits('close')
  if (useRefresh.value) {
    emits('updateFun')
  }
  done()
}
const $data = reactive({
  loading: true,
  tabList: [
    {
      label: '单个授权',
      value: 1
    },
    {
      label: '批量邀请',
      value: 2
    }
  ],
  chooseTab: 1
})
// 选择类型
const changeTab = throttle(e => {
  // 如果授权中，就禁止切换
  if (disabled.value) {
    return
  }
  $data.chooseTab = e
  if ($data.chooseTab === 1) {
    console.log('单个授权')
    nextTick(() => {
      $data.loading = false
      authGuestQrCodeRef.value && authGuestQrCodeRef.value.initFn()
    })
  }
})

const emits = defineEmits(['updateFun', 'close'])

onMounted(() => {
  if (props.authDialog.info) {
    info.value = JSON.parse(JSON.stringify(props.authDialog.info))
    if (info.value.originUid) {
      showStatus.value = 1
    } else {
      showStatus.value = 3
    }

    showStatus.value = 1
  }
  nextTick(() => {
    $data.loading = false
    authGuestQrCodeRef.value && authGuestQrCodeRef.value.initFn(info.value)
  })
})
</script>
<style lang="scss" scoped>
.dialog_content {
  width: 100%;
  padding: 16px;
  min-height: 260px;
}
.tab_box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .one_tab {
    width: 120px;
    height: 32px;
    background: #eaebed;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
  }
  .one_tab:first-child {
    border-radius: 4px 0px 0px 4px;
  }
  .one_tab:last-child {
    border-radius: 0px 4px 4px 0px;
  }
  .choose_tab {
    background: #393c45;
    font-size: 14px;
    font-weight: 400;
    color: #ffffff;
  }
}
.tab_tip {
  font-size: 14px;
  font-weight: 400;
  color: #303133;
  line-height: 20px;
  width: 100%;
  text-align: center;
  margin: 20px 0 16px;
}
.authSuccess_box {
  width: 100%;
  height: 289px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }

  .title {
    width: 100%;
    text-align: center;
    margin-top: 16px;
    margin-bottom: 80px;
    font-size: 16px;
    font-weight: 400;
    color: #1f2329;
    line-height: 24px;
  }
}
.no_select {
  opacity: 0.6;
}
</style>
