<template>
  <div class="publish_create" v-loading="$data.pageLoading">
    <div :class="{ content: true, disabled_content: $data.disabled }">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="330px">
        <el-form-item label="发布任务名称：" prop="publishTaskName">
          <el-input
            class="name_input"
            placeholder="请输入发布任务名称"
            :disabled="$data.disabled"
            v-model.trim="formData.publishTaskName"
            :maxlength="20"
            @blur="retEmit"
          />
        </el-form-item>
        <el-form-item
          :label="`选择${systemVersion == 3 ? '素材' : '视频'}：`"
          prop=""
          :class="{ choose_video: getVideoNum > 5 }"
        >
          <div class="p_video_warp">
            <div class="btns">
              <el-button
                v-if="!$data.disabled"
                type="primary"
                @click="openChooseVideo('Video')"
                :style="{ marginBottom: getVideoNum > 0 ? '16px' : 0 }"
              >
                选视频
              </el-button>
              <el-button
                v-if="!$data.disabled && systemVersion == 3"
                type="primary"
                @click="openChooseVideo('Imgtext')"
                :style="{ marginBottom: getVideoNum > 0 ? '16px' : 0 }"
              >
                选图文
              </el-button>
            </div>

            <div class="video_list" v-if="getVideoNum > 0">
              <template v-if="getVideoNum <= 5">
                <div
                  @click="palyVideo(item)"
                  class="video_item"
                  v-for="(item, index) in formData.videoList"
                  :key="index"
                >
                  <img :src="item.thumbCoverUrl || item.coverUrl" alt="" class="cover_img" />

                  <img
                    v-if="!$data.disabled"
                    src="https://tagvv-1256030678.file.myqcloud.com/20240402apjyi.png"
                    alt=""
                    class="del_icon"
                    @click.stop="delVideo(item)"
                  />
                  <img
                    v-if="item.type != 99"
                    src="https://tagvv-1256030678.file.myqcloud.com/20240402w4k4t.png"
                    alt=""
                    class="paly_icon"
                  />
                </div>
              </template>
              <div class="choose_num" :style="$data.id ? '' : 'margin-top: -8px'" v-else>
                已选择
                <span class="num_span">
                  {{ getVideoNum }}
                </span>
                {{
                  `条${systemVersion == 3 && subSource == 'batchPublishImgtext' ? '图文' : '视频'}`
                }}
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item
          label="选择账号："
          prop=""
          :class="{ choose_acc: selectAccountInfo.checkNum > 5 }"
        >
          <div class="p_account_warp" v-loading="accountInfo.loading">
            <div class="acc_top">
              <el-select
                :disabled="$data.disabled || initDiasbled"
                v-model="accountInfo.chooseAccountGroupId"
                placeholder="请选择矩阵号分组"
                clearable
                style="width: 230px"
                @change="chooseGroupChange"
              >
                <el-option
                  v-for="item in accountInfo.accountGroupList"
                  :label="item.groupName"
                  :value="item.id"
                  :key="item.id"
                />
              </el-select>
              <div
                class="more_select_account"
                :style="initDiasbled ? 'cursor:not-allowed' : ''"
                v-if="!$data.disabled"
                @click="openAccountSelect"
              >
                自定义选择
                <img
                  src="https://tagvv-1256030678.file.myqcloud.com/20240402j2a9e.png"
                  alt=""
                  class="more_select_icon"
                />
              </div>
            </div>

            <accountEllipsis
              v-if="$data.id"
              :id="$data.id"
              :infinite="true"
              :showNum="3"
              :platFormIcon="true"
              :platFormIconWidth="16"
              @update="updateAccountInfo"
            />

            <template v-if="formData.accountList && formData.accountList.length > 0 && !$data.id">
              <accountEllipsis
                v-if="formData.accountList.length <= 5"
                :list="formData.accountList"
                :infinite="false"
                :showNum="5"
                :platFormIcon="true"
                :platFormIconWidth="16"
              />
              <div class="choose_num" style="margin-top: 8px" v-else>
                已选择
                <span class="num_span">
                  {{ formData.accountList.length }}
                </span>
                个账号
              </div>
            </template>
          </div>
        </el-form-item>
        <el-form-item label-width="0" v-if="getVideoNum > 0 || formData.accountList.length > 0">
          <div class="account_tip">
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20240402gfeqy.png"
              alt=""
              class="tip_icon"
            />
            <span class="text" v-html="contentTip"></span>
          </div>
        </el-form-item>
        <el-form-item label="" prop="">
          <template #label>
            <div class="video_label">{{ `${systemVersion == 3 ? '素材' : '视频'}标题` }}：</div>
          </template>
          <div class="poi_warp">
            <div class="video_title_warp" v-if="!$data.disabled">
              <el-button
                type="primary"
                @click="addVideo"
                :disabled="getVideoNum <= formData.titleList.length"
              >
                添加
              </el-button>
              <div
                class="ai_box"
                :class="{ ai_box_disabled: !(getVideoNum > 0 && titleHelpInfo.videoNum > 0) }"
                @click="opAiTitle"
              >
                标题创作助手
                <img
                  src="https://tagvv-1256030678.file.myqcloud.com/20240402harpd.png"
                  alt=""
                  class="ai_icon"
                />
              </div>
            </div>
            <div class="title_list_warp">
              <div
                class="title_item"
                :class="{ title_item_disabled: $data.id }"
                v-for="(item, index) in formData.titleList"
                :key="index"
              >
                <!-- ${
                    systemVersion == 3 && chooseVideoInfo.subSource == 'batchPublishImgtext'
                      ? ' 话题以#开头并输入空格确认'
                      : ''
                  } -->
                <el-input
                  style="width: 518px"
                  v-model="item.title"
                  clearable
                  type="textarea"
                  resize="none"
                  show-word-limit
                  :autosize="{ minRows: 3, maxRows: 4 }"
                  :maxlength="500"
                  :disabled="$data.disabled || initDiasbled"
                  :placeholder="`请在此输入标题`"
                />
                <span
                  class="del_btn"
                  v-if="formData.titleList.length > 1 && !$data.disabled"
                  @click="delOneTitle(index)"
                >
                  删除
                </span>
              </div>
            </div>
            <div class="poi_tip" v-if="subSource === 'batchPublishImgtext'">
              是否优先使用发布任务设置的标题
              <el-switch
                :disabled="$data.disabled || initDiasbled"
                style="margin-left: 8px"
                v-model="formData.useTaskTitle"
              ></el-switch>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="挂载项设置：" class="poi_form_item">
          <div>
            <el-button type="primary" @click.stop="showMountFun">设置</el-button>
            <div class="mount_box" v-if="mountText && mountText.length > 0">
              <div v-for="(a, b) in mountText" :key="b">
                {{ a }}
                <img src="https://tagvv-1256030678.file.myqcloud.com/20241031vgnrx.png" />
              </div>
            </div>
          </div>
          <!-- <div class="poi_warp">
            <div class="poi_item">
              <selectPoi
                v-if="!$data.pageLoading"
                :disabled="$data.disabled || initDiasbled"
                :info="dyPoiInfo"
                :selectPOiInfo="formData.selectPOiInfo.dy"
                @select="selectPoiFn"
              />
            </div>
            <div class="poi_item">
              <selectPoi
                v-if="!$data.pageLoading"
                :disabled="$data.disabled || initDiasbled"
                :info="xhsPoiInfo"
                :selectPOiInfo="formData.selectPOiInfo.xhs"
                @select="selectPoiFn"
              />
            </div>
            <div class="poi_tip">
              是否启用优先挂载账号绑定POI
              <el-switch
                :disabled="$data.disabled || initDiasbled"
                style="margin-left: 8px"
                v-model="formData.useAccountOwenPoi"
              ></el-switch>
            </div>
            <div class="poi_tip poi_tip_depart">
              未设置账号绑定POI时，挂载账号所在业务主体部门POI
              <el-switch
                :disabled="$data.disabled || !formData.useAccountOwenPoi || initDiasbled"
                style="margin-left: 8px"
                v-model="formData.useDepartOwenPoi"
              ></el-switch>
            </div>
          </div> -->
        </el-form-item>
        <el-form-item label="是否启用定时发布：" prop="" class="publish_time">
          <el-switch
            :disabled="$data.disabled || initDiasbled"
            v-model="formData.timingPublish"
          ></el-switch>
          <div class="time_warp" v-if="formData.timingPublish">
            计划于
            <el-date-picker
              :disabled="$data.disabled || initDiasbled"
              v-model="formData.publishTime"
              type="datetime"
              placeholder="请选择发布时间"
              format="YYYY-MM-DD HH:mm"
              date-format="MMM DD, YYYY"
              time-format="HH:mm"
              :disabled-date="disabledDate"
              style="margin: 0 8px; width: 180px"
            />
            开始发布
          </div>
        </el-form-item>
        <el-form-item label="是否启用账号间隔发布：">
          <el-switch
            :disabled="$data.disabled || initDiasbled"
            v-model="formData.intervalPublish"
          ></el-switch>
          <span class="interval_tip">
            每个账号发布成功{{ formData.intervalTime }}min后，下一个账号才会开始发布
          </span>
        </el-form-item>
      </el-form>
    </div>
    <div class="btn" v-if="!$data.disabled">
      <el-button @click="closeDialog">取消</el-button>
      <el-button
        type="primary"
        style="margin-left: 24px"
        :loading="$data.btnLoading"
        @click="handleConfirm"
      >
        确认提交
      </el-button>
    </div>
    <!-- 选择视频弹窗 -->
    <chooseVideo
      v-if="chooseVideoInfo.show"
      pageSource="batchPublishCreate"
      :chooseDialog="chooseVideoInfo"
      :multiple="true"
      :showChooseNum="true"
      :subSource="chooseVideoInfo.subSource"
      @updateChooseFun="updateChooseFun"
    />
    <!-- 预览视频 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo" />
    <!-- 选择账号 -->
    <selectAccount
      v-if="selectAccountInfo.show"
      :info="selectAccountInfo"
      :source="selectAccountInfo.source"
      :accountGroupList="accountInfo.accountGroupList"
      @cancel="closeSelectAccount"
      @submit="submitSelectAccount"
    />
    <!-- 标题助手 -->
    <titleHelp
      v-if="titleHelpInfo.show"
      :info="titleHelpInfo"
      @close="titleHelpClose"
      @submit="titleHelpSubmit"
    />
    <previewImgTextDialog
      v-if="previewImgTextDialogInfo.show"
      :previewDialog="previewImgTextDialogInfo"
    />
    <!-- 挂载项设置的弹窗 -->
    <mountDOM
      v-if="mountDialog.show"
      :isInit="!$data.id"
      :mountDialog="mountDialog"
      @updateFun="updateMountFun"
    />
  </div>
</template>

<script setup>
import mountDOM from '../components/mount_dialog.vue'
import chooseVideo from '@/views/content_center/content_matrix/components/publish_video/choose_video_dialog.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
// import selectPoi from '../../../components/matrix/select_poi_input.vue'
import selectAccount from '../components/select_account_dialog.vue'
import titleHelp from '../components/title_help_dialog.vue'
import accountEllipsis from '../components/account_ellipsis.vue'
import previewImgTextDialog from '@/views/sumvideo/components/preview_imgText_dialog.vue'

import { throttle, isNotEmpty, dateFormat } from '@/utils/tools.js'
import api from '@/api/content_center/content_matrix.js'
import { useRouter, useRoute } from 'vue-router'
import {
  getTaskName,
  createPublishTask,
  publishTaskDetail
} from '@/api/sumvideo/content_distribute.js'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

const $data = reactive({
  id: null, // 点击详情过来会自带ID
  disabled: false, // 点击详情过来要禁用所有可修改选项
  btnLoading: false, // 确定按钮的loading
  preTaskId: null, // 预生成的任务id,用于生成ai标题时，作为creativeId传入，同时创建任务时，作为preTaskId回传
  pageLoading: false,
  isPublish: false // 是否是发布成功正在跳转，true就禁止点击
})
// const emits = defineEmits(['cancel', 'submit'])
const formRef = ref(null)
const message = inject('$message')
const formData = reactive({
  publishTaskName: '', // 发布任务名称
  videoList: [], // // 选择的要发布的视频列表
  accountList: [], // 要发布到的矩阵号列表
  titleList: [
    {
      title: ''
    }
  ], // 添加的标题
  // selectPOiInfo: {
  //   dy: {},
  //   xhs: {}
  // }, // 选择的poi信息
  dyTopicList: [], // 抖音话题
  dyAtList: [], // 抖音@
  dyPOIInfo: {}, // 抖音POI
  xhsTopicList: [], // 小红书话题
  xhsAtList: [], // 小红书@
  xhsPOIInfo: {}, // 小红书POI
  isNotePrioritizedTemplateInfo: false, // 图文优先使用模板信息(话题与@)
  useTaskTitle: false, // 是否优先使用任务标题
  useAccountOwenPoi: false, // 使用账号的poi
  useDepartOwenPoi: false, // 使用部门poi
  timingPublish: false, // 是否启用定时发布
  publishTime: '', // 发布时间
  intervalPublish: false, // 是否启用账号间隔发布
  intervalTime: 5 // 间隔发布时长，分钟，入参转化为秒
})

const getTableListParams = ref({}) // 获取分镜组的参数

// 选择视频
const chooseVideoInfo = reactive({
  show: false,
  videoTotal: 0, // 回显时视频数量
  subSource: '' // batchPublishVideo 批量发布选择视频 batchPublishImgtext 批量发布选择图文
})
const subSource = ref('')

const accountInfo = reactive({
  loading: false,
  accountGroupList: [], // 分组列表
  chooseAccountGroupId: null // 选择的矩阵号分组id
})

const formRules = reactive({
  publishTaskName: [
    {
      required: true,
      message: '请输入文本',
      trigger: 'blur'
    },
    {
      min: 1,
      max: 300,
      message: '请输入文本，最多300个字',
      trigger: 'blur'
    }
  ]
})

// 预览素材
const previewInfo = reactive({
  show: false, // 是否显示预览弹窗
  type: '', // 类型 video视频 audio音频 image图片
  title: '', // 预览标题
  url: '', // 地址
  cover: ''
})
// 选择账号
const selectAccountInfo = reactive({
  show: false,
  chooseIds: [] // 已选择的账号openids
})

const previewImgTextDialogInfo = ref({
  show: false,
  info: {}
})

const getVideoNum = computed(() => {
  let num
  if ($data.id) {
    num = chooseVideoInfo.videoTotal
  } else {
    num = formData.videoList.length
    const unEmptyTitles = formData.titleList.filter(x => !!x.title)
    const listLength = num - unEmptyTitles.length
    titleHelpInfo.videoNum = listLength
  }
  return num
})
// 标题助手
const titleHelpInfo = reactive({
  show: false,
  videoNum: 0 // 已选视频数量，就是生成最大条数
})

const contentTip = computed(() => {
  const accountNum =
    isNotEmpty($data.id) && isNotEmpty(detailAccountTotal.value)
      ? detailAccountTotal.value
      : formData.accountList.length
  console.log('数量', accountNum)
  let lastStr = ''
  if (getVideoNum.value > accountNum) {
    lastStr = `<span class="num_span">${getVideoNum.value - accountNum}</span>条${
      systemVersion.value === 3 ? '素材' : '视频'
    }不会被使用`
  } else {
    lastStr = `<span class="num_span">${accountNum - getVideoNum.value}</span>个账号将不会发布`
  }
  const str =
    `已选择<span class="num_span">${getVideoNum.value}</span>个${
      systemVersion.value === 3 ? '素材' : '视频'
    } /<span class="num_span">${accountNum}</span>个账号。每个账号将随机选择一条不重复的${
      systemVersion.value === 3 ? '素材' : '视频'
    }发布，剩余` + lastStr
  return str
})

// // 抖音poi
// const dyPoiInfo = reactive({
//   showIcon: true, // 是否显示icon
//   iconWidth: 20, // icon宽
//   platform: 1 // 平台 1抖音 2小红书
// })
// // 小红书poi
// const xhsPoiInfo = reactive({
//   showIcon: true, // 是否显示icon
//   iconWidth: 20, // icon宽
//   platform: 2 // 平台 1抖音 2小红书
// })

// 回显时选择的数量需要回显出来
function updateAccountInfo(info) {
  // selectAccountInfo.checkNum = info.page.total
  console.log('需要回显数量', info)
}
watch(
  () => formData.titleList,
  newVal => {
    if (!$data.id) {
      const unEmptyTitles = formData.titleList.filter(x => !!x.title)
      const listLength = getVideoNum.value - unEmptyTitles.length
      titleHelpInfo.videoNum = listLength
    } else {
      titleHelpInfo.videoNum = 0
    }
  },
  { deep: true, immediate: true }
)

// 获取任务名称
function getTaskNameFn() {
  getTaskName({})
    .then(res => {
      console.log('获取任务名称返回res', res)
      if (res.code === 0) {
        formData.publishTaskName = res.data?.taskName
        $data.preTaskId = res.data?.preTaskId
      }
      $data.pageLoading = false
    })
    .catch(() => {
      $data.pageLoading = false
    })
}

// 定时发布时间范围
function disabledDate(date) {
  // 获取当前时间
  // 禁用选择今天之前的日子
  const today = new Date(new Date().setHours(0, 0, 0, 0))
  // 禁用选择30天后的日子
  const thirtyDaysLater = new Date(new Date().setDate(new Date().getDate() + 30))
  return date < today || date > thirtyDaysLater
  // const now = new Date()
  // 当前时刻
  // const thirtyDaysLater = new Date()
  // thirtyDaysLater.setDate(now.getDate() + 30)

  // // 禁用选择当前时间之前的日子和30天后的日子
  // return date < now || date > thirtyDaysLater
}

// // poi选择
// function selectPoiFn(platform, poiInfo) {
//   if (platform === 1) {
//     formData.selectPOiInfo.dy = poiInfo
//   }
//   if (platform === 2) {
//     formData.selectPOiInfo.xhs = poiInfo
//   }
// }
// 删除标题
const delOneTitle = throttle(function (index) {
  formData.titleList.splice(index, 1)
}, 500)

// 标题提交
function titleHelpSubmit(val) {
  const list = []
  if (val) {
    ;(val || []).forEach(item => {
      const one = {
        title: ''
      }
      one.title = item.title
      list.push(one)
    })
  }
  if (list.length > 0) {
    // 过滤当前未填写的标题
    // 舍弃超过已选标题数量的标题
    const unEmptyTitles = formData.titleList.filter(x => !!x.title)
    const listLength = getVideoNum.value - unEmptyTitles.length
    const otherList = list.slice(0, listLength)
    console.log('保留的视频标题', otherList)
    formData.titleList = unEmptyTitles.concat(otherList)
  }
  titleHelpClose()
}
function titleHelpClose() {
  titleHelpInfo.show = false
}

// 打开ai标题
const opAiTitle = throttle(function () {
  if (titleHelpInfo.videoNum <= 0) return
  titleHelpInfo.creativeId = $data.preTaskId
  titleHelpInfo.show = true
}, 500)
// 添加标题
const addVideo = throttle(function () {
  const oneTitle = {
    title: ''
  }
  formData.titleList.push(oneTitle)
}, 500)
function submitSelectAccount(info) {
  accountInfo.chooseAccountGroupId = null
  formData.accountList = info.chooseList
  selectAccountInfo.chooseIds = info.chooseIds
  closeSelectAccount()
}
function closeSelectAccount() {
  selectAccountInfo.show = false
}
// 打开自定义选择账号
const openAccountSelect = throttle(function () {
  if (initDiasbled.value) return
  selectAccountInfo.show = true
  selectAccountInfo.source = subSource.value
}, 500)

// 获取分组内矩阵号列表
function getTableList() {
  const data = {
    pageSize: 999,
    pageNo: 1,
    authStatus: 0, // 筛选授权有效的账号
    dyWebAuthStatus: 0, // 筛选有发布能力的账号
    isSimpleInfo: 1,
    orderBy: 2,
    groupIds: accountInfo.chooseAccountGroupId ? [accountInfo.chooseAccountGroupId] : [],
    // excludePlatform: 2, // 排除视频号
    excludePlatforms: subSource.value === `batchPublishImgtext` ? [2, 4] : [2] // 图文要排除视频号和快手  视频要排除视频号
  }
  getTableListParams.value = JSON.parse(JSON.stringify(data))
  api
    .getMatrixList(data)
    .then(res => {
      if (res.code === 0) {
        if (data.groupIds && data.groupIds.length > 0) {
          formData.accountList = res?.data?.records || []

          const ids = []
          formData.accountList.forEach(item => {
            ids.push(item.openId)
          })
          selectAccountInfo.chooseIds = ids
        } else {
          console.log('清空账号信息，不能获取全部，页面清空即可')
          formData.accountList = []
          selectAccountInfo.chooseIds = []
        }
      }
      accountInfo.loading = false
    })
    .catch(() => {
      accountInfo.loading = false
    })
}
// 选择分组
function chooseGroupChange() {
  accountInfo.loading = true
  getTableList()
}

// 获取分组
function getNewGroupList() {
  api
    .getNewGroupList({})
    .then(res => {
      if (res.success) {
        accountInfo.accountGroupList = res.data || []
      }
    })
    .catch(() => {})
}

// 预览
const palyVideo = throttle(function (item) {
  if (item.type !== 99) {
    previewInfo.cover = item.coverUrl
    previewInfo.url = item.url
    previewInfo.type = 'video'
    previewInfo.title = '预览视频'
    previewInfo.show = true
  } else {
    const imageTextTitle = item.imageTextTitle ? JSON.parse(item.imageTextTitle) : {}
    previewImgTextDialogInfo.value = {
      show: true,
      urlList: item.pictures ? JSON.parse(item.pictures).map(x => x.url) : [],
      title: imageTextTitle.title || '',
      desc: imageTextTitle.description || '',
      mount: item.mount ? JSON.parse(item.mount) : {}
    }
  }
}, 500)
// 删除一条已选
const delVideo = throttle(function (item) {
  if (!item) return
  formData.videoList = formData.videoList.filter(x => x.id !== item.id)
}, 500)

// 选择结果
function updateChooseFun(list) {
  console.log('选择的数据', subSource.value, chooseVideoInfo.subSource)
  formData.videoList = list
  chooseVideoInfo.show = false
  // 如果选中的类型和当前类型不一致，就清空选择的账号、分组、标题、图文话题/@设置
  if (subSource.value !== chooseVideoInfo.subSource) {
    subSource.value = chooseVideoInfo.subSource
    formData.useTaskTitle = false
    accountInfo.chooseAccountGroupId = null
    formData.accountList = []
    formData.isNotePrioritizedTemplateInfo = false
  }
}
// 打开选择视频
const openChooseVideo = throttle(function (type) {
  chooseVideoInfo.show = true
  chooseVideoInfo.subSource = `batchPublish${type}`
}, 500)

// 文本内容校验
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  formRules.publishTaskName = e.target.value.trim().replace(reg, '')
}

function getAccountOpenIds(list) {
  const result = []
  ;(list || []).forEach(item => {
    if (item.openId) {
      result.push(item.openId)
    }
  })
  return result || []
}
// 取消创建
const closeDialog = throttle(function () {
  router.go(-1)
}, 500)
// 确定创建
const handleConfirm = throttle(function () {
  formRef.value.validate(valid => {
    if (valid && !$data.isPublish) {
      // 再验证一下
      if (!formData.publishTaskName) {
        message.warning('请填写发布任务名称！')
        return
      }
      if (!formData.videoList?.length) {
        message.warning(`请至少选择一条${systemVersion.value === 3 ? '素材' : '视频'}！`)
        return
      }
      if (!formData.accountList?.length) {
        message.warning('请至少选择一个账号！')
        return
      }
      if (formData.timingPublish && !formData.publishTime) {
        message.warning('请设置定时发布时间！')
        return
      }
      $data.btnLoading = true

      const params = {
        publishMediaType: subSource.value === 'batchPublishImgtext' ? 2 : 4,
        preTaskId: $data.preTaskId,
        name: formData.publishTaskName,
        videoTitles: getPublishTitle(formData.titleList),
        isAccountPoiPriority: formData.useAccountOwenPoi ? 1 : 0, // 是否优先使用账号poi 1是0否
        isTaskTitlePriority: formData.useTaskTitle ? 1 : 0, // 是有优先使用任务标题
        isDeptPoiPriority: formData.useDepartOwenPoi ? 1 : 0, // 是否优先使用账号绑定的POI
        isNotePrioritizedTemplateInfo: formData.isNotePrioritizedTemplateInfo ? 1 : 0 //   图文优先使用模板信息(话题与@) 1是 0否
      }
      // poi
      if (isNotEmpty(formData.dyPOIInfo)) {
        params.dyPoi = formData.dyPOIInfo.poi
        params.dyPoiName = formData.dyPOIInfo.poiName
      }
      if (isNotEmpty(formData.xhsPOIInfo)) {
        params.xhsPoi = formData.xhsPOIInfo.poi
        params.xhsPoiName = formData.xhsPOIInfo.poiName
        params.xhsPoiSubname = formData.xhsPOIInfo.subname
        params.xhsPoiType = formData.xhsPOIInfo.source
      }
      // 话题
      if (isNotEmpty(formData.dyTopicList)) {
        params.dyTopics = formData.dyTopicList
      }
      if (isNotEmpty(formData.xhsTopicList)) {
        params.xhsTopics = formData.xhsTopicList
      }
      // @
      if (isNotEmpty(formData.dyAtList)) {
        params.dyAtAccounts = formData.dyAtList.map(x => {
          return {
            ...x,
            image:
              isNotEmpty(x.avatarThumb) && isNotEmpty(x.avatarThumb.urlList)
                ? x.avatarThumb.urlList[0]
                : '',
            uid: x.userId,
            nickname: x.name
          }
        })
      }
      if (isNotEmpty(formData.xhsAtList)) {
        params.xhsAtAccounts = formData.xhsAtList.map(x => {
          return { ...x, nickname: x.name, openId: x.userId }
        })
      }
      // 计划发布时间，关闭不传
      if (formData.timingPublish && formData.publishTime) {
        params.planToPublishTime = dateFormat(formData.publishTime, 'YYYY-MM-DD hh:mm:ss')
      }
      // 间隔发布时长 单位s 默认300，不开启传 0 或不传
      if (formData.intervalPublish) {
        params.intervalTime = formData.intervalTime * 60
      }
      // 要发布的成品信息
      params.isVideoSelectAll = false
      const videoIds = formData.videoList.map(x => x.id)
      params.includeVideoIds = videoIds
      // 视频的筛选条件

      // 账号组信息
      if (accountInfo.chooseAccountGroupId) {
        params.accountQueryParam = JSON.stringify(getTableListParams.value)
        params.isAccountSelectAll = true // 选择分组的时候是true
      } else {
        // 选择的账号信息
        params.includeOpenIds = getAccountOpenIds(formData.accountList)
        params.isAccountSelectAll = false
      }

      createPublishTask(params)
        .then(res => {
          if (res.code === 0) {
            $data.isPublish = true

            nextTick(() => {
              router.push('/sumwhy_video/matrix_distribute/success')

              $data.btnLoading = false
            })
          }
        })
        .catch(() => {
          $data.btnLoading = false
        })
    } else {
      console.log('不满足条件')
    }
  })
}, 700)

function getPublishTitle(list) {
  if (!list || list.length === 0) return []
  const resultList = []
  list.forEach(item => {
    if (item.title) {
      resultList.push(item.title)
    }
  })
  return resultList && resultList.length > 0 ? JSON.stringify(resultList) : JSON.stringify([''])
}
const detailAccountTotal = ref(null) // 点击详情页进入获取账号的总数
function initPage() {
  if ($data.id) {
    publishTaskDetail({ id: $data.id })
      .then(res => {
        if (res.code === 0) {
          formData.publishTaskName = res.data?.name || ''
          formData.videoList = res.data?.videos || []
          if (formData.videoList && formData.videoList.length > 0) {
            const hasImgText = formData.videoList.filter(x => x.type === 99)
            subSource.value =
              hasImgText && hasImgText.length > 0 ? 'batchPublishImgtext' : 'batchPublishVideo'
          }
          chooseVideoInfo.videoTotal = res.data?.videoTotal || 0

          if (res.data?.accountQueryParam && res.data.accountQueryParam.length > 0) {
            const accountQueryParam = JSON.parse(res.data.accountQueryParam)
            const { groupIds } = accountQueryParam
            accountInfo.chooseAccountGroupId = groupIds && groupIds.length > 0 ? groupIds[0] : null
          }

          formData.accountList = res.data?.accounts || []
          detailAccountTotal.value = res.data?.accountTotal || 0
          // 回显标题
          const titleList = []
          let { videoTitles } = res.data
          if (videoTitles) {
            videoTitles = JSON.parse(videoTitles)
            videoTitles.forEach(x => {
              if (x) {
                titleList.push({
                  title: x
                })
              }
            })
          }
          if (titleList.length === 0) {
            titleList.push({
              title: ''
            })
          }
          formData.titleList = titleList
          // 回显抖音POI
          if (res.data?.dyPoi) {
            formData.dyPOIInfo = {
              poi: res.data?.dyPoi,
              poiName: res.data?.dyPoiName
            }
          }
          // 回显小红书POI
          if (res.data?.xhsPoi) {
            formData.xhsPOIInfo = {
              poi: res.data?.xhsPoi,
              poiName: res.data?.xhsPoiName,
              subname: res.data?.xhsPoiSubname,
              source: res.data?.xhsPoiType
            }
          }
          // 回显抖音话题
          if (res.data?.dyTopics) {
            formData.dyTopicList = res.data?.dyTopics
          }
          // 回显小红书话题
          if (res.data?.xhsTopics) {
            formData.xhsTopicList = res.data?.xhsTopics
          }
          // 回显抖音@
          if (res.data?.dyAtAccounts) {
            formData.dyAtList = res.data?.dyAtAccounts.map(x => {
              return {
                ...x,
                userId: x.uid,
                name: x.nickname
              }
            })
          }
          // 回显小红书@
          if (res.data?.xhsAtAccounts) {
            formData.xhsAtList = res.data?.xhsAtAccounts
          }

          formData.useAccountOwenPoi = !!res.data?.isAccountPoiPriority
          formData.useTaskTitle = !!res.data?.isTaskTitlePriority
          formData.useDepartOwenPoi = !!res.data?.isDeptPoiPriority
          formData.isNotePrioritizedTemplateInfo = !!res.data?.isNotePrioritizedTemplateInfo
          if (res.data?.planToPublishTime) {
            formData.timingPublish = true
            formData.publishTime = res.data.planToPublishTime
          }
          if (res.data?.intervalTime) {
            formData.intervalPublish = true
          }
        }
        $data.pageLoading = false
      })
      .catch(() => {
        $data.pageLoading = false
      })
  } else {
    getTaskNameFn()
    formData.useAccountOwenPoi = false
    formData.useTaskTitle = false
    formData.isNotePrioritizedTemplateInfo = false
    formData.useDepartOwenPoi = false // 默认关闭
  }
}
onMounted(() => {
  $data.pageLoading = true
  $data.isPublish = false
  if (route.query.id) {
    $data.id = route.query.id
    $data.disabled = true
  }
  initPage()
  getNewGroupList()
})
onUnmounted(() => {
  $data.isPublish = false
})
// 新建时，如果没有选择素材除任务名称外其他选项都禁用
const initDiasbled = computed(() => {
  return !(formData.videoList && formData.videoList.length > 0)
})

// -- 挂载项设置
const mountText = computed(() => {
  const mountList = []
  if (isNotEmpty(formData.dyTopicList)) {
    mountList.push('抖音话题')
  }
  if (isNotEmpty(formData.dyAtList)) {
    mountList.push('抖音@')
  }
  if (isNotEmpty(formData.dyPOIInfo)) {
    mountList.push('抖音POI')
  }
  if (isNotEmpty(formData.xhsTopicList)) {
    mountList.push('小红书话题')
  }
  if (isNotEmpty(formData.xhsAtList)) {
    mountList.push('小红书@')
  }
  if (isNotEmpty(formData.xhsPOIInfo)) {
    mountList.push('小红书POI')
  }
  const textList = []
  if (isNotEmpty(mountList)) {
    textList.push(mountList.join('/'))
  }

  if (formData.useAccountOwenPoi) {
    textList.push('优先挂载账号绑定POI')
  }
  if (formData.useDepartOwenPoi) {
    textList.push('未设置账号绑定POI时，挂载账号所在业务主体部门POI')
  }
  if (formData.isNotePrioritizedTemplateInfo) {
    textList.push('优先挂载图文素材里的话题和@')
  }
  console.log('最新的text', textList)

  return textList
}) // 挂载项的提示文案
const mountDialog = ref({
  show: false,
  info: null,
  disabled: false
})
const showMountFun = throttle(() => {
  mountDialog.value = {
    show: true,
    disabled: $data.disabled || initDiasbled.value,
    origin: subSource.value,
    info: {
      dyTopicList: formData.dyTopicList || [],
      dyAtList: formData.dyAtList || [],
      dyPOIInfo: formData.dyPOIInfo || [],
      xhsTopicList: formData.xhsTopicList || [],
      xhsAtList: formData.xhsAtList || [],
      xhsPOIInfo: formData.xhsPOIInfo || {},
      useAccountOwenPoi: !!formData.useAccountOwenPoi,
      useDepartOwenPoi: !!formData.useDepartOwenPoi,
      isNotePrioritizedTemplateInfo:
        subSource.value === 'batchPublishImgtext' ? !!formData.isNotePrioritizedTemplateInfo : false
    }
  }
})

function updateMountFun(info, dialog, btnLoading) {
  console.log('更新的挂载项', info)
  formData.dyTopicList = info.dyTopicList || []
  formData.dyAtList = info.dyAtList || []
  formData.dyPOIInfo = info.dyPOIInfo || []
  formData.xhsTopicList = info.xhsTopicList || []
  formData.xhsAtList = info.xhsAtList || []
  formData.xhsPOIInfo = info.xhsPOIInfo || []
  formData.useAccountOwenPoi = !!info.useAccountOwenPoi
  formData.useDepartOwenPoi = !!info.useDepartOwenPoi
  formData.isNotePrioritizedTemplateInfo = !!info.isNotePrioritizedTemplateInfo
  nextTick(() => {
    btnLoading.value = false
    dialog.value.handleClose()
  })
}
// -- 挂载项设置end
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.publish_create {
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  position: relative;
  .content {
    height: calc(100% - 80px);
    overflow-y: auto;
    padding-top: 22px;
    padding-bottom: 24px;
    :deep(.el-form-item__label) {
      padding-right: 8px;
    }
    .name_input {
      width: 518px;
    }

    .video_list {
      display: flex;
      flex-wrap: wrap;
      .video_item {
        cursor: pointer;
        width: 90px;
        height: 120px;
        background: #b9b9b9;
        border-radius: 4px;
        position: relative;
        margin-right: 12px;
        &:last-child {
          margin-right: 0;
        }
        .cover_img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 4px;
          object-fit: cover;
        }
        .del_icon {
          width: 20px;
          height: 20px;
          position: absolute;
          top: -8px;
          right: -8px;
          cursor: pointer;
        }
        .paly_icon {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
        }
      }
    }
    .video_list_disabled {
      &:first-child {
        margin-top: 0;
      }
    }
    .p_account_warp {
      .acc_top {
        display: flex;
        align-items: center;
        .more_select_account {
          display: flex;
          align-items: center;
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #364fcd;
          margin-left: 16px;
          user-select: none;
          cursor: pointer;
          .more_select_icon {
            width: 14px;
            height: 14px;
            object-fit: cover;
            margin-left: 4px;
          }
        }
      }
    }
    .video_label {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .account_tip {
      max-height: 40px;
      margin-left: 232px;
      display: flex;
      align-items: center;
      background: #eaedfa;
      border-radius: 4px;
      border: 1px solid #889cff;
      padding: 10px 16px;
      .tip_icon {
        width: 16px;
        height: 16px;
        min-width: 16px;
      }
      .text {
        display: flex;
        align-items: center;
        margin-left: 10px;
      }
    }
    .video_title_warp {
      display: flex;
      align-items: center;
      .ai_box {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #f85151;
        background: rgba(248, 81, 81, 0.1);
        user-select: none;
        cursor: pointer;
        padding: 5px 8px;
        width: max-content;
        margin-left: 24px;
        line-height: 18px;
        position: relative;
        border-radius: 4px;
        .ai_icon {
          position: absolute;
          right: -12px;
          top: -10px;
          width: 19px;
          height: 17px;
        }
      }
      .ai_box_disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    .title_list_warp {
      .title_item {
        margin-top: 16px;
        display: flex;
        align-items: center;
        .del_btn {
          cursor: pointer;
          margin-left: 12px;
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #364fcd;
          user-select: none;
        }
      }
      .title_item_disabled {
        &:first-child {
          margin-top: 0;
        }
      }
    }
    .poi_warp {
      .poi_item + .poi_item {
        margin-top: 16px;
      }
      .poi_tip {
        display: flex;
        align-items: center;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #909399;
        margin-top: 8px;
        margin-left: 0;
      }
      .poi_tip_depart {
        margin-top: 0;
      }
    }

    .time_warp {
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #909399;
      margin-left: 12px;
      :deep(.el-icon) {
        height: unset;
      }
    }
    .interval_tip {
      line-height: unset;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #909399;
      margin-left: 12px;
    }
  }
  .disabled_content {
    height: 100%;
  }
  .btn {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background: #ffffff;
    box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
    border-radius: 0px 0px 4px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.choose_num {
  display: flex;
  align-items: center;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #909399;
  .num_span {
    padding: 0 4px;
    color: #364fcd;
  }
}
.num_span {
  color: #364fcd;
  padding: 0 4px;
  line-height: 20px !important;
}
:deep(.num_span) {
  color: #364fcd;
  padding: 0 4px;
  line-height: 20px !important;
}

:deep(.poi_form_item) {
  margin-bottom: 12px !important;
}
:deep(.publish_time) {
  margin-bottom: 14px !important;
}
:deep(.choose_video) {
  margin-bottom: 14px !important;
}
:deep(.choose_acc) {
  margin-bottom: 14px !important;
}
.mount_box {
  margin-top: 16px;
  width: 558px;
  height: max-content;
  background: #f2f3f5;
  border-radius: 2px;
  padding: 12px 16px;
  div + div {
    margin-top: 8px;
  }
  div {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: #606266;
    line-height: 20px;
    img {
      width: 16px;
      height: 16px;
      object-fit: contain;
      display: flex;
    }
  }
}
</style>
