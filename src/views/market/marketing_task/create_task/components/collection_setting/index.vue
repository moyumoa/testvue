<template>
  <div class="setting_block">
    <div class="setting_title">征集设置</div>
    <div class="setting_main">
      <template v-for="(config, index) in collectionConfig.children" :key="index">
        <el-form-item
          v-if="showKeys.includes(config.ckey)"
          :label="`${config.ckey === 'video_collect_template' ? '' : config.name + '：'}`"
          :prop="config.ckey"
        >
          <div class="form_item_content" v-if="config.ckey == 'collect_type'">
            <el-radio-group v-model="config.cvalue" :disabled="disabled">
              <el-radio label="1">视频</el-radio>
              <el-radio label="2">原料</el-radio>
            </el-radio-group>
          </div>
          <div class="form_item_content" v-if="config.ckey == 'collect_mode'">
            <el-radio-group
              v-model="config.cvalue"
              :disabled="disabled"
              @change="changeCollectMode($event, config)"
            >
              <el-radio label="1">直接上传视频</el-radio>
              <el-radio label="2">创意模板合成视频</el-radio>
            </el-radio-group>
            <div class="tip" v-if="config.cvalue == 2">
              从企业创意中选择创意脚本；使用后成员需按照此脚本制作视频
            </div>
          </div>
          <!-- 模板发布扩展内容 -->
          <template v-else-if="config.ckey === 'video_collect_template'">
            <div class="sumvideo_template" style="display: flex" v-if="data.templateInfo">
              <div>
                <div
                  class="template_cover"
                  :style="{ 'background-image': `url(${data.templateInfo.coverUrl})` }"
                >
                  <div class="digital_icon_left" v-if="data.templateInfo.tag == 2"></div>
                  <template v-if="!disabled">
                    <div class="del_btn" @click="deleteTemplate(config)">
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
                <span class="num_tips">{{ data.templateInfo.totalCnt || 0 }}</span>
                个分镜，目前
                <span class="num_tips">{{ data.templateInfo.replaceCnt || 0 }}</span>
                个分镜为可替换
                <span class="num_tips get_new" @click="getReplaceCnt(data.templateInfo.id, true)">
                  {{ '刷新' }}
                </span>
                <br />
                <span class="num_tips go_det" @click="goReplaceDet">查看创意详情>></span>
              </div>
            </div>
            <div class="sumvideo_btn" @click="data.showTemplateDialog = true" v-else>
              <el-icon size="24" color="#999">
                <i-plus />
              </el-icon>
              <div class="sumvideo_btn_text">添加创意</div>
            </div>
          </template>
          <!-- 原料征集 -->
          <div class="form_item_content" v-if="config.ckey == 'choose_pipeline'">
            <el-button
              type="primary"
              @click="data.showFlowLineDialog = true"
              v-if="!config.cvalue && !disabled"
            >
              设置
            </el-button>
            <div v-else>
              已选
              <span style="color: #364fcd">{{ data.selectedFlowLineIds.length }}</span>
              条流水线
              <span
                v-if="!disabled"
                style="color: #364fcd; cursor: pointer; margin-left: 16px"
                @click="data.showFlowLineDialog = true"
              >
                重新选择
              </span>
            </div>
          </div>
          <div class="form_item_content" v-if="config.ckey == 'pipeline_lables'">
            <div class="tip">
              共{{ data.labelList.length }}种标签，当前已选
              <span style="color: #364fcd">{{ data.selectedLabels.length }}</span>
              种
            </div>
            <div class="lables">
              <div
                class="lable"
                :class="{ active: item.checked }"
                :style="{
                  cursor: disabled ? 'not-allowed' : 'pointer'
                }"
                @click="onCheckLable(item)"
                v-for="item in data.labelList"
                :key="item.id"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
          <div class="form_item_content" v-if="config.ckey == 'collect_num' && collectType == 2">
            <span style="margin-right: 16px">每种原料采集</span>
            <el-input-number
              v-model="config.cvalue"
              :disabled="disabled"
              :min="1"
              :max="99"
              controls-position="right"
            />
          </div>
          <!-- 视频征集 -->
          <div class="form_item_content" v-if="config.ckey == 'video_tags_set'">
            <tagSetting
              :disabled="disabled"
              :tagInfo="config.cvalue"
              :taskType="props.taskType"
              type="videoTagSet"
              @updateTag="filterVideoTag"
            ></tagSetting>
          </div>
          <div class="form_item_content" v-if="config.ckey == 'video_required'">
            <el-input
              :disabled="disabled"
              :placeholder="`请输入${config.name}`"
              v-model="config.cvalue"
              type="textarea"
              resize="none"
              show-word-limit
              :autosize="{ minRows: 3, maxRows: 4 }"
              :maxlength="60"
            ></el-input>
            <div class="tip">
              例如产品实物出镜、近景特写、达人出镜、镜头时长、指定画面等
              <el-tooltip effect="dark" placement="right">
                <template #content>
                  真实产品需出镜，并给到产品近景特写，特写时长不低于3s，达人需真人出镜
                </template>
                <span class="remark">查看示例</span>
              </el-tooltip>
            </div>
          </div>
          <div class="form_item_content" v-if="config.ckey == 'collect_num' && collectType == 1">
            <span style="margin-right: 16px">每人</span>
            <el-input-number
              v-model="config.cvalue"
              :disabled="disabled"
              :min="1"
              :max="999"
              controls-position="right"
            />
            个
          </div>
          <div class="form_item_content" v-if="config.ckey == 'video_duration_range'">
            <el-input-number
              style="width: 100px"
              v-model="data.videoMinTime"
              :disabled="disabled"
              :min="1"
              :max="99999"
              controls-position="right"
              @change="onChangeVideoTime(config)"
            />
            &nbsp;至&nbsp;
            <el-input-number
              style="width: 100px"
              v-model="data.videoMaxTime"
              :disabled="disabled"
              :min="1"
              :max="99999"
              controls-position="right"
              @change="onChangeVideoTime(config)"
            />
            &nbsp;秒
          </div>
          <div class="form_item_content" v-if="config.ckey == 'video_demo'">
            <div class="tip" style="margin-bottom: 12px">
              视频大小200M以内，MP4、MOV格式，最多上传5个视频
            </div>
            <div class="upload_list">
              <div
                class="upload_item_wrapper"
                v-for="(video, index) in data.videoList"
                :key="index"
              >
                <img class="upload_item" :src="video.img" @click="previewVideo(video.url)" />
                <!-- <div class="close" @click="deleteVideoDemo(index, config)" v-if="!disabled">
                  <el-icon>
                    <i-circle-close-filled />
                  </el-icon>
                </div> -->
                <img
                  class="close"
                  @click="deleteVideoDemo(index, config)"
                  v-if="!disabled"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230610mq634.png"
                  alt=""
                />
              </div>
              <div class="upload_item_wrapper" v-if="data.videoList.length < 5 && !disabled">
                <el-upload
                  :disabled="data.videoUploadLoading"
                  class="uploader"
                  :action="data.uploadVideoUrl"
                  accept="video/mp4"
                  :show-file-list="false"
                  :on-success="
                    res => {
                      return handleVideoSuccess(res, config)
                    }
                  "
                  :before-upload="beforeVideoUpload"
                >
                  <div class="upload_btn" v-loading="data.videoUploadLoading">
                    <el-icon size="24" color="#999">
                      <i-plus />
                    </el-icon>
                    <div class="upload_btn_text">样例视频</div>
                  </div>
                </el-upload>
              </div>
            </div>
          </div>
          <div class="form_item_content" v-if="config.ckey == 'image_guide'">
            <div class="tip" style="margin-bottom: 12px">
              图片大小500K以内，png、jpg格式，建议图片尺寸为630*280，最多上传5个图片
            </div>
            <div class="upload_list">
              <div class="upload_item_wrapper" v-for="(url, index) in data.imgList" :key="index">
                <!-- <img class="upload_item" :src="url" /> -->
                <el-image
                  style="width: 100%; height: 100%"
                  :src="url"
                  fit="cover"
                  :preview-src-list="data.imgList"
                  :initial-index="index"
                ></el-image>
                <!-- <div class="close" @click="deleteImageDemo(index, config)" v-if="!disabled">
                  <el-icon>
                    <i-circle-close-filled />
                  </el-icon>
                </div> -->
                <img
                  class="close"
                  @click="deleteImageDemo(index, config)"
                  v-if="!disabled"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230610mq634.png"
                  alt=""
                />
              </div>
              <div class="upload_item_wrapper" v-if="data.imgList.length < 5 && !disabled">
                <el-upload
                  class="uploader"
                  :disabled="data.imgUploadLoading"
                  :action="data.uploadImgUrl"
                  accept="image/*"
                  :show-file-list="false"
                  :on-success="
                    res => {
                      return handleImageSuccess(res, config)
                    }
                  "
                  :before-upload="beforeImageUpload"
                >
                  <div class="upload_btn" v-loading="data.imgUploadLoading">
                    <el-icon size="24" color="#999">
                      <i-plus />
                    </el-icon>
                    <div class="upload_btn_text">样例图片</div>
                  </div>
                </el-upload>
              </div>
            </div>
          </div>
        </el-form-item>
      </template>
    </div>
  </div>
  <choose-flow-line
    v-if="data.showFlowLineDialog"
    v-model:showDialog="data.showFlowLineDialog"
    :defaultIds="data.selectedFlowLineInfos"
    @chooseFlowLine="onChooseFlowLine"
  ></choose-flow-line>
  <!-- 创意弹窗 -->
  <sumvideo-template-dialog
    ref="sumvideoTemplateDialogEle"
    v-if="data.showTemplateDialog"
    @chooseTemplate="chooseTemplate"
    v-model:showDialog="data.showTemplateDialog"
    type="3"
    :templateType="'video'"
  ></sumvideo-template-dialog>
</template>

<script setup>
import sumvideoTemplateDialog from '../video_setting/sumvideo_template_dialog.vue'
import tagSetting from '../tag_setting/index.vue'
import chooseFlowLine from './choose_flow_line.vue'
import { getPipelineLabelList } from '@/api/market/task'
import { getCkeyOfCvalue } from '../../task_tools'
import { ElMessage } from 'element-plus'
import { getCreativeReplaceCnt } from '@/api/market/task_audit'

const props = defineProps({
  collectionConfig: Object,
  taskInfo: Object,
  disabled: Boolean,
  taskType: Number
})
const { collectionConfig, disabled, taskInfo } = toRefs(props)

const message = inject('$message')
const data = reactive({
  uploadVideoUrl: '/api/mission/file/videoUploadReturnImg',
  uploadImgUrl: '/api/mission/file/upload',
  imgList: [],
  videoList: [],
  videoUploadLoading: false,
  imgUploadLoading: false,
  showFlowLineDialog: false,
  selectedFlowLineIds: [], // 选择流水线ids
  selectedFlowLineInfos: [], // 选择的流水线对象列表
  labelList: [], // 流水线标签列表
  selectedLabels: [], // 选择的流水线标签列表
  labelIds: [], // 预设的标签列表, 任务详情获取
  // 征集原料任务keys
  masterialKeys: ['collect_type', 'choose_pipeline', 'pipeline_lables', 'collect_num'],
  videoKeys1: [
    'collect_type',
    'video_required',
    'collect_num',
    'video_duration_range',
    'video_demo',
    'image_guide',
    'video_tags_set',
    'collect_mode'
  ],
  videoKeys2: ['collect_type', 'video_tags_set', 'collect_mode', 'video_collect_template'],
  videoMinTime: 0,
  videoMaxTime: 0,

  showTemplateDialog: false,

  templateInfo: null
})

// 征集类型
const collectType = computed(() => {
  return getCkeyOfCvalue(taskInfo.value, 'base_set', 'collect_type')
})

// 创意模板合成视频相关操作
const collectMode = computed(() => {
  return getCkeyOfCvalue(taskInfo.value, 'base_set', 'collect_mode')
})
// 要显示的key
const showKeys = computed(() => {
  return Number(collectType.value) === 2
    ? data.masterialKeys
    : Number(collectMode.value) === 1
    ? data.videoKeys1
    : data.videoKeys2
})

// 选择流水线
function onChooseFlowLine(_data) {
  const ids = _data.map(x => x.id)
  data.selectedFlowLineIds = ids
  data.selectedFlowLineInfos = _data
  data.selectedLabels = []
  _getPipelineLabelList(ids)
  collectionConfig.value.children.forEach(config => {
    if (config.ckey === 'choose_pipeline') {
      config.cvalue = ids.join()
    }
  })
}

// 获取流水线标签
function _getPipelineLabelList(ids) {
  getPipelineLabelList({
    condition: {
      labelCollection: 0,
      pipelineIds: ids
    },
    pageNum: 1,
    pageSize: 100
  }).then(res => {
    data.labelList = res.data.records
    if (data.labelIds.length) {
      data.labelList.forEach(e => {
        if (data.labelIds.includes(String(e.id))) {
          e.checked = true
        }
      })
      data.selectedLabels = data.labelList.filter(e => e.checked)
    }
  })
}

// 选择标签
function onCheckLable(item) {
  if (disabled.value) return
  item.checked = !item.checked
  data.selectedLabels = data.labelList.filter(e => e.checked)
  collectionConfig.value.children.forEach(config => {
    if (config.ckey === 'pipeline_lables') {
      if (data.selectedLabels.length) {
        config.cvalue = data.selectedLabels.map(e => e.id).join()
      } else {
        config.cvalue = null
      }
    }
  })
}

function previewVideo(url) {
  window.open(url)
}
// 修改视频时间长度
function onChangeVideoTime(config) {
  const _times = [data.videoMinTime, data.videoMaxTime]
  config.cvalue = _times.join()
}

// 视频上传限制
function beforeVideoUpload(file) {
  const isLimit = file.size / 1024 / 1024 < 200
  if (!isLimit) {
    message.error('视频大小不能超过200M')
  }
  data.videoUploadLoading = isLimit
  return isLimit
}
// 上传视频
function handleVideoSuccess(res, item) {
  data.videoUploadLoading = false
  data.videoList.push(res.data)
  item.cvalue = JSON.stringify(data.videoList)
}
// 删除视频
function deleteVideoDemo(index, item) {
  data.imgUploadLoading = false
  data.videoList.splice(index, 1)
  item.cvalue = JSON.stringify(data.videoList)
}
// 图片上传限制
function beforeImageUpload(file) {
  const isLimit = file.size / 1024 / 1024 < 0.5
  if (!isLimit) {
    message.error('图片大小不能超过500K')
  }
  data.imgUploadLoading = isLimit
  return isLimit
}
// 上传图片
function handleImageSuccess(res, item) {
  data.imgUploadLoading = false
  data.imgList.push(res.data)
  item.cvalue = data.imgList.join(',')
}
// 删除图片
function deleteImageDemo(index, item) {
  data.imgList.splice(index, 1)
  item.cvalue = data.imgList.join(',')
}

onMounted(() => {
  collectionConfig.value.children.forEach(config => {
    if (config.ckey === 'collect_type' && !config.cvalue) {
      config.cvalue = '2'
    }
    if (config.cvalue) {
      if (config.ckey === 'pipeline_lables') {
        data.labelIds = config.cvalue.split(',')
      }
      if (config.ckey === 'choose_pipeline') {
        const ids = config.cvalue.split(',')
        data.selectedFlowLineIds = ids
        _getPipelineLabelList(ids)
      }
      if (config.ckey === 'video_demo') {
        data.videoList = JSON.parse(config.cvalue)
      }
      if (config.ckey === 'image_guide') {
        data.imgList = config.cvalue.split(',')
      }
      if (config.ckey === 'video_duration_range') {
        const _times = config.cvalue.split(',')
        data.videoMinTime = Number(_times[0])
        data.videoMaxTime = Number(_times[1])
      }
      if (config.ckey === 'video_collect_template') {
        data.templateInfo = JSON.parse(config.cvalue)
        getReplaceCnt(data.templateInfo.id)
      }
    }
  })
})
// 更新视频标签
function filterVideoTag(option) {
  console.log('option', option)
  for (const i in collectionConfig.value.children) {
    const config = collectionConfig.value.children[i]
    if (config.ckey === 'video_tags_set') {
      config.cvalue = option ? JSON.stringify(option) : ''
    }
  }
}
const sumvideoTemplateDialogEle = ref(null)
function changeCollectMode(e, config) {
  console.log(e)
  if (e === '1') {
    data.templateInfo = null
    for (const i in collectionConfig.value.children) {
      const config = collectionConfig.value.children[i]
      if (config.ckey === 'video_collect_template') {
        config.cvalue = ''
      }
    }
  }
}
// 清空创意模板信息
function deleteTemplate(item) {
  item.cvalue = null
  data.templateInfo = null
  if (sumvideoTemplateDialogEle.value) {
    sumvideoTemplateDialogEle.value.clearCheck()
  }
}
// 去查看原料详情
function goReplaceDet() {
  window.open(
    `${location.origin}/sumwhy_video/template_space/template_edit?id=${data.templateInfo.id}`,
    '_blank'
  )
}
// 获取分镜数和可替换分镜数
function getReplaceCnt(creativeId, refresh = false) {
  getCreativeReplaceCnt({ creativeId }).then(res => {
    console.log('选择原料的分镜数和可替换分镜数==>', res)
    data.templateInfo = {
      ...data.templateInfo,
      replaceCnt: res.data.replaceCnt,
      totalCnt: res.data.totalCnt
    }
    if (refresh) {
      ElMessage.success('刷新成功！')
    }
  })
}
// 选择创意
function chooseTemplate(item) {
  data.templateInfo = item
  for (const i in collectionConfig.value.children) {
    const config = collectionConfig.value.children[i]
    if (config.ckey === 'video_collect_template') {
      config.cvalue = JSON.stringify(item)
    }
  }
  getReplaceCnt(item.id)
}
</script>

<style lang="scss" scoped>
.form_item_content {
  .lables {
    width: 985px;
    max-height: 140px;
    overflow-y: auto;
    .lable {
      box-sizing: border-box;
      display: inline-block;
      margin-right: 16px;
      margin-bottom: 16px;
      min-width: 80px;
      padding: 0 10px;
      line-height: 26px;
      border-radius: 16px;
      border: 1px solid #dcdfe6;
      color: #303133;
      font-size: 14px;
      text-align: center;
      transition: all 0.2s;
      &.active {
        background-color: #d2d7f0;
        border-color: transparent;
      }
      // &:hover {
      //   background-color: #d2d7f0;
      // }
    }
  }
}

.upload_list {
  display: flex;
  flex-wrap: wrap;
  .upload_item_wrapper {
    position: relative;
    flex-shrink: 0;
    width: 120px;
    height: 120px;
    margin-right: 12px;
    margin-bottom: 12px;
    .upload_item {
      cursor: pointer;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .close {
      cursor: pointer;
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      object-fit: contain;
    }
  }
}
:deep .uploader {
  .upload_btn {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px dashed #d8d8d8;
    .upload_btn_text {
      font-size: 14px;
      margin-top: 5px;
      color: #333;
    }
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
</style>
