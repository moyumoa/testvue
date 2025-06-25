<template>
  <div class="setting_block">
    <div class="setting_title">任务分发</div>
    <div class="setting_main">
      <!-- 任务形式 除了活动日历[目前就是任务列表]并且存在授权有效的KOC小程序并且有创建KOC任务权限才显示 如果是编辑，原本KOC的任务还要继续形式任务形式-->
      <el-form-item
        label="任务形式："
        prop="taskGroup"
        v-if="
          ((KOCInfo.hasKOC &&
            KOCInfo.isValid &&
            pageSource != 'ActCalendar' &&
            hasCreateKocPermission) ||
            (taskInfo.taskGroup == 3 && props.isEdit)) &&
          [1, 6].includes(taskType)
        "
      >
        <el-radio-group
          v-model="taskInfo.taskGroup"
          :disabled="disabled"
          @change="onChangeTaskGroup"
        >
          <el-radio :label="1">KOS任务</el-radio>
          <el-radio :label="3">KOC任务</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- KOS配置 -->
      <template v-if="taskInfo.taskGroup == 1">
        <el-form-item label="该任务属于：" prop="chooseOrgId" v-if="data.permissionList.length > 1">
          <el-radio-group v-model="taskInfo.chooseOrgId" :disabled="disabled" @change="onChangeOrg">
            <el-radio v-for="(item, index) in data.permissionList" :key="index" :label="item.orgId">
              {{ item.orgName }}
            </el-radio>
          </el-radio-group>
          <div class="tip small_tips">您当前有多个部门数据权限，请选择本次任务数据归属</div>
          <div class="tip small_tips">任务分发，只能分发给已选择的部门下成员</div>
        </el-form-item>
        <el-form-item label="分发人群：" prop="deliverType">
          <el-radio-group
            v-model="taskInfo.deliverType"
            :disabled="disabled"
            @change="onChangeDeliverType"
          >
            <el-radio :label="0">全部分发</el-radio>
            <el-radio :label="1">按部门分发</el-radio>
            <!-- <el-radio :label="2" v-if="showTalent" :disabled="!outsiderState">外部达人</el-radio> -->
          </el-radio-group>
          <div class="tip small_tips" v-if="taskInfo.deliverType === 0">分发给所有成员</div>
          <div class="tip small_tips" v-if="taskInfo.deliverType === 1">
            所选部门及其子部门的成员
          </div>
          <!-- <div class="tip small_tips" v-if="taskInfo.deliverType === 2">分发给所有外部达人</div> -->
          <choose-department
            ref="chooseDepartmentRef"
            v-if="taskInfo.deliverType == 1"
            @choose="onChooseDepartment"
            :keys="data.checkIds"
            :orgId="taskInfo.chooseOrgId"
            :autoLoad="false"
          >
            <template #default="{ showDialog }">
              <div class="flex_box">
                <!-- plain   -->
                <el-button type="primary" :disabled="disabled" @click="onShowDialog(showDialog)">
                  选择部门
                </el-button>
                <div
                  style="margin-left: 10px"
                  v-if="taskInfo.orgIds && taskInfo.orgs && taskInfo.orgs.length > 0"
                >
                  <template v-for="(x, y) in taskInfo.orgs" :key="y">
                    <span v-if="y < 3">
                      <span v-if="y > 0">、</span>
                      {{ x.orgName }}
                    </span>

                    <span v-if="y === 3">...等共{{ taskInfo.orgs.length }}个部门</span>
                  </template>
                </div>
              </div>
            </template>
          </choose-department>
          <div class="distribute_content" v-if="pageSource != 'growth'">
            <div class="one_content">
              <span>只分发给有授权账号的成员</span>
              <el-switch
                @change="_getDelivernum"
                class="content_switch"
                v-model="taskInfo.distributeOpen"
                :active-value="1"
                :inactive-value="0"
                inline-prompt
                :disabled="disabled"
              ></el-switch>
              <!-- active-text="开"
              inactive-text="关" -->
            </div>
            <div class="tip small_tips">开启后，没有授权账号的成员将不会被分发到任务</div>
          </div>
        </el-form-item>
        <el-form-item label="指定矩阵号分组：">
          <el-select
            style="width: 70%; margin-bottom: 10px"
            collapse-tags
            :reserve-keyword="false"
            filterable
            multiple
            v-model="taskInfo.groupIds"
            placeholder="请选择指定矩阵号分组"
            clearable
            @change="_getDelivernum"
            @clear="_getDelivernum"
            :disabled="disabled"
          >
            <el-option
              v-for="item in data.groupList"
              :key="item.id"
              :label="item.groupName"
              :value="item.id"
            ></el-option>
          </el-select>
          <div class="tip small_tips">可在分发人群的基础上，再筛选运营的矩阵号范围</div>
          <div class="tip small_tips">
            请注意矩阵号分组中的矩阵号，是矩阵号分组创建人员权限范围内的矩阵号
          </div>
        </el-form-item>
        <!-- <el-form-item
        :label="taskInfo.deliverType == 1 ? '按部门分发：' : '全部分发：'"
        prop="deliverNum"
      >
        <div>
          选择
          <span class="count">{{ data?.delivernum || 0 }}</span>
          个成员
        </div>

        <template v-if="taskInfo.deliverType !== 2">
          <div class="tip small_tips">
            指定任务分发到全部成员身上，若成员权限被关闭，则无法进行任务。
          </div>
          <div class="tip small_tips">在任务创建后，后续加入的成员也会接收任务</div>
        </template>
        <template v-if="taskInfo.deliverType == 2">
          <div class="tip small_tips">
            指定任务分发到外部达人身上，若外部达人权限被关闭，则无法进行任务。
          </div>
          <div class="tip small_tips">外部达人使用微信小程序承接任务</div>
        </template>
      </el-form-item> -->
        <el-form-item label="人群预览" prop="deliverNum">
          <div>
            预计分发成员人数约
            <span class="count">{{ data?.delivernum || 0 }}</span>
            人，任务创建后，后续新加入的成员也可参与任务
          </div>
        </el-form-item>
        <el-form-item
          label="倒计时通知："
          prop="countdown"
          v-if="pageSource != 'growth' && (taskType < 4 || taskType == 6)"
        >
          <div class="notice_box">
            <el-radio-group v-model="data.noticeSwitch" :disabled="disabled" @change="noticeChange">
              <el-radio :label="0">关闭</el-radio>
              <el-radio :label="1">开启</el-radio>
            </el-radio-group>
            <div class="notice_second" v-if="data.noticeSwitch">
              任务结束前
              <el-input-number
                style="width: 120px; margin: 0 8px"
                v-model="data.noticeTime"
                :disabled="disabled"
                :min="1"
                :max="99"
                :step="1"
                :precision="0"
                controls-position="right"
                @change="noticeTimeChange"
              />
              个小时发送任务通知
            </div>
            <div class="notice_third" v-if="data.noticeSwitch">
              预计在
              <span>{{ data.sendTime || '--' }}</span>
              ，系统会自动给还未参与过任务的员工发送一条任务通知
            </div>
          </div>
        </el-form-item>
      </template>
      <!-- KOC配置 -->
      <template v-if="taskInfo.taskGroup == 3">
        <el-form-item label="该任务属于：" prop="chooseOrgId" v-if="data.permissionList.length > 1">
          <el-radio-group v-model="taskInfo.chooseOrgId" :disabled="disabled" @change="onChangeOrg">
            <el-radio v-for="(item, index) in data.permissionList" :key="index" :label="item.orgId">
              {{ item.orgName }}
            </el-radio>
          </el-radio-group>
          <div class="tip small_tips">您当前有多个部门数据权限，请选择本次任务数据归属</div>
        </el-form-item>
        <el-form-item label="本次活动参与人数上限：" prop="joinLimitNum">
          <div>
            <el-input-number
              style="width: 120px; margin: 0 8px 0 0"
              v-model="data.joinLimitNum"
              :disabled="basicDisabled"
              :min="data.joinLimitMin"
              :max="data.joinLimitMax"
              :step="1"
              :precision="0"
              controls-position="right"
              @change="joinLimitNumChange"
            />
            人
          </div>
        </el-form-item>
      </template>
      <template v-if="showAiAudit">
        <el-form-item label="智能审核：" prop="multi_join_set">
          <!-- 编辑的时候 switch 不能编辑 不显示 -->
          <el-tooltip
            :disabled="!aiAuditDisabled || disabled"
            effect="dark"
            content="请前往【系统管理】-【通知管理】添加审核人员"
            placement="right"
          >
            <el-switch
              v-model="aiAuditSwitch"
              active-value="1"
              inactive-value="0"
              :disabled="disabled || aiAuditDisabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
            />
          </el-tooltip>
          <div class="switch_and_text">
            <div class="tip small_tips">
              开启后，终端员工创作的内容需要通过审核才能发布，智能审核将扣除5星力值/次，
            </div>
            <div class="tip small_tips">
              不通过重新审核将重复扣除星力值，请确保星力值余额充足，否则终端员工将无法提交审核
            </div>
          </div>
        </el-form-item>
        <el-form-item v-if="aiAuditSwitch === '1'" label="直接通过：" prop="aiAuditPass">
          <div class="quota_line">
            <el-input-number
              class="quota_line_input_number"
              v-model="aiAudit.passMin"
              :disabled="basicDisabled"
              :min="0"
              :max="100"
              :step="1"
              :precision="0"
              placeholder="最小值(含)"
              controls-position="right"
            />
            &nbsp;~&nbsp;
            <el-input-number
              class="quota_line_input_number"
              v-model="aiAudit.passMax"
              :disabled="basicDisabled"
              :min="aiAudit.passMin"
              :max="100"
              :step="1"
              placeholder="最大值(不含)"
              :precision="0"
              controls-position="right"
            />
            <span class="tips">综合得分在此区间的，将会直接通过，允许终端员工继续发布内容</span>
          </div>
        </el-form-item>
        <el-form-item v-if="aiAuditSwitch === '1'" label="直接驳回：" prop="aiAuditReject">
          <div class="quota_box">
            <div class="quota_line">
              <el-input-number
                class="quota_line_input_number"
                v-model="aiAudit.rejectMin"
                :disabled="basicDisabled"
                :min="0"
                :max="100"
                :step="1"
                :precision="0"
                placeholder="最小值(含)"
                controls-position="right"
              />
              &nbsp;~&nbsp;
              <el-input-number
                class="quota_line_input_number"
                v-model="aiAudit.rejectMax"
                :disabled="basicDisabled"
                :min="0"
                :max="100"
                :step="1"
                :precision="0"
                placeholder="最大值(不含)"
                controls-position="right"
              />
              <div class="tips">综合得分在此区间的，将会直接驳回，需要终端员工修改提交</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item v-if="aiAuditSwitch === '1'" label="">
          <div class="quota_tips">
            综合得分在“直接通过”和“直接驳回”之外的视频，将默认启用人工审核
          </div>
        </el-form-item>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { queryChildrenDeptIdsPage } from '@/api/market/operate_analysis.js'
import { getDelivernum, getOrgPermissionList } from '@/api/market/task'
import chooseDepartment from '@/views/market/components/choose_department.vue'
// import { getCkeyOfCvalue } from '../task_tools'
import api from '@/api/content_center/content_matrix.js'
import { dateFormat, isNotEmpty, getUserPermission } from '@/utils/tools.js'
import { RELEASE_TYPE } from '@/utils/dictionary/task'
import { getAuditTaskUser } from '@/api/market/operation.js'
import { useStore } from 'vuex'

const route = useRoute()
const props = defineProps({
  taskInfo: Object,
  disabled: Boolean,
  pageSource: String,
  taskType: Number,
  basicDisabled: Boolean,
  isEdit: Boolean // 是否编辑
})
const taskInfo = toRef(props, 'taskInfo')
const disabled = toRef(props, 'disabled')
const basicDisabled = toRef(props, 'basicDisabled') // 可以编辑  但是审核详情的时候会禁用
const message = inject('$message')
const emits = defineEmits(['updateDelivernum', 'updateValidate', 'getOffsetTop'])
const chooseDepartmentRef = ref(null)

const data = reactive({
  delivernum: 0,
  checkIds: [], // 部门选中的ID列表
  checkInfos: [], // 部门选中的详细信息
  groupList: [],
  permissionList: [],
  noticeSwitch: 0, // 倒计时通知开关
  noticeTime: 1, // 任务结束前x小时，默认我1
  sendTime: '', // 具体的发送时间
  joinLimitMin: 1, // 本次活动参与人数上限最小值  默认下限最小值是1 编辑的时候取任务里保存的上限人数
  joinLimitMax: 10000, // 本次活动参与人数上限最大值  默认上限最大值是10000 编辑的时候不能超过星力值余额
  joinLimitNum: 1 // 本次活动参与人数上限
})

// 获取分发人数
function _getDelivernum() {
  if (taskInfo.value.chooseOrgId === null || taskInfo.value.chooseOrgId === undefined) return
  const params = {
    userId: route.query.id
      ? taskInfo.value.createUserId
      : localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo')).userId
      : '',
    type: taskInfo.value.deliverType,
    chooseOrgId: taskInfo.value.chooseOrgId,
    groupIds: taskInfo.value.groupIds || [],
    distributeOpen: taskInfo.value.distributeOpen || 0
  }
  if (taskInfo.value.deliverType === 1) {
    params.orgIds = taskInfo.value.orgIds || ''
  }
  getDelivernum(params).then(res => {
    updateDelivernum(res.data)
  })
}

// 更新分发人数
function updateDelivernum(num) {
  data.delivernum = num
  emits('updateDelivernum', num)
}

// 获取任务数据权限列表
function _getOrgPermissionList() {
  getOrgPermissionList().then(res => {
    data.permissionList = res.data
    if (res.data.length === 1) {
      if (route.query.id && disabled.value) {
        return
      }
      taskInfo.value.chooseOrgId = data.permissionList[0].orgId
      _getDelivernum()
    }
  })
}

function onShowDialog(callback) {
  if (!taskInfo.value.chooseOrgId) {
    return message.warning('请先选择数据归属')
  }
  console.log(data.checkIds)
  chooseDepartmentRef.value.initDepart(
    {
      chooseOrgId: taskInfo.value.chooseOrgId
    },
    data.checkIds || [],
    data.checkInfos || []
  )

  callback && callback()
}

// 选择部门
function onChooseDepartment(nodes, orgs, nodeInfos) {
  data.checkIds = nodes || []
  data.checkInfos = nodeInfos || []
  console.log(nodes, ',nodes', orgs, 'orgs')
  taskInfo.value.orgs = orgs
  // taskInfo.value.orgIds = nodes.join(',')
  _getChildDepart(nodes)
}

// 选择分发方式
function onChangeDeliverType() {
  emits('updateValidate', 'deliverType')
  data.delivernum = 0
  taskInfo.value.orgs = []
  data.checkIds = []
  data.checkInfos = []
  if (Number(taskInfo.value.deliverType) !== 1) {
    taskInfo.value.orgIds = ''
    updateDelivernum(0)
    _getDelivernum()
  }
}

// 选择组织架构权限
function onChangeOrg() {
  taskInfo.value.orgIds = ''
  taskInfo.value.orgs = []
  data.checkIds = []
  data.checkInfos = []
  if (Number(taskInfo.value.deliverType) === 1) {
    updateDelivernum(0)
  } else {
    _getDelivernum()
  }
}
// 根据部门ID获取子部门
function _getChildDepart(nodes) {
  queryChildrenDeptIdsPage({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : null,
    departmentIds: nodes
  })
    .then(res => {
      if (res.code === 0) {
        taskInfo.value.orgIds = res.data && res.data.length > 0 ? res.data.join(',') : ''
      } else {
        taskInfo.value.orgIds = ''
      }
      emits('updateValidate', 'deliverType')
      _getDelivernum()
    })
    .catch(() => {
      taskInfo.value.orgIds = ''
      _getDelivernum()
    })
}
// const showTalent = computed(() => {
//   const videoType = getCkeyOfCvalue(taskInfo.value, 'video_set', 'video_push_mode')
//   return !videoType || (videoType && videoType.search(/[2]+/) === -1)
// })
// 矩阵号分组
function _getNewGroupList() {
  api.getNewGroupList({}).then(res => {
    if (res.code === 0) {
      data.groupList = res.data || []
    }
  })
}

// 选择任务形式
function onChangeTaskGroup() {
  console.log('选择任务形式', taskInfo.value.taskGroup)
  emits('getOffsetTop')
}

// KOC活动参与人数上限
function joinLimitNumChange(e) {
  props.taskInfo.infoConfigs.forEach(item => {
    if (item.ckey === 'join_limit_num') {
      item.cvalue = e
      emits('updateValidate', 'joinLimitNum')
    }
  })
}

onMounted(() => {
  console.log('mounted', props.isEdit)
  _getDelivernum()
  _getOrgPermissionList()
  _getNewGroupList()
  // 获取KOC下的任务参与人数上限
  const joinLimitNumInfo = props.taskInfo.infoConfigs.find(item => item.ckey === 'join_limit_num')
  data.joinLimitNum =
    isNotEmpty(joinLimitNumInfo) && isNotEmpty(joinLimitNumInfo.cvalue)
      ? parseInt(joinLimitNumInfo.cvalue)
      : 1
  if (props.isEdit) {
    data.joinLimitMin = data.joinLimitNum
  }
  // 按部门分发的数据回显  orgs是新加的字段，用于部门数据回显。
  if (taskInfo.value.orgs && taskInfo.value.orgs.length > 0) {
    const orgs = taskInfo.value.orgs
    const ids = []
    orgs.forEach(x => {
      ids.push(x.orgId)
    })
    data.checkIds = ids
  } else {
    data.checkIds = []
  }

  data.checkInfos = []
  // 指定矩阵号分组的数据回显
  if (taskInfo.value.groups && taskInfo.value.groups.length > 0) {
    const groupIds = []
    taskInfo.value.groups.forEach(x => {
      groupIds.push(x.id)
    })
    taskInfo.value.groupIds = groupIds
  }
  // 任务倒计时回显
  if (taskInfo.value.countdown) {
    data.noticeSwitch = 1
    data.noticeTime = parseInt(parseInt(taskInfo.value.countdown) / 60)
    getSendTime()
  } else {
    data.noticeSwitch = 0
    data.noticeTime = 1
    getSendTime()
  }
  if (aiAuditSwitch.value === '1') {
    // 审核回显
    initAuditInfo()
  }

  // 获取内容审核人员信息
  getAuditTaskUser({
    type: 4
  }).then(res => {
    if (res.code === 0) {
      aiAuditDisabled.value = res.data?.length === 0
      // 编辑的时候不修改 复制的任务的时候需要修改
      if (!disabled.value) {
        if (aiAuditDisabled.value) {
          aiAuditSwitch.value = '0'
        }
      }
    }
  })
  console.log(data.checkIds, 'mounted')
})
const store = useStore()
const KOCInfo = computed(() => store.state.app.KOCInfo)
// const isAdmin = computed(() => store.state.user.isAdmin)
// 任务通知的开关修改
function noticeChange(e) {
  console.log('开关', e)
  taskInfo.value.countdown = e === 0 ? 0 : parseInt(data.noticeTime) * 60 || 60
  getSendTime()
  emits('updateValidate', 'countdown')
}
// 任务倒计时修改
function noticeTimeChange(e) {
  console.log('倒计时', e)
  taskInfo.value.countdown = parseInt(e) * 60
  getSendTime()
  emits('updateValidate', 'countdown')
}
function getSendTime() {
  data.sendTime = taskInfo.value.endTime
    ? dateFormat(
        new Date(
          new Date(taskInfo.value.endTime).getTime() -
            parseInt(taskInfo.value.countdown) * 60 * 1000
        ),
        'YYYY-MM-DD hh:mm:ss'
      )
    : ''
}
// 获取结束时间
watch(
  () => taskInfo.value.endTime,
  value => {
    getSendTime()
  },
  { deep: true }
)

// 任务配置
const videoConfig = computed(() => {
  return props.taskInfo.infoConfigs.find(item => item.ckey === 'video_set')
})

// 发布方式
const pushMode = computed(() => {
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_push_mode') {
      return Number(config.cvalue)
    }
  }
})
// 转发模式关闭审核
watch(
  () => pushMode.value,
  val => {
    if (val === 4) {
      aiAuditSwitch.value = '0'
    }
  }
)
// 显示智能审核
const showAiAudit = computed(() => {
  // 图文/视频任务自由创作、模版合成才显示审核配置项
  return (
    [1, 6].includes(props.taskType) &&
    [RELEASE_TYPE.get('upload'), RELEASE_TYPE.get('sumvideo')].includes(pushMode.value)
  )
})

const aiAuditDisabled = ref(false)
const aiAudit = ref({
  passMin: undefined,
  passMax: undefined,
  rejectMin: undefined,
  rejectMax: undefined
})
watch(
  () => aiAudit.value,
  val => {
    updateAuditInfo(val)
  },
  { deep: true }
)
const initAuditInfo = () => {
  props.taskInfo.infoConfigs.forEach(item => {
    if (item.ckey === 'video_intelligent_audit_pass') {
      const tempData = JSON.parse(item.cvalue)
      aiAudit.value.passMin = Number(tempData.minValue)
      aiAudit.value.passMax = Number(tempData.maxValue)
    }
    if (item.ckey === 'video_intelligent_audit_reject') {
      const tempData = JSON.parse(item.cvalue)
      aiAudit.value.rejectMin = Number(tempData.minValue)
      aiAudit.value.rejectMax = Number(tempData.maxValue)
    }
  })
}

const updateAuditInfo = newValue => {
  props.taskInfo.infoConfigs.forEach(item => {
    if (item.ckey === 'video_intelligent_audit_pass') {
      item.cvalue = JSON.stringify({
        minValue: newValue.passMin,
        maxValue: newValue.passMax
      })
    }
    if (item.ckey === 'video_intelligent_audit_reject') {
      item.cvalue = JSON.stringify({
        minValue: newValue.rejectMin,
        maxValue: newValue.rejectMax
      })
    }
    emits('updateValidate', 'aiAuditPass')
    emits('updateValidate', 'aiAuditReject')
  })
}

// 智能审核开关
const aiAuditSwitch = computed({
  get() {
    return (
      props.taskInfo.infoConfigs.find(item => item.ckey === 'video_intelligent_audit')?.cvalue ||
      '0'
    )
  },
  set(val) {
    props.taskInfo.infoConfigs.forEach(item => {
      if (item.ckey === 'video_intelligent_audit') {
        item.cvalue = val
      }
    })
  }
})

const hasCreateKocPermission = ref(false)

onMounted(() => {
  // 创建KOC任务权限
  hasCreateKocPermission.value = !!getUserPermission('koc_create')
})
</script>

<style lang="scss" scoped>
.count {
  color: #364fcd;
  font-size: 14px;
}
.small_tips {
  line-height: 17px;
  margin-bottom: 4px;
}

:deep .el-radio-group {
  height: auto;
}
.flex_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 10px 0;
}
:deep(.el-select .el-select__tags .el-tag) {
  margin: 2px 0px 2px 6px;
}
.distribute_content {
  .one_content {
    margin-bottom: 4px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .content_switch {
    margin-left: 8px;
  }
}
.notice_box {
  .notice_third {
    color: #c0c4cc;
    font-size: 14px;
    span {
      color: #364fcd;
    }
  }
}
// 智能审核
.switch_and_text {
  width: 800px;
  display: flex;
  flex-direction: column;
  color: #c0c4cc;
}
.quota_line {
  width: 800px;
  display: flex;
  flex-direction: row;
  align-items: center;
  .label {
    color: #606266;
    font-size: 14px;
    line-height: 20px;
  }
  .quota_line_input_number {
    width: 140px;
  }
  .tips {
    color: #c0c4cc;
    font-size: 12px;
    line-height: 20px;
    margin-left: 8px;
  }
}
.quota_tips {
  margin-top: -5px;
  color: #364fcd;
}
</style>
