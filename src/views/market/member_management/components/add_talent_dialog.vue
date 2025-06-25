<template>
  <el-dialog v-model="showDialog" :width="543" @closed="closeDialog">
    <template #title>
      <div class="dialog_title">
        <div class="title">邀请达人</div>
        <div class="sub_title">
          <!-- :before-change="changeSwitch" -->
          <el-switch
            :loading="talentSwitch.loading"
            @change="changeSwitch"
            v-model="talentSwitch.value"
            inline-prompt
            :width="45"
            active-text="开"
            inactive-text="关"
          ></el-switch>
          <span class="tips" v-if="talentSwitch.value">开关开启，达人可通过链接/扫码加入</span>
          <span class="tips" v-else>开关关闭，达人暂时无法通过链接/扫码加入</span>
        </div>
      </div>
    </template>
    <div>
      <div class="scene scene1">
        <div class="scene_head">
          <img class="icon" src="@/assets/images/auth/email.png" alt />
          <div class="title">应用场景1</div>
        </div>
        <div class="tip">您可以把链接嵌入营销短信内容中，实现精准批量添加达人。</div>
        <div class="link_box">
          <div class="link">链接：{{ shortUrl }}</div>
          <el-link class="copy_btn" type="primary" v-copy="shortUrl">复制</el-link>
        </div>
      </div>
      <div class="scene scene2">
        <div class="scene_head">
          <img class="icon" src="@/assets/images/auth/wechat.png" alt />
          <div class="title">应用场景2</div>
        </div>
        <div class="tip">您可以把二维码发送到微信或其他群中，在公域流量中实现批量添加。</div>
        <div class="qrcode">
          <img class="code" :src="qrCodeURL" alt />
          <el-link class="down_btn" type="primary" @click="downLoadImg">下载</el-link>
        </div>
      </div>
      <!-- <div class="scene scene3">
        <div class="scene_head">
          <img class="icon" style="height: 20px" src="@/assets/images/auth/download.png" alt />
          <div class="title">应用场景3</div>
        </div>
        <div class="tip">您可以用微信扫码打开页面，再将该页面分享到微信群中，实现批量卡片添加。</div>
        <img class="code" :src="qrCodeURL" alt />
        <div class="tip">请使用微信扫码</div>
      </div>-->
    </div>
  </el-dialog>
</template>

<script setup>
import vCopy from '@/directive/copy'
import { downLoadFile } from '@/utils/exportFile.js'
import {
  // getOrganization,
  getOutsiderConfig,
  updateOutsiderConfig
  // getUserGroup
} from '@/api/market/operate_analysis.js'
import { useStore } from 'vuex'
const emits = defineEmits(['update:showDialog'])
const props = defineProps({
  showDialog: Boolean,
  qrCodeURL: String,
  shortUrl: String
})
const { showDialog } = toRefs(props)
const store = useStore()
function closeDialog() {
  emits('update:showDialog', false)
}
const qrCodeURL = toRef(props, 'qrCodeURL')
function downLoadImg() {
  downLoadFile(qrCodeURL.value, 'invite.jpg')
}

const message = inject('$message')
// 开关
const talentSwitch = ref({
  value: false,
  loading: false
})
function getSwitchFun() {
  getOutsiderConfig().then(res => {
    if (res.code === 0) {
      talentSwitch.value.value = res.data && res.data.outsiderState === 1

      store.commit('user/setOutsiderState', talentSwitch.value.value)
    }
  })
}
function changeSwitch() {
  talentSwitch.value.loading = true
  updateOutsiderConfig({
    outsiderState: talentSwitch.value.value ? 1 : 0
  })
    .then(res => {
      if (res.code === 0) {
        message.success('操作成功')
      }
    })
    .finally(() => {
      getSwitchFun()
      talentSwitch.value.loading = false
    })
}
onMounted(() => {
  // organizationInfo()
  getSwitchFun()
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
.scene {
  margin-bottom: 24px;
  .scene_head {
    display: flex;
    align-items: center;
    .icon {
      width: 24px;
      height: 24px;
    }
    .title {
      margin-left: 8px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      line-height: 22px;
    }
  }
  .tip {
    margin-top: 12px;
    font-size: 14px;
    color: #606266;
    line-height: 20px;
  }
}
.scene1 {
  .link_box {
    margin-top: 12px;
    display: flex;
    .link {
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
    }
    .copy_btn {
      margin-left: 24px;
    }
  }
}
.scene2 {
  .icon {
    height: 20px !important;
  }
  .qrcode {
    margin-top: 12px;
    display: flex;
    align-items: center;
    .code {
      width: 110px;
      height: 110px;
    }
    .down_btn {
      margin-left: 12px;
    }
  }
}
.scene3 {
  margin-bottom: 0;
  .code {
    margin-top: 12px;
    width: 110px;
    height: 110px;
  }
}
</style>
