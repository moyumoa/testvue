<template>
  <div>
    <el-dialog
      :model-value="showDialog"
      @close="emits('update:showDialog', false)"
      title="直播间商品折扣"
      :width="1080"
    >
      <live-goods-report-table type="dialog" :accountId="accountId"></live-goods-report-table>
    </el-dialog>
  </div>
</template>

<script setup>
import liveGoodsReportTable from './live_goods_report_table.vue'

const props = defineProps({
  showDialog: Object,
  accountId: [Number, String]
})
const { showDialog, accountId } = toRefs(props)
const emits = defineEmits(['update:showDialog'])
</script>

<style lang="scss" scoped></style>
