<template>
  <div class="info">
    <div class="material_cover">
      <material-item :materialInfo="auditInfo.taskUserMaterial"></material-item>
    </div>
    <div class="material_info">
      <div class="material_info_header">
        <span class="type">{{ MATERIAL_TYPE.getCN(auditInfo.taskUserMaterial.type) }}</span>
        <span class="label">{{ auditInfo.taskUserMaterial.labelName }}</span>
      </div>
      <div class="label_remark">{{ auditInfo.taskUserMaterial.remark || '' }}</div>
    </div>
  </div>
</template>

<script setup>
import { MATERIAL_TYPE } from '@/utils/dictionary/task'
import materialItem from '@/views/market/components/material_item.vue'

const props = defineProps({
  auditInfo: Object
})
const { auditInfo } = toRefs(props)
</script>

<style lang="scss" scoped>
.info {
  display: flex;
  .material_cover {
    width: 60px;
    height: 80px;
    border-radius: 4px;
    margin-right: 12px;
  }
  .material_info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .material_info_header {
      .type {
        margin-right: 20px;
        font-size: 16px;
        color: #303133;
        font-weight: bold;
      }
      .label {
        display: inline-block;
        text-align: center;
        min-width: 70px;
        line-height: 26px;
        padding: 0 10px;
        border-radius: 16px;
        border: 1px solid #ccc;
        box-sizing: border-box;
      }
    }
    .label_remark {
      @include mult_line(2);
      line-height: 18px;
    }
  }
}
</style>
