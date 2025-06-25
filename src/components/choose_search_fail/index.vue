<template>
  <searchFail
    :placeholder="props.placeholder"
    :failType="props.failType"
    :fileID="props.fileID"
    @select="selectInfo"
  />
</template>

<script setup>
import searchFail from '@/views/sumvideo/components/files/search_file.vue'
const props = defineProps({
  placeholder: String,
  failType: String,
  fileID: Object // 已选择的
})
const emits = defineEmits(['updateFail'])
function selectInfo(data) {
  emits('updateFail', data)
}
</script>

<style lang="scss" scoped></style>
