<template>
  <div class="task-statistics">
    <div class="container" >
      <el-table :data="list" v-if="list.length > 0">
        <el-table-column prop="label" label="任务参与统计" />
        <el-table-column label="任务详情查看人数">
          <template v-slot="{ row }">
            {{ wanSliceFormat(row.DetailView) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="任务详情查看人次">
          <template v-slot="{ row }">
            {{ wanSliceFormat(row.DetailViewNumber) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="" width="50">
          <template v-slot="{ row }">
            <img
              v-if="row.key === 'videoTask' || row.key === 'noteTask'"
              class="icon-16"
              src="https://tagvv-1256030678.file.myqcloud.com/20240618fz5gv.png"
            />
          </template>
        </el-table-column>
        <el-table-column label="立即参加人数">
          <template v-slot="{ row }">
            {{
              row.key === 'videoTask' || row.key === 'noteTask'
                ? wanSliceFormat(row.ImmediatelyJoinView)
                : '--'
            }}
          </template>
        </el-table-column>
        <el-table-column label="立即参加人次">
          <template v-slot="{ row }">
            {{
              row.key === 'videoTask' || row.key === 'noteTask'
                ? wanSliceFormat(row.ImmediatelyJoinViewNumber)
                : '--'
            }}
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
