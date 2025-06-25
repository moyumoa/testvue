<template>
  <div>
    <mask-border v-if="maskOpen"></mask-border>
    <!-- <down-load-client></down-load-client> -->
    <iframe :src="srcUrl" id="mobsf" scrolling="no" frameborder="0" class="body"></iframe>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import maskBorder from '@/views/sumvideo/components/maskborder.vue'
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
import { sumvideoRewriteUrl, sumvideoNeedLogin } from '@/utils/OEA.js'
const router = useRouter()
window.addEventListener('message', receiveMessageFromIframePage, false)
window.addEventListener('message', receiveMessageFromIframePageForCss, false)

// 获取当前的路由
const url = ref(null)
url.value =
  import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_SUMVIDEO_URL
    : window.location.origin
const srcUrl = ref(null)
srcUrl.value = sumvideoRewriteUrl(url.value + '/sumvideo/corporate_creativity')

// 图层蒙版是否打开
const maskOpen = ref(null)

// iframe中控制路由的变化
function receiveMessageFromIframePage(event) {
  console.log('监听到的路由', event.data, event)
  // let params = {}
  // if (event.data.params) {
  //   params = JSON.parse(event.data.params)
  // }

  // 编辑模板分镜
  if (
    event.data.data &&
    typeof event.data.data === 'string' &&
    event.data.data.indexOf('creative_mould') > -1
  ) {
    router.push({
      path: '/sumwhy_video/creative_mould'
    })
  }
  // sumvideo打开剪辑页
  if (
    event.data.metaData &&
    event.data.metaData.event === 'urlChange' &&
    event.data.metaData.target !== '_spa'
  ) {
    window.open(event.data.data.url, event.data.data.target)
  }
  // 免登
  if (event.data.metaData && event.data.metaData.event === 'needLogin') {
    sumvideoNeedLogin(event.data.data.url)
  }
}

// 打开涂层蒙版 监听弹窗事件的变化
function receiveMessageFromIframePageForCss(event) {
  console.log('监听弹窗事件的变化', event.data, event)
  if (
    event.data.data &&
    typeof event.data.data === 'string' &&
    event.data.data.indexOf('layer_mask') > -1
  ) {
    if (event.data.params) {
      maskOpen.value = true
    } else {
      maskOpen.value = false
    }
  }
}

onBeforeUnmount(() => {
  // 离开页面时销毁页面的监听事件
  window.removeEventListener('message', receiveMessageFromIframePage, false)
  window.removeEventListener('message', receiveMessageFromIframePageForCss, false)
})
</script>

<style lang="scss" scoped>
.body {
  width: calc(100vw - 242px);
  height: calc(100vh - 120px);
  overflow: hidden;
  z-index: 11;
}
</style>
