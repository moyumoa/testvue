<template>
  <vue-office-excel
    :options="{
      xls: true
    }"
    :src="url"
    style="height: 60vh"
  />
</template>
<script setup>
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/excel/lib/index.css'
const props = defineProps({
  url: String
})

const { url } = toRefs(props)
</script>
<style lang="scss" scoped>
:deep(.x-spreadsheet-table) {
  width: 870px !important;
}
:deep(.x-spreadsheet-menu) {
  overflow-x: visible !important;
}
</style>
