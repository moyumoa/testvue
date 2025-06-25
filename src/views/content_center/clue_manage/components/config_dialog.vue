<template>
  <!-- 线索推送快捷配置的弹窗组件 -->
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :custom-class="'xm_element_dialog xm_invitaion_dialog '"
      width="560px"
      :before-close="handleClose"
    >
      <template #title>
        <div class="dialog_title">
          <div class="title">线索推送快捷配置</div>
        </div>
      </template>

      <div class="valid_box" v-loading="info.loading">
        <div class="valid_method">
          <div class="method_title">方法1</div>
          <div class="method_mark">企业号运营者访问链接，按提示输入企业号绑定的手机号及验证码</div>
          <div class="method_link">
            <div class="link_mark">链接</div>
            <div class="link_box">
              <div class="link_link">{{ info.configUrl || '' }}</div>

              <el-link type="primary" v-copy="info.configUrl" class="link_btn">复制</el-link>
            </div>
          </div>
        </div>
        <div class="valid_method">
          <div class="method_title">方法2</div>
          <div class="method_mark">
            企业号运营者用微信扫码，按提示输入企业号绑定的手机号及验证码
          </div>
          <div class="method_scan">
            <div class="scan_code" v-if="info.configUrl">
              <qrcode-vue v-if="info.configUrl" :size="120" level="H" :value="info.configUrl" />
              <!-- <el-link type="primary" class="code_btn" @click="downLoadImg">下载</el-link> -->
            </div>
            <div class="scan_mark" style="color: #303133">注意事项：</div>
            <div class="scan_tip">
              1、企业号需先开通线索版后台
              <br />
              2、企业号成长等级需达到“金牌”
              <br />
              3、此配置操作不代表授权，未授权到星麦云系统中的企业号仍无法更新线索数据
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import qrcodeVue from 'qrcode.vue'
import { getClueConfigGuideUrl } from '@/api/content_center/clue_manage.js'
// import { throttle } from '@/utils/tools.js'
import vCopy from '@/directive/copy'
const props = defineProps({
  configDialog: {
    type: Object,
    default: () => {
      return {
        id: null,
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.configDialog, 'show')
const info = reactive({
  loading: false,
  isValid: true,
  validTime: '',
  configUrl: '',
  invitaionCode: ''
})
function init() {
  getInvitationInfo()
}
init()
function getInvitationInfo() {
  info.loading = true
  getClueConfigGuideUrl({})
    .then(res => {
      if (res.code === 0) {
        if (res.data) {
          info.isValid = true
          info.configUrl = res.data
        } else {
          info.isValid = false
        }
        info.loading = false
      }
    })
    .catch(() => {
      dialog.value.handleClose()
      info.loading = false
    })
}

function handleClose(done) {
  done()
}
// // 下载二维码
// const downLoadImg = throttle(() => {
//   console.log('xz')
//   const canvas = document.getElementById('app').getElementsByTagName('canvas')
//   const a = document.createElement('a')
//   a.href = canvas[0].toDataURL('img/png')
//   a.download = '线索推送快捷配置'
//   a.click()
//   a.remove()
// }, 700)
</script>
<style lang="scss" scoped>
@import '@/views/content_center/components/css/qrcode.scss';

.dialog_title {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.scan_tip {
  width: 100%;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
  line-height: 18px;
  padding-bottom: 12px;
}
.link_link::-webkit-scrollbar {
  display: none;
}
</style>
