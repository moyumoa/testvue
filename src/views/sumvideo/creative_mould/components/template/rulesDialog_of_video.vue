<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="规则设置"
      width="820px"
      custom-class="rule_setting_dialog "
    >
      <div
        v-loading="$data.initLoading"
        :class="{ dialog_content: true, no_replace_dialog_content: !isReplace }"
      >
        <div class="rules_left" ref="scrollRef">
          <!-- 视频制作方式： -->
          <div class="one_rules rules_top" v-if="isReplace">
            <div class="one_label label_20 marginTop2">视频制作方式：</div>
            <div class="one_content">
              <el-checkbox-group
                @change="uploadTypeCheckChange"
                v-model="$data.info.uploadType"
                class="group_box drop_group_box"
              >
                <el-checkbox
                  :disabled="item.label === 2"
                  :label="item.label"
                  v-for="(item, index) in $data.uploadTypeList"
                  :key="index"
                >
                  {{ item.name }}
                  <chooseTypeDOM
                    v-if="
                      item.label === 4 &&
                      $data.info.uploadType &&
                      $data.info.uploadType.indexOf(4) > -1
                    "
                    @updateChooseList="updateChooseList"
                    :creativeReplaceId="props.ruleDialog.id"
                    :mediaType="props.ruleDialog.mediaType"
                    :templateId="props.ruleDialog.templateId"
                    :info="$data.info"
                  />

                  <!-- 配置视频范围 勾选了从视频库选取这个制作方式才出现 -->
                  <el-button
                    v-if="
                      false &&
                      item.label === 4 &&
                      $data.info.uploadType &&
                      $data.info.uploadType.indexOf(4) > -1
                    "
                    type="primary"
                    @click="showElementDialog"
                  >
                    设置可选范围
                  </el-button>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
          <!-- 不可替换原料选择 -->
          <div class="one_rules" v-if="!isReplace">
            <div class="one_label" style="line-height: 24px">不可替换原料选择：</div>
            <div class="one_content group_box drop_group_box">
              <chooseTypeDOM
                @updateChooseList="updateChooseList"
                :creativeReplaceId="props.ruleDialog.id"
                :mediaType="props.ruleDialog.mediaType"
                :templateId="props.ruleDialog.templateId"
                :info="$data.info"
              />

              <el-tooltip class="item" effect="dark" :content="notReplaceTip" placement="right">
                <img
                  style="margin-top: 1px"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230322gvgyn.png"
                  class="tooltip_icon"
                  alt
                />
              </el-tooltip>
            </div>
          </div>
          <!-- 从原料库选择的视频列表 -->
          <div
            class="choose_material_box"
            v-if="
              (isReplace && $data.info.uploadType && $data.info.uploadType.indexOf(4) > -1) ||
              !isReplace
            "
            v-loading="$data.chooseLoading"
          >
            <videoOrImgMaterial
              origin="templateEdit"
              v-if="$data.chooseList && $data.chooseList.length > 0"
              :showMore="true"
              v-model:listTotal="$data.listTotal"
              :mediaType="props.ruleDialog.mediaType"
              :chooseList="$data.chooseList"
              :creativeReplaceId="props.ruleDialog.id"
              :templateId="props.ruleDialog.templateId"
              @previewFun="previewFun"
              v-model:clickStoryboardId="$data.clickStoryboardId"
              v-model:uploadLoading="$data.chooseLoading"
              @showMaterialAllFun="showMaterialAllFun"
              @delFun="delFun($event, $data)"
            />
          </div>
          <!-- 原料比例 -->
          <div class="one_rules" style="margin-top: 20px" v-if="!isReplace">
            <div class="one_label">原料比例：</div>
            <div class="one_content">
              <el-select
                v-model="$data.info.cropType"
                placeholder="请选择原料比例"
                style="width: 180px"
              >
                <el-option
                  v-for="(rItem, rIndex) in cropTypeList"
                  :label="rItem.label || '-'"
                  :value="rItem.value"
                  :key="rIndex"
                />
              </el-select>
            </div>
          </div>
          <!-- 长原料处理方式 -->
          <div class="one_rules" v-if="!isReplace">
            <div class="one_label">长原料处理方式：</div>
            <div class="one_content">
              <el-select
                v-model="$data.info.replaceModel"
                placeholder="请选择处理方式"
                style="width: 180px"
              >
                <el-option
                  v-for="(rItem, rIndex) in replaceModelList"
                  :label="rItem.label || '-'"
                  :value="rItem.value"
                  :key="rIndex"
                >
                  <div class="xm_flex_center">
                    {{ rItem.label }}
                    <el-tooltip class="item" effect="dark" placement="top">
                      <template #content>
                        <div class="tooltip_wrap">{{ rItem.tip || '--' }}</div>
                      </template>
                      <div class="xm_tooltipOfRight1"></div>
                    </el-tooltip>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>

          <div class="one_rules">
            <div class="one_label">视频原声：</div>
            <div class="one_content">
              <el-switch
                v-model="$data.info.isMuted"
                inline-prompt
                :width="45"
                active-text="开"
                inactive-text="关"
              ></el-switch>
            </div>
          </div>
          <template v-if="isReplace">
            <!-- 提词器 -->
            <div
              style="margin-top: 14px"
              class="one_rules"
              v-if="$data.info.uploadType && $data.info.uploadType.indexOf(1) > -1"
            >
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
                        class="teleprompter_img"
                        src="https://tagvv-1256030678.file.myqcloud.com/20230317eqeo7.png"
                        alt=""
                      />
                    </div>
                  </template>
                </el-tooltip>
              </div>
            </div>
            <!-- 自动生成字幕 -->
            <div class="one_rules" style="margin-top: 12px">
              <div class="one_label">自动生成字幕：</div>
              <div class="one_content">
                <el-switch
                  v-model="$data.info.fontSetting.autoAsr"
                  inline-prompt
                  :width="45"
                  active-text="开"
                  inactive-text="关"
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
                <div class="one_label label_20">样式：</div>
                <div class="one_content">
                  <el-checkbox v-model="$data.info.fontSetting.fontFace.italic">斜体</el-checkbox>
                  <el-checkbox v-model="$data.info.fontSetting.fontFace.bold">加粗</el-checkbox>
                  <el-checkbox v-model="$data.info.fontSetting.fontFace.underline">
                    下划线
                  </el-checkbox>
                </div>
              </div>
              <!-- 边框格式 -->
              <div class="one_rules" style="margin-top: 8px">
                <div class="one_label label_24" style="font-weight: 600">边框格式：</div>
                <div class="one_content">
                  <div class="top_check" @click="borderStyleChange(1)">
                    <el-checkbox v-if="$data.info.fontSetting.borderStyle == 1" checked>
                      描边
                    </el-checkbox>
                    <el-checkbox v-else>描边</el-checkbox>
                    <div class="check_mask"></div>
                  </div>
                  <div class="top_check" @click="borderStyleChange(3)">
                    <el-checkbox v-if="$data.info.fontSetting.borderStyle == 3" checked>
                      背景
                    </el-checkbox>
                    <el-checkbox v-else>背景</el-checkbox>
                    <div class="check_mask"></div>
                  </div>
                </div>
              </div>
              <!-- 颜色 -->
              <div
                class="one_rules"
                style="margin-top: 8px"
                v-if="$data.info.fontSetting.borderStyle"
              >
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
                  <el-color-picker
                    style="width: 60px"
                    v-model="$data.info.fontSetting.outlineColour"
                  />
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
          </template>
        </div>
        <div class="rules_right" v-if="isReplace && $data.info.fontSetting.autoAsr">
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
            />
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="$data.saveLoading" @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="$data.saveLoading" @click="saveFun">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <elementDialog
      v-if="$data.videoElementInfo.show"
      :elementDialog="$data.videoElementInfo"
      @updateInfo="updateInfo"
    />
    <!-- 查看所有导入原料的弹窗 -->
    <materialDOM
      origin="templateEdit"
      v-if="materialDialog.show"
      :info="$data.info"
      :isDynamicFilter="materialDialog.isDynamicFilter"
      :materialDialog="materialDialog"
      @previewFun="previewFun"
      @updateMaterialFilter="updateMaterialFilter"
      @updateChooseList="updateChooseList"
    />
    <!-- 预览分镜的弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
  </div>
</template>
<script setup>
// 视频的规则设置弹窗
import chooseTypeDOM from './choose_material_type.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import materialDOM from '@/views/sumvideo/create_by_template/components/material_dialog.vue'
import videoOrImgMaterial from '@/views/sumvideo/create_by_template/components/video_or_image_material.vue'
import sampleSubtitlesDOM from './sample_subtitles.vue'
import elementDialog from '@/views/sumvideo/creative_mould/components/template/element_dialog.vue'
import { setReplaceRule, getFontList } from '@/api/sumvideo/creative_templateSpectroscope.js'
import { ElMessage } from 'element-plus'
import { throttle, isEmpty, isNotEmpty } from '@/utils/tools.js'
import { delFun, getMaterialList } from './js/choose_material.js'
import { getTextPoint } from '@/views/sumvideo/components/material/high_setting_subTitles_dialog.js'

const props = defineProps({
  notReplaceTip: {
    type: String,
    default: ''
  },
  replaceModelList: {
    type: Array,
    default: () => {
      return []
    }
  },
  cropTypeList: {
    type: Array,
    default: () => {
      return []
    }
  },
  ruleDialog: {
    type: Object,
    default: () => {
      return {
        isReplace: true, // 是否可替换
        templateId: null,
        id: null,
        replaceRule: null,
        minDuration: undefined,
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const { notReplaceTip, cropTypeList, replaceModelList } = toRefs(props)
const yMax = ref(667)
const needInitY = ref(true) // 初始化时，在有回显数据时，不计算y位置

const isReplace = toRef(props.ruleDialog, 'isReplace')
const show = toRef(props.ruleDialog, 'show')
const $data = reactive({
  initLoading: true,
  minDuration: undefined, // 可选视频的最短时长
  saveLoading: false,
  uploadTypeList: [
    {
      label: 2,
      name: '相册上传'
    },
    {
      label: 1,
      name: '直接拍摄'
    },
    {
      label: 4,
      name: '从原料库选择'
    }
  ], // 音频制作方式列表
  info: {},
  fontList: [], // 字体列表
  videoElementInfo: {
    show: false
  },
  chooseLoading: false, // 从原料库选择的loading
  chooseList: [], // 从原料库选择的视频列表
  listTotal: null // 从原料库选择的视频总数
})

function init() {
  console.log('视频规则的弹窗init', props.ruleDialog.replaceRule)
  // 不可替换
  if (!isReplace.value) {
    if (props.ruleDialog.replaceRule) {
      $data.info = JSON.parse(props.ruleDialog.replaceRule)
      $data.info.uploadType = [4]
      $data.info.isMuted = $data.info.isMuted === 0
      if (isEmpty($data.info.replaceModel)) {
        $data.info.replaceModel = 0
      }
      if (isEmpty($data.info.cropType)) {
        $data.info.cropType = 2
      }
    } else {
      $data.info.uploadType = [4]
      $data.info.isDynamicFilter = true
      $data.info.isMuted = true
      $data.info.replaceModel = 0
      $data.info.cropType = 2
    }
  } else {
    // 可替换

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
      outlineOpacity: null // 不透明度
    }
    $data.info = {
      ...$data.info,
      fontSetting
    }
    if (localStorage.getItem('isFlyBook') === '1') {
      $data.uploadTypeList.splice(1, 1)
    }

    if (props.ruleDialog.replaceRule) {
      $data.info = JSON.parse(props.ruleDialog.replaceRule)
      $data.info.isMuted = $data.info.isMuted === 0
      // 如果之前没有设置过字体规则，返回数据内就不会有字体规则，需要增加默认
      if (!$data.info.fontSetting) {
        needInitY.value = true
        $data.info.fontSetting = {
          ...fontSetting,
          x: 0,
          alignment: true
        }
      } else {
        // 老数据：设置行间距默认值
        if ($data.info.fontSetting && isEmpty($data.info.fontSetting.lineSpacing)) {
          $data.info.fontSetting.lineSpacing = 0
        }
        // 是否需要初始化x
        if ($data.info.fontSetting.x === undefined) {
          $data.info.fontSetting.x = 0
        } else {
          // 计算回显数据
          $data.info.fontSetting.x = Math.ceil(($data.info.fontSetting.x / 1080) * 375)
        }
        // 是否初始化y 初始化进入没有y||在开关未开启时就点击保存
        if ($data.info.fontSetting.y === undefined) {
          $data.info.fontSetting.y = undefined
          needInitY.value = true
        } else {
          // 计算回显数据
          $data.info.fontSetting.y = Math.ceil(($data.info.fontSetting.y / 1920) * 667)
          needInitY.value = false
        }
        // 是否需要初始化居中
        if ($data.info.fontSetting.alignment === undefined) {
          $data.info.fontSetting.alignment = true
          $data.info.fontSetting.x = 0
        } else {
          $data.info.fontSetting.alignment = $data.info.fontSetting.alignment === 'TopCenter'
          if ($data.info.fontSetting.alignment) {
            $data.info.fontSetting.x = 0
          }
        }
      }
      if (
        !(
          ($data.info.isDynamicFilter && isNotEmpty($data.info.filter)) ||
          (!$data.info.isDynamicFilter && isNotEmpty($data.info.creationIds))
        )
      ) {
        $data.info.filter = {
          folderIds: [],
          type: 1,
          excludeIds: [],
          durationMin: props.ruleDialog.minDuration || undefined
        }
      }
    } else {
      $data.info.uploadType = localStorage.getItem('isFlyBook') !== '1' ? [2, 1] : [2]
      $data.info.isDynamicFilter = true
      $data.info.filter = {
        folderIds: [],
        type: 1,
        excludeIds: [],
        durationMin: props.ruleDialog.minDuration || undefined
      }
      $data.info.isMuted = true
    }
  }
  $data.minDuration = props.ruleDialog.minDuration || undefined

  // 如果选择了原料，就去获取原料列表
  if (!($data.info.isAlreadySet === false)) {
    if (
      (isReplace.value && $data.info.uploadType && $data.info.uploadType.indexOf(4) > -1) ||
      !isReplace.value
    ) {
      getMaterialList($data, 'init', null, null, null, null, true)
    } else {
      $data.initLoading = false
    }
  } else {
    $data.initLoading = false
  }
}

init()

function handelChangeTextCenter(e) {
  if (e) {
    $data.info.fontSetting.x = 0
  }
}

function updatePosition(canvasH, domH) {
  const hDiff = canvasH - domH
  let deepYmax = JSON.parse(JSON.stringify(yMax.value))
  yMax.value = parseInt((hDiff / canvasH) * 667)
  // deepYmax > yMax.value代表左顶点上移，undefined代表初始化时无y数据
  if (deepYmax !== yMax.value && needInitY.value) {
    if ($data.info.fontSetting.y > yMax.value || $data.info.fontSetting.y === undefined) {
      $data.info.fontSetting.y = yMax.value
    }
    deepYmax = yMax.value
  } else {
    if (!needInitY.value) {
      needInitY.value = true
    }
  }
}
// 检查是否有表情包
function retEmit(e, type) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  $data.info[type] = e.target.value.replace(reg, '')
}
// 显示视频元素筛选框
const showElementDialog = throttle(() => {
  $data.videoElementInfo = {
    show: true,
    minDuration: $data.minDuration,
    elementOrigin: 1,
    info: {
      isDynamicFilter: $data.info.isDynamicFilter,
      filter: $data.info.filter || null,
      creationIds: $data.info.creationIds || [],
      creationList: $data.info.creationList || []
    }
  }
}, 500)
function updateInfo(e) {
  $data.info.isDynamicFilter = e.isDynamicFilter
  $data.info.filter = e.filter
  $data.info.creationIds = e.creationIds
  $data.info.creationList = e.creationList
}
// 关闭弹窗
function closeDialog() {
  dialog.value.handleClose()
}
// 确认弹窗
const saveFun = throttle(() => {
  $data.saveLoading = true
  const data = JSON.parse(JSON.stringify($data.info))
  if (data.uploadType.indexOf(1) === -1) {
    data.teleprompter = ''
  }
  if (isReplace.value && data.uploadType.indexOf(4) === -1) {
    data.isDynamicFilter = true
    data.creationIds = []
    data.creationList = []
    data.filter = {}
  } else {
    if (data.isDynamicFilter) {
      data.creationIds = []
      data.creationList = []
    } else {
      data.filter = {}
    }
  }
  if (isReplace.value) {
    if (data.fontSetting.autoAsr) {
      // 字幕设置
      const posiInfo = getTextPoint(data.fontSetting.x, data.fontSetting.y)
      // data.fontSetting.alignment = $data.info.fontSetting.alignment ? 'TopCenter' : ''
      if (data.fontSetting.alignment) {
        data.fontSetting.alignment = 'TopCenter'
      } else {
        data.fontSetting.alignment = ''
      }
      data.fontSetting.x = posiInfo.finX
      data.fontSetting.y = posiInfo.finY
    } else {
      // 自动字幕关闭初始化字幕位置
      data.fontSetting.x = 0
      data.fontSetting.y = undefined
      data.fontSetting.alignment = 'TopCenter'
    }
  }

  data.isAlreadySet = isNotEmpty(data.filter) || isNotEmpty(data.creationIds)

  data.isMuted = data.isMuted ? 0 : 1
  console.log('入参data', data)
  // if (data) return
  const param = {
    id: props.ruleDialog.id,
    replaceRule: JSON.stringify(data)
  }
  console.log('规则', param)
  setReplaceRule(param)
    .then(res => {
      if (res.code === 0) {
        ElMessage({
          message: '规则设置成功',
          type: 'success'
        })
      }

      closeDialog()
      $data.saveLoading = false
    })
    .catch(() => {
      closeDialog()
      $data.saveLoading = false
    })
}, 500)

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
    mediaType: props.ruleDialog.mediaType, // 实际的原料类型
    materialType: props.ruleDialog.mediaType, // 要显示的原料类型 因为不足2秒的音频是打开文本弹窗
    creativeReplaceId: props.ruleDialog.id, // 分镜替换ID
    templateId: props.ruleDialog.templateId, // 模板ID
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

// 预览信息
const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
function previewFun(title, url, type, cover) {
  previewInfo.value = {
    show: true,
    title: '查看视频',
    url: url,
    type: 'video',
    cover: cover || ''
  }
}

// 视频制作方式修改
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
    $data.initLoading = true
    $data.info.filter = {
      folderIds: [],
      type: 1,
      excludeIds: [],
      durationMin: $data.minDuration || undefined
    }
    getMaterialList($data, 'init', null, null, null, null, true)
  }
}
</script>
<style lang="scss" scoped>
@import './scss/rules.scss';
div {
  box-sizing: border-box;
}
.dialog_content {
  min-height: 180px;
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
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
.no_replace_dialog_content {
  padding-right: 6px !important;
  .rules_left {
    width: 100%;
    margin-right: 0 !important;

    .one_rules:last-child {
      margin-top: 14px !important;
    }
  }
  .rules_right {
    display: none;
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
</style>
