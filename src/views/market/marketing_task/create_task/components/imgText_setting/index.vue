<template>
  <div class="setting_block">
    <div class="setting_title">内容设置</div>
    <div class="setting_main">
      <!-- 图文发布平台 -->
      <el-form-item
        class="tag_formItem"
        label="图文发布平台："
        prop="video_publish_platform"
        style="flex: 1"
      >
        <el-checkbox-group
          @change="changePlatform"
          v-model="data.publishPlatform"
          :disabled="disabled"
          style="height: unset"
          :min="1"
        >
          <!-- <el-checkbox label="0">不限制平台</el-checkbox> -->
          <el-checkbox label="1">抖音</el-checkbox>
          <el-checkbox label="3">小红书</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <!--  扫码发布 没有全局开就单独显示     -->
      <!--      <el-form-item-->
      <!--        v-if="dyVersion != 2"-->
      <!--        label="扫码发布："-->
      <!--        prop="scan_and_publish"-->
      <!--      >-->
      <!--        <div class="flex_box">-->
      <!--          <el-switch-->
      <!--            v-model="canScanPublish"-->
      <!--            :disabled="disabled || scanPublishDisabled"-->
      <!--            inline-prompt-->
      <!--            active-text="开"-->
      <!--            inactive-text="关"-->
      <!--            active-value="1"-->
      <!--            inactive-value="0"-->
      <!--          />-->
      <!--          <div class="tip" style="margin-left: 5px">-->
      <!--            开启后，抖音平台将通过扫码发布，其他平台不受影响-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </el-form-item>-->
      <el-form-item
        class="tag_formItem"
        label="图文发布方式："
        prop="video_push_mode"
        style="flex: 1"
      >
        <el-radio-group
          @change="changeWay"
          v-model="data.modeList"
          :disabled="disabled"
          style="height: unset"
        >
          <el-radio label="1">自由创作</el-radio>
          <el-radio label="4">一键转发</el-radio>
          <el-radio label="3">创意模板发布</el-radio>
        </el-radio-group>
        <div class="tip" v-if="data.modeList">
          {{ tipText || '' }}
        </div>
      </el-form-item>
      <!--  是否可以重新参与      -->
      <!-- <el-form-item
        v-if="pushMode == RELEASE_TYPE.get('upload') && dyVersion == 3"
        label="重复参与"
      >
        <div
          class="repeated_wrapper"
          :style="{ height: repeatedInfo.switchStatus == 1 ? '130px' : '64px' }"
        >
          <div class="audit_wrapper">
            <el-switch
              v-model="repeatedInfo.switchStatus"
              :active-value="1"
              :inactive-value="0"
              @change="repeatedInfoChange($event, 'switchStatus')"
              :disabled="disabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
            />
          </div>
          <div class="tip">开启后，任务将支持成员在时间范围内多次参与，任务奖励也会多次发放</div>
          <el-radio-group
            v-if="repeatedInfo.switchStatus === 1"
            v-model="repeatedInfo.typeRadio"
            :disabled="disabled"
            @change="repeatedInfoChange($event, 'typeRadio')"
          >
            <el-radio :label="1">
              <div class="repeated_radio">
                每
                <el-input-number
                  class="repeated_radio_input_number"
                  v-model="repeatedInfo.everyday"
                  @change="repeatedInfoChange($event, 'everyday')"
                  :disabled="disabled"
                  :min="1"
                  :max="100"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                />
                日可参与1次，任务范围内每位成员最多参与
                <el-input-number
                  class="repeated_radio_input_number"
                  v-model="repeatedInfo.maximum"
                  @change="repeatedInfoChange($event, 'maximum')"
                  :disabled="disabled"
                  :min="2"
                  :max="100"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                />
                次
              </div>
            </el-radio>
            <el-radio :label="2">
              <div class="repeated_radio">
                完成1次任务后可继续参与，任务范围内每位成员最多参与
                <el-input-number
                  class="repeated_radio_input_number"
                  @change="repeatedInfoChange($event, 'totalMaximum')"
                  v-model="repeatedInfo.totalMaximum"
                  :disabled="disabled"
                  :min="2"
                  :max="100"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                />
                次
              </div>
            </el-radio>
          </el-radio-group>
        </div>
      </el-form-item> -->
      <!-- 模板发布扩展内容 -->
      <el-form-item
        v-if="data.modeList == 3 && pushMode == RELEASE_TYPE.get('sumvideo')"
        prop="video_set_template"
      >
        <div class="sumvideo_template" style="display: flex" v-if="data.templateInfo">
          <div>
            <div
              class="template_cover"
              :style="{
                'background-image': `url(${
                  data.templateInfo.thumbCoverUrl || data.templateInfo.coverUrl
                }),linear-gradient(135deg, #eff2ff 0%, #dbe0ff 100%)`
              }"
            >
              <div class="digital_icon_left" v-if="data.templateInfo.tag == 2"></div>
              <template v-if="!disabled">
                <div class="del_btn" @click="deleteTemplate">
                  <el-icon color="#ffffff" size="18">
                    <i-delete />
                  </el-icon>
                </div>
              </template>
            </div>
            <div class="template_name">{{ data.templateInfo.name }}</div>
          </div>
          <!-- 右边 分镜提示等 -->
          <div class="template_r_tips">
            创意包含
            <span class="num_tips">{{ data.templateInfo.photoClipCnt || 0 }}</span>
            张图片
            <template v-if="data.templateInfo.textClipCnt">
              ，
              <span class="num_tips">{{ data.templateInfo.textClipCnt || 0 }}</span>
              个文本
            </template>
            ，目前
            <span class="num_tips">{{ data.templateInfo.replaceCnt || 0 }}</span>
            张图片可替换
            <span class="num_tips get_new" @click="getReplaceCnt(data.templateInfo.id, true)">
              {{ '刷新' }}
            </span>
            <br />
            <span class="num_tips go_det" @click="goReplaceDet">查看模板详情>></span>
          </div>
        </div>
        <div class="sumvideo_btn" @click="data.showTemplateDialog = true" v-else>
          <el-icon size="24" color="#999">
            <i-plus />
          </el-icon>
          <div class="sumvideo_btn_text">添加模板</div>
        </div>
      </el-form-item>
      <!-- 一键转发扩展内容 -->
      <el-form-item label="选择图文：" v-if="data.modeList == 4" prop="video_forward_conditions">
        <el-button type="primary" :disabled="disabled" @click="data.showVideoListDialog = true">
          选择图文
        </el-button>
        <div class="choose_result" v-if="data.forwardConditions">
          从素材库中共计筛选了
          <span style="color: #364fcd">{{ data?.forwardConditions.total || 0 }}</span>
          个图文素材
        </div>
      </el-form-item>
      <!-- 图文标题参考 -->
      <el-form-item class="tag_formItem keyword_formItem" label="图文参考标题：" style="flex: 1">
        <template #label>
          <div class="keyword_label">
            图文参考标题：
            <el-tooltip placement="top">
              <template #content>
                <div style="max-width: 330px">员工发布时会参考生成的标题自动仿写</div>
              </template>
              <span class="xm_tooltipOfRight"></span>
            </el-tooltip>
          </div>
        </template>
        <keywordToTitle
          btnText="AI一键生成标题"
          width="542px"
          :formData="formData"
          :platformList="platformList"
          :disabled="disabled"
          :dyTopicList="atAndTopicAndPoi.topicList"
          :dyAtList="atAndTopicAndPoi.dyAtList"
          :xhsTopicList="atAndTopicAndPoi.topicList"
          :xhsAtList="atAndTopicAndPoi.xhsAtList"
          :keywordList="formData.keywordList"
        />
      </el-form-item>

      <!--挂载项设置   v-if="showMount"-->
      <el-form-item
        label="挂载项设置："
        prop="mountContent"
        v-if="!!data.modeList && dyVersion != 3"
      >
        <mount-dialog :taskType="taskType" :disabled="disabled" :taskInfo="taskInfo"></mount-dialog>
      </el-form-item>
      <!-- 发布标题 -->
      <el-form-item
        label="发布标题："
        prop="publish_title_config"
        v-if="data.modeList == 1 && dyVersion != 3"
      >
        <!-- <el-radio-group
          v-model="data.publishTitleConfig"
          style="height: unset"
          :disabled="disabled"
          @change="publishTitleConfigChange"
        >
          <el-radio label="1">手动填写</el-radio>
          <el-radio label="2">固定标题</el-radio>
          <el-radio label="3">智能推荐</el-radio>
        </el-radio-group> -->
        <div class="title_warp">
          <!-- <div class="tip" v-if="data.publishTitleConfig == '1'">
            员工在做任务时可自由选择是否填写并携带标题发布内容
          </div> -->
          <el-input
            v-if="data.publishTitleConfig == '1'"
            :disabled="disabled"
            :placeholder="`请输入预设发布标题，员工可手动修改`"
            v-model="
              (
                videoConfig.children.find(s => {
                  return s.ckey === 'video_title'
                }) || { cvalue: null }
              ).cvalue
            "
            type="textarea"
            resize="none"
            show-word-limit
            :autosize="{ minRows: 3, maxRows: 4 }"
            :maxlength="500"
            @input="titleInput"
          ></el-input>
          <div
            class="tip"
            v-if="
              data.titleOver && data.publishTitleConfig == '1' && data.publishPlatform.includes('3')
            "
          >
            发布到小红书时，超出20字的部分将自动拆为笔记正文描述
          </div>
          <!-- <div class="tip" v-if="data.publishTitleConfig == '3'">
            智能自动填写关联模板标题文案库中的文案，员工可修改
          </div> -->
        </div>
      </el-form-item>
      <!-- 作品标签 -->
      <!-- <el-form-item class="tag_formItem" label="作品标签：" prop="video_tags_set">
        <tagSetting
          v-if="data.mountedOverTag"
          :disabled="disabled"
          :tagInfo="data.tagInfo"
          type="videoTagSet"
          @updateTag="filterVideoTag"
        ></tagSetting>
      </el-form-item> -->
    </div>
    <!-- 选择图文池 -->
    <videoList
      ref="videoListRef"
      title="任务图文池设置"
      subTitle="执行任务时达人从设置的图文池中挑选图文发布"
      materialType="imgtext"
      @filterConditions="filterConditions"
      v-model:showDialog="data.showVideoListDialog"
    />
    <!-- 选择创意模板 -->
    <sumvideo-template-dialog
      ref="sumvideoTemplateDialogEle"
      v-if="data.showTemplateDialog"
      @chooseTemplate="chooseTemplate"
      :type="pushMode"
      :templateType="'imgtext'"
      :videoTemplateList="data.videoTemplateList"
      v-model:showDialog="data.showTemplateDialog"
    />
  </div>
</template>

<script setup>
// import tagSetting from '../tag_setting/index.vue'
import videoList from '../video_setting/video_list.vue'
import MountDialog from '../video_setting/mount_dialog.vue'
import sumvideoTemplateDialog from '../video_setting/sumvideo_template_dialog.vue'
import keywordToTitle from '../video_setting/keyword_to_title.vue'
import { RELEASE_TYPE } from '@/utils/dictionary/task.js'
import { ElMessage } from 'element-plus'
import { getCreativeReplaceCnt } from '@/api/market/task_audit'
import { getForwardVideoList } from '@/api/market/task.js'
import { isNotEmpty } from '@/utils/tools.js'

import { useStore } from 'vuex'

const store = useStore()
const dyVersion = computed(() => store.state.user.dyVersion)

const props = defineProps({
  videoConfig: Object,
  taskInfo: Object,
  disabled: Boolean,
  pageSource: String,
  taskType: Number,
  isFromCalendar: Boolean // 是否从营销计划进入
})
// const isFromCalendar = toRef(props, 'isFromCalendar')
const videoConfig = toRef(props, 'videoConfig')

const disabled = toRef(props, 'disabled')

const emits = defineEmits(['updateValidate', 'publishPlatformChange'])

const videoListRef = ref(null)

const data = reactive({
  publishPlatform: ['1'], // 图文发布平台
  tagInfo: '',
  mountedOverTag: false, // 是否获取到标签
  publishTitleConfig: '1',
  titleOver: false, // 输入的标题书否超过20个字
  modeList: null, // 发布方式 1相册上传直接发布 4一键转发 3创意模板
  showVideoListDialog: false, // 是否显示图文选择弹窗
  forwardConditions: null, // 获取图文池参数
  templateInfo: null, // 选择的创意模板信息
  showTemplateDialog: false // 是否显示创意模板选择弹窗
})

const sumvideoTemplateDialogEle = ref(null)

const pushMode = computed(() => {
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_push_mode') {
      return config.cvalue
    }
  }
})

const tipText = computed(() => {
  const tipSet = {
    1: '账号上传图片后直接发布',
    4: '从素材库中框选出图文池，员工做任务时需要从图文池中选择一个图文发布',
    3: '从图文模板中选择模板，使用后成员需按照此模板制作图文'
  }
  return tipSet[data.modeList]
})

// 去查看素材详情
function goReplaceDet() {
  window.open(
    `${location.origin}/sumwhy_video/template_imgText/detail?id=${data.templateInfo.id}`,
    '_blank'
  )
}
// 删除已选模板
function deleteTemplate() {
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_set_template') {
      config.cvalue = null
    }
  }
  if (sumvideoTemplateDialogEle.value) {
    sumvideoTemplateDialogEle.value.clearCheck()
  }

  data.templateInfo = null
}

// 获取分镜数和可替换分镜数
function getReplaceCnt(creativeId, refresh = false) {
  getCreativeReplaceCnt({ creativeId }).then(res => {
    data.templateInfo = {
      ...data.templateInfo,
      replaceCnt: res.data.replaceCnt,
      photoClipCnt: res.data.photoClipCnt,
      textClipCnt: res.data.textClipCnt
    }
    if (refresh) {
      ElMessage.success('刷新成功！')
    }
  })
}
// 更新模板信息 item 是要更新的数据  type 是视频发布方式  skipSetType 是跳过设置data的数据
function chooseTemplate(item, type, skipSetType) {
  console.log('选择创意模板', item, type, skipSetType)
  if (!skipSetType) {
    data.templateInfo = item
  }
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_set_template') {
      config.cvalue = JSON.stringify(item)
    }
  }
  getReplaceCnt(item.id)

  emits('updateValidate', 'video_set_template')
}

// 选择图文池
function filterConditions(option) {
  console.log('更新图文池选择', option)
  data.forwardConditions = JSON.parse(JSON.stringify(option))
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_forward_conditions') {
      config.cvalue = JSON.stringify(option)
    }
  }
  emits('updateValidate', 'video_forward_conditions')
}

function titleInput(e) {
  if (e?.length > 20) {
    data.titleOver = true
  } else {
    data.titleOver = false
  }
}
// const showScanPublish = ref(false)
//
// const canScanPublish = computed({
//   get() {
//     return videoConfig?.value.children.find(
//       item => item.ckey === 'scan_and_publish'
//     )?.cvalue
//   },
//   set(value) {
//     const scanPublishSetting = videoConfig?.value.children.find(
//       item => item.ckey === 'scan_and_publish'
//     )
//     scanPublishSetting.cvalue = value
//   }
// })
// // 是否显示扫码发布
// const scanPublishDisabled = computed(() => {
//   return data.publishPlatform !== '0' && data.publishPlatform !== '1'
// })
// function publishTitleConfigChange() {
//   data.titleOver = false
//   videoConfig.value.children.forEach(item => {
//     if (item.ckey === 'video_title') {
//       item.cvalue = ''
//     }
//     if (item.ckey === 'publish_title_config') {
//       item.cvalue = data.publishTitleConfig
//     }
//   })
// }
// 为了在复制任务->选择转发任务时去除视频、图片样例
const requireConfig = props.taskInfo?.infoConfigs.find(item => item.ckey === 'task_require')

// 修改发布方式
function changeWay(e) {
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_push_mode') {
      config.cvalue = data.modeList || '1'
    }
    // 切换的时候清空填写标题
    if (config.ckey === 'video_title') {
      config.cvalue = ''
    }
    // 切换时清空重复参与相关
    if (config.ckey === 'multi_join_set') {
      config.cvalue = 0
      repeatedInfo.value.switchStatus = 0
    }
    if (config.ckey === 'multi_join_type') {
      config.cvalue = 1
      repeatedInfo.value.typeRadio = 1
    }
    if (config.ckey === 'join_interval') {
      config.cvalue = 1
      repeatedInfo.value.everyday = 1
    }
    if (config.ckey === 'total_join_times') {
      config.cvalue = 1
      repeatedInfo.value.maximum = 2
      repeatedInfo.value.totalMaximum = 2
    }
  }
  // 如果非上传图文，则清空视频示例和图片指引
  if (Number(e) === 4 || Number(e) === 3) {
    requireConfig.children.forEach(e => {
      if (e.ckey === 'video_demo' || e.ckey === 'image_guide') {
        e.cvalue = null
      }
    })
  }

  emits('updateValidate', 'video_push_mode')
}

// 修改发布平台
function changePlatform(value) {
  // data.titleOver = false
  data.publishTitleConfig = '1'
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_publish_platform') {
      config.cvalue = data.publishPlatform.join(',')
    }
  }
  // 如果选中的包含抖音的平台关闭并且禁用
  // if (scanPublishDisabled.value) {
  //   canScanPublish.value = '0'
  // }
  emits('updateValidate', 'video_publish_platform')
  // 如果选择了抖音 清空小红书POI 选择了小红书 清空抖音POI 选择了快手或者视频号 清空小红书和抖音POI
  emits('publishPlatformChange', value)
}

// 显示挂载项配置 不限平台 抖音 小红书 这三个需要显示挂载项设置
// const showMount = computed(() => {
//   // 获取视频发布设置的当前值
//   // 值为0 或者 1  显示
//   const value = videoConfig?.value.children.find(
//     item => item.ckey === 'video_publish_platform'
//   )?.cvalue
//   return value === '0' || value === '1' || value === '3'
// })

onMounted(() => {
  console.log('videoConfig.value', videoConfig.value.children)

  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]

    if (config.ckey === 'video_publish_platform') {
      if (config.cvalue === '0') {
        // 默认选中所有
        config.cvalue = '1,3'
        data.publishPlatform = ['1', '3']
      } else {
        if (config.cvalue) {
          data.publishPlatform = config.cvalue.split(',')
        } else {
          // 默认选中抖音
          data.publishPlatform = ['1']
        }
      }
      
      emits('publishPlatformChange', data.publishPlatform)
    } else if (config.ckey === 'video_push_mode') {
      console.log('发布方式', config.cvalue)
      data.modeList = config.cvalue || null // 不设置默认选中
    } else if (config.ckey === 'video_tags_set') {
      data.tagInfo = config.cvalue || ''
      data.mountedOverTag = true
    } else if (config.ckey === 'publish_title_config') {
      data.publishTitleConfig = config.cvalue || '1'
    } else if (config.ckey === 'video_title') {
      data.titleOver = config.cvalue && config.cvalue.length > 20
    } else if (config.ckey === 'video_forward_conditions') {
      // "一键转发条件"
      if (config.cvalue) {
        data.forwardConditions = JSON.parse(config.cvalue)
        videoListRef.value.setDefaultParam(data.forwardConditions)
        updateNum()
      }
    } else if (config.ckey === 'video_set_template') {
      // 模板发布信息
      if (pushMode.value === '3') {
        data.templateInfo = JSON.parse(config.cvalue)
        // 回显操作 （编辑，调用下方法
        if (data.templateInfo && data.templateInfo.id) getReplaceCnt(data.templateInfo.id)
      }
    } else if (config.ckey === 'multi_join_set') {
      repeatedInfo.value.switchStatus = config.cvalue ? Number(config.cvalue) : 0
    } else if (config.ckey === 'multi_join_type') {
      repeatedInfo.value.typeRadio = config.cvalue ? Number(config.cvalue) : 1
    } else if (config.ckey === 'join_interval') {
      repeatedInfo.value.everyday =
        repeatedInfo.value.typeRadio === 1 ? (config.cvalue ? Number(config.cvalue) : 1) : 1
    } else if (config.ckey === 'total_join_times') {
      console.log('repeatedInfo.value.typeRadio ', repeatedInfo.value.typeRadio)
      if (repeatedInfo.value.typeRadio === 1) {
        repeatedInfo.value.maximum = config.cvalue ? Number(config.cvalue) : 2
      } else {
        repeatedInfo.value.totalMaximum = config.cvalue ? Number(config.cvalue) : 2
      }
    } else if (config.ckey === 'video_common_mount' && isNotEmpty(config.cvalue)) {
      const cvalue = JSON.parse(config.cvalue)
      if (isNotEmpty(cvalue.titlePrompt)) {
        // 提交是数组 回显是字符串
        formData.titlePrompt = cvalue.titlePrompt[0]
      }
      if (isNotEmpty(cvalue.otherTitle)) {
        formData.otherTitle = cvalue.otherTitle
      }
      if (isNotEmpty(cvalue.xhsTitle)) {
        formData.xhsTitle = cvalue.xhsTitle
      }
      if (isNotEmpty(cvalue.xhsDescription)) {
        formData.xhsDescription = cvalue.xhsDescription
      }
    }
    // if (config.ckey === 'scan_and_publish') {
    //   showScanPublish.value = true
    //   data.canScanPublish = config.cvalue
    // }
  }
})
async function updateNum() {
  const res = await getForwardVideoList(data.forwardConditions)
  data.forwardConditions.total = res.data.total
}
// 更新视频标签
// function filterVideoTag(option) {
//   for (const i in videoConfig.value.children) {
//     const config = videoConfig.value.children[i]
//     if (config.ckey === 'video_tags_set') {
//       config.cvalue = option ? JSON.stringify(option) : ''
//     }
//   }
// }

// --重复参与 begin
const repeatedInfo = ref({
  switchStatus: 0,
  typeRadio: 1, //
  everyday: 1, // 每日可重复参加几次
  maximum: 2, // 每日参加最多几次
  totalMaximum: 2 // 完成即可参与，最高参与次数
})
// 数据修改
// function repeatedInfoChange(data, key) {
//   if (key === 'switchStatus') {
//     videoConfig.value.children.forEach(e => {
//       if (e.ckey === 'multi_join_set') {
//         e.cvalue = data
//       }
//       if (e.ckey === 'multi_join_type') {
//         e.cvalue = repeatedInfo.value.typeRadio
//       }
//       if (e.ckey === 'join_interval') {
//         if (repeatedInfo.value.typeRadio === 1) {
//           e.cvalue = repeatedInfo.value.everyday
//         } else {
//           e.cvalue = ''
//         }
//       }
//       if (e.ckey === 'total_join_times') {
//         if (repeatedInfo.value.typeRadio === 1) {
//           e.cvalue = repeatedInfo.value.maximum
//         } else {
//           e.cvalue = repeatedInfo.value.totalMaximum
//         }
//       }
//     })
//   } else if (key === 'typeRadio') {
//     // 切换参与类型 要设置对应的参数
//     videoConfig.value.children.forEach(e => {
//       if (e.ckey === 'multi_join_type') {
//         e.cvalue = data
//       }
//       if (e.ckey === 'join_interval') {
//         if (data === 1) {
//           e.cvalue = repeatedInfo.value.everyday
//         } else {
//           e.cvalue = ''
//         }
//       }
//       if (e.ckey === 'total_join_times') {
//         if (data === 1) {
//           e.cvalue = repeatedInfo.value.maximum
//         } else {
//           e.cvalue = repeatedInfo.value.totalMaximum
//         }
//       }
//     })
//   } else if (key === 'everyday') {
//     // 重复参与开关开启 & 第一种参与类型[每X日一次，最多参与Y次] 才可以设置参与间隔
//     if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 1) {
//       videoConfig.value.children.forEach(e => {
//         if (e.ckey === 'join_interval') {
//           e.cvalue = data
//         }
//       })
//     }
//   } else if (key === 'maximum') {
//     // 重复参与开关开启 & 第一种参与类型[每X日一次，最多参与Y次] 才可以设置总参与次数
//     if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 1) {
//       videoConfig.value.children.forEach(e => {
//         if (e.ckey === 'total_join_times') {
//           e.cvalue = data
//         }
//       })
//     }
//   } else if (key === 'totalMaximum') {
//     // 重复参与开关开启 & 第二种规则[完成一次后，最多参与Y次] 才可以设置总参与次数
//     if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 2) {
//       videoConfig.value.children.forEach(e => {
//         if (e.ckey === 'total_join_times') {
//           e.cvalue = data
//         }
//       })
//     }
//   }
// }
// --重复参与 end
// --重复参与 end、
const formData = reactive({
  titlePrompt: '',
  otherTitle: '', // 除小红书外的 抖音/视频号/快手标题
  xhsTitle: '',
  xhsDescription: ''
})
const atAndTopicAndPoi = computed(() => {
  const data = {
    topicList: [],
    dyPoiInfo: null,
    dyAtList: [],
    xhsAtList: []
  }
  videoConfig.value.children.forEach(config => {
    if (config.ckey === 'video_common_mount' && isNotEmpty(config.cvalue)) {
      const cvalue = JSON.parse(config.cvalue)
      if (isNotEmpty(cvalue.topicList)) {
        data.topicList = cvalue.topicList
      }
    }
    // 设置抖音@的人
    if (config.ckey === 'video_@_person' && isNotEmpty(config.cvalue)) {
      data.dyAtList = JSON.parse(config.cvalue)
    }
    // 设置小红书@的人
    if (config.ckey === 'video_xhs_@_person' && isNotEmpty(config.cvalue)) {
      data.xhsAtList = JSON.parse(config.cvalue)
    }
  })
  return data
})
// 数据修改
watch(
  () => formData,
  () => {
    updateTask()
  },
  {
    deep: true
  }
)

const platformList = computed(() => {
  return data.publishPlatform.map(item => Number(item))
})
function updateTask() {
  videoConfig.value.children.forEach(config => {
    if (config.ckey === 'intelligent_ai_title') {
      if (formData.otherTitle || formData.xhsDescription || formData.xhsTitle) {
        config.cvalue = JSON.stringify({
          otherTitle: formData.otherTitle,
          xhsDescription: formData.xhsDescription,
          xhsTitle: formData.xhsTitle,
          titlePrompt : formData.titlePrompt // 前端移动端会用到
        })
      } else {
        config.cvalue = ''
      }
    }
    if (config.ckey === 'video_common_mount') {
      let data = isNotEmpty(config.cvalue) ? JSON.parse(config.cvalue) : {}
      data = {
        ...data,
        ...formData,
        titlePrompt : formData.titlePrompt ? [formData.titlePrompt] : '' // 接口要求加上
      }
      config.cvalue = JSON.stringify(data) 
    }
  })
}
</script>

<style lang="scss" scoped>
.setting_main {
  .mount_content_text {
    margin-left: 10px;
    margin-right: 10px;
    display: inline-block;
  }

  .mount_content {
    display: inline-block;
  }
}

.flex_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.choose_result {
  margin-top: 20px;
  background: #f6f7f8;
  border-radius: 4px;
  padding: 16px;
  line-height: 1;
}
.sumvideo_btn {
  cursor: pointer;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px dashed #d8d8d8;
  .sumvideo_btn_text {
    font-size: 14px;
    margin-top: 5px;
    color: #333;
  }
}
.sumvideo_template {
  .template_r_tips {
    margin-left: 20px;
    .num_tips {
      color: #364fcd;
    }
    .get_new {
      cursor: pointer;
      margin-left: 10px;
    }
    .go_det {
      cursor: pointer;
    }
  }
  .template_cover {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 2px;
    background-color: linear-gradient(135deg, #eff2ff 0%, #dbe0ff 100%);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    &:hover {
      .detail_btn,
      .del_btn {
        display: block;
      }
    }
    .detail_btn {
      display: none;
      cursor: pointer;
      position: absolute;
      bottom: 26px;
      left: 50%;
      transform: translateX(-50%);
      width: 85px;
      line-height: 24px;
      text-align: center;
      background: #364fcd;
      border-radius: 2px;
      color: #fff;
      font-size: 14px;
    }
    .del_btn {
      display: none;
      cursor: pointer;
      position: absolute;
      left: 50%;
      bottom: 0;
      height: 24px;
      text-align: center;
      transform: translateX(-50%);
    }
  }
  .template_name {
    width: 120px;
    padding: 0 2px;
    box-sizing: border-box;
    @include mult_line(1);
  }
}
.repeated_wrapper {
  display: block;
  height: 130px;
  :deep(.el-radio) {
    height: 40px;
  }
  .repeated_radio {
    color: #303133;
    margin: 6px 0;
    .repeated_radio_input_number {
      width: 120px;
      margin: 0 8px;
    }
  }
}
.tag_formItem {
  :deep(.el-checkbox__input.is-disabled + span.el-checkbox__label) {
    color: var(--el-checkbox-checked-text-color);
  }
  :deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner) {
    background-color: var(--el-checkbox-checked-bg-color);
    border-color: var(--el-checkbox-checked-input-border-color);
  }
}
:deep(.keyword_formItem) {
  .el-form-item__label {
    padding-right: 4px !important;
  }
  .keyword_label {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .xm_tooltipOfRight::after {
      margin-left: 0;
      width: 16px;
      height: 16px;
    }
  }
  .el-form-item__content {
    flex: auto;
  }
  .one_result {
    width: 542px;
  }
}
:deep(.el-form-item__label) {
  padding-right: 20px;
}
</style>
