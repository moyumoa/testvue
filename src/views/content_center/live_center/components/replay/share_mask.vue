<template>
  <div class="mask_con" @mouseenter="shareEnter">
    <div class="shar_top">
      <span>分享录屏</span>
    </div>

    <figure
      class="share_ma"
      v-if="data.value.architectureMode === 2 || data.value.architectureMode === 3"
    >
      <img
        class="weChatImg"
        :src="data.value.microAppUrl"
        v-if="data.value.architectureMode === 3"
      />
      <qrcode-vue
        :value="codeUrl"
        :size="size"
        :margin="2"
        level="H"
        v-if="data.value.architectureMode === 2"
      />
      <figcaption>
        请使用
        <span v-if="data.value.architectureMode === 2">飞书</span>
        <span v-if="data.value.architectureMode === 3">企微</span>
        扫码并分享
      </figcaption>
    </figure>
    <div class="shar_top share_conlint">
      <span>分享录屏链接</span>
    </div>

    <div class="copy_link" v-if="data.value.pcUrl">
      <span class="share_href">{{ data.value.pcUrl }}</span>
      <span class="copy" @click.prevent="copy(data.value.pcUrl)">复制</span>
    </div>
    <div class="copy_link" v-else>暂无分享链接</div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
// 生产二维码
import QrcodeVue from 'qrcode.vue'
export default defineComponent({
  components: {
    QrcodeVue
  },
  props: {
    data: {
      type: Object
    }
  },
  setup(props, context) {
    const propData = toRef(props, 'data')
    const codeUrl = propData.value.value.microAppUrl
    const message = inject('$message')
    function copy(val) {
      const input = document.createElement('input')
      input.value = val
      document.body.appendChild(input)
      input.select()
      document.execCommand('Copy')
      document.body.removeChild(input)
      message({
        type: 'success',
        message: '复制成功！'
      })
    }
    const size = ref(126)
    const count = ref(true)
    function maskShare() {
      count.value = false
      context.emit('hideMask', false)
    }
    function shareEnter() {
      context.emit('enterS', count.value)
    }
    return { copy, codeUrl, size, maskShare, shareEnter }
  }
})
</script>
<style lang="scss" scoped>
.weChatImg {
  width: 126px;
  height: 126px;
}
.mask_con {
  position: fixed;
  top: 264px;
  left: 512px;
  z-index: 996;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0px 2px 8px 0px rgba(200, 201, 204, 0.5);
  width: 268px;
  min-width: 268px;
  height: 305px;
  padding: 14px 16px;

  .shar_top {
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #303133;
  }

  .share_ma {
    text-align: center;
    border-bottom: 1px solid #e8e8e8;
    padding-top: 12px;

    figcaption {
      margin-top: 8px;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      margin-top: 16px;
      margin-bottom: 12px;
    }
  }

  .share_conlint {
    padding-top: 14px;
    font-weight: 500;
    color: #303133;
  }

  .copy_link {
    display: flex;
    align-items: center;
    margin-top: 10px;
    span {
      display: inline-block;
    }
    .share_href {
      width: 168px;
      height: 24px;
      line-height: 24px;
      border-radius: 2px;
      border: 1px solid #dcdfe6;
      overflow: hidden; //超出隐藏
      white-space: nowrap; //不换行
      text-overflow: ellipsis; //点点显示
      text-indent: 8px;
    }
    .copy {
      width: 58px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      background: #364fcd;
      border-radius: 2px;
      font-weight: 400;
      color: #ffffff;
      margin-left: 10px;
      cursor: pointer;
    }
  }
  // .copy:hover {
  //   opacity: 1;
  //   transition: cubic-bezier(0.23, 1, 0.32, 1);
  // }
}
</style>
