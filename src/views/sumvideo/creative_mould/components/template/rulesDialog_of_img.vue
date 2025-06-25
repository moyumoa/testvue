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
        <!-- 图片上传方式： -->
        <div class="one_rules rules_top" v-if="isReplace">
          <div class="one_label label_20 marginTop2">图片上传方式：</div>
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

                <!-- 配置图库范围 勾选了从图片库选取这个上传方式才出现 -->
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
            :mediaType="8"
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
// 图片的规则设置弹窗
import chooseTypeDOM from './choose_material_type.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import materialDOM from '@/views/sumvideo/create_by_template/components/material_dialog.vue'
import videoOrImgMaterial from '@/views/sumvideo/create_by_template/components/video_or_image_material.vue'
import elementDialog from '@/views/sumvideo/creative_mould/components/template/element_dialog.vue'
import { setReplaceRule } from '@/api/sumvideo/creative_templateSpectroscope.js'
import { ElMessage } from 'element-plus'
import { throttle, isNotEmpty, isEmpty } from '@/utils/tools.js'
import { delFun, getMaterialList } from './js/choose_material.js'
const props = defineProps({
  notReplaceTip: {
    type: String,
    default: ''
  },
  ruleDialog: {
    type: Object,
    default: () => {
      return {
        isReplace: true, // 是否可替换
        templateId: null,
        id: null,
        replaceRule: null,
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const { notReplaceTip } = toRefs(props)
const isReplace = toRef(props.ruleDialog, 'isReplace')
const show = toRef(props.ruleDialog, 'show')
const $data = reactive({
  initLoading: true,
  saveLoading: false,
  uploadTypeList: [
    {
      label: 2,
      name: '相册上传'
    },
    {
      label: 4,
      name: '从原料库选择'
    }
  ], // 音频制作方式列表
  info: {},
  videoElementInfo: {
    show: false
  },
  chooseLoading: false, // 从原料库选择的loading
  chooseList: [], // 从原料库选择的视频列表
  listTotal: null // 从原料库选择的视频总数
})

function init() {
  console.log('图片规则的弹窗init', props.ruleDialog.replaceRule)
  // 不可替换
  if (!isReplace.value) {
    if (props.ruleDialog.replaceRule) {
      $data.info = JSON.parse(props.ruleDialog.replaceRule)
      $data.info.uploadType = [4]
    } else {
      $data.info.uploadType = [4]
      $data.info.isDynamicFilter = true
    }
  } else {
    // 可替换

    if (props.ruleDialog.replaceRule) {
      $data.info = JSON.parse(props.ruleDialog.replaceRule)
      if (
        $data.info.isDynamicFilter &&
        $data.info.isDynamicFilter === true &&
        isEmpty($data.info.filter)
      ) {
        $data.info.filter = { folderIds: [], type: 2, excludeIds: [] }
      }
    } else {
      $data.info.uploadType = [2]
      $data.info.isDynamicFilter = true
      $data.info.filter = { folderIds: [], type: 2, excludeIds: [] }
    }
  }
  // isAlreadySet=false 代表是没有设置过原料 如果选择了原料，就去获取原料列表
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

// 显示图片元素筛选框
const showElementDialog = throttle(() => {
  $data.videoElementInfo = {
    show: true,
    elementOrigin: 2,
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
  console.log($data.info)
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
    mediaType: 8, // 实际的原料类型
    materialType: 8, // 要显示的原料类型 因为不足2秒的音频是打开文本弹窗
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
    title: '查看图片',
    url: url,
    type: 'image',
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
    $data.info.filter = { folderIds: [], type: 2, excludeIds: [] }
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
  padding: 16px 0 16px 16px;
}
</style>
