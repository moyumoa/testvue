<template>
  <div style="width: 100%; height: 100%; position: relative">
    <mask-border v-if="maskOpen" bottomHeight="16px"></mask-border>
    <iframe
      ref="iframeRef"
      :src="srcUrl"
      id="mobsf"
      scrolling="no"
      frameborder="0"
      class="body"
    ></iframe>
    <!--  合成进度条的关闭时显示的按钮  所以openPipelineProgressState = false的时候才显示 -->
    <div class="panel_switch" @click="openPipelineProgress" v-if="!openPipelineProgressState">
      <p>展开列表</p>
      <img src="https://tagvv-1256030678.file.myqcloud.com/20231019xqdwf.png" alt="" />
      <div class="panel_switch_mask" v-if="maskOpen"></div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import maskBorder from '@/views/sumvideo/components/maskborder.vue'
import { useRoute, useRouter } from 'vue-router'
import { sumvideoRewriteUrl, sumvideoNeedLogin } from '@/utils/OEA.js'
const route = useRoute()
const router = useRouter()
const store = useStore()
const id = ref(null)
const name = ref(null)
const namelabel = ref(null)
const srcUrl = ref(null)
id.value = route.query.id
name.value = route.query.name
namelabel.value = route.query.namelabel
const url = ref(null)
url.value =
  import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_SUMVIDEO_URL
    : window.location.origin
srcUrl.value = sumvideoRewriteUrl(
  url.value +
    '/sumvideo/PipelineSettings?id=' +
    route.query.id +
    '&name=' +
    route.query.name +
    '&namelabel=' +
    route.query.namelabel
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
}

//
window.addEventListener('message', receiveMessageFromIframePage, false)

// iframe中控制路由的变化
function receiveMessageFromIframePage(event) {
  let params = {}
  if (event.data.params) {
    params = JSON.parse(event.data.params)
  }
  // 数字人制作
  if (
    event.data.data &&
    typeof event.data.data === 'string' &&
    event.data.data.indexOf('digitalPerson') > -1
  ) {
    router.push({
      path: '/sumwhy_video/Assemblyline/assemblyline_details/digitalPerson',
      query: {
        id: params.id,
        needAudio: params.needAudio
      }
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
  // 流水线关闭
  if (event.data.data && event.data.data.indexOf('pipeline_progress') > -1) {
    openPipelineProgressState.value = event.data.params
  }
}

const iframeRef = ref(null)
const openPipelineProgressState = ref(true)
const openPipelineProgress = () => {
  if (iframeRef.value == null) return
  if (maskOpen.value) return
  openPipelineProgressState.value = true
  iframeRef.value.contentWindow.postMessage({ data: 'pipeline_progress', params: true }, '*')
}

onBeforeUnmount(() => {
  iframeRef.value = null
  // 离开页面时销毁页面的监听事件
  window.removeEventListener('message', receiveMessageFromIframePageForCss, false)
  window.removeEventListener('message', receiveMessageFromIframePage, false)
})
</script>

<style lang="scss" scoped>
.body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 11;
}
.panel_switch {
  position: absolute;
  top: 24px;
  left: -15px;
  z-index: 11;
  width: 32px;
  height: 108px;
  line-height: 18px;
  color: #fff;
  text-align: center;
  background-color: #364fcd;
  box-shadow: 4px 0px 8px 0px rgba(103, 103, 103, 0.15);
  border-radius: 0px 8px 8px 0px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  p {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 18px;
  }
  img {
    margin-top: 4px;
    display: flex;
    width: 16px;
    height: 16px;
  }
}
.panel_switch_mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 32px;
  height: 108px;
  background: #000;
  opacity: 0.5;
  border-radius: 0px 8px 8px 0px;
  cursor: default;
}
</style>
