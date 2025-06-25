<template>
  <div class="audio_rules">
    <!-- 配置区 -->
    <div class="rules_left" ref="scrollRef">
      <!-- 音频上传方式 -->
      <div class="one_rules rules_top" style="margin-top: 4px">
        <div class="one_label label_20">音频上传方式：</div>
        <div class="one_content">
          <el-checkbox-group
            @change="uploadTypeCheckChange"
            v-model="$data.info.uploadType"
            class="group_box drop_group_box"
          >
            <el-checkbox
              :disabled="item.label === 1 || props.disUploadType.indexOf(item.label) > -1"
              :label="item.label"
              v-for="(item, index) in $data.uploadTypeList"
              :key="index"
            >
              {{ item.name }}
              <!-- 配置文本范围 勾选了文本转音频这个音频上传方式才出现 -->
              <el-button
                v-if="
                  false &&
                  item.label === 3 &&
                  $data.info.uploadType &&
                  $data.info.uploadType.indexOf(3) > -1
                "
                :disabled="props.disUploadType.indexOf(item.label) > -1"
                type="primary"
                @click="showElementDialog"
              >
                设置文本范围
              </el-button>
              <chooseTypeDOM
                v-if="
                  item.label === 3 && $data.info.uploadType && $data.info.uploadType.indexOf(3) > -1
                "
                :disabled="props.disUploadType.indexOf(item.label) > -1"
                @updateChooseList="updateChooseList"
                :creativeReplaceId="creativeReplaceId"
                :mediaType="4"
                :templateId="templateId"
                :info="$data.info"
                :extraInfo="$data.extraInfo"
                :materialDuration="materialDuration"
              />
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="warn_tip" v-if="props.disUploadType.indexOf(3) > -1">
        <el-icon><i-warning /></el-icon>
        音频时长过短，暂不支持文本转音频
      </div>
      <!-- 从原料库选择的视频列表 -->
      <div
        class="choose_material_box choose_material_text"
        v-if="$data.info.uploadType && $data.info.uploadType.indexOf(3) > -1"
        v-loading="$data.chooseLoading"
      >
        <textMaterial
          origin="templateEdit"
          v-if="$data.chooseList && $data.chooseList.length > 0"
          :showMore="true"
          v-model:listTotal="$data.listTotal"
          :mediaType="mediaType"
          :chooseList="$data.chooseList"
          :creativeReplaceId="creativeReplaceId"
          :templateId="templateId"
          v-model:clickStoryboardId="$data.clickStoryboardId"
          v-model:uploadLoading="$data.chooseLoading"
          @showMaterialAllFun="showMaterialAllFun"
          @delFun="delFun($event, $data)"
        />
      </div>
      <!-- 提词器 -->
      <div class="one_rules">
        <div class="one_label">提词器：</div>
        <div class="one_content">
          <el-input
            @blur="retEmit($event, 'teleprompter')"
            maxlength="300"
            type="textarea"
            rows="3"
            resize="none"
            v-model="$data.info.teleprompter"
            placeholder="请输入提词器"
            show-word-limit
            style="width: 360px"
          ></el-input>
          <el-tooltip class="item" effect="dark" content="" placement="right-start">
            <img
              style="margin-top: 8px"
              src="https://tagvv-1256030678.file.myqcloud.com/20230322gvgyn.png"
              class="tooltip_icon"
              alt
            />
            <template #content>
              <div class="teleprompter_box">
                <div class="teleprompter_title">编辑提词器后将在员工录制时进行提示</div>
                <img
                  v-if="props.origin === 'audio'"
                  class="teleprompter_img"
                  src="https://tagvv-1256030678.file.myqcloud.com/202303148eki8.png"
                  alt=""
                />
                <img
                  v-else-if="props.origin === 'digital'"
                  class="teleprompter_img"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230317yfu84.png"
                  alt=""
                />
              </div>
            </template>
          </el-tooltip>
        </div>
      </div>
      <!-- 自动生成字幕 -->
      <div class="one_rules">
        <div class="one_label">自动生成字幕：</div>
        <div class="one_content">
          <el-switch
            v-model="$data.info.fontSetting.autoAsr"
            inline-prompt
            :width="45"
            @change="autoAsrChange"
          ></el-switch>
        </div>
      </div>
      <div v-if="!$data.info.fontSetting.autoAsr" style="height: 20px"></div>
      <!-- 自动生成字幕开了之后才显示 -->
      <template v-if="$data.info.fontSetting.autoAsr">
        <div class="one_rules">
          <div class="one_title">
            字幕规则设置
            <el-tooltip
              class="item"
              effect="dark"
              content="字幕将固定在画面底部显示，不可调整"
              placement="right"
            >
              <img
                style="margin-top: 1px"
                src="https://tagvv-1256030678.file.myqcloud.com/20230322gvgyn.png"
                class="tooltip_icon"
                alt
              />
            </el-tooltip>
          </div>
        </div>
        <!-- 字体 -->
        <div class="one_rules" style="margin-top: 16px">
          <div class="one_label">字体：</div>
          <div class="one_content">
            <el-select
              v-model="$data.info.fontSetting.font"
              placeholder="请选择字体"
              style="width: 276px"
            >
              <el-option
                v-for="item in $data.fontList"
                :label="item.font"
                :value="item.fontKey"
                :key="item.id"
              />
            </el-select>
          </div>
        </div>
        <!-- 字号 -->
        <div class="one_rules">
          <div class="one_label">字号：</div>
          <div class="one_content">
            <el-input-number
              v-model="$data.info.fontSetting.fontSize"
              :min="12"
              :max="50"
              :step="1"
              style="width: 100px"
              controls-position="right"
            />
          </div>
        </div>
        <!-- 字间距 -->
        <div class="one_rules">
          <div class="one_label">字间距：</div>
          <div class="one_content">
            <el-input-number
              v-model="$data.info.fontSetting.spacing"
              :min="0"
              :max="10"
              :step="1"
              style="width: 100px"
              controls-position="right"
            />
          </div>
        </div>
        <!-- 行间距 -->
        <div class="one_rules">
          <div class="one_label">行间距：</div>
          <div class="one_content">
            <el-input-number
              v-model="$data.info.fontSetting.lineSpacing"
              :min="0"
              :max="10"
              :step="1"
              style="width: 100px"
              controls-position="right"
            />
          </div>
        </div>
        <!-- 字幕位置 -->
        <div class="one_rules">
          <div class="one_label">字幕位置：</div>
          <div class="one_content" style="align-items: center">
            X
            <el-input-number
              v-model="$data.info.fontSetting.x"
              :min="0"
              :max="375"
              :step="1"
              style="width: 100px; margin-left: 8px; margin-right: 16px"
              controls-position="right"
              :disabled="$data.info.fontSetting.alignment"
            />
            <el-checkbox
              v-model="$data.info.fontSetting.alignment"
              style="margin-bottom: 0; margin-right: 16px"
              @change="handelChangeTextCenter"
            >
              居中
            </el-checkbox>
            Y
            <el-input-number
              v-model="$data.info.fontSetting.y"
              :min="0"
              :max="yMax"
              :step="1"
              style="width: 100px; margin-left: 8px"
              controls-position="right"
            />
          </div>
        </div>
        <!-- 颜色 -->
        <div class="one_rules">
          <div class="one_label">颜色：</div>
          <div class="one_content">
            <el-color-picker style="width: 60px" v-model="$data.info.fontSetting.fontColor" />
          </div>
        </div>
        <!-- 透明度 -->
        <div class="one_rules">
          <div class="one_label">透明度：</div>
          <div class="one_content">
            <el-slider
              style="width: 252px"
              v-model="$data.info.fontSetting.fontColorOpacity"
              :show-tooltip="false"
              :show-input-controls="false"
              :max="100"
              :min="0"
              :step="1"
            ></el-slider>
            <el-input-number
              style="width: 100px; margin-left: 8px"
              v-model="$data.info.fontSetting.fontColorOpacity"
              :max="100"
              :min="0"
              :step="1"
              controls-position="right"
            />
          </div>
        </div>

        <!-- 样式： -->
        <div class="one_rules">
          <div class="one_label label_24">样式：</div>
          <div class="one_content">
            <el-checkbox v-model="$data.info.fontSetting.fontFace.italic">斜体</el-checkbox>
            <el-checkbox v-model="$data.info.fontSetting.fontFace.bold">加粗</el-checkbox>
            <el-checkbox v-model="$data.info.fontSetting.fontFace.underline">下划线</el-checkbox>
          </div>
        </div>
        <!-- 边框格式 -->
        <div class="one_rules" style="margin-top: 8px">
          <div class="one_label label_24" style="font-weight: 600">边框格式：</div>
          <div class="one_content">
            <div class="top_check" @click="borderStyleChange(1)">
              <el-checkbox v-if="$data.info.fontSetting.borderStyle == 1" checked>描边</el-checkbox>
              <el-checkbox v-else>描边</el-checkbox>
              <div class="check_mask"></div>
            </div>
            <div class="top_check" @click="borderStyleChange(3)">
              <el-checkbox v-if="$data.info.fontSetting.borderStyle == 3" checked>背景</el-checkbox>
              <el-checkbox v-else>背景</el-checkbox>
              <div class="check_mask"></div>
            </div>
          </div>
        </div>
        <!-- 颜色 -->
        <div class="one_rules" style="margin-top: 8px" v-if="$data.info.fontSetting.borderStyle">
          <div class="one_label">
            {{
              $data.info.fontSetting.borderStyle == 3
                ? '背景'
                : $data.info.fontSetting.borderStyle == 1
                ? '描边'
                : ''
            }}颜色：
          </div>
          <div class="one_content">
            <el-color-picker style="width: 60px" v-model="$data.info.fontSetting.outlineColour" />
          </div>
        </div>
        <!-- 宽度 -->
        <div class="one_rules" v-if="$data.info.fontSetting.borderStyle">
          <div class="one_label">
            {{
              $data.info.fontSetting.borderStyle == 3
                ? '背景'
                : $data.info.fontSetting.borderStyle == 1
                ? '描边'
                : ''
            }}宽度：
          </div>
          <div class="one_content">
            <el-slider
              style="width: 252px"
              v-model="$data.info.fontSetting.outline"
              :show-tooltip="false"
              :show-input-controls="false"
              :max="5"
              :min="1"
              :step="1"
            ></el-slider>
            <el-input-number
              style="width: 100px; margin-left: 8px"
              v-model="$data.info.fontSetting.outline"
              :max="5"
              :min="1"
              :step="1"
              controls-position="right"
            />
          </div>
        </div>

        <!-- 不透明度 -->
        <div class="one_rules" v-if="$data.info.fontSetting.borderStyle">
          <div class="one_label">
            {{
              $data.info.fontSetting.borderStyle == 3
                ? '背景'
                : $data.info.fontSetting.borderStyle == 1
                ? '描边'
                : ''
            }}不透明度：
          </div>
          <div class="one_content">
            <el-slider
              style="width: 252px"
              v-model="$data.info.fontSetting.outlineOpacity"
              :show-tooltip="false"
              :show-input-controls="false"
              :max="100"
              :min="0"
              :step="1"
            ></el-slider>
            <el-input-number
              style="width: 100px; margin-left: 8px"
              v-model="$data.info.fontSetting.outlineOpacity"
              :max="100"
              :min="0"
              :step="1"
              controls-position="right"
            />
          </div>
        </div>
      </template>
    </div>
    <!-- 字幕预览区 -->
    <div class="rules_right" v-if="$data.info.fontSetting.autoAsr">
      <img
        class="right_phone"
        src="https://tagvv-1256030678.file.myqcloud.com/20230322p812u.png"
        alt=""
      />
      <div class="right_mark">预览效果仅供参考，可能存在细微偏差</div>
      <div class="right_bottom">
        <sampleSubtitlesDOM
          :fontSetting="$data.info.fontSetting"
          @updatePosition="updatePosition"
          ref="sampleSubtitlesDOMRef"
        />
      </div>
    </div>
    <elementDialog
      v-if="$data.textElementInfo.show"
      :elementDialog="$data.textElementInfo"
      @updateInfo="updateInfo"
    />
    <!-- 查看所有导入原料的弹窗 -->
    <materialDOM
      origin="templateEdit"
      v-if="materialDialog.show"
      :info="$data.info"
      :isDynamicFilter="materialDialog.isDynamicFilter"
      :materialDialog="materialDialog"
      @updateMaterialFilter="updateMaterialFilter"
      @updateChooseList="updateChooseList"
    />
  </div>
</template>
<script setup>
import chooseTypeDOM from './choose_material_type.vue'
import materialDOM from '@/views/sumvideo/create_by_template/components/material_dialog.vue'
import textMaterial from '@/views/sumvideo/create_by_template/components/text_material.vue'

import { getFontList } from '@/api/sumvideo/creative_templateSpectroscope.js'
import { throttle, isEmpty, isNotEmpty } from '@/utils/tools.js'
import elementDialog from '@/views/sumvideo/creative_mould/components/template/element_dialog.vue'
import sampleSubtitlesDOM from './sample_subtitles.vue'
import { delFun, getMaterialList } from './js/choose_material.js'
import { getTextPoint } from '@/views/sumvideo/components/material/high_setting_subTitles_dialog.js'

const props = defineProps({
  creativeReplaceId: Number || String,
  mediaType: Number || String,
  templateId: Number || String,
  info: {
    type: Object,
    default: () => {
      return {}
    }
  },
  origin: {
    type: String,
    default: '' // digital 数字人分镜规则过来 audio 音频分镜规则过来的
  },
  disUploadType: {
    type: Array,
    default() {
      return []
    }
  },
  materialDuration: {
    type: Number,
    default: null // 音频分镜时长
  }
})
const { creativeReplaceId, mediaType, templateId, materialDuration } = toRefs(props)
const yMax = ref(667)
const needInitY = ref(true) // 初始化时，在有回显数据时，不计算y位置
const sampleSubtitlesDOMRef = ref(null)
const $data = reactive({
  info: {}, // 保存信息
  uploadTypeList: [
    {
      label: 1,
      name: '直接录制'
    },
    {
      label: 2,
      name: '上传音频文件'
    },
    {
      label: 3,
      name: '文本转音频'
    }
  ], // 音频上传方式列表
  fontList: [], // 字体列表
  textElementInfo: {
    show: false
  },
  chooseLoading: false, // 从原料库选择的loading
  chooseList: [], // 从原料库选择的视频列表
  listTotal: null // 从原料库选择的视频总数
})
// 获取字体列表
function getFontFun() {
  getFontList({
    applyType: 1,
    orderSetting: '',
    pageNo: 1,
    pageSize: 1000,
    searchCount: true
  }).then(res => {
    if (res.code === 0) {
      $data.fontList = res.data.records || []
    }
  })
}
getFontFun()
function init() {
  const fontSetting = {
    autoAsr: false, // 自动生成字幕 默认关闭
    font: 'wqy-microhei', // 字体
    fontSize: 16, // 字号
    fontColor: '#ffffff', // 字体颜色
    fontColorOpacity: 100, // 透明度，1-100
    spacing: 0, // 字间距
    lineSpacing: 0, // 行间距
    fontFace: {
      bold: false, // 加粗
      italic: false, // 斜体
      underline: false // 下划线
    },
    borderStyle: null, // 边框格式类型 1描边 3背景
    outlineColour: null, // 描边颜色
    outline: null, // 描边宽度
    outlineOpacity: null, // 不透明度
    alignment: true,
    x: 0,
    y: undefined
  }
  if (!isEmpty(props.info)) {
    const info = JSON.parse(JSON.stringify(props.info))
    if (!(props.info.fontSetting && !isEmpty(props.info.fontSetting))) {
      if (info.fontSetting) {
        needInitY.value = true
        info.fontSetting = {
          ...info.fontSetting,
          x: !info.fontSetting.x ? 0 : info.fontSetting.x,
          alignment: !!info.fontSetting.alignment
        }
      }
    } else {
      // 老数据：设置数字人音频的行间距默认值
      if (!(info.fontSetting.lineSpacing && info.fontSetting.lineSpacing > 0)) {
        info.fontSetting.lineSpacing = 0
      }
      // 是否需要初始化x
      if (info.fontSetting.x === undefined) {
        info.fontSetting.x = 0
      } else {
        // 计算回显数据
        info.fontSetting.x = Math.ceil((info.fontSetting.x / 1080) * 375)
      }
      // 是否初始化y
      if (info.fontSetting.y === undefined) {
        info.fontSetting.y = undefined
        needInitY.value = true
      } else {
        // 计算回显数据
        info.fontSetting.y = Math.ceil((info.fontSetting.y / 1920) * 667)
        needInitY.value = false
      }
      // 是否需要初始化居中
      if (info.fontSetting.alignment === undefined) {
        info.fontSetting.alignment = true
        info.fontSetting.x = 0
      } else {
        info.fontSetting.alignment = info.fontSetting.alignment === 'TopCenter'
        if (info.fontSetting.alignment) {
          info.fontSetting.x = 0
        }
      }
    }
    $data.info = info
  } else {
    needInitY.value = true
    $data.info = {
      isDynamicFilter: true,
      uploadType: props.origin === 'digital' ? [1, 2, 3] : [1],
      fontSetting: fontSetting
    }
  }
  console.log('$data.info', $data.info)
  // 如果选择了原料，就去获取素材列表
  if (!($data.info.isAlreadySet === false)) {
    if ($data.info.uploadType && $data.info.uploadType.indexOf(3) > -1) {
      emits('update:initLoading', true)
      getMaterialList($data, 'init', null, null, null, emits, true, true)
    }
  }
}
init()

// 检查是否有表情包
function retEmit(e, type) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  $data.info[type] = e.target.value.replace(reg, '')
}
// 显示文本元素筛选框
const showElementDialog = throttle(() => {
  $data.textElementInfo = {
    show: true,
    elementOrigin: 4,
    info: {
      isDynamicFilter: $data.info.isDynamicFilter,
      filter: $data.info.filter || null,
      creationIds: $data.info.creationIds || [],
      creationList: $data.info.creationList || []
    }
  }
}, 500)

const emits = defineEmits(['updateInfo', 'update:initLoading'])
function handelChangeTextCenter(e) {
  if (e) {
    $data.info.fontSetting.x = 0
  }
}
function autoAsrChange(e) {
  if (e && needInitY.value) {
    sampleSubtitlesDOMRef.value && sampleSubtitlesDOMRef.value.initY()
  }
}

function updatePosition(canvasH, domH) {
  const hDiff = canvasH - domH
  let deepYmax = JSON.parse(JSON.stringify(yMax.value))
  yMax.value = parseInt((hDiff / canvasH) * 667)
  if (deepYmax !== yMax.value && needInitY.value) {
    if ($data.info.fontSetting.y > yMax.value || $data.info.fontSetting.y === undefined) {
      $data.info.fontSetting.y = yMax.value
    }
    deepYmax = yMax.value
    // $data.info.fontSetting.y = $data.info.fontSetting.y
    //   ? $data.info.fontSetting.y
    //   : parseInt((hDiff / canvasH) * 667)
  } else {
    if (!needInitY.value) {
      needInitY.value = true
    }
  }
}
//
function updateInfo(e) {
  $data.info.isDynamicFilter = e.isDynamicFilter
  $data.info.filter = e.filter
  $data.info.creationIds = e.creationIds
  $data.info.creationList = e.creationList
}
watch(
  () => $data.info,
  val => {
    // 处理字幕位置相关信息
    const depVal = JSON.parse(JSON.stringify(val))
    if (depVal.fontSetting) {
      const posiInfo = getTextPoint(val.fontSetting?.x, val.fontSetting?.y)
      // depVal.fontSetting.alignment = val.fontSetting.alignment ? 'TopCenter' : ''
      if (val.fontSetting?.alignment) {
        depVal.fontSetting.alignment = 'TopCenter'
      } else {
        depVal.fontSetting.alignment = ''
      }
      depVal.fontSetting.x = posiInfo.finX
      depVal.fontSetting.y = posiInfo.finY
      console.log('audio_rules监听数据', depVal)
      if (!depVal.fontSetting.autoAsr) {
        // 自动字幕关闭初始化字幕位置
        depVal.fontSetting.x = 0
        depVal.fontSetting.y = undefined
        depVal.fontSetting.alignment = 'TopCenter'
      }
      emits('updateInfo', depVal)
    } else {
      const fontSetting = {
        autoAsr: false, // 自动生成字幕 默认关闭
        font: 'wqy-microhei', // 字体
        fontSize: 16, // 字号
        fontColor: '#ffffff', // 字体颜色
        fontColorOpacity: 100, // 透明度，1-100
        spacing: 0, // 字间距
        lineSpacing: 0, // 行间距
        fontFace: {
          bold: false, // 加粗
          italic: false, // 斜体
          underline: false // 下划线
        },
        borderStyle: null, // 边框格式类型 1描边 3背景
        outlineColour: null, // 描边颜色
        outline: null, // 描边宽度
        outlineOpacity: null, // 不透明度
        alignment: true,
        x: 0,
        y: undefined
      }
      needInitY.value = true
      $data.info = {
        isDynamicFilter: depVal.isDynamicFilter,
        uploadType: depVal.uploadType
          ? depVal.uploadType
          : props.origin === 'digital'
          ? [1, 2, 3]
          : [1],
        teleprompter: depVal.teleprompter || '',
        filter: depVal.filter,
        fontSetting: fontSetting
      }
    }
  },
  { deep: true, immediate: true }
)
const scrollRef = ref(null)
// 边框格式修改
function borderStyleChange(type) {
  if (type === 1) {
    if ($data.info.fontSetting.borderStyle === 1) {
      $data.info.fontSetting.borderStyle = null
      $data.info.fontSetting.outline = null
      $data.info.fontSetting.outlineColour = null
      $data.info.fontSetting.outlineOpacity = null
    } else {
      $data.info.fontSetting.borderStyle = 1
      $data.info.fontSetting.outline = 2
      $data.info.fontSetting.outlineColour = '#000000'
      $data.info.fontSetting.outlineOpacity = 100
    }
  } else {
    if ($data.info.fontSetting.borderStyle === 3) {
      $data.info.fontSetting.borderStyle = null
      $data.info.fontSetting.outline = null
      $data.info.fontSetting.outlineColour = null
      $data.info.fontSetting.outlineOpacity = null
    } else {
      $data.info.fontSetting.borderStyle = 3
      $data.info.fontSetting.outline = 2
      $data.info.fontSetting.outlineColour = '#000000'
      $data.info.fontSetting.outlineOpacity = 100
    }
  }
  nextTick(() => {
    scrollRef.value.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'smooth' })
  })
}

// 点击查看全部
const materialDialog = ref({
  show: false
})
function showMaterialAllFun() {
  const filter = JSON.parse(
    JSON.stringify(
      $data.info.isDynamicFilter
        ? $data.info.filter || {}
        : {
            includeIds: $data.info.creationIds || []
          }
    )
  )
  if ($data.info.isDynamicFilter) {
    filter.type = [filter.type]
  }
  materialDialog.value = {
    useAIText: false, // 是否使用文本+AI朗读
    mediaType: 3, // 实际的原料类型
    materialType: 3, // 要显示的原料类型 因为不足2秒的音频是打开文本弹窗
    creativeReplaceId: creativeReplaceId.value, // 分镜替换ID
    templateId: templateId.value, // 模板ID
    pipelineId: null, // 流水线ID
    show: true,
    filter: filter,
    isDynamicFilter: $data.info.isDynamicFilter
  }
}
// 查看全部弹窗里点击了删除，所以要更新最新的导入原料信息和数量
function updateChooseList(data, total) {
  $data.listTotal = total
  $data.chooseList = data
}
// 查看全部弹窗点击了删除，所以要更新删除ID
function updateMaterialFilter(ids) {
  if (materialDialog.value.isDynamicFilter) {
    $data.info.filter.excludeIds = ids
  } else {
    $data.info.creationIds = ids
  }
}

// 音频上传方式修改
function uploadTypeCheckChange(e) {
  console.log('uploadTypeCheckChange', e)
  console.log(
    '$ddd',
    $data.info.uploadType,
    $data.info.filter,
    $data.info.isDynamicFilter,
    $data.info.creationIds
  )
  if (
    !($data.chooseList && $data.chooseList.length > 0) ||
    !(
      ($data.info.isDynamicFilter && isNotEmpty($data.info.filter)) ||
      (!$data.info.isDynamicFilter && isNotEmpty($data.info.creationIds))
    )
  ) {
    emits('update:initLoading', true)
    $data.info.filter = { folderIds: [], type: 4, excludeIds: [] }
    getMaterialList($data, 'init', null, null, null, emits, true, true)
  }
}
</script>
<style lang="scss" scoped>
@import './scss/rules.scss';
div {
  box-sizing: border-box;
}
.audio_rules {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px 0 20px;
  .rules_left {
    width: 525px;
    max-height: 56vh;
    overflow-y: auto;
    margin-right: 16px;
  }
  .rules_right {
    width: 228px;
    // height: 494px;
    position: relative;
    overflow: hidden;
    .right_phone {
      width: 100%;
      height: 494px;
      display: flex;
      object-fit: contain;
    }
    .right_mark {
      width: 100%;
      font-size: 12px;
      font-weight: 400;
      color: #909399;
      line-height: 17px;
      text-align: center;
    }
    .right_bottom {
      position: absolute;
      left: 5px;
      bottom: 71px;
      width: calc(100% - 10px);
      text-align: center;
      overflow: hidden;
      height: 404px;
      // display: flex;
      // flex-direction: column;
      // justify-content: flex-end;
      // align-items: flex-end;
    }
    .right_text {
      width: 100%;
      text-align: center;
      line-height: 1.2;
    }
  }
}
.warn_tip {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: #f1924e;
  padding-left: 106px;
  margin-bottom: 16px;
  .el-icon {
    margin-right: 6px;
  }
}

.top_check {
  position: relative;
  .check_mask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    cursor: pointer;
  }
}
.top_check + .top_check {
  margin-left: 30px;
}
:deep(.storyboard_material_box .material_box .one_text .text_text_box) {
  height: 32px;
  background: #f7f8fa;
  border-radius: 2px;
  padding: 0 12px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
:deep(.choose_text_page .page_center .one_text + .one_text) {
  margin-top: 1px;
}
:deep(.choose_material_text .storyboard_material_box .material_box) {
  margin-top: 0 !important;
}
</style>
