<template>
  <el-button
    :type="props.type"
    v-loading.fullscreen.lock="props.isExport ? loading : false"
    :disabled="disabled"
    :loading="loading"
    @click="apiRequest"
  >
    <slot></slot>
  </el-button>
</template>

<script setup>
const props = defineProps({
  type: String,
  disabled: Boolean,
  isExport: Boolean, // 是否是导出按钮，导出按钮要显示全屏的Loading
  asyncFunc: Function // 接收一个promise函数
})

const loading = ref(false)

function apiRequest() {
  loading.value = true
  props.asyncFunc().finally(() => {
    loading.value = false
  })
}
</script>

<style lang="scss" scoped></style>
