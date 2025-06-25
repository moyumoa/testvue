<template>
  <div class="setting_block">
    <div class="setting_title">{{ requirement.name }}</div>
    <div class="setting_main">
      <template v-for="(item, index) in requirement.children">
        <el-form-item
          :key="item.ckey + index"
          v-if="
            !notDefaultShowKeys.includes(item.ckey) || (item.ckey == 'mount_title' && mountInfo)
          "
          :label="item.ckey == 'video_title' && taskType == 6 ? '发布标题：' : item.name + '：'"
          :prop="item.ckey"
        >
          <!-- 视频示例 -->
          <template v-if="item.ckey == 'video_demo'">
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

                <img
                  class="close"
                  @click="deleteVideoDemo(index, item)"
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
                      return handleVideoSuccess(res, item)
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
          </template>
          <!-- 图片示例 -->
          <template v-else-if="item.ckey == 'image_guide'">
            <div class="tip" style="margin-bottom: 12px">
              图片大小{{
                taskType == 6 ? '5M' : '500K'
              }}以内，png、jpg格式，建议图片尺寸为630*280，最多上传{{
                taskType == 6 ? '9' : '5'
              }}个图片
            </div>
            <div class="upload_list">
              <div class="upload_item_wrapper" v-for="(url, index) in data.imgList" :key="index">
                <!-- <img class="upload_item" :src="url" /> -->
                <el-image
                  style="width: 100%; height: 100%; border-radius: 2px"
                  :src="url"
                  fit="cover"
                  :preview-src-list="data.imgList"
                  :initial-index="index"
                ></el-image>

                <img
                  class="close"
                  @click="deleteImageDemo(index, item)"
                  v-if="!disabled"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230610mq634.png"
                  alt=""
                />
              </div>
              <div
                class="upload_item_wrapper"
                v-if="
                  ((taskType == 6 && data.imgList.length < 9) ||
                    (taskType != 6 && data.imgList.length < 5)) &&
                  !disabled
                "
              >
                <el-upload
                  class="uploader"
                  :disabled="data.imgUploadLoading"
                  :action="data.uploadImgUrl"
                  accept="image/jpeg, image/jpg, image/png"
                  :show-file-list="false"
                  :on-success="
                    res => {
                      return handleImageSuccess(res, item)
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
          </template>
          <!-- textarea文本 -->
          <el-input
            v-else-if="isTextarea(item.ckey)"
            :disabled="disabled"
            :placeholder="
              item.ckey == 'video_title' && taskType == 6
                ? `请输入发布至平台的内容标题，若不填写则成员可自定义`
                : `请输入${item.name}`
            "
            v-model="item.cvalue"
            type="textarea"
            resize="none"
            show-word-limit
            :autosize="{ minRows: 3, maxRows: 4 }"
            :maxlength="limitInputLength(item.ckey)"
          ></el-input>

          <!-- 重复参与 只有下载发布模式下的普通任务才加 -->
          <div
            v-else-if="taskType == 2 && item.ckey === 'multi_join_set'"
            class="repeated_wrapper"
            :style="{ height: repeatedInfo.switchStatus == 1 ? '160px' : '64px' }"
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
                    @change="repeatedInfoChange($event, 'maximum')"
                    v-model="repeatedInfo.maximum"
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
          <!--          </el-form-item>-->
          <el-input
            v-else
            :disabled="disabled"
            :placeholder="
              item.ckey == 'video_title' && taskType == 6
                ? `请输入发布至平台的内容标题，若不填写则成员可自定义`
                : `请输入${item.name}`
            "
            v-model="item.cvalue"
            @input="clearEnter($event, item)"
            :maxlength="limitInputLength(item.ckey)"
            :show-word-limit="item.ckey == 'video_title'"
          ></el-input>
          <div class="bottom_tip" v-if="item.ckey == 'live_topic'">
            您可设置直播话题，设置后，员工必须按照您的要求设置直播话题，该场直播才有效，话题不允许输入标点符号
          </div>
          <div class="bottom_tip" v-if="item.ckey == 'mount_title'">
            好的文案可以吸引更多人点击哦，建议 12 字以内
            <el-tooltip popper-class="tooltip-class" placement="right-start" raw-content>
              <template #content>
                <div class="tooltip_content" style="margin-top: -20px">
                  <img src="https://tagvv-1256030678.file.myqcloud.com/202201173i5ny.png" />
                </div>
              </template>
              <span class="remark">查看示例</span>
            </el-tooltip>
          </div>

          <div class="tip" v-if="item.ckey == 'task_require_info' && taskType != 6">
            例如产品实物出镜、近景特写、达人出镜、镜头时长、指定画面等
            <el-tooltip effect="dark" placement="right">
              <template #content>
                真实产品需出镜，并给到产品近景特写，特写时长不低于3s，达人需真人出镜
              </template>
              <span class="remark">查看示例</span>
            </el-tooltip>
          </div>
        </el-form-item>
      </template>
    </div>
  </div>
</template>

<script setup>
import { RELEASE_TYPE } from '@/utils/dictionary/task'
import { getCkeyOfCvalue } from '../task_tools'
// import { limitEnter } from '@/utils/tools'

const props = defineProps({
  requirement: Object,
  taskInfo: Object,
  disabled: Boolean,
  pageSource: String,
  taskType: Number,
  dyVersion: Number
})
const { requirement, taskInfo, disabled, taskType, pageSource, dyVersion } = toRefs(props)

const message = inject('$message')
const data = reactive({
  uploadVideoUrl: '/api/mission/file/videoUploadReturnImg',
  uploadImgUrl: '/api/mission/file/upload',
  // 标题子级key
  // titleKeys: ['video_title', 'video_topic', 'video_@_person'],
  // 标题子级的index
  titleKeyIndexList: [],
  imgList: [],
  videoList: [],
  videoUploadLoading: false,
  imgUploadLoading: false,
  atValue: ''
})

// 是否有标题相关key
// const hasTitleKey = computed(() => {
//   const list = requirement.value.children.filter((e, index) => {
//     const isTitleKey = data.titleKeys.includes(e.ckey)
//     if (isTitleKey) {
//       data.titleKeyIndexList.push(index)
//     }
//     return isTitleKey
//   })
//   return list && list.length
// })

// 不默认显示的key
const notDefaultShowKeys = computed(() => {
  if (
    pushMode.value === RELEASE_TYPE.get('sumvideo') ||
    pushMode.value === RELEASE_TYPE.get('forward')
  ) {
    return [
      // 'video_title',
      // 'video_topic',
      // 'video_@_person',
      'mount_title',
      'video_demo',
      'image_guide'
    ]
  }
  // 下载发布模式下的普通直播任务 要在任务要求里显示重复参与相关
  return dyVersion.value && dyVersion.value === 3 && pageSource.value !== 'growth'
    ? ['mount_title', 'multi_join_type', 'total_join_times', 'join_interval']
    : ['mount_title', 'multi_join_set', 'multi_join_type', 'total_join_times', 'join_interval']
})

// 挂载信息
const mountInfo = computed(() => {
  // 挂载信息为空 置空挂载文案
  if (getCkeyOfCvalue(taskInfo.value, 'mount_set', 'mount_info') === null) {
    const temp = requirement.value.children.find(item => item.ckey === 'mount_title')
    temp.cvalue = null
  }
  return getCkeyOfCvalue(taskInfo.value, 'mount_set', 'mount_info')
})

// 视频发布方式
const pushMode = computed(() => {
  return Number(getCkeyOfCvalue(taskInfo.value, 'video_set', 'video_push_mode'))
})

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
  const typeList = ['image/jpeg', 'image/jpg', 'image/png']
  if (typeList.indexOf(file.type) === -1) {
    message.error('仅支持png、jpg格式的图片')
    return false
  }
  const isLimit =
    taskType.value === 6 ? file.size / 1024 / 1024 <= 5 : file.size / 1024 / 1024 <= 0.5
  if (!isLimit) {
    message.error(`图片大小不能超过${taskType.value === 6 ? '5M' : '500K'}`)
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

function previewVideo(url) {
  window.open(url)
}

// 不同key的最大长度限制
function limitInputLength(ckey) {
  let maxLen = 60
  switch (ckey) {
    case 'live_topic':
      maxLen = 16
      break
    case 'mount_title':
      maxLen = 12
      break
    case 'video_title':
      maxLen = 500
      break
  }
  return maxLen
}

function isTextarea(ckey) {
  const textareaKeys = ['task_require_info', 'video_title']
  return textareaKeys.includes(ckey)
}

// 去除换行
function clearEnter(value, item) {
  const _value = value.replace(/[\r\n]/g, '')
  item.cvalue = _value.trim()
}
// --重复参与 begin
const repeatedInfo = ref({
  switchStatus: 0,
  typeRadio: 1, //
  everyday: 1, // 每日可重复参加几次
  maximum: 2, // 每日参加最多几次
  totalMaximum: 2 // 完成即可参与，最高参与次数
})
// 数据修改
function repeatedInfoChange(data, key) {
  console.log('asdfadfasdf', key, data, repeatedInfo.value)
  if (key === 'switchStatus') {
    requirement.value.children.forEach(e => {
      if (e.ckey === 'multi_join_set') {
        e.cvalue = data
      }
      if (e.ckey === 'multi_join_type') {
        e.cvalue = repeatedInfo.value.typeRadio
      }
      if (e.ckey === 'join_interval') {
        if (repeatedInfo.value.typeRadio === 1) {
          e.cvalue = repeatedInfo.value.everyday
        } else {
          e.cvalue = ''
        }
      }
      if (e.ckey === 'total_join_times') {
        if (repeatedInfo.value.typeRadio === 1) {
          e.cvalue = repeatedInfo.value.maximum
        } else {
          e.cvalue = repeatedInfo.value.totalMaximum
        }
      }
    })
  } else if (key === 'typeRadio') {
    // 切换参与类型 要设置对应的参数
    requirement.value.children.forEach(e => {
      if (e.ckey === 'multi_join_type') {
        e.cvalue = data
      }
      if (e.ckey === 'join_interval') {
        if (data === 1) {
          e.cvalue = repeatedInfo.value.everyday
        } else {
          e.cvalue = ''
        }
      }
      if (e.ckey === 'total_join_times') {
        if (data === 1) {
          e.cvalue = repeatedInfo.value.maximum
        } else {
          e.cvalue = repeatedInfo.value.totalMaximum
        }
      }
    })
  } else if (key === 'everyday') {
    // 重复参与开关开启 & 第一种参与类型[每X日一次，最多参与Y次] 才可以设置参与间隔
    if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 1) {
      requirement.value.children.forEach(e => {
        if (e.ckey === 'join_interval') {
          e.cvalue = data
        }
      })
    }
  } else if (key === 'maximum') {
    // 重复参与开关开启 & 第一种参与类型[每X日一次，最多参与Y次] 才可以设置总参与次数
    if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 1) {
      requirement.value.children.forEach(e => {
        if (e.ckey === 'total_join_times') {
          e.cvalue = data
        }
      })
    }
  } else if (key === 'totalMaximum') {
    // 重复参与开关开启 & 第二种规则[完成一次后，最多参与Y次] 才可以设置总参与次数
    if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 2) {
      requirement.value.children.forEach(e => {
        if (e.ckey === 'total_join_times') {
          e.cvalue = data
        }
      })
    }
  }
}
// --重复参与 end
// onMounted(() => {
//   // 转换图片和视频数据格式 'url,url' => [url, url]
//   requirement.value.children.forEach(req => {
//     if (req.cvalue) {
//       if (req.ckey === 'video_demo') {
//         data.videoList = JSON.parse(req.cvalue)
//       }
//       if (req.ckey === 'image_guide') {
//         data.imgList = req.cvalue.split(',')
//       }
//       if (req.ckey === 'video_@_person') {
//         data.atValue = JSON.parse(req.cvalue).openId
//       }
//     }
//   })
// })
watch(
  () => requirement.value,
  val => {
    if (requirement.value && requirement.value.children) {
      let videoList = []
      let imgList = []
      requirement.value.children.forEach(req => {
        if (req.cvalue) {
          if (req.ckey === 'video_demo') {
            videoList = JSON.parse(req.cvalue)
          }
          if (req.ckey === 'image_guide') {
            imgList = req.cvalue.split(',')
          }
          if (req.ckey === 'video_@_person') {
            data.atValue = JSON.parse(req.cvalue).openId
          }

          // 回显重复参与相关信息--
          if (req.ckey === 'multi_join_set') {
            repeatedInfo.value.switchStatus = Number(req.cvalue) || 0
          }
          if (req.ckey === 'multi_join_type') {
            repeatedInfo.value.typeRadio = Number(req.cvalue) || 1
          }
          if (req.ckey === 'join_interval') {
            repeatedInfo.value.everyday =
              repeatedInfo.value.typeRadio === 1 ? Number(req.cvalue) || 1 : 1
          }
          if (req.ckey === 'total_join_times') {
            if (repeatedInfo.value.typeRadio === 1) {
              repeatedInfo.value.maximum = Number(req.cvalue) || 2
            } else {
              repeatedInfo.value.totalMaximum = Number(req.cvalue) || 2
            }
          }
          // 回显重复参与相关信息--
        }
      })
      data.videoList = videoList || []
      data.imgList = imgList || []
    }
  },
  { deep: true, immediate: true }
)
function clearFun(type) {
  console.log('clera', type)
}
defineExpose({
  clearFun
})
</script>

<style lang="scss" scoped>
.setting_main {
  .title_wrapper {
    margin-top: 10px;
    .title_cell {
      display: flex;
      line-height: 32px;
      margin-bottom: 12px;
      .title_label {
        flex-shrink: 0;
        width: 60px;
        margin-right: 14px;
        text-align: right;
        font-size: 14px;
        color: #606266;
        &.required {
          &::before {
            content: '*';
            margin-right: 4px;
            color: #ff0b00;
          }
        }
      }
      .title_content {
        width: 100%;
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
        border-radius: 2px;
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
:deep .el-select {
  width: 100% !important;
}

// 去除标题要求除话题外的表单error样式
:deep .title_content .video_title .el-textarea__inner,
.title_content .el-form-item.is-error .el-input__inner {
  border-color: #dcdfe6;
}
:deep .el-form-item.is-error .el-input__inner {
  border-color: #dcdfe6;
}
:deep .el-form-item.is-error .el-input__validateIcon {
  color: #dcdfe6 !important;
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
</style>
