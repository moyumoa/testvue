<template>
  <div :class="{ envPage_left: isHideLeftMenu, envPage_top: isHideTopMenu }">
    <mask-border v-if="maskOpen"></mask-border>
    <!-- <down-load-client></down-load-client> -->
    <iframe :src="srcUrl" id="mobsf" scrolling="no" frameborder="0" class="body"></iframe>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import maskBorder from '@/views/sumvideo/components/maskborder.vue'
import { useRouter } from 'vue-router'
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
import { sumvideoRewriteUrl, sumvideoNeedLogin } from '@/utils/OEA.js'
const router = useRouter()
window.addEventListener('message', receiveMessageFromIframePage, false)

// 获取路由地址
const url = ref(null)
url.value =
  import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_SUMVIDEO_URL
    : window.location.origin
const srcUrl = ref(null)
srcUrl.value = sumvideoRewriteUrl(url.value + '/sumvideo/assembly_line')

window.addEventListener('message', receiveMessageFromIframePageForCss, false)

const store = useStore()
const isHideLeftMenu = store.getters.isHideLeftMenu

const isHideTopMenu = store.getters.isHideTopMenu

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

// iframe中控制路由的变化
function receiveMessageFromIframePage(event) {
  console.log('监听到的路由', event.data, event)
  let params = {}
  if (event.data.params) {
    params = JSON.parse(event.data.params)
  }

  // 进入流水线
  if (
    event.data.data &&
    typeof event.data.data === 'string' &&
    event.data.data.indexOf('PipelineSettings') > -1
  ) {
    router.push({
      path: '/sumwhy_video/Assemblyline/assemblyline_details',
      query: {
        id: params.id,
        name: params.name,
        namelabel: params.namelabel
      }
    })
  }

  // 进入作品库
  if (
    event.data.data &&
    typeof event.data.data === 'string' &&
    event.data.data.indexOf('productList') > -1
  ) {
    router.push({
      path: '/sumwhy_video/Assemblyline/productList',
      query: {
        id: params.id,
        name: params.name,
        namelabel: params.namelabel
      }
    })
  }

  // 编辑模板分镜
  if (
    event.data.data &&
    typeof event.data.data === 'string' &&
    event.data.data.indexOf('template_edit') > -1
  ) {
    router.push({
      path: '/sumwhy_video/template_space/template_edit',
      query: {
        id: params.id
      }
    })
  }
  // 数字人制作
  if (
    event.data.data &&
    typeof event.data.data === 'string' &&
    event.data.data.indexOf('digitalPerson') > -1
  ) {
    router.push({
      path: '/sumwhy_video/Assemblyline/digitalPerson',
      query: {
        id: params.id
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
