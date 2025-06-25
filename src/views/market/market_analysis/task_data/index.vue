<template>
  <div>
    <xm_search
      :searchComponents="searchComponents"
      @getData="querySearch"
      @reset="resetSearch"
    ></xm_search>
    <div class="page_main mt_16">
      <div class="page_btns">
        <el-button type="default" @click="exportData">导出</el-button>
      </div>
      <xm_table
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="任务信息" prop="taskName" min-width="170">
          <template #default="scope">
            <div>
              <el-link
                :underline="false"
                type="primary"
                class="name"
                @click="getDetails(scope.row.taskType, scope.row.taskId)"
              >
                {{ scope.row.taskName || '--' }}
              </el-link>
              <div>{{ scope.row.createTime || '--' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建人" prop="taskCreateUserName" min-width="80">
          <template #default="{ row }">{{ row.taskCreateUserName || '-' }}</template>
        </el-table-column>
        <el-table-column label="分发人数" prop="coverAccountCount" min-width="80">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.coverAccountCount || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="参与人数" prop="joinAccountCount" min-width="80">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.joinAccountCount || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="完成人数" prop="finishAccountCount" min-width="80">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.finishAccountCount || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="任务类型" prop="taskType" min-width="80">
          <template #default="{ row }">{{ TASK_TYPE.getCN(row.taskType) }}任务</template>
        </el-table-column>
        <el-table-column label="任务状态" prop="taskStatus" min-width="80">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <i
                style="
                  display: inline-block;
                  width: 4px;
                  height: 4px;
                  border-radius: 50%;
                  margin-right: 8px;
                "
                :class="{
                  'status-0': null,
                  'status-1': scope.row.taskStatus === 5,
                  'status-2':
                    scope.row.taskStatus === 0 ||
                    scope.row.taskStatus === 3 ||
                    scope.row.taskStatus === 7,
                  'status-3': scope.row.taskStatus === 1 || scope.row.taskStatus === 4,
                  'status-4': scope.row.taskStatus === 2 || scope.row.taskStatus === 6
                }"
              ></i>
              {{ TASK_STATUS.getCN(scope.row.taskStatus) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="任务时间" prop="startTime" min-width="100">
          <template #default="scope">
            <div style="display: flex; flex-wrap: wrap">
              <div style="white-space: nowrap">{{ scope.row.startTime }}</div>
              &nbsp;至&nbsp;
              <div style="white-space: nowrap">{{ scope.row.endTime }}</div>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { handleGetList } from './get_list'
import { wanSliceFormat } from '@/utils/tools.js'
import { useRouter } from 'vue-router'
import { TASK_TYPE, TASK_STATUS } from '@/utils/dictionary/task'

// const message = inject('$message')
const vm = getCurrentInstance()
const { tableForm, searchComponents, getList, querySearch, resetSearch, exportData } =
  handleGetList(vm)
const router = useRouter()
function getDetails(type, id) {
  const pathEnums = {
    1: 'video_task/video_task_details',
    2: 'live_task/live_task_details',
    3: 'collecting_task/detail',
    5: 'study_task/detail'
  }
  router.push({
    path: pathEnums[type],
    query: {
      itemId: id,
      type
    }
  })
  // if (type === 1) {
  //   router.push({
  //     path: 'video_task/video_task_details',
  //     query: {
  //       itemId: id,
  //       type: 1
  //     }
  //   })
  // } else if (type === 2) {
  //   router.push({
  //     path: 'live_task/live_task_details',
  //     query: {
  //       itemId: id,
  //       type: 2
  //     }
  //   })
  // } else {
  //   message.warning('暂无页面')
  // }
}
</script>

<style lang="scss" scoped>
.status-0 {
  background-color: rgba(54, 79, 205, 1);
}
.status-1 {
  background-color: rgba(255, 172, 109, 1);
}
.status-2 {
  background-color: rgba(144, 147, 153, 1);
}
.status-3 {
  background-color: rgba(81, 248, 139, 1);
}
.status-4 {
  background-color: rgba(248, 81, 81, 1);
}
</style>
