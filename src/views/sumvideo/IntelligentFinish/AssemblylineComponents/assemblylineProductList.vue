<template>
  <div :class="{ envPage_left: isHideLeftMenu, envPage_top: isHideTopMenu }">
    <mask-border v-if="maskOpen"></mask-border>
    <iframe :src="srcUrl" id="mobsf" scrolling="no" frameborder="0" class="body"></iframe>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import maskBorder from '@/views/sumvideo/components/maskborder.vue'
import { useRoute } from 'vue-router'
import { sumvideoRewriteUrl, sumvideoNeedLogin } from '@/utils/OEA.js'
const route = useRoute()
const id = ref(null)
const name = ref(null)
const srcUrl = ref(null)
id.value = route.query.id
name.value = route.query.name
const url = ref(null)
url.value =
  import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_SUMVIDEO_URL
    : window.location.origin
srcUrl.value = sumvideoRewriteUrl(
  url.value + '/sumvideo/productList?id=' + route.query.id + '&name=' + route.query.name
)

window.addEventListener('message', receiveMessageFromIframePageForCss, false)
// 图层蒙版是否打开
const maskOpen = ref(null)

const store = useStore()
const isHideLeftMenu = store.getters.isHideLeftMenu

const isHideTopMenu = store.getters.isHideTopMenu

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
  width: calc(100vw - 242px);
  height: calc(100vh - 120px);
  overflow: hidden;
  z-index: 11;
}

.envPage_left {
  .body {
    width: calc(100vw - 32px) !important;
  }
}
.envPage_top {
  .body {
    height: calc(100vh - 10px) !important;
  }
}
</style>
