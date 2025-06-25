<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    width="540px"
    title="11"
    custom-class="calendar_dialog"
    :show-close="false"
  >
    <template #title>
      <div class="dialog_head">
        <div class="head_title">
          <img v-if="$data.taskInfo.type === 2" src="@/assets/images/task/live.png" />
          <img v-if="$data.taskInfo.type === 1" src="@/assets/images/task/video.png" />
          {{ $data.taskInfo.name || '--' }}
        </div>
        <div class="head_gary">{{ $data.orgName || '--' }}</div>
        <div class="head_gary">
          任务时间：{{ $data.taskInfo.startTime ? $data.taskInfo.startTime.split(' ')[0] : '--' }} ~
          {{ $data.taskInfo.endTime ? $data.taskInfo.endTime.split(' ')[0] : '--' }}
        </div>
        <div class="head_seal">
          <img v-if="$data.taskInfo.status === 0" src="@/assets/images/task/status0.png" />
          <img v-if="$data.taskInfo.status === 1" src="@/assets/images/task/status1.png" />
          <img v-if="$data.taskInfo.status === 2" src="@/assets/images/task/status2.png" />
          <img v-if="$data.taskInfo.status === 3" src="@/assets/images/task/status3.png" />
          <img v-if="$data.taskInfo.status === 4" src="@/assets/images/task/status4.png" />
          <img v-if="$data.taskInfo.status === 5" src="@/assets/images/task/status5.png" />
          <img v-if="$data.taskInfo.status === 6" src="@/assets/images/task/status6.png" />
          <img v-if="$data.taskInfo.status === 7" src="@/assets/images/task/status7.png" />
        </div>
        <div class="head_close" @click="handleClose('none')">
          <el-icon><i-close /></el-icon>
        </div>
      </div>
    </template>
    <div class="dialog_content" v-loading="$data.loading">
      <!-- 切换区 -->
      <div class="content_top">
        <div
          :class="{ one_top: true, active_top: $data.chooseTop === item.value }"
          v-for="(item, index) in $data.topList"
          :key="index"
          @click="$data.chooseTop = item.value"
        >
          {{ item.label }}
        </div>
      </div>
      <!-- 内容 -->
      <div class="content_content">
        <div class="content1" v-if="$data.chooseTop === 1">
          <div>任务名称：{{ $data.taskInfo.name || '--' }}</div>
          <div>任务简介：{{ $data.taskInfo.taskInfo || '--' }}</div>
          <div>开始时间：{{ $data.taskInfo.startTime || '--' }}</div>
          <div>结束时间：{{ $data.taskInfo.endTime || '--' }}</div>
          <div>任务类型：{{ TASK_TYPE.getCN($data.taskInfo.type) }}任务</div>
          <div>任务状态：{{ TASK_STATUS.getCN($data.taskInfo.status) }}</div>
          <div>分发人数：{{ wanSliceFormat($data.taskInfo.deliverCount || 0, false, true) }}人</div>
          <div>创建人：{{ $data.taskInfo.taskCreateUserName || '--' }}</div>
          <div>创建时间：{{ $data.taskInfo.gmtCreate || '--' }}</div>
        </div>
        <div class="content2" v-else>
          <div class="content2_left">
            <div>分发人数：{{ wanSliceFormat($data.taskData.deliverCnt || 0, false, true) }}人</div>
            <div>完成人数：{{ wanSliceFormat($data.taskData.finishCnt || 0, false, true) }}人</div>
            <div v-if="$data.taskInfo.type === 1">
              视频数：{{ wanSliceFormat($data.taskData.videoCnt || 0, false, true) }}
            </div>
            <div v-if="$data.taskInfo.type === 1">
              点赞数：{{ wanSliceFormat($data.taskData.diggCnt || 0, false, true) }}
            </div>
            <div v-if="$data.taskInfo.type === 1">
              分享数：{{ wanSliceFormat($data.taskData.shareCnt || 0, false, true) }}
            </div>
            <div v-if="$data.taskInfo.type === 1">
              留资数：{{ wanSliceFormat($data.taskData.retentionCnt || 0, false, true) }}
            </div>
            <div v-if="$data.taskInfo.type === 2">
              直播场次：{{ wanSliceFormat($data.taskData.liveCnt || 0, false, true) }}
            </div>
            <div v-if="$data.taskInfo.type === 2">
              观看人次：{{ wanSliceFormat($data.taskData.watchCnt || 0, false, true) }}
            </div>
            <div>发放金币：{{ wanSliceFormat($data.taskData.goldCnt || 0, false, true) }}</div>
          </div>
          <div class="content2_right">
            <div>参与人数：{{ wanSliceFormat($data.taskData.joinCnt || 0, false, true) }}人</div>
            <div>
              参与率：{{
                $data.taskData.deliverCnt && $data.taskData.deliverCnt != '0'
                  ? parseFloat(
                      (($data.taskData.joinCnt || 0) / ($data.taskData.deliverCnt || 0)) * 100
                    ).toFixed(2)
                  : 0
              }}%
            </div>
            <div v-if="$data.taskInfo.type === 1">
              播放数：{{ wanSliceFormat($data.taskData.playCnt || 0, false, true) }}
            </div>
            <div v-if="$data.taskInfo.type === 1">
              评论数：{{ wanSliceFormat($data.taskData.commentCnt || 0, false, true) }}
            </div>
            <div v-if="$data.taskInfo.type === 2">
              直播时长：{{
                wanSliceFormat(parseInt(($data.taskData.liveDuration || 0) / 1000 / 60))
              }}分钟
            </div>
            <div v-if="$data.taskInfo.type === 2">
              留资数：{{ wanSliceFormat($data.taskData.retentionCnt || 0, false, true) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog_footer">
        <div class="footer_left">
          <el-link
            class="left_btn"
            type="primary"
            v-if="showBtnFun($data.taskInfo.status, 'copy') && showBtnFunFromActivity()"
            @click="copyTask"
          >
            复制
          </el-link>
          <el-link
            class="left_btn"
            type="primary"
            v-if="showBtnFun($data.taskInfo.status, 'start') && showBtnFunFromActivity()"
            @click="setTaskStatus(1, $data.taskInfo.id)"
          >
            开启
          </el-link>
          <el-link
            class="left_btn"
            type="primary"
            v-if="showBtnFun($data.taskInfo.status, 'pause') && showBtnFunFromActivity()"
            @click="setTaskStatus(2, $data.taskInfo.id)"
          >
            暂停
          </el-link>
          <el-link
            class="left_btn"
            type="primary"
            v-if="showBtnFun($data.taskInfo.status, 'end') && showBtnFunFromActivity()"
            @click="setTaskStatus(3, $data.taskInfo.id)"
          >
            终止
          </el-link>
          <el-link
            class="left_btn"
            type="primary"
            v-if="showBtnFun($data.taskInfo.status, 'del') && showBtnFunFromActivity()"
            @click="delTask($data.taskInfo.id, 'dialog')"
          >
            删除
          </el-link>
        </div>
        <div class="footer_right">
          <el-button
            :disabled="$data.btnDis"
            v-if="
              $data.taskInfo.taskGroup !== 3 &&
              showBtnFun($data.taskInfo.status, 'message') &&
              showBtnFunFromActivity()
            "
            @click="dialogVisible = true"
          >
            发送通知
          </el-button>
          <el-button
            type="primary"
            v-if="
              showBtnFun($data.taskInfo.status, 'edit', $data.taskInfo.createUserId) &&
              showBtnFunFromActivity()
            "
            @click="editTask"
          >
            编辑
            <!-- {{
              $data.taskInfo.status === 1 ||
              $data.taskInfo.status === 3 ||
              $data.taskInfo.status === 4 ||
              ($data.taskInfo.status === 2 && $data.taskInfo.createUserId === userId)
                ? '编辑'
                : '详情'
            }} -->
          </el-button>

          <el-button
            :disabled="$data.btnDis"
            @click="toDetail()"
            v-if="
              $data.taskInfo.id &&
              showBtnFun($data.taskInfo.status, 'detail', $data.taskInfo.createUserId)
            "
          >
            详情
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
  <task-notice-dialog v-model="dialogVisible" @confirm="saveMessageFun"></task-notice-dialog>
</template>
<script setup>
import TaskNoticeDialog from '../../marketing_task/components/task_notice_dialog.vue'
import taskListOfAction from '../../marketing_task/components/js/task_list_action'
import { TASK_TYPE, TASK_STATUS } from '@/utils/dictionary/task'
import { taskSimpleDetail } from '@/api/market/calendar.js'
import { throttle, wanSliceFormat } from '@/utils/tools.js'
const props = defineProps({
  detailDialog: {
    type: Object,
    default: () => {
      return {
        show: false, // 是否显示弹窗
        id: null
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.detailDialog, 'show')
const $data = reactive({
  orgName: '',
  taskInfo: {},
  taskData: {},
  id: null,
  loading: false,
  btnDis: false,
  isAction: false, // 是否点过开启、终止、暂停三个按钮
  topList: [
    {
      label: '基本信息',
      value: 1
    },
    {
      label: '数据',
      value: 2
    }
  ],
  chooseTop: 1
})
// 初始化弹窗
function init() {
  if (props.detailDialog.id) {
    $data.loading = true
    $data.id = props.detailDialog.id
    _getTaskInfoView()
  }
}
init()
// 获取任务详情
function _getTaskInfoView() {
  taskSimpleDetail({
    taskId: $data.id
  })
    .then(res => {
      if (res.code === 0) {
        // console.log('获取打开弹窗的任务详情', res)
        $data.orgName = res.data.orgName
        $data.taskInfo = res.data.info
        $data.taskData = res.data.stat
      }
    })
    .finally(() => {
      $data.loading = false
    })
}
const userId = ref('')
userId.value = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo')).userId + ''
  : ''
// 根据任务状态显示对应的操作按钮
function showBtnFun(status, action, createUserId) {
  let show = false
  switch (action) {
    case 'copy':
      show = status >= 0
      break
    case 'edit':
      show =
        status === 1 ||
        (status === 2 && createUserId === userId.value) ||
        status === 3 ||
        status === 4
      // show = status >= 0 && status !== 5
      break
    case 'start':
      show = status === 1 || status === 5
      break
    case 'pause':
      show = status === 4
      break
    case 'end':
      show = status === 5
      break
    case 'del':
      show = status === 1 || status === 2 || status === 3 || status === 4 || status === 5
      break
    case 'message':
      show = status === 3 || status === 4 || status === 5
      break
    case 'detail':
      // show =
      //   status === 0 ||
      //   status === 7 ||
      //   status === 6 ||
      //   (status === 2 && createUserId !== userId.value)
      show =
        status === 1 || status === 3 || status === 4 || status === 5 || status === 6 || status === 7
      break
    default:
      break
  }
  return show
}
// 从编辑或创建活动进入showButs: 'onlyDetail'
function showBtnFunFromActivity() {
  if (!props.detailDialog.showButs) return true
  if (props.detailDialog.showButs === 'onlyDetail') return false
}

const vm = getCurrentInstance()
const { setTaskStatus, delTask, sendPass } = taskListOfAction(
  vm,
  {},
  _getTaskInfoView,
  handleClose,
  $data
)
// 发送通知
const dialogVisible = ref(false)
// const openNoticeDialog = () => {
//   dialogVisible.value = true
// currentItemId.value = id
// }
const saveMessageFun = function () {
  dialogVisible.value = false
  sendPass($data.taskInfo.id)
}

const emits = defineEmits(['updateList', 'showTaskInitDialog', 'showDeteDialog'])
// 修改任务
const editTask = throttle(status => {
  const returnQuery = {
    id: $data.id,
    type: $data.taskInfo.type,
    disEdit: status === 'none' ? 1 : 0
  }
  if ($data.taskInfo.activityStartTime || $data.taskInfo.activityEndTime) {
    returnQuery.initInfo = {
      timeChoseDisabled: true,
      startTime: $data.taskInfo.activityStartTime,
      endTime: $data.taskInfo.activityEndTime
    }
  }
  emits('showTaskInitDialog', returnQuery)
  dialog.value.handleClose()
}, 700)
const taskTypeEnums = {
  1: {
    name: '发布任务',
    path: 'video_task/video_task_details',
    type: 1,
    joinCountTips: ['上传视频：成功上传视频', '拍摄视频：成功发布视频', '一键转发：确认转发视频'],
    finishCountTips: [
      '上传视频：成功发布到线上通过（官方或前置审核通过）',
      '拍摄视频：按照任务的要求（小程序挂载、话题）设置',
      '一键转发：成功发布到线上通过（官方审核通过）'
    ]
  },
  2: {
    name: '直播任务',
    path: 'live_task/live_task_details',
    type: 2,
    joinCountTips: ['挂载小程序：检测到有直播', '不挂载小程序：选择直播记录既参与和完成任务'],
    finishCountTips: ['挂载小程序：直播挂载路径正确', '不挂载小程序：选择直播记录既参与和完成任务']
  },
  3: {
    name: '征集任务',
    path: 'collecting_task/detail',
    type: 3,
    joinCountTips: ['成功上传任意素材/视频'],
    finishCountTips: ['任务素材/视频审核全部通过']
  },
  4: {
    name: '学习任务',
    path: 'study_task/detail',
    type: 5,
    finishCountTips: ['观看时长>=创建任务时设置的浏览时长']
  },
  6: {
    name: '图文任务',
    path: 'imgText_task/imgText_task_details',
    type: 6,
    joinCountTips: ['上传图文、一键转发：确认参与任务进入到发布页', '模板发布：确认合成图文'],
    successCountTips: ['成功发布到线上'],
    finishCountTips: ['达到最低指标'],
    numberOfPeopleTips: [
      '已分发人数：任务实际已经分发到的人数 ',
      '注：因组织架构及人员变动，“已分发人数”与“预计分发人数”可能不一致；',
      '系统会在任务开始前48h左右触发补偿机制，保证任务能覆盖到归属部门下的所有达人'
    ]
  }
}
// 查看数据
const toDetail = throttle(status => {
  window.open(
    `/content_market/${taskTypeEnums[$data.taskInfo.type].path}?itemId=${$data.taskInfo.id}&type=${
      $data.taskInfo.type
    }`,
    '_blank'
  )
}, 700)
// 复制任务
const copyTask = throttle(() => {
  emits('showTaskInitDialog', {
    copyId: $data.id,
    type: $data.taskInfo.type
  })
  dialog.value.handleClose()
}, 700)
// 弹窗关闭
function handleClose(status) {
  if (status === 'none' && !$data.isAction) {
    if (props.detailDialog.origin === 'dateDialog') {
      emits('showDeteDialog')
    }
  } else {
    emits(
      'updateList',
      props.detailDialog.origin === 'dateDialog' ? 'showDateDialog' : '',
      $data.isAction
        ? { startTime: $data.taskInfo.startTime, endTime: $data.taskInfo.endTime }
        : null
    )
  }

  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  border-top: 1px solid #dcdee0;
  border-bottom: 1px solid #dcdee0;
  padding: 12px 16px 16px;
  .content_top {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .one_top {
      cursor: pointer;
      width: 68px;
      height: 24px;
      border-radius: 2px;
      margin-right: 4px;
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 24px;
      text-align: center;
      &:hover {
        color: #364fcd;
      }
    }
    .active_top {
      background: #e9edfb;
      color: #364fcd;
    }
  }
  .content_content {
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
    .content1 {
      padding-top: 4px;
      div {
        margin-top: 8px;
      }
    }
    .content2 {
      padding-top: 4px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      .content2_left,
      .content2_right {
        width: 50%;
        div {
          margin-top: 8px;
        }
      }
    }
  }
}
.dialog_head {
  width: 100%;
  margin: 0 -8px;
  .head_title {
    margin-bottom: 8px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    line-height: 24px;
    padding-right: 10px;
    img {
      width: 20px;
      height: 20px;
      object-fit: cover;
      margin-right: 6px;
    }
  }
  .head_gary {
    margin-top: 6px;
    font-size: 14px;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
  }
  .head_seal {
    position: absolute;
    right: 50px;
    top: 28px;
    img {
      width: 64px;
      height: 64px;
      object-fit: cover;
    }
  }
  .head_close {
    cursor: pointer;
    position: absolute;
    right: 20px;
    top: 20px;
    color: #909399;
    font-size: 16px;
    &:hover {
      color: #364fcd;
    }
  }
}
.dialog_footer {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 32px;
}
.left_btn + .left_btn {
  margin-left: 16px;
}
</style>
