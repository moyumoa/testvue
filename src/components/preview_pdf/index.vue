<template>
  <vue-office-pdf :src="url" />
</template>
<script setup>
import VueOfficePdf from '@vue-office/pdf'
const props = defineProps({
  url: String
})

const { url } = toRefs(props)
</script>
<style lang="scss" scoped>
:deep(.vue-office-pdf-wrapper) {
  padding: 0 !important;
  background: none !important;
}
</style>
