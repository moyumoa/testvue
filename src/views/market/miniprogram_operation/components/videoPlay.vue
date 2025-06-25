<template>
  <div class="video-play">
    <el-dialog
        title="查看视频"
        @close="isShowDialog = false"
        :width="video.width > video.height?'544px':'344px'"
        v-model="isShowDialog"
    >
      <video
          id="videoId"
          ref="videoRef"
          class="video"
          :style="{width:video.width > video.height?'500px':'300px',objectFit: 'contain'}"
          :src="info.videoUrl"
          controls="controls"
      ></video>
    </el-dialog>
  </div>

</template>

<script setup>
const props = defineProps({
  info:Object,
  show:{
    type:Boolean,
    default:false
  }
})

const emit = defineEmits(['update:show'])
const isShowDialog = ref(false)
watch(
    () => props.show,
    value => {
      if (value){
        getWidthAndHeight(value)
      }
      isShowDialog.value = value
    },
    {
      immediate: true
    }
)

watch(
    () => isShowDialog.value,
    value => {
      emit('update:show', value)
    }
)
const video = reactive({
  width:720,
  height:1280
})

function getWidthAndHeight(){
  const videoObj = document.createElement('video')
  videoObj.preload = 'metadata'
  videoObj.src = props.info.videoUrl
  videoObj.onloadedmetadata = function (evt) {

    video.width = videoObj.videoWidth
    video.height = videoObj.videoHeight
  }
}


</script>

<style lang="scss" scoped>

</style>
