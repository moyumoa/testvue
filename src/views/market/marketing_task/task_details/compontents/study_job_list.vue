<template>
  <div>
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>
    <div class="page_main mt_16">
      <xm_table
        class="pic_table"
        tableType="live"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getTaskInfo"
        @sort-change="handleSortChange"
      >
        <el-table-column label="成员信息" min-width="250" fixed="left">
          <template v-slot="{ row }">
            <table_column_matrix_account
              :info="row"
              showPhone
              :showDyNum="false"
              :showLeaving="row.staffStatus && row.staffStatus == 2"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="部门" min-width="200">
          <template v-slot="{ row }">
            <table_column_department_info
              connectStr="/"
              divisionStr=";"
              v-if="row.orgInfo"
              :departmentName="row.orgInfo"
              trigger="hover"
            ></table_column_department_info>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="提交作业时间" min-width="160">
          <template v-slot="{ row }">{{ row.homeworkSubmitTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="点评状态" min-width="130">
          <template v-slot="{ row }">
            <div class="status_style" v-if="statusList.get(row.commentStatus || 0)">
              <div :class="'status_circle ' + statusList.get(row.commentStatus || 0).class"></div>
              <div>
                {{ statusList.get(row.commentStatus || 0).label }}
              </div>
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column label="点评人" min-width="130">
          <template v-slot="{ row }">{{ row.commentName || '-' }}</template>
        </el-table-column>
        <el-table-column label="点评时间" min-width="160">
          <template v-slot="{ row }">{{ row.commentTime || '-' }}</template>
        </el-table-column>
        <el-table-column
          label="点评分数"
          min-width="130"
          sortable="custom"
          column-key="commentGrade"
          prop="commentGrade"
        >
          <template v-slot="{ row }">
            {{ row.commentStatus === 1 ? row.commentGrade || 0 : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="点评意见" min-width="130">
          <template v-slot="{ row }">
            <div class="line-hidden2">
              {{ row.commentText || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="right" fixed="right">
          <template v-slot="{ row }">
            <el-link
              v-if="row.commentStatus === 0"
              :disabled="!row.commentHomeworkPermission"
              type="primary"
              class="ml_16"
              style="margin: 0"
              @click="addComment(row)"
            >
              点评
            </el-link>
            <el-link
              v-if="
                (row.commentStatus === 1 && row.homeworks && row.homeworks.length == 1) ||
                (row.homeworks && row.homeworks.length > 1)
              "
              type="primary"
              class="ml_16"
              style="margin: 0 0 0 16px"
              @click="showDialog(row)"
            >
              查看
            </el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <studyJobDialog
      v-if="jobDialog.show"
      :jobDialog="jobDialog"
      :taskInfo="props.taskInfo"
      @updateList="getTaskInfo"
      @closeJobDialog="closeJobDialog"
    ></studyJobDialog>
    <studyJobRecord
      v-if="recordDialog.show"
      :jobDialog="recordDialog"
      :commentHomeworkPermission="commentHomeworkPermission"
      @showJobDialog="showJobDialog"
    ></studyJobRecord>
  </div>
</template>
<script setup>
import studyJobRecord from './study_job_record.vue'
import studyJobDialog from './study_job_dialog.vue'
import { throttle } from '@/utils/tools.js'
import { studyJobList } from '../data'
import { useRoute } from 'vue-router'

const props = defineProps({
  taskInfo: Object
})
// 作业类型
const courseHomeworkType = ref('')

props.taskInfo.taskConfigs.forEach(x => {
  if (x.ckey === 'course_homework_type') {
    courseHomeworkType.value = x.cvalue
  }
})

const route = useRoute()
const {
  tableForm,
  statusList,
  getTaskInfo,
  searchComponents,
  handleSortChange,
  commentHomeworkPermission
} = studyJobList('study')
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getTaskInfo()
}
resetSearch()
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getTaskInfo()
}

const jobDialog = reactive({
  show: false,
  taskId: route.query.itemId
})
const recordDialog = reactive({
  show: false,
  courseHomeworkType: courseHomeworkType.value,
  deliverId: null,
  taskId: route.query.itemId
})
// 查看
const showDialog = throttle(e => {
  if (e.homeworks) {
    if (e.homeworks.length > 1) {
      // 查看时，如果有多条点评记录，就显示记录弹窗
      recordDialog.courseHomeworkType = courseHomeworkType.value
      recordDialog.show = true
      recordDialog.deliverId = e.deliverId
      recordDialog.userId = e.userId
      return
    }
    jobDialog.homeworkId = e.homeworks[0].id
    jobDialog.commentStatus = e.homeworks[0].commentStatus
    jobDialog.deliverId = e.deliverId
    jobDialog.homeworkText = e.homeworks[0].homeworkText
    jobDialog.homeworkRequirement = e.homeworks[0].homeworkRequirement
    jobDialog.homeworkSample = e.homeworkSample
    jobDialog.courseHomeworkType = courseHomeworkType.value
    if (e.homeworks[0].commentStatus === 1) {
      jobDialog.commentVideoPart = e.homeworks[0].commentVideoPart
      jobDialog.commentGrade = e.homeworks[0].commentGrade || 0
      jobDialog.commentText = e.homeworks[0].commentText
    }
    jobDialog.origin = 'jobList'
    jobDialog.show = true
  }
}, 700)
// 点评
const addComment = throttle(e => {
  if (e.homeworks && e.homeworks.length > 0) {
    jobDialog.homeworkId = e.homeworks[0].id
    jobDialog.commentStatus = e.homeworks[0].commentStatus
    jobDialog.deliverId = e.deliverId
    jobDialog.homeworkText = e.homeworks[0].homeworkText
    jobDialog.homeworkRequirement = e.homeworks[0].homeworkRequirement
    jobDialog.homeworkSample = e.homeworkSample
    jobDialog.courseHomeworkType = courseHomeworkType.value
    if (e.homeworks[0].commentStatus === 1) {
      jobDialog.commentVideoPart = e.homeworks[0].commentVideoPart
      jobDialog.commentGrade = e.homeworks[0].commentGrade || 0
      jobDialog.commentText = e.homeworks[0].commentText
    }

    jobDialog.origin = 'jobList'
    jobDialog.show = true
  }
}, 700)
function showJobDialog(e) {
  jobDialog.homeworkRequirement = e.homeworkRequirement
  jobDialog.homeworkSample = e.homeworkSample
  jobDialog.taskId = e.taskId
  jobDialog.commentStatus = e.commentStatus
  jobDialog.deliverId = e.deliverId
  jobDialog.homeworkText = e.homeworkText
  jobDialog.homeworkId = e.id
  jobDialog.courseHomeworkType = courseHomeworkType.value
  if (e.commentStatus === 1) {
    jobDialog.commentVideoPart = e.commentVideoPart
    jobDialog.commentGrade = e.commentGrade || 0
    jobDialog.commentText = e.commentText
  }
  jobDialog.show = true
  jobDialog.origin = 'recordDialog'
  recordDialog.show = false
}

function closeJobDialog(origin) {
  if (origin === 'recordDialog') {
    recordDialog.show = true
  }
}
// const depTree = item => {
//   const userDepDetails = item[0]?.userDepDetails[0]
//   if (isEmpty(userDepDetails)) return ''
//   const nodes = []
//   const getNode = function (obj) {
//     if (obj.depName) {
//       nodes.push(obj.depName)
//     }
//     if (obj.childrenDep) {
//       getNode(obj.childrenDep)
//     }
//   }
//   getNode(userDepDetails)
//   return nodes.join('/')
// }
</script>
<style lang="scss" scoped></style>
