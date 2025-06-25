<template>
  <div>
    <g-tabs v-if="isWeChat" :data="tabs" v-model:current="currentTab" />
    <div v-if="currentTab === 'noticeManagement'" class="notice_manage">
      <!-- 日报提醒 飞书和企微有 -->
      <div class="section" v-if="!isWeiXin">
        <div class="title">日报提醒</div>
        <div class="notice">
          <div class="label" style="align-items: flex-start">日报提醒：</div>
          <div class="noticeContent">
            <el-switch
              :model-value="state.openDailyMessage"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @click="editRole('daily', state.openDailyMessage)"
            ></el-switch>
            <div class="tips">
              开启后，每天15:00将给设置的角色发送{{
                isWeChat ? '企业微信' : '飞书'
              }}消息，推送矩阵账号日报
            </div>
          </div>
        </div>
        <div class="notice mt_16" v-if="state.openDailyMessage">
          <div class="label" style="line-height: 24px; height: 24px">提醒角色：</div>
          <div class="noticeContent">
            <el-tag class="role_item" v-for="(item, index) in dailyRole" :key="index">
              {{ item }}
            </el-tag>
            <el-link style="line-height: 24px" type="primary" @click="editRole('daily')">
              编辑
            </el-link>
          </div>
        </div>
        <div class="notice mt_10" v-if="state.openDailyMessage">
          <div class="label" style="line-height: 20px">提&ensp;醒&ensp;群：</div>
          <div
            v-if="feishu.length > 0"
            class="label"
            style="line-height: 20px; white-space: normal"
          >
            <template v-for="(item, index) in feishuBrr" :key="index">
              {{ index === feishu.length - 1 ? item : item + '/' }}
            </template>
          </div>
        </div>
      </div>
      <!-- :style="{ width: isWeiXin ? '100%;' : '' }" -->
      <div
        class="section"
        :class="isWeiXin ? 'section_hide_wx' : 'section_show_wx'"
        style="margin-right: unset"
        v-if="systemVersion == 3"
      >
        <div class="title">开播提醒</div>
        <div class="notice" style="align-items: flex-start">
          <div class="label">开播提醒：</div>
          <div class="noticeContent">
            <el-switch
              :model-value="state.openLiveroomStartMessage"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @click="editRole('live', state.openLiveroomStartMessage)"
            ></el-switch>
            <!-- @change="val => setData(val, 'openLiveroomStartMessage')" -->
            <div class="tips">
              开启后，矩阵账号开播，将给设置的角色推送{{
                isWeChat ? '企业微信' : isWeiXin ? '微信公众号' : '飞书'
              }}消息
            </div>
          </div>
        </div>
        <div
          class="notice mt_16"
          v-if="state.openLiveroomStartMessage"
          style="align-items: flex-start"
        >
          <div class="label" style="line-height: 24px; height: 24px">提醒角色：</div>
          <div class="noticeContent">
            <el-tag class="role_item" v-for="(item, index) in liveRole" :key="index">
              {{ item }}
            </el-tag>
            <el-link style="line-height: 24px" type="primary" @click="editRole('live')">
              编辑
            </el-link>
          </div>
        </div>
      </div>
      <div
        class="section section_tips"
        :style="{ marginRight: isWeiXin ? '0' : '' }"
        v-resize="noticeResize"
      >
        <div class="title">矩阵号授权失效提醒</div>
        <div class="notice">
          <div class="label">自动提醒：</div>
          <div class="noticeContent">
            <el-switch
              :model-value="state.authAutoSendNotice"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @click="loseEfficacyTipsChange"
            ></el-switch>
            <!-- @change="val => setData(val, 'openLiveroomStartMessage')" -->
            <div class="tips">
              开启后，系统将在发现矩阵号过期时自动推送一条授权提醒给运营者（注：免打扰时段的消息会延迟发送）
              <el-tooltip effect="dark" placement="top">
                <img
                  style="width: 14px; height: 14px; margin-top: -2px; vertical-align: middle"
                  src="\src\assets\images\operate\tip_line.png"
                  alt
                />
                <template #content>免打扰时段：22:00~8:00</template>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="tips_type">
          <span>提醒类型：</span>
          <tipChoseTerminal
            style="margin-left: 8px"
            @tipsChoseChange="_tipsChoseChange"
            :loseEfficacyTips="state.authAutoSendNotice"
            :authTypeIds="state.authTypeIds"
            :from="'auto'"
            :noticeResizeWidth="noticeResizeWidth"
          />
        </div>
        <!-- 手动提醒 -->
        <div class="notice" style="align-items: flex-start">
          <div class="label">手动提醒：</div>
          <div class="noticeContent">
            <el-button type="primary" @click="sendNotice" :loading="handLoading">
              发送通知
            </el-button>
            <div class="tips" style="margin-top: 8px">
              点击发送通知按钮，系统将向所有授权过期的矩阵号运营者推送一条授权提醒（注：每次通知间隔不小于1h，免打扰时段不允许发送通知）
            </div>
          </div>
        </div>
      </div>
      <!-- 任务审核设置 -->
      <auditTask v-if="[3,4].includes(systemVersion)" class="section"></auditTask>
      <!-- 视频/图文任务内容审核通知设置 -->
      <auditVideo v-if="[3,4].includes(systemVersion)" class="section"></auditVideo>
      <!-- 征集视频与素材审核设置 -->
      <auditMaterial v-if="[3,4].includes(systemVersion)" class="section"></auditMaterial>
      <!-- 作业点评通知设置 -->
      <homeworkReview v-if="[3].includes(systemVersion)" class="section" />
      <!-- 三方平台授权失效提醒 -->
      <div
        class="section"
        :class="isWeiXin ? 'section_hide_wx' : 'section_show_wx'"
        style="margin-right: unset"
        v-if="systemVersion == 3"
      >
        <div class="title">三方平台授权失效提醒</div>
        <div class="notice">
          <div class="label">抖店失效提醒：</div>
          <div class="noticeContent">
            <el-switch
              :model-value="state.openDoudianMessage"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @click="editRole('doudian', state.openDoudianMessage)"
            ></el-switch>
            <div class="tips">
              开启后，系统在发现抖店授权过期时自动推送一条授权提醒给设置的角色成员（注：免打扰时段的消息会延迟发送）
              <el-tooltip effect="dark" placement="top">
                <img
                  style="width: 14px; height: 14px; margin-top: -2px; vertical-align: middle"
                  src="\src\assets\images\operate\tip_line.png"
                  alt
                />
                <template #content>免打扰时段：22:00~8:00</template>
              </el-tooltip>
            </div>
            <div class="notice_role_box" v-if="state.openDoudianMessage">
              <div class="role_label">提醒角色：</div>
              <div class="role_content">
                <el-tag class="role_item" v-for="(item, index) in doudianRole" :key="index">
                  {{ item }}
                </el-tag>
                <el-link style="line-height: 24px" type="primary" @click="editRole('doudian')">
                  编辑
                </el-link>
              </div>
            </div>
          </div>
        </div>

        <div class="notice" style="align-items: flex-start; margin-top: 10px">
          <div class="label">来客失效提醒：</div>
          <div class="noticeContent">
            <el-switch
              :model-value="state.openLifeMessage"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @click="editRole('laike', state.openLifeMessage)"
            ></el-switch>
            <div class="tips">
              开启后，系统在发现抖音来客授权过期时自动推送一条授权提醒给设置的角色成员（注：免打扰时段的消息会延迟发送）
              <el-tooltip effect="dark" placement="top">
                <img
                  style="width: 14px; height: 14px; margin-top: -2px; vertical-align: middle"
                  src="\src\assets\images\operate\tip_line.png"
                  alt
                />
                <template #content>免打扰时段：22:00~8:00</template>
              </el-tooltip>
            </div>
            <div class="notice_role_box" v-if="state.openLifeMessage">
              <div class="role_label">提醒角色：</div>
              <div class="role_content">
                <el-tag class="role_item" v-for="(item, index) in lifeRole" :key="index">
                  {{ item }}
                </el-tag>
                <el-link style="line-height: 24px" type="primary" @click="editRole('laike')">
                  编辑
                </el-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 手动提醒 选择弹窗-->
      <el-dialog
        width="500px"
        title="授权提醒"
        custom-class="handMovementDialog_dialog"
        :close-on-click-modal="false"
        destroy-on-close
        v-model="handMovementDialog"
      >
        <tipChoseTerminal
          @tipsChoseChange="_tipsChoseChange"
          :authTypeIds="authTypeIdsHand"
          :from="'hand'"
        />
        <div class="h_d_content">
          确认向约
          <span style="color: #364fcd">{{ tipsNum }}</span>
          位运营者发送授权提醒？
        </div>
        <template #footer>
          <el-button @click="handMovementDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmTipNotice" :loading="handLoading">
            确定
          </el-button>
        </template>
      </el-dialog>

      <el-dialog
        :close-on-click-modal="false"
        destroy-on-close
        v-model="visible"
        title="设置"
        width="500px"
      >
        <div class="dialog">
          <div class="item">
            <el-checkbox v-model="roleCheck" size="large" />
            <div
              class="label"
              :style="{
                width: showFeiShu && isWeChat ? '115px' : '',
                textAlignLast: showFeiShu && isWeChat ? 'justify' : ''
              }"
            >
              角&emsp;色：
            </div>
            <el-select v-model="role" multiple placeholder="请选择角色" style="width: 100%">
              <el-option
                v-for="item in roleList"
                :label="item.roleName"
                :value="item.roleId"
                :key="item.roleId"
              />
            </el-select>
          </div>
          <div
            :style="{
              paddingLeft: showFeiShu && isWeChat ? '115px' : ''
            }"
          >
            请设置接收{{
              editType == 'doudian' || editType == 'laike' ? '失效' : showFeiShu ? '日报' : '开播'
            }}提醒的角色
          </div>
        </div>
        <div class="dialog mb" v-if="showFeiShu">
          <div class="item">
            <el-checkbox v-model="feishuCheck" size="large" />
            <div
              class="label"
              :style="{
                width: isWeChat ? '115px' : '',
                textAlignLast: isWeChat ? 'justify' : ''
              }"
            >
              {{ isWeChat ? '企业微信' : '飞书' }}群：
            </div>
            <el-select
              v-model="feishu"
              multiple
              :placeholder="`请选择${isWeChat ? '企业微信' : '飞书'}群`"
              style="width: 100%"
            >
              <el-option
                v-for="item in feishuList"
                :label="item.name"
                :value="item.groupId"
                :key="item.groupId"
              />
            </el-select>
          </div>
          <div
            v-if="isWeChat"
            :style="{
              paddingLeft: isWeChat ? '115px' : ''
            }"
          >
            只可选择已添加的企业微信群
          </div>
          <div v-else>
            请设置接收日报提醒的飞书群，只可选择机器人所在的群
            <el-popover
              placement="right"
              width="590px"
              trigger="hover"
              popper-class="g_popper_gray"
            >
              <template #reference>
                <i style="font-size: 14px; cursor: pointer" class="iconfont icon-wenhao"></i>
              </template>
              <div class="myTips">
                <div class="left">
                  <div>移动端</div>
                  <p>1.点击群设置</p>
                  <img src="@/assets/images/content_config/a.png" alt style="width: 260px" />
                  <p>2.点击群机器人</p>
                  <img src="@/assets/images/content_config/b.png" alt style="width: 260px" />
                  <p>3.点击添加</p>
                  <img src="@/assets/images/content_config/c.png" alt style="width: 260px" />
                  <p>4.找到tagvv，添加即可</p>
                  <img
                    src="@/assets/images/content_config/d.png"
                    alt
                    style="width: 260px; height: 190px"
                  />
                </div>
                <div class="right">
                  <div>PC端</div>
                  <p>1.点击群设置，点击群机器人</p>
                  <img src="@/assets/images/content_config/e.png" alt style="width: 260px" />
                  <p>2.点击添加机器人</p>
                  <img src="@/assets/images/content_config/f.png" alt style="width: 260px" />
                  <p>3.找到tagvv，添加即可</p>
                  <img src="@/assets/images/content_config/gg.png" alt style="width: 260px" />
                </div>
              </div>
            </el-popover>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelDate">取消</el-button>
            <el-button type="primary" @click="setData" :disabled="isOk">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <weChatSetting v-else></weChatSetting>
  </div>
</template>

<script setup>
import GTabs from '../components/g_tabs/index.vue'
import weChatSetting from './weChat_setting.vue'
import auditVideo from '@/views/market/operation_setting/components/audit_video.vue'
import auditTask from '@/views/market/operation_setting/components/audit_task.vue'
import auditMaterial from '@/views/market/operation_setting/components/audit_material.vue'
import homeworkReview from '@/views/market/operation_setting/components/homework_review.vue'
import {
  getNoticeConfig,
  setNoticeConfig,
  getChatPage,
  getOperatorCount,
  manualSendAuthNotice,
  beforeManualSendAuthNoticeCheck
} from '@/api/system_setting/notice'
import { selectRoleList } from '@/api/system_setting/role'
import tipChoseTerminal from './components/tip_chose_terminal.vue'
import { useStore } from 'vuex'

// 记录宽度，用来显示提示类型是否换行
const noticeResizeWidth = ref('')
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

const vResize = {
  mounted: (el, binding) => {
    let width = ''
    let height = ''
    function isReize() {
      const style = document.defaultView.getComputedStyle(el)
      if (width !== style.width || height !== style.height) {
        binding.value({ width: style.width })
      }
      width = style.width
      height = style.height
    }
    el.__vueSetInterval__ = setInterval(isReize, 300)
  },
  beforeUnmount(el) {
    clearInterval(el.__vueSetInterval__)
  }
}

function noticeResize(val) {
  const { width } = val
  noticeResizeWidth.value = width
}

const tabs = ref([
  { label: '通知管理', value: 'noticeManagement' },
  { label: '企微群设置', value: 'weChatSetting' }
])
const currentTab = ref('noticeManagement')

const isWeChat = ref(true)
isWeChat.value = localStorage.getItem('isWeChat') === '1'
const isWeiXin = ref(true)
isWeiXin.value = localStorage.getItem('isWeiXin') === '1'

const state = reactive({
  openDailyMessage: false,
  openLiveroomStartMessage: false,
  openDoudianMessage: false,
  openLifeMessage: false,
  dailyRoleIds: [],
  liveRoleIds: [],
  doudianRoleIds: [],
  lifeRoleIds: [],
  id: null,
  authAutoSendNotice: false, //  授权自动提醒 0否 1是
  authTypeIds: '' // 提醒类型 默认全部  id字符串:1:抖音 2:视频号 3:小红书 4:快手 5:抖音web 6:百应 例: authTypeIds: '1,2,4'
})
const brandInfo = JSON.parse(localStorage.getItem('brandInfo'))
const message = inject('$message')
const roleList = ref()
const feishuList = ref()
const visible = ref(false)
const feishuCheck = ref(false)
const roleCheck = ref(false)
const role = ref([])
const feishu = ref([])
const feishuBrr = ref([])
const editType = ref(null)

const handMovementDialog = ref(false) // 手动提示弹窗
const tipsNum = ref(0) // 提醒人数
const authTypeIdsHand = ref('') // 手动通知勾选 有效值1,2,3,4,5 默认值1,2,3
const setType = ref('') // 设置类型 auto：自动提醒 hand：手动提醒
const handLoading = ref(false) // 手动通知按钮loading

function loseEfficacyTipsChange() {
  state.authAutoSendNotice = !state.authAutoSendNotice
  _setData()
}

// 自动提醒选择
function _tipsChoseChange(val, type) {
  setType.value = type
  if (type === 'auto') {
    state.authTypeIds = val
    _setData()
  }
  if (type === 'hand') {
    authTypeIdsHand.value = val
    _getOperatorCount()
  }
}

// 提交手动发送通知
async function confirmTipNotice() {
  handLoading.value = true
  await _manualSendAuthNotice()
}

// 发送通知
function sendNotice() {
  authTypeIdsHand.value = systemVersion.value === 3 ? '1,2,3,4,7' : '1,2,3,4' // 每次打开弹窗默认值
  _getOperatorCount()
  handMovementDialog.value = true
}

// 计算分发人数
function _getOperatorCount() {
  let arr = null // 如果没有选择的话，入参需要处理成null，而不是[]
  if (authTypeIdsHand.value)
    arr = authTypeIdsHand.value.split(',').filter(x => {
      return x
    })
  getOperatorCount({ brandId: brandInfo.brandId, authTypeIds: arr })
    .then(res => {
      tipsNum.value = res.data.operatorCount || 0
    })
    .catch(() => {
      tipsNum.value = 0
    })
}

// 手动通知配置
function _manualSendAuthNotice() {
  let arr = null
  if (authTypeIdsHand.value)
    arr = authTypeIdsHand.value.split(',').filter(x => {
      return x
    })
  if (tipsNum.value === 0) {
    handLoading.value = false
    return message.warning('暂无授权过期矩阵号')
  }
  const params = { brandId: brandInfo.brandId, authTypeIds: arr }
  // 手动提醒的弹窗关闭策略改变，要先调用接口判断是否可以发送提醒，可以发送提醒，点击发送弹窗立马关闭，不用的等待发送提醒接口返回
  beforeManualSendAuthNoticeCheck(params)
    .then(res => {
      if (res.data) {
        // 不可发送接口直接异常抛出原因，不用处理
        message.success('操作成功')
        manualSendAuthNotice(params)
      }
      // else {
      //  返回false或没有返回，不用处理
      // }
      handLoading.value = false // 关闭loading
      handMovementDialog.value = false // 关闭弹窗
    })
    .catch(() => {
      handLoading.value = false // 关闭loading
      handMovementDialog.value = false // 关闭弹窗
    })
}

watchEffect(() => {
  feishuCheck.value = false
  if (feishu.value.length > 0) {
    feishuCheck.value = true
  }
})
watchEffect(() => {
  roleCheck.value = false
  if (role.value.length > 0) {
    roleCheck.value = true
  }
})
watchEffect(() => {
  if (feishuCheck.value === false) {
    feishu.value = []
  }
})
watchEffect(() => {
  if (roleCheck.value === false) {
    role.value = []
  }
})
const isOk = computed(() => {
  if (
    (feishu.value.length > 0 &&
      feishuCheck.value === true &&
      roleCheck.value === false &&
      role.value.length <= 0) ||
    (roleCheck.value === true &&
      role.value.length > 0 &&
      feishu.value.length <= 0 &&
      feishuCheck.value === false) ||
    (feishu.value.length > 0 &&
      feishuCheck.value === true &&
      roleCheck.value === true &&
      role.value.length > 0)
  ) {
    return false
  } else {
    return true
  }
})
getRole()
function getRole() {
  selectRoleList({
    pageNumber: 1,
    pageSize: 999,
    isFilterOutsider: 1
  }).then(res => {
    roleList.value = res.data
  })
}
const dailyRole = computed(() => {
  const res = []
  state.dailyRoleIds.forEach(item => {
    const filterRole = roleList.value && roleList.value.filter(role => role.roleId === item)
    filterRole && filterRole.length > 0 && res.push(filterRole[0].roleName)
  })
  return res
})
const liveRole = computed(() => {
  const res = []
  state.liveRoleIds.forEach(item => {
    const filterRole = roleList.value && roleList.value.filter(role => role.roleId === item)
    filterRole && filterRole.length > 0 && res.push(filterRole[0].roleName)
  })
  return res
})
const doudianRole = computed(() => {
  const res = []
  state.doudianRoleIds.forEach(item => {
    const filterRole = roleList.value && roleList.value.filter(role => role.roleId === item)
    filterRole && filterRole.length > 0 && res.push(filterRole[0].roleName)
  })
  return res
})
const lifeRole = computed(() => {
  const res = []
  state.lifeRoleIds.forEach(item => {
    const filterRole = roleList.value && roleList.value.filter(role => role.roleId === item)
    filterRole && filterRole.length > 0 && res.push(filterRole[0].roleName)
  })
  return res
})
getData()
function getData() {
  getNoticeConfig({
    brandId: brandInfo.brandId
  }).then(({ data }) => {
    state.id = data.id
    state.openDailyMessage = !!data.openDailyMessage
    state.openLiveroomStartMessage = !!data.openLiveroomStartMessage
    state.openDoudianMessage = !!data.openDoudianMessage
    state.openLifeMessage = !!data.openLifeMessage
    state.authAutoSendNotice = !!data.authAutoSendNotice
    state.dailyRoleIds = data.dailyRoleIds ? data.dailyRoleIds.split(',').map(item => +item) : []
    state.liveRoleIds = data.liveRoleIds ? data.liveRoleIds.split(',').map(item => +item) : []
    state.doudianRoleIds = data.doudianRoleIds
      ? data.doudianRoleIds.split(',').map(item => +item)
      : []
    state.lifeRoleIds = data.lifeRoleIds ? data.lifeRoleIds.split(',').map(item => +item) : []
    nextTick(() => {
      state.authTypeIds = data.authTypeIds || ''
    })
    const arr = []
    const brr = []
    data.chatList.forEach(item => {
      arr.push(item.groupId)
      brr.push(item.name)
    })
    feishu.value = arr
    feishuBrr.value = brr
  })
}
getRobotDate()
let pageToken = ''
function getRobotDate(val = '') {
  getChatPage({ pageSize: 999, pageToken: val }).then(res => {
    pageToken = res.data.pageToken
  })
}

const showFeiShu = ref(false)
function editRole(type, status) {
  getChatPage({ pageSize: 999, pageToken: pageToken }).then(res => {
    feishuList.value = res.data.chatList
    const switchStatus = status
    if (type === 'live') {
      role.value = [...state.liveRoleIds]
      showFeiShu.value = false
    } else if (type === 'doudian') {
      role.value = [...state.doudianRoleIds]
      showFeiShu.value = false
    } else if (type === 'laike') {
      role.value = [...state.lifeRoleIds]
      showFeiShu.value = false
    } else {
      role.value = [...state.dailyRoleIds]
      showFeiShu.value = true
    }
    editType.value = type
    console.log('editType-1', editType.value)
    if (!switchStatus) {
      visible.value = true
    } else {
      setData(false, type)
    }
  })
}
brandInfo.brandId === 1 && setData()
function setData(val, type) {
  if (editType.value === 'live') {
    state.openLiveroomStartMessage = !state.openLiveroomStartMessage
    if (visible.value) {
      state.openLiveroomStartMessage = true
    }
    state.liveRoleIds = [...role.value]
  } else if (editType.value === 'daily') {
    state.openDailyMessage = !state.openDailyMessage
    if (visible.value) {
      state.openDailyMessage = true
    }
    state.dailyRoleIds = [...role.value]
  } else if (editType.value === 'doudian') {
    state.openDoudianMessage = !state.openDoudianMessage
    if (visible.value) {
      state.openDoudianMessage = true
    }
    state.doudianRoleIds = [...role.value]
  } else if (editType.value === 'laike') {
    state.openLifeMessage = !state.openLifeMessage
    if (visible.value) {
      state.openLifeMessage = true
    }
    state.lifeRoleIds = [...role.value]
  }
  const list = []
  feishuList.value.forEach(item => {
    feishu.value.forEach(y => {
      if (item.groupId === y) {
        list.push(item)
      }
    })
    // return item.groupId === toRaw(feishu.value)[0]
  })
  console.log('list:', list)
  const params = { ...state }
  params.openDailyMessage = params.openDailyMessage ? 1 : 0
  params.openLiveroomStartMessage = params.openLiveroomStartMessage ? 1 : 0
  params.openDoudianMessage = params.openDoudianMessage ? 1 : 0
  params.openLifeMessage = params.openLifeMessage ? 1 : 0
  params.dailyRoleIds = params.dailyRoleIds.join(',')
  params.liveRoleIds = params.liveRoleIds.join(',')
  params.doudianRoleIds = params.doudianRoleIds.join(',')
  params.lifeRoleIds = params.lifeRoleIds.join(',')
  params.chatList = list
  // 失效提醒相关入参
  params.authAutoSendNotice = params.authAutoSendNotice ? 1 : 0
  params.authTypeIds = setType.value === 'hand' ? authTypeIdsHand.value : params.authTypeIds
  visible.value = false
  setNoticeConfig(params)
    .then(() => {
      getData()
      message.success('设置成功')
    })
    .catch(() => {
      state[type] = !val
    })
    .finally(() => {
      editType.value = null
    })
}
// 失效提醒接口调用
function _setData() {
  getChatPage({ pageSize: 999, pageToken: pageToken }).then(res => {
    feishuList.value = res.data.chatList
    const list = []
    feishuList.value.forEach(item => {
      feishu.value.forEach(y => {
        if (item.groupId === y) {
          list.push(item)
        }
      })
    })
    const params = { ...state }
    params.openDailyMessage = params.openDailyMessage ? 1 : 0
    params.openLiveroomStartMessage = params.openLiveroomStartMessage ? 1 : 0
    params.openDoudianMessage = params.openDoudianMessage ? 1 : 0
    params.openLifeMessage = params.openLifeMessage ? 1 : 0
    params.dailyRoleIds = params.dailyRoleIds.join(',')
    params.liveRoleIds = params.liveRoleIds.join(',')
    params.doudianRoleIds = params.doudianRoleIds.join(',')
    params.lifeRoleIds = params.lifeRoleIds.join(',')
    params.chatList = list
    // 失效提醒相关入参
    params.authAutoSendNotice = params.authAutoSendNotice ? 1 : 0
    params.authTypeIds = setType.value === 'hand' ? authTypeIdsHand.value : params.authTypeIds
    setNoticeConfig(params).then(() => {
      getData()
      message.success('设置成功')
    })
  })
}
const cancelDate = () => {
  getData()
  visible.value = false
}
</script>

<style lang="scss" scoped>
.mt_10 {
  margin-top: 10px;
}
.notice_manage {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-row-gap: 16px;
  grid-column-gap: 16px;
  :deep(.el-checkbox) {
    height: auto;
  }

  .section {
    // margin-bottom: 16px;
    border-radius: 4px;
    background: #fff;
    // margin-right: 16px;
    padding: 32px;
    // &:last-child {
    //   margin: 0;
    // }
    .title {
      font-size: 18px;
      line-height: 20px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    .notice {
      display: flex;
      &:last-child {
        align-items: center;
      }
      .label {
        margin-right: 8px;
        // height: 46px;
        line-height: 32px;
        white-space: nowrap;
      }
      .noticeContent {
        width: calc(100% - 100px);
      }
      .tips {
        margin-top: 4px;
        font-size: 12px;
        line-height: 20px;
        color: #909399;
      }
      .notice_role_box {
        margin-top: 10px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        .role_label {
          line-height: 24px;
          height: 24px;
          color: #909399;
        }
        .role_content {
          width: calc(100% - 80px);
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          flex-wrap: wrap;
        }
      }
    }
    .tips_type {
      display: flex;
      // align-items: center;
      margin: 6px 0 8px 76px;
      font-size: 12px;
      line-height: 20px;
      color: #909399;
      white-space: nowrap;
      // flex-wrap: wrap;
    }
  }
  .section:nth-child(2n) {
    margin-right: 0 !important;
  }
  .section_tips {
    // width: calc(50% - 8px);
    // min-width: calc(50% - 8px);
    // margin-top: 16px;
  }
  .section_hide_wx {
    // width: calc(50% - 8px);
    // min-width: calc(50% - 8px);
    // margin-right: 16px !important;
  }
  .section_show_wx {
    // width: calc(50% - 8px);
    // min-width: calc(50% - 8px);
  }
  :deep(.handMovementDialog_dialog) {
    .h_d_content {
      margin-top: 14px;
    }
    .el-dialog__footer {
      padding-top: unset;
    }
  }

  .role_item {
    margin-right: 10px;
    margin-bottom: 10px;
  }
  .dialog {
    .item {
      display: flex;
      align-items: center;
    }
    &.mb {
      margin-top: 20px;
    }
    > div:nth-child(1) {
      display: flex;
      .label {
        width: 70px;
        margin-left: 10px;
      }
    }
    > div:nth-child(2) {
      padding-left: 85px;
      margin-top: 6px;
      font-size: 12px;
      color: #909399;
    }
  }
}
.myTips {
  color: #fff;
  padding: 12px 30px 0 6px;
  display: flex;
  .left {
    margin-right: 40px;
    margin-left: 10px;
  }
  .left,
  .right {
    > div {
      height: 22px;
      font-size: 16px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 22px;
    }
    > p {
      margin-left: 12px;
      margin: 12px 0 13px 0;
      font-size: 12px;
    }
  }
}
.g_tabs_wrapper {
  margin-bottom: 18px;
}
</style>
