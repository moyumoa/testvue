<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      width="960px"
      title="上传记录"
      custom-class="rule_setting_dialog rule_setting_form_dialog hide_footer_line"
    >
      <div class="dialog_content">
        <xm_table
          class="pic_table"
          v-loading="tableForm.loading"
          :data="tableForm.listData"
          v-model:page="tableForm.page"
          @getTableData="getList"
          :tableHeight="500"
        >
          <el-table-column label="模型名称" min-width="170">
            <template #default="scope">
              {{ scope.row.name || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="模型视频" width="110">
            <template #default="scope">
              <div class="video_box" style="cursor: pointer" @click="previewFun(scope.row)">
                <img class="cover_url" :src="scope.row.shadeImg || scope.row.coverUrl" alt="" />
                <img
                  v-if="showPlay(scope.row)"
                  class="video_play"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230308mdq3m.png"
                  alt=""
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="上传人" width="150">
            <template #default="scope">
              {{ scope.row.createUserName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="上传时间" width="160">
            <template #default="scope">
              {{ scope.row.submitTime || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="审核状态" width="120">
            <template #default="scope">
              <div class="status_style">
                <div
                  v-if="scope.row.status && statusList.get(scope.row.status)"
                  :class="
                    'status_circle ' +
                    (statusList.get(scope.row.status) ? statusList.get(scope.row.status).class : '')
                  "
                ></div>
                <div>
                  {{
                    statusList.get(scope.row.status) ? statusList.get(scope.row.status).label : '-'
                  }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="原因" min-width="200">
            <template #default="scope">
              <div
                v-if="
                  (scope.row.status === 5 && scope.row.auditMsg) ||
                  (scope.row.status == 8 && scope.row.errorMsg)
                "
              >
                <el-tooltip
                  class="item"
                  effect="dark"
                  placement="top"
                  popper-class="record_result_popper"
                >
                  <div class="reason_box line-hidden2 reason_tool_box">
                    {{
                      scope.row.status == 5
                        ? scope.row.auditMsg || '-'
                        : scope.row.status == 8
                        ? scope.row.errorMsg || '-'
                        : '-'
                    }}
                  </div>
                  <template #content>
                    <div class="reason_box reason_content_box">
                      {{
                        scope.row.status == 5
                          ? scope.row.auditMsg || '-'
                          : scope.row.status == 8
                          ? scope.row.errorMsg || '-'
                          : '-'
                      }}
                    </div>
                  </template>
                </el-tooltip>
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
        </xm_table>
      </div>
    </el-dialog>
    <!-- 预览弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
  </div>
</template>
<script setup>
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import { throttle } from '@/utils/tools.js'
import { listAllFaceModel } from '@/api/sumvideo/digital_model.js'

const props = defineProps({
  recordDialog: {
    type: Object,
    default: () => {
      return {
        id: null,
        info: null,
        type: 1, // 1面部模型 2 人物模型
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
// 1待建模 2 系统预处理中 3 审核中 4已过审 5未过审 6建模中 7建模成功 8失败 9已关闭（废弃） 10待建模
const statusList1 = ref(
  new Map([
    [1, { label: '审核中', class: '' }],
    [2, { label: '审核中', class: '' }],
    [3, { label: '审核中', class: '' }],
    [4, { label: '审核中', class: '' }],
    [5, { label: '审核失败', class: 'red_circle' }],
    [6, { label: '审核中', class: '' }],
    [7, { label: '审核通过', class: 'green_circle' }],
    [8, { label: '审核失败', class: 'red_circle' }],
    [9, { label: '审核失败', class: 'red_circle' }],
    [10, { label: '审核中', class: '' }]
  ])
)
const statusList2 = ref(
  new Map([
    [1, { label: '审核中', class: '' }],
    [2, { label: '审核中', class: '' }],
    [3, { label: '审核中', class: '' }],
    [4, { label: '审核通过', class: 'green_circle' }],
    [5, { label: '审核失败', class: 'red_circle' }],
    [6, { label: '审核中', class: '' }],
    [7, { label: '审核通过', class: 'green_circle' }],
    [8, { label: '审核失败', class: 'red_circle' }],
    [9, { label: '审核失败', class: 'red_circle' }],
    [10, { label: '审核中', class: '' }]
  ])
)
const statusList = ref(null)
const dialog = ref()
const show = toRef(props.recordDialog, 'show')

// 表格的查询条件
const tableForm = reactive({
  loading: true,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
function init() {
  tableForm.loading = true
  tableForm.page.index = 1
  statusList.value = props.recordDialog.type === 1 ? statusList1.value : statusList2.value
  getList()
}
init()
function getList() {
  listAllFaceModel({
    source: 2,
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    modelType: props.recordDialog.type,
    orderSetting: 'DESC:submit_time',
    searchCount: true
  })
    .then(res => {
      if (res.code === 0) {
        tableForm.listData = res.data.records || []
        tableForm.page.total = res.data.total || 0
      } else {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
        }
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}
// 播放视频
const previewInfo = ref({
  show: false
})
function showPlay(e) {
  return (
    (props.recordDialog.type === 1 &&
      e.status &&
      statusList.value.get(e.status).label !== '审核通过') ||
    props.recordDialog.type === 2
  )
}
const previewFun = throttle(e => {
  if (props.recordDialog.type === 1) {
    if (e.status && statusList.value.get(e.status).label !== '审核通过') {
      previewInfo.value = {
        show: true,
        title: '查看视频',
        url: e.videoUrl,
        type: 'video',
        cover: e.coverUrl || ''
      }
    } else {
      previewInfo.value = {
        show: true,
        title: '查看模型',
        url: e.coverUrl,
        type: 'image',
        cover: ''
      }
    }
  } else if (props.recordDialog.type === 2) {
    if (e.status && statusList.value.get(e.status).label !== '审核通过') {
      previewInfo.value = {
        show: true,
        title: '查看视频',
        url: e.videoUrl,
        type: 'video',
        cover: e.coverUrl || ''
      }
    } else {
      previewInfo.value = {
        show: true,
        title: '查看模型',
        url: e.videoUrl,
        type: 'digitalVideo',
        cover: e.shadeImg || '',
        maskPosition: JSON.parse(e.maskPosition)
      }
    }
  }
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  padding: 16px 16px 20px;
  width: 100%;
}
.cover_url {
  width: 60px;
  height: 80px;
  display: flex;
  border-radius: 2px;
  object-fit: cover;
}
.video_box {
  width: 60px;
  height: 80px;
  margin: 10px 0;
  position: relative;
  .video_play {
    width: 28px;
    height: 28px;
    display: flex;
    position: absolute;
    left: 16px;
    top: 26px;
    cursor: pointer;
  }
}
:deep(.is-horizontal) {
  display: none !important;
}
.reason_box {
  white-space: pre-wrap;
  word-break: break-all;
}
.reason_content_box {
  max-width: 300px;
  max-height: 20vh;
  overflow-y: auto;
  padding: 0 10px;
}
.reason_tool_box {
  max-width: 100%;
  width: max-content;
}
:deep(.dialog_content .el-table__empty-text) {
  line-height: 440px;
}
</style>
