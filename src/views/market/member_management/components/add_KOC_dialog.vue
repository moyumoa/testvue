<template>
  <div>
    <el-dialog
      v-model="showDialog"
      width="560px"
      @closed="closeDialog"
      :custom-class="'xm_element_dialog xm_invitaion_dialog'"
    >
      <template #title>
        <div class="dialog_title">
          <div class="title">KOC小程序</div>
        </div>
      </template>
      <div class="valid_box" v-loading="loading">
        <!-- 授权有效的KOC小程序 -->
        <template v-if="KOCInfo.hasKOC && KOCInfo.isValid">
          <div class="valid_method">
            <div class="method_title">方式1</div>
            <div class="method_mark">您可以把链接嵌入营销内容中，通过链接访问小程序</div>
            <div class="method_link">
              <div class="link_mark">链接</div>
              <div class="link_box">
                <div class="link_link">{{ shortUrl || '' }}</div>

                <el-link type="primary" v-copy="shortUrl" class="link_btn">复制</el-link>
              </div>
            </div>
          </div>
          <div class="valid_method">
            <div class="method_title">方式2</div>
            <div class="method_mark">您可以把二维码发送到微信群中，通过微信扫码访问小程序</div>
            <div class="method_scan">
              <div class="scan_code" v-if="qrCodeURL">
                <img class="code_icon" :src="qrCodeURL" alt="" />
              </div>
              <el-link v-if="qrCodeURL" type="primary" class="code_btn" @click="downLoadImg">
                下载
              </el-link>
            </div>
          </div>
        </template>
        <!-- 没有专属小程序 -->
        <div class="no_pro" v-else>
          <div class="no_text">当前品牌暂未开通KOC小程序，请联系顾问协助定制品牌专属KOC小程序</div>

          <el-button class="no_btn" type="primary" @click.stop="closeDialog">我知道了</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import vCopy from '@/directive/copy'
import { downLoadFile } from '@/utils/exportFile.js'
import { getInvitationInfo } from '@/api/market/operate_analysis.js'
import { useStore } from 'vuex'
const store = useStore()
const emits = defineEmits(['update:showDialog'])
const props = defineProps({
  showDialog: Boolean
})
const { showDialog } = toRefs(props)

function closeDialog() {
  emits('update:showDialog', false)
}

function downLoadImg() {
  downLoadFile(qrCodeURL.value, 'KOC小程序邀请二维码.jpg')
}
const loading = ref(true)
const KOCInfo = computed(() => store.state.app.KOCInfo)

const shortUrl = ref()
const qrCodeURL = ref()
function getInviteInfo() {
  loading.value = true
  getInvitationInfo()
    .then(res => {
      if (res.code === 0) {
        qrCodeURL.value = res.data.qrCodeURL
        shortUrl.value = res.data.shortUrl
      }
    })
    .finally(() => {
      loading.value = false
    })
}
onMounted(() => {
  if (KOCInfo.value.hasKOC && KOCInfo.value.isValid) {
    getInviteInfo()
  } else {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.dialog_title {
  display: flex;
  align-items: center;
  .title {
    color: #303133;
    font-size: 16px;
    font-weight: bold;
    line-height: 22px;
  }
  .sub_title {
    margin-left: 20px;
    display: flex;
    align-items: center;
    .tips {
      margin-left: 12px;
    }
  }
}
:deep .el-dialog .el-dialog__footer {
  display: none;
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
.code_icon {
  width: 120px;
  height: 120px;
  object-fit: contain;
}
.no_pro {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  .no_text {
    width: 100%;

    font-weight: 400;
    font-size: 14px;
    color: #323233;
    line-height: 24px;
  }
  .no_btn {
    margin-top: 30px;
  }
}
</style>
