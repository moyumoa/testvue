<template>
  <!-- 废弃页面 -->
  <div class="page">
    <!-- 查询筛选类型 -->
    <!-- search -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>

    <!-- 查询结果 -->
    <section>
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getTaskList"
      >
        <el-table-column label="审核信息" min-width="300">
          <template #default="scope">
            <p v-if="scope.row.name">{{ scope.row.name }}</p>
            <p v-if="scope.row.startTime">
              {{ scope.row.startTime.slice(0, 10) }}&nbsp;至&nbsp;{{
                scope.row.endTime.slice(0, 10)
              }}
            </p>
          </template>
        </el-table-column>
        <el-table-column label="审核类型">
          <template #default="scope">
            <p>{{ scope.row.type === 1 ? '视频任务' : '直播任务' }}</p>
          </template>
        </el-table-column>
        <el-table-column label="任务创建人" min-width="100">
          <template #default="scope">
            <p>{{ scope.row.createHostName ? scope.row.createHostName : '--' }}</p>
            <p>{{ scope.row.createHostRoleName ? scope.row.createHostRoleName : '--' }}</p>
          </template>
        </el-table-column>
        <el-table-column label="状态变更时间" min-width="150">
          <template #default="scope">
            <p v-if="scope.row.auditTime">{{ scope.row.auditTime ? scope.row.auditTime : '--' }}</p>
            <p v-else>--</p>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" min-width="110">
          <template #default="scope">
            <div class="status">
              <span
                style="
                  font-size: 5px;
                  margin-right: 4px;
                  display: inline-block;
                  width: 4px;
                  height: 4px;
                  border-radius: 50%;
                "
                :class="{
                  'status-0': scope.row.status === 0,
                  'status-2': scope.row.status === 2,
                  'status-1': scope.row.status !== 2 && scope.row.status !== 0
                }"
              ></span>
              <p>
                {{
                  scope.row.status === 0
                    ? '待审核'
                    : scope.row.status === 2
                    ? '审核不通过'
                    : '审核通过'
                }}
              </p>
              <template v-if="scope.row.status === 2">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="scope.row.auditRemark"
                  placement="top-start"
                >
                  <el-icon style="margin-left: 8px">
                    <i-warning />
                  </el-icon>
                </el-tooltip>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" min-width="110">
          <template #default="scope">
            <el-link type="primary" @click="taskDetails(scope.row)">详情</el-link>
            <el-link
              type="primary"
              v-if="scope.row.status === 0"
              class="ml_16"
              @click="audit(scope.row)"
            >
              审核
            </el-link>
          </template>
        </el-table-column>
      </xm_table>
    </section>

    <el-dialog v-model="isShow" title="审核" width="400px" style="height: 280px" destroy-on-close>
      <el-radio-group v-model="query.status">
        <el-radio :label="1">审核通过</el-radio>
        <el-radio :label="2">审核不通过</el-radio>
      </el-radio-group>
      <template v-if="query.status == 2">
        <el-form :rules="rules">
          <el-form-item prop="reason">
            <el-input
              v-model="query.remark"
              :rows="1"
              type="textarea"
              resize="none"
              placeholder="请输入审核不通过理由，最多15字"
              style="font-size: 14px"
              :maxlength="15"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isShow = false">取消</el-button>
          <el-button type="primary" @click="updateTask()">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { pageList } from './model/get_list'
export default {
  setup() {
    const {
      searchComponents,
      tableForm,
      query,
      isShow,
      audit,
      getTaskList,
      taskDetails,
      updateTask,
      rules
    } = pageList()
    // 重置
    function resetSearch() {
      tableForm.loading = true
      tableForm.page.index = 1
      tableForm.page.size = 10
      getTaskList()
    }
    resetSearch()
    // 查询
    function searchList() {
      tableForm.loading = true
      tableForm.page.index = 1
      getTaskList()
    }

    return {
      isShow,
      searchComponents,
      tableForm,
      audit,
      resetSearch,
      searchList,
      getTaskList,
      taskDetails,
      updateTask,
      query,
      rules
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  // 查询筛选类型

  section {
    background: #fff;
    margin: 16px 0;
    padding: 24px;
    font-size: 14px;
    .el-button {
      // padding: 8px 0px;
    }
    .status {
      display: flex;
      align-items: center;
    }
  }
  //
}
.status-0 {
  background-color: rgba(144, 147, 153, 1);
}
.status-1 {
  background-color: rgba(81, 248, 139, 1);
}
.status-2 {
  background-color: rgba(248, 81, 81, 1);
}
</style>
