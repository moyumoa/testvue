<template>
  <div class="task-statistics">
    <div class="container">
      <el-table :data="list" v-if="list.length > 0">
        <el-table-column prop="label" label="" />
        <el-table-column label="页面查看人数">
          <template v-slot="{ row }">
            {{ wanSliceFormat(row.View) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="页面查看人次">
          <template v-slot="{ row }">
            {{ wanSliceFormat(row.ViewNumber) || '--' }}
          </template>
        </el-table-column>
      </el-table>
      <el-empty description="暂无数据" :image-size="120" v-else>
        <template #image>
          <img src="@/assets/images/content_center/no_data.png" />
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { wanSliceFormat } from '@/utils/tools'

defineProps({
  list: {
    type: Array,
    default: () => []
  }
})
</script>

<style lang="scss" scoped>
.task-statistics {
  height: 231px;
  background: #ffffff;
  border-radius: 4px;
  box-sizing: border-box;
  overflow: hidden;

  :deep(.el-table__body-wrapper) {
    .el-table__cell {
      height: 48px !important;
    }
  }

  :deep(.el-table__header) {
    .el-table__cell {
      height: 40px !important;
    }
  }

  .icon-16 {
    width: 16px;
    height: 16px;
  }
}
</style>
