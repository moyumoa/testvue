<template>
  <!-- 邀请成员加入的弹窗组件 -->
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :custom-class="
        tipDialog.show
          ? 'xm_element_dialog xm_invitaion_dialog xm_dialog_hidden '
          : 'xm_element_dialog xm_invitaion_dialog '
      "
      width="560px"
      :before-close="handleClose"
    >
      <template #title>
        <div class="dialog_title">
          <div class="title">邀请成员加入</div>
          <div class="part_box mode_part" @click="switchMode">
            <div class="part_name mode_name">
              {{ platformMode === 'wx' ? '微信小程序' : '星麦云APP' }}
            </div>
            <img
              class="part_icon mode_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20240903ikn6w.png"
              alt=""
            />
          </div>
          <div class="part_box">
            <img
              class="part_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20230210hcgnl.png"
              alt=""
            />
            <div class="part_name">{{ props.invitationDialog.name || '--' }}</div>
          </div>
        </div>
      </template>
      <!-- 启用 -->

      <div class="valid_box" v-if="info.isValid" v-loading="info.loading">
        <div class="valid_time_box">
          <div class="time_time">
            目前的邀请有效期至
            <span>{{ info.validTime || '' }}</span>
          </div>
          <div class="time_btn" @click="showTipFun('refresh')">
            <img
              class="time_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20230213zc2mm.png"
              alt=""
            />
            <el-link type="primary">点击刷新</el-link>
          </div>
          <div class="time_btn" @click="showTipFun('valid')">
            <img
              class="time_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20230213ab1vf.png"
              alt=""
            />
            <el-link type="primary">停用邀请</el-link>
          </div>
        </div>
        <div class="valid_method">
          <div class="method_title">方法1</div>
          <div class="method_mark">成员通过微信访问链接即可申请加入品牌</div>
          <div class="method_link">
            <div class="link_mark">链接</div>
            <div class="link_box">
              <div class="link_link">{{ info.invitaionUrl || '' }}</div>

              <el-link type="primary" v-copy="info.invitaionUrl" class="link_btn">复制</el-link>
            </div>
          </div>
        </div>
        <div class="valid_method">
          <div class="method_title">方法2</div>
          <div class="method_mark">成员通过微信扫码即可申请加入品牌</div>
          <div class="method_scan">
            <div class="scan_code" v-if="info.invitaionCode">
              <img class="code_icon" :src="info.invitaionCode" alt="" />
              <el-link type="primary" class="code_btn" @click="downLoadImg">下载</el-link>
            </div>
            <div class="scan_mark">提示：邀请不同部门成员加入的链接是不同的，注意不要发错哦！</div>
          </div>
        </div>
      </div>

      <!-- 停用 -->

      <div class="notValid_box" v-else v-loading="info.loading">
        <img
          class="notValid_icon"
          src="https://tagvv-1256030678.file.myqcloud.com/20230213rrm2s.png"
          alt=""
        />
        <div class="notValid_mark">当前部门的邀请功能已停用</div>
        <el-button @click="stopCode">重新启用</el-button>
      </div>
    </el-dialog>
    <!-- 提示 -->
    <el-dialog
      :close-on-click-modal="false"
      destroy-on-close
      title="提示"
      width="420px"
      @close="tipDialog.show = false"
      v-model="tipDialog.show"
      custom-class="xm_element_dialog delPart_dialog"
    >
      <!-- 刷新的提示 -->
      <div class="delpart_content" v-if="tipDialog.type == 'refresh'">
        刷新后，之前的链接/二维码都将失效，是否确定刷新？
      </div>
      <!-- 停用的提示 -->
      <div class="delpart_content" v-if="tipDialog.type == 'valid'">
        停用后，当前部门的邀请链接将会自动失效，后续他人无法再通过该链接加入。是否确定停用？
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeTipDialog">取消</el-button>
          <el-button type="primary" :loading="tipDialog.saveLoading" @click="handleSaveConfirm">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { generateInvitation, disableDepartmentInvitation } from '@/api/system_setting/framework.js'
import { throttle } from '@/utils/tools.js'
import vCopy from '@/directive/copy'
import { downLoadFile } from '@/utils/exportFile.js'
import {ElMessage} from "element-plus";
const props = defineProps({
  invitationDialog: {
    type: Object,
    default: () => {
      return {
        id: null,
        show: true // 是否显示弹窗
      }
    },
    required: true
  },
  mode: {
    type: String,
    default: 'wx' // wx 微信模式 app 星麦云app
  }
}) // 提示的弹窗
const tipDialog = reactive({
  type: '',
  show: false,
  saveLoading: false
})
const dialog = ref()
const show = toRef(props.invitationDialog, 'show')
const info = reactive({
  loading: false,
  isValid: true,
  validTime: '',
  invitaionUrl: '',
  invitaionCode: ''
})
const emits = defineEmits(['getStaffList', 'update:mode'])
const platformMode = computed({
  get() {
    return props.mode
  },
  set(value) {
    emits('update:mode', value)
  }
})
function init() {
  getInvitationInfo(false)
}
init()
const $message = inject('$message')
// 获取小程序的邀请信息
function getInvitationInfo(refresh) {
  info.loading = true
  tipDialog.show = false
  generateInvitation({
    departmentId: props.invitationDialog.id,
    refresh: refresh,
    isApp: platformMode.value === 'app' ? true : undefined
  })
    .then(res => {
      if (res.code === 0) {
        if (res.data && res.data.isEnableInvitation) {
          info.isValid = true
          info.validTime = res.data.expiredTime
          info.invitaionCode = res.data.qrCode
          info.invitaionUrl = res.data.shortURL
        } else {
          info.isValid = false
        }
        info.loading = false
      }
      tipDialog.saveLoading = false
    })
    .catch(() => {
      dialog.value.handleClose()
      info.loading = false
      tipDialog.saveLoading = false
    })
}
const switchMode = () => {
  if(info.loading) return
  platformMode.value = platformMode.value === 'wx' ? 'app' : 'wx'
  ElMessage.success('终端切换成功')
  nextTick(() => {
    getInvitationInfo(false)
  })
}
function handleClose(done) {
  console.log('弹窗关闭')
  emits('getStaffList')
  done()
}
// 下载二维码
const downLoadImg = throttle(() => {
  downLoadFile(info.invitaionCode, `邀请成员加入${props.invitationDialog.name || ''}成员.jpg`)
}, 700)

// 提示的弹窗

const showTipFun = throttle(type => {
  tipDialog.type = type
  tipDialog.show = true
}, 700)
const handleSaveConfirm = throttle(() => {
  tipDialog.saveLoading = true
  if (tipDialog.type === 'refresh') {
    getInvitationInfo(true)
  } else {
    stopCode()
  }
}, 700)
function stopCode() {
  disableDepartmentInvitation({
    departmentId: props.invitationDialog.id,
    refresh: true,
    isApp: platformMode.value === 'app' ? true : undefined
  })
    .then(res => {
      if (res.code === 0) {
        $message.success('操作成功')
        getInvitationInfo(true)
      } else {
        tipDialog.show = false
      }
      tipDialog.saveLoading = false
    })
    .catch(() => {
      tipDialog.saveLoading = false
      tipDialog.show = false
    })
}
const closeTipDialog = throttle(() => {
  tipDialog.show = false
}, 700)
</script>
<style lang="scss" scoped>
.dialog_title {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .title {
    flex-shrink: 0;
  }
  .part_box {
    margin-left: 8px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 0 8px 0 4px;
    height: 28px;
    border-radius: 16px;
    background: #eff3fd;
    font-size: 14px;
    font-weight: 400;
    color: #323233;
    line-height: 20px;
    .part_icon {
      width: 20px;
      height: 20px;
      object-fit: cover;
      margin-right: 6px;
    }
    .part_name {
      max-width: 250px;
      @include mult_line(1);
    }
  }
  .mode_part {
    padding: 0 8px;
    cursor: pointer;
    .mode_icon {
      margin-right: 0;
      margin-left: 6px;
    }
    .mode_name {
      color: #364fcd;
    }
  }
}
.delpart_content {
  font-size: 14px;
  padding-bottom: 17px;
  font-weight: 400;
  color: #323233;
  line-height: 20px;
}
</style>
