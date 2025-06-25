<template>
  <div>
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>

    <div class="page_main mt_16">
      <el-tabs v-model="activeName">
        <el-tab-pane label="全部" name="-1"></el-tab-pane>
        <el-tab-pane label="待点评" name="0"></el-tab-pane>
        <el-tab-pane label="已点评" name="1"></el-tab-pane>
      </el-tabs>
      <xm_table
        class="pic_table"
        tableType="live"
        ref="table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
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
        <el-table-column label="关联任务" min-width="200">
          <template v-slot="{ row }">
            {{ row.taskName }}
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
        <el-table-column label="点评人" min-width="160">
          <template v-slot="{ row }">
            {{ row.commentName || '-' }}
            <span
              class="xm_depart"
              style="display: inline-block"
              v-if="row.commentStaffStatus && row.commentStaffStatus == 2"
            ></span>
          </template>
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
    <!--  点评作业   -->
    <studyJobDialog
      v-if="jobDialog.show"
      :jobDialog="jobDialog"
      @updateList="getList"
      @closeJobDialog="closeJobDialog"
    ></studyJobDialog>
    <!-- 查看提交 提交记录   -->
    <studyJobRecord
      v-if="recordDialog.show"
      :jobDialog="recordDialog"
      :commentHomeworkPermission="hasCommentPermission"
      @showJobDialog="showJobDialog"
    ></studyJobRecord>
  </div>
</template>
<script setup>
import studyJobRecord from '../task_details/compontents/study_job_record.vue'
import studyJobDialog from '../task_details/compontents/study_job_dialog.vue'
import { throttle } from '@/utils/tools.js'
import { getQuery } from '@/utils/get_query.js'
import { homeWorkCommentCenterList } from '@/api/market/task.js'

const searchComponents = reactive([
  {
    type: 'chooseDept',
    label: '组织架构',
    val: [],
    filed: 'orgIds',
    multiple: true,
    isUsePermission: true
  },
  {
    type: 'input',
    label: '成员姓名',
    val: '',
    placeholder: '请输入成员姓名',
    filed: 'employeeName'
  },
  {
    type: 'input',
    label: '关联任务',
    val: '',
    placeholder: '请输入关联任务 ',
    filed: 'taskName'
  }
])
const table = ref(null)
const tableForm = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  },
  params: {}
})

// -1 全部 0 待点评 1已点评
const activeName = ref('-1')
watch(
  () => activeName.value,
  newValue => {
    tableForm.page.index = 1
    tableForm.page.size = 10
    getList()
  }
)
// const depTree = (item) => {
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

// 有作业点评的权限
const hasCommentPermission = ref(false)
const getList = () => {
  tableForm.loading = true
  const { index: pageNo, size: pageSize } = tableForm.page
  const params = {
    pageNo,
    pageSize,
    ...tableForm.params,
    commentStatus: activeName.value === '-1' ? null : activeName.value,
    ...getQuery(searchComponents)
  }
  tableForm.listData = []
  homeWorkCommentCenterList(params)
    .then(res => {
      const _list = res.data.records || []
      tableForm.listData = _list.map(e => {
        e.dyAvatar = e.avatar
        e.dyName = e.name
        e.dyNum = e.douYinAccount
        e.phone = e.phoneNum
        e.showPhone = false
        if (e.homeworks && e.homeworks.length > 0) {
          e.homeworkSubmitTime = e.homeworks[0].homeworkSubmitTime
          e.commentName = e.homeworks[0].commentName
          e.commentStaffStatus = e.homeworks[0].staffStatus
          e.commentTime = e.homeworks[0].commentTime
          e.commentGrade = e.homeworks[0].commentGrade
          e.commentStatus = e.homeworks[0].commentStatus
          e.commentText = e.homeworks[0].commentText
        } else {
          e.homeworkSubmitTime = ''
          e.commentName = ''
          e.commentStaffStatus = null
          e.commentTime = ''
          e.commentGrade = 0
          e.commentStatus = 0
          e.commentText = ''
        }
        return e
      })
      tableForm.page.total = res.data.total || 0
      // 当前用户是否有点评权限
      if (tableForm.listData.length > 0) {
        hasCommentPermission.value = tableForm.listData[0]?.commentHomeworkPermission
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}
onMounted(() => {
  getList()
})

function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  tableForm.params = {}
  table.value.clearSort()
  getList()
}

const statusList = reactive(
  new Map([
    [-1, { label: '全部', class: '' }],
    [1, { label: '已点评', class: 'green_circle' }],
    [0, { label: '待点评', class: '' }]
  ])
)

function handleSortChange(val) {
  const value = {
    target: '',
    orderBy: 0
  }
  if (val.prop === 'commentGrade') {
    value.target = 'mtuch.comment_grade'
  } else {
    value.target = val.prop || ''
  }
  if (val.order === 'ascending') {
    value.orderBy = 1
  } else if (val.order === 'descending') {
    value.orderBy = 0
  } else {
    value.orderBy = 0
  }
  tableForm.params = value
  getList()
}

// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}

const jobDialog = reactive({
  show: false
})
const recordDialog = reactive({
  show: false,
  deliverId: null
})
// 查看
const showDialog = throttle(e => {
  if (e.homeworks) {
    if (e.homeworks.length > 1) {
      // 查看时，如果有多条点评记录，就显示记录弹窗
      recordDialog.taskId = e.taskId
      recordDialog.courseHomeworkType = e.courseHomeworkType
      recordDialog.show = true
      recordDialog.deliverId = e.deliverId
      recordDialog.userId = e.userId
      return
    }
    jobDialog.taskId = e.taskId
    jobDialog.homeworkId = e.homeworks[0].id
    jobDialog.commentStatus = e.homeworks[0].commentStatus
    jobDialog.deliverId = e.deliverId
    jobDialog.homeworkText = e.homeworks[0].homeworkText
    jobDialog.homeworkRequirement = e.homeworks[0].homeworkRequirement
    jobDialog.homeworkSample = e.homeworkSample
    jobDialog.courseHomeworkType = e.courseHomeworkType

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
    jobDialog.taskId = e.taskId
    jobDialog.homeworkId = e.homeworks[0].id
    jobDialog.commentStatus = e.homeworks[0].commentStatus
    jobDialog.deliverId = e.deliverId
    jobDialog.homeworkText = e.homeworks[0].homeworkText
    jobDialog.homeworkRequirement = e.homeworks[0].homeworkRequirement
    jobDialog.homeworkSample = e.homeworkSample
    jobDialog.courseHomeworkType = e.courseHomeworkType
    if (e.homeworks[0].commentStatus === 1) {
      jobDialog.commentVideoPart = e.homeworks[0].commentVideoPart
      jobDialog.commentGrade = e.homeworks[0].commentGrade || 0
      jobDialog.commentText = e.homeworks[0].commentText
    }

    jobDialog.origin = 'jobList'
    jobDialog.show = true
  }
}, 700)

// 作业记录 点击显示作业 显示作业信息
function showJobDialog(e) {
  jobDialog.commentStatus = e.commentStatus
  jobDialog.deliverId = e.deliverId
  jobDialog.taskId = e.taskId
  jobDialog.homeworkText = e.homeworkText
  jobDialog.homeworkRequirement = e.homeworkRequirement
  jobDialog.homeworkSample = e.homeworkSample
  jobDialog.homeworkId = e.id
  jobDialog.courseHomeworkType = recordDialog.courseHomeworkType
  if (e.commentStatus === 1) {
    jobDialog.commentVideoPart = e.commentVideoPart
    jobDialog.commentGrade = e.commentGrade || 0
    jobDialog.commentText = e.commentText
  }
  jobDialog.show = true
  jobDialog.origin = 'recordDialog'
  recordDialog.show = false
}

// 关闭点评
function closeJobDialog(origin) {
  if (origin === 'recordDialog') {
    recordDialog.show = true
  }
}
</script>
<style lang="scss" scoped></style>
