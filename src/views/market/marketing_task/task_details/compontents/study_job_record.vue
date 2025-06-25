<template>
  <div>
    <div>
      <el-dialog
        ref="dialog"
        custom-class="task_init_dialog"
        :close-on-click-modal="false"
        destroy-on-close
        v-model="show"
        title="作业记录"
        width="820px"
      >
        <div style="padding: 16px">
          <xm_table
            class="pic_table"
            tableType="live"
            v-loading="tableForm.loading"
            :data="tableForm.listData"
            v-model:page="tableForm.page"
            @getTableData="getList"
          >
            <el-table-column label="提交时间" width="160">
              <template v-slot="{ row }">{{ row.homeworkSubmitTime || '-' }}</template>
            </el-table-column>
            <el-table-column label="点评人" min-width="100">
              <template v-slot="{ row }">
                {{ row.commentName || '-' }}
                <span
                  class="xm_depart"
                  style="display: inline-block"
                  v-if="row.commentStaffStatus && row.commentStaffStatus == 2"
                ></span>
              </template>
            </el-table-column>
            <el-table-column label="点评时间" width="160">
              <template v-slot="{ row }">{{ row.commentTime || '-' }}</template>
            </el-table-column>
            <el-table-column label="得分" min-width="100" prop="commentGrade">
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
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template v-slot="{ row }">
                <el-link
                  v-if="row.commentStatus === 1"
                  type="primary"
                  class="ml_16"
                  style="margin: 0"
                  @click="showDialog(row)"
                >
                  查看
                </el-link>
                <el-link
                  v-else
                  type="primary"
                  class="ml_16"
                  style="margin: 0"
                  :disabled="!canComment"
                  @click="showDialog(row)"
                >
                  点评
                </el-link>
              </template>
            </el-table-column>
          </xm_table>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script setup>
import { getHomeWorkDetail } from '@/api/market/task.js'
import { isEmpty, throttle } from '@/utils/tools.js'
import { useRoute } from 'vue-router'
const route = useRoute()
const props = defineProps({
  jobDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        deliverId: null,
        taskId: null
      }
    },
    required: true
  },
  commentHomeworkPermission: {
    type: Boolean,
    default: true
  }
})
const canComment = computed({
  get() {
    return props.commentHomeworkPermission
  }
})
// const jobDialog = reactive({
//   show: false,
//   taskId: route.query.itemId
// })
const dialog = ref()
const { show, deliverId, userId, taskId } = toRefs(props.jobDialog)

// 如果taskId
if (isEmpty(taskId.value)) {
  taskId.value = route.query.itemId
}

// 表格的查询条件
const tableForm = reactive({
  loading: false,
  homeworkSample: '[]', // 作业要求
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
const emits = defineEmits(['showJobDialog'])
// 点评
const showDialog = throttle(e => {
  e.deliverId = deliverId.value
  e.taskId = taskId.value
  e.homeworkSample = tableForm.homeworkSample
  emits('showJobDialog', e)
}, 700)

function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
resetSearch()

function getList() {
  getHomeWorkDetail({
    condition: {
      deliverId: deliverId.value,
      taskId: taskId.value,
      userId: userId.value
    },
    pageNum: tableForm.page.index,
    pageSize: tableForm.page.size
  })
    .then(res => {
      if (res.code === 0 && res.data.homeworksPage) {
        if (res.data.homeworkSample) {
          tableForm.homeworkSample = res.data.homeworkSample
        } else {
          tableForm.homeworkSample = '[]'
        }
        tableForm.listData = res.data.homeworksPage.records || []
        tableForm.page.total = res.data.homeworksPage.total || 0
      }

      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}
</script>
<style lang="scss" scoped>
.error_text {
  color: #ff0000;
  margin-top: 8px;
}
div {
  box-sizing: border-box;
}
.content_bottom {
  width: calc(100% - 16px);
  border-top: 1px solid #dcdee0;
  padding-top: 20px;
}
</style>
