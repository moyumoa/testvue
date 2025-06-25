<template>
  <!-- 邀请成员加入的弹窗组件 -->
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :custom-class="'xm_element_dialog xm_invitaion_dialog'"
      width="560px"
      :before-close="handleClose"
    >
      <template #title>
        <div class="dialog_title">
          <div class="title">批量授权</div>
          <div class="part_box" v-if="brandName">
            <img
              class="part_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20230210hcgnl.png"
              alt=""
            />
            <div class="part_name">{{ brandName || '--' }}</div>
          </div>
        </div>
      </template>

      <div class="valid_box" v-loading="info.loading">
        <div class="valid_switch">
          授权过程绑定运营者身份
          <el-tooltip class="item" effect="dark" content="" placement="top">
            <template #content>
              <div style="max-width: 300px">
                开启后，授权页面需要先登录才能进行授权，
                <br />
                未开启情况下无法绑定授权矩阵号对应的运营者身份
              </div>
            </template>
            <div class="xm_tooltipOfRight valid_tip"></div>
          </el-tooltip>
          <el-switch
            class="public_switch"
            v-model="info.needLogin"
            @change="getInvitationInfo('switch')"
            :width="45"
            active-text="开"
            inactive-text="关"
            inline-prompt
          ></el-switch>
        </div>
        <div class="valid_method">
          <div class="method_title">方式1</div>
          <div class="method_mark">您可以把链接嵌入营销短信内容中，通过批量分发进行授权</div>
          <div class="method_link">
            <div class="link_mark">链接</div>
            <div class="link_box">
              <div class="link_link">{{ info.invitaionUrl || '' }}</div>

              <el-link type="primary" v-copy="info.invitaionUrl" class="link_btn">复制</el-link>
            </div>
          </div>
        </div>
        <div class="valid_method">
          <div class="method_title">方式2</div>
          <div class="method_mark">您可以把二维码发送到微信群中，通过批量分发进行授权</div>
          <div class="method_scan">
            <div class="scan_code" v-if="info.qrCodeURL">
              <img class="code_icon" :src="info.qrCodeURL" alt="" />
            </div>
            <el-link v-if="info.invitaionUrl" type="primary" class="code_btn" @click="downLoadImg">
              下载
            </el-link>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { downLoadFile } from '@/utils/exportFile.js'
import { getBatchAuthUrlV2 } from '@/api/sumvideo/matrix_manage.js'
import { throttle } from '@/utils/tools.js'
import vCopy from '@/directive/copy'
const props = defineProps({
  batchAuthDialog: {
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
const { brandName } = JSON.parse(localStorage.getItem('brandInfo'))

const dialog = ref()
const show = toRef(props.batchAuthDialog, 'show')
const info = reactive({
  loading: false,
  invitaionUrl: '', // 批量授权h5链接
  qrCodeURL: '', // 批量授权小程序码
  needLogin: false // 授权过程是否开启登录
})
function getInvitationInfo(origin) {
  info.loading = true
  let params = {}
  if (origin === 'switch') {
    params = {
      needLogin: info.needLogin
    }
  }
  getBatchAuthUrlV2(params)
    .then(res => {
      if (res.code === 0) {
        info.qrCodeURL = res.data?.qrCodeURL || ''
        info.invitaionUrl = res.data?.shortUrl || ''
        info.loading = false
      }
    })
    .catch(() => {
      dialog.value.handleClose()
      info.loading = false
    })
}

getInvitationInfo()

const emits = defineEmits(['getStaffList'])

function handleClose(done) {
  emits('getStaffList')
  done()
}
// 下载二维码
const downLoadImg = throttle(() => {
  downLoadFile(info.qrCodeURL, `${brandName || ''}批量授权.jpg`)
}, 700)
</script>
<style lang="scss" scoped>
.dialog_title {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
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
}
.method_scan {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  .code_btn {
    margin-left: 12px;
    padding-bottom: 6px;
  }
}
.link_link::-webkit-scrollbar {
  display: none;
}
.valid_switch,
.valid_tip {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: #323233;
}
.valid_switch {
  margin-bottom: 20px;
}
.valid_tip {
  margin-right: 8px;
}
.code_icon {
  width: 120px;
  height: 120px;
  object-fit: contain;
}
</style>
