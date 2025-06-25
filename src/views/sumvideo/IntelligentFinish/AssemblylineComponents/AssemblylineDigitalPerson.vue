<template>
  <div style="width: 100%; height: 100%">
    <mask-border v-if="maskOpen" bottomHeight="16px"></mask-border>
    <iframe :src="srcUrl" id="mobsf" scrolling="no" frameborder="0" class="body"></iframe>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import maskBorder from '@/views/sumvideo/components/maskborder.vue'
import { useRoute } from 'vue-router'
import { sumvideoRewriteUrl, sumvideoNeedLogin } from '@/utils/OEA.js'
const route = useRoute()
const store = useStore()
// const router = useRouter()
const id = ref(null)
const srcUrl = ref(null)
id.value = route.query.id
const url = ref(null)
url.value =
  import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_SUMVIDEO_URL
    : window.location.origin
srcUrl.value = sumvideoRewriteUrl(
  `${url.value}/sumvideo/digitalPerson?id=${route.query.id}&needAudio=${route.query.needAudio}`
)

window.addEventListener('message', receiveMessageFromIframePageForCss, false)

// 图层蒙版是否打开
const maskOpen = ref(null)

// 打开涂层蒙版 监听弹窗事件的变化
function receiveMessageFromIframePageForCss(event) {
  if (
    event.data.data &&
    typeof event.data.data === 'string' &&
    event.data.data.indexOf('layer_mask') > -1
  ) {
    if (event.data.params) {
      maskOpen.value = true
      store.commit('page/setExportEntryDis', true)
    } else {
      maskOpen.value = false
      store.commit('page/setExportEntryDis', false)
    }
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

onBeforeUnmount(() => {
  // 离开页面时销毁页面的监听事件
  window.removeEventListener('message', receiveMessageFromIframePageForCss, false)
})
</script>

<style lang="scss" scoped>
.body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 11;
}
</style>
