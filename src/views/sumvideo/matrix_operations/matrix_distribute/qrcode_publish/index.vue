<template>
  <div>
    <listDOM ref="listRef" v-if="showType == 1" @toDetail="toDetail" />
    <detailDOM ref="detailRef" :qrId="qrId" :status="status" v-else-if="showType == 2" />
  </div>
</template>
<script setup>
import listDOM from './list.vue'
import detailDOM from './detail.vue'
import { throttle } from '@/utils/tools'
const qrId = ref(null) // 详情的入参id
const status = ref(null) // 详情的入参status 用于判断是否显示同步数据
const showType = ref(null) // 1 列表 2详情
const listRef = ref(null)
const detailRef = ref(null)
const initType = throttle(() => {
  if (showType.value === 1) return
  showType.value = 1
  nextTick(() => {
    listRef.value.resetSearch()
  })
}, 1000)
function toDetail(data) {
  qrId.value = data.qrId
  status.value = data.status
  showType.value = 2
  nextTick(() => {
    detailRef.value.initPage()
  })
}

defineExpose({
  initType
})
</script>
<style lang="scss" scoped></style>
