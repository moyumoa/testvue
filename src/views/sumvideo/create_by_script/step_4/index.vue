<template>
  <div class="step_4">
    <fourthStep @closeFun="closePage" @toRecords="toRecords" />
  </div>
</template>

<script setup>
import fourthStep from '@/views/sumvideo/components/step/fourth_step.vue'

import { throttle } from '@/utils/tools.js'
import { useRouter } from 'vue-router'
import { resetPushState } from '@/utils/getRoute'

const router = useRouter()
const emits = defineEmits(['closeFn'])

const closePage = throttle(function () {
  resetPushState()
  emits('closeFn')
}, 500)

function toRecords() {
  sessionStorage.setItem('refresh', true)
  router.push(`/sumwhy_video/synthesis_task`)
}

defineExpose({
  closePage
})
</script>

<style lang="scss" scoped>
.step_4 {
  border-radius: 4px;
  height: 100%;
  overflow-y: auto;
  position: relative;
}
</style>
