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
        <!-- 音频类型 -->
        <div class="one_rules one_rules_center" v-if="isReplace">
          <div class="one_label label_20">音频类型：</div>
          <div class="one_content">
            <el-radio-group v-model="$data.info.isBackground" @change="changeBGMFun">
              <el-radio-button :label="true">
                <div class="one_radio_box">BGM</div>
              </el-radio-button>
              <el-radio-button :label="false">
                <div class="one_radio_box">非BGM</div>
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <template
          v-if="
            (isReplace && $data.info.uploadType && $data.info.uploadType.indexOf(4) > -1) ||
            !isReplace
          "
        >
          <!-- 音频上传方式---BGM -->
          <div class="one_rules rules_top" v-if="isReplace">
            <div class="one_label label_20 marginTop2">音频上传方式：</div>
            <div class="one_content">
              <el-checkbox-group v-model="$data.info.uploadType" class="group_box drop_group_box">
                <el-checkbox disabled :label="4">
                  从原料库选择
                  <chooseTypeDOM
                    @updateChooseList="updateChooseList"
                    :creativeReplaceId="props.ruleDialog.id"
                    :mediaType="props.ruleDialog.mediaType"
                    :templateId="props.ruleDialog.templateId"
                    :info="$data.info"
                    :extraInfo="$data.extraInfo"
                  />
                  <el-button v-if="false" type="primary" @click="showElementDialog">
                    设置可选范围
                  </el-button>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
          <!-- 配置图库范围 勾选了从音频库选取这个上传方式才出现 -->
          <!--          <div class="one_rules">-->
          <!--            <div class="one_label"></div>-->
          <!--            <div class="one_content">-->
          <!--              <el-button type="primary" @click="showElementDialog">设置可选范围</el-button>-->
          <!--            </div>-->
          <!--          </div>-->
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
                :extraInfo="$data.extraInfo"
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
          <!-- 从原料库选择的音频列表 -->
          <div class="choose_material_box" v-loading="$data.chooseLoading">
            <BGMMaterial
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
              @showMaterialAllFun="showMaterialAllFun(2)"
              @delFun="delFun($event, $data, props.ruleDialog.mediaType)"
            />
          </div>
          <!-- 长原料处理方式 -->
          <div class="one_rules" v-if="!isReplace" style="margin-bottom: 20px">
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
        </template>
        <audioRulesDOM
          v-else
          :info="$data.info"
          :creativeReplaceId="props.ruleDialog.id"
          :mediaType="props.ruleDialog.mediaType"
          :templateId="props.ruleDialog.templateId"
          :disUploadType="$data.materialDuration && $data.materialDuration < 2000 ? [3] : []"
          origin="audio"
          @updateInfo="updateAudioInfo"
          :materialDuration="$data.materialDuration"
          v-model:initLoading="$data.initLoading"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="$data.saveLoading" @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="$data.saveLoading" @click="saveFun">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <elementDialog
      v-if="$data.audioElementInfo.show"
      :elementDialog="$data.audioElementInfo"
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
// 音频的规则设置弹窗
import chooseTypeDOM from './choose_material_type.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import materialDOM from '@/views/sumvideo/create_by_template/components/material_dialog.vue'
import BGMMaterial from '@/views/sumvideo/create_by_template/components/BGM_material.vue'

import elementDialog from '@/views/sumvideo/creative_mould/components/template/element_dialog.vue'
import audioRulesDOM from '@/views/sumvideo/creative_mould/components/template/audioFilter_notBGM.vue'
import { setReplaceRule } from '@/api/sumvideo/creative_templateSpectroscope.js'
import { ElMessage } from 'element-plus'
import { throttle, isEmpty, isNotEmpty } from '@/utils/tools.js'
import { delFun, getMaterialList } from './js/choose_material.js'

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
  ruleDialog: {
    type: Object,
    default: () => {
      return {
        isReplace: true, // 是否可替换
        templateId: null,
        materialDuration: null, // 音频分镜的时长
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
const { notReplaceTip, replaceModelList } = toRefs(props)
const isReplace = toRef(props.ruleDialog, 'isReplace')
const show = toRef(props.ruleDialog, 'show')
const $data = reactive({
  initLoading: true,
  materialDuration: null, // 音频分镜的时长
  minDuration: undefined, // 可选音频的最短时长
  saveLoading: false,
  info: {},
  extraInfo: {
    audioIsDynamicFilter: true,
    textIsDynamicFilter: true,
    audioUploadType: [4],
    textUploadType: [1, 2, 3]
  }, // 保留切换BGM/非BGM数据，用于回显
  audioElementInfo: {
    show: false
  },
  chooseLoading: false, // 从原料库选择的loading
  chooseList: [], // 从原料库选择的视频列表
  listTotal: null // 从原料库选择的视频总数
})

function init() {
  $data.materialDuration = props.ruleDialog.materialDuration || undefined
  console.log('音频规则的弹窗init', props.ruleDialog.replaceRule)
  if (!isReplace.value) {
    if (props.ruleDialog.replaceRule) {
      $data.info = JSON.parse(props.ruleDialog.replaceRule)
      $data.info.uploadType = [4]
      if (isEmpty($data.info.replaceModel)) {
        $data.info.replaceModel = 0
      }
    } else {
      $data.info.uploadType = [4]
      $data.info.isDynamicFilter = true
      $data.info.replaceModel = 0
    }
  } else {
    if (props.ruleDialog.replaceRule) {
      const info = JSON.parse(props.ruleDialog.replaceRule)
      $data.info = info
      if (info.isBackground) {
        if (
          !(
            ($data.info.isDynamicFilter && isNotEmpty($data.info.filter)) ||
            (!$data.info.isDynamicFilter && isNotEmpty($data.info.creationIds))
          )
        ) {
          $data.info.filter = {
            folderIds: [],
            type: 3,
            excludeIds: [],
            durationMin: props.ruleDialog.minDuration || undefined
          }
        }
        $data.extraInfo.audioUploadType = info.uploadType || [4]
        $data.extraInfo.audioCreationIds = info.creationIds || []
        $data.extraInfo.audioCreationList = info.audioCreationList || []
        $data.extraInfo.audioFilter = $data.info.filter
        $data.extraInfo.audioIsDynamicFilter = info.isDynamicFilter
      } else {
        if (
          !(
            ($data.info.isDynamicFilter && isNotEmpty($data.info.filter)) ||
            (!$data.info.isDynamicFilter && isNotEmpty($data.info.creationIds))
          )
        ) {
          $data.info.filter = { folderIds: [], type: 4, excludeIds: [] }
        }
        $data.extraInfo.textUploadType =
          setNotBGMUploadType(info.uploadType) || setDefaultUploadType()
        $data.extraInfo.textCreationIds = info.creationIds || []
        $data.extraInfo.textCreationList = info.audioCreationList || []
        $data.extraInfo.textFilter = $data.info.filter
        $data.extraInfo.textIsDynamicFilter = info.isDynamicFilter
      }
    } else {
      $data.info = {
        isBackground: false,
        uploadType: setDefaultUploadType(),
        isDynamicFilter: true,
        fontSetting: {},
        filter: { folderIds: [], type: 4, excludeIds: [] }
      }
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
// 设置音频分镜的默认上传规则
function setDefaultUploadType() {
  if ($data.materialDuration && $data.materialDuration < 2000) {
    return [1, 2]
  } else {
    return [1, 2, 3]
  }
}
// 音频分镜，非BGM下，如果坑位小于2S，但之前选择了文本转音频的要给他取消勾选
function setNotBGMUploadType(list) {
  if ($data.materialDuration && $data.materialDuration < 2000) {
    if (list && list.length > 0) {
      const i = list.findIndex(item => item === 3)
      console.log('i', i)
      if (i > -1) {
        list.splice(i, 1)
      }
      return list
    } else {
      return list
    }
  } else {
    return list
  }
}
function changeBGMFun(e) {
  $data.info.filter = e
    ? $data.extraInfo.audioFilter || {
        folderIds: [],
        type: 3,
        excludeIds: [],
        durationMin: $data.minDuration
      }
    : $data.extraInfo.textFilter || { folderIds: [], type: 4, excludeIds: [] }
  $data.info.isDynamicFilter = e
    ? $data.extraInfo.audioIsDynamicFilter
    : $data.extraInfo.textIsDynamicFilter
  $data.info.creationIds = e ? $data.extraInfo.audioCreationIds : $data.extraInfo.textCreationIds
  $data.info.creationList = e ? $data.extraInfo.audioCreationList : $data.extraInfo.textCreationList
  $data.info.uploadType = e ? $data.extraInfo.audioUploadType : $data.extraInfo.textUploadType
  // 切换类型时，将选中的原料信息清空，并获取最新的原料信息
  $data.listTotal = 0
  $data.chooseList = []
  console.log('xxx', e, $data.info, $data.extraInfo)
  if ((isReplace.value && e) || !isReplace.value) {
    $data.initLoading = true
    getMaterialList($data, 'init', null, null, null, null, true)
  }
}
// 显示音频元素筛选框
const showElementDialog = throttle(() => {
  $data.audioElementInfo = {
    show: true,
    minDuration: $data.minDuration,
    elementOrigin: 3,
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
  $data.extraInfo.audioUploadType = $data.info.uploadType
  $data.extraInfo.audioIsDynamicFilter = e.isDynamicFilter
  $data.extraInfo.audioFilter = e.filter
  $data.extraInfo.audioCreationIds = e.creationIds
  $data.extraInfo.audioCreationList = e.creationList
}
function updateAudioInfo(e) {
  $data.info.teleprompter = e.teleprompter
  $data.info.fontSetting = e.fontSetting
  $data.info.isDynamicFilter = e.isDynamicFilter
  $data.info.filter = e.filter
  $data.info.creationIds = e.creationIds
  $data.info.creationList = e.creationList
  $data.info.uploadType = e.uploadType
  $data.extraInfo.textUploadType = e.uploadType
  $data.extraInfo.textIsDynamicFilter = e.isDynamicFilter
  $data.extraInfo.textFilter = e.filter
  $data.extraInfo.textCreationIds = e.creationIds
  $data.extraInfo.textCreationList = e.creationList
}
// 关闭弹窗
function closeDialog() {
  dialog.value.handleClose()
}
// 设置数据 如果是动态 就把选中的作品清空 反之就把筛选条件清空
function setSaveParam(data) {
  if (data.isDynamicFilter) {
    data.creationIds = []
    data.creationList = []
  } else {
    data.filter = {}
  }
}
// 确认弹窗
const saveFun = throttle(() => {
  $data.saveLoading = true
  const data = JSON.parse(JSON.stringify($data.info))
  console.log($data.info)
  if (!isReplace.value) {
    setSaveParam(data)
  } else {
    if (data.uploadType.indexOf(4) > -1) {
      setSaveParam(data)
      data.teleprompter = ''
      data.fontSetting = null
    } else {
      if (data.uploadType.indexOf(3) > -1) {
        setSaveParam(data)
      } else {
        data.isDynamicFilter = true
        data.creationIds = []
        data.creationList = []
        data.filter = {}
      }
    }
  }

  data.isAlreadySet = isNotEmpty(data.filter) || isNotEmpty(data.creationIds)

  console.log(data)

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

// 点击查看全部
const materialDialog = ref({
  show: false
})
function showMaterialAllFun(mediaType) {
  console.log('showMaterialAllFun-mediaType', mediaType)
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
    mediaType: mediaType, // 实际的原料类型
    materialType: mediaType, // 要显示的原料类型
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
    $data.extraInfo.audioFilter = $data.info.filter
  } else {
    $data.info.creationIds = ids
    $data.extraInfo.audioCreationIds = ids
  }
}

// 预览信息
const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
function previewFun(title, url, type, cover) {
  previewInfo.value = {
    show: true,
    title: '查看音频',
    url: url,
    type: 'audio',
    cover: cover || ''
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
  padding: 16px 16px 0;
  :deep(.el-radio-group) {
    height: 20px;
  }
  :deep(.el-radio.el-radio--large) {
    height: 20px;
    line-height: 20px;
    margin-right: 24px;
  }
  .one_radio_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
}
.choose_material_box {
  :deep(.storyboard_material_box .material_box .one_audio) {
    width: 184px;
    margin-top: 8px;
    margin-right: 8px;
  }
}
</style>
