<template>
  <div class="choose_type_dom">
    <el-dropdown disabled popper-class="xm_dropDown">
      <el-button :disabled="disabled" type="primary" class="drop_btn" style="position: relative">
        匹配原料
        <el-icon class="el-icon--right">
          <i-arrow-down />
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="conditionMatch">条件匹配</el-dropdown-item>
          <el-dropdown-item @click="accurateMatch">精确选择</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <!-- 精确选择 -->
    <selectMaterial
      origin="templateEdit"
      v-if="chooseMaterialDialog.show"
      :info="chooseMaterialDialog"
      :subtitle="chooseMaterialDialog.subtitle"
      :showSubTip="chooseMaterialDialog.showSubTip"
      :dialogTitle="chooseMaterialDialog.dialogTitle"
      :materialType="chooseMaterialDialog.materialType"
      :scriptReplaceId="chooseMaterialDialog.creativeReplaceId"
      :scriptId="templateId"
      :materialTypeList="chooseMaterialDialog.materialTypeList"
      @updateSelectInfo="updateSelectFun"
      :lengthMin="chooseMaterialDialog.lengthMin"
      :lengthMax="chooseMaterialDialog.lengthMax"
      :resourceType="chooseMaterialDialog.resourceType"
    />
    <!-- 条件匹配 -->
    <matchMaterial
      origin="templateEdit"
      ref="matchMaterialRef"
      v-if="matchMaterialInfo.show"
      :info="matchMaterialInfo"
      :subtitle="matchMaterialInfo.subtitle"
      :showSubTip="matchMaterialInfo.showSubTip"
      :lengthMin="matchMaterialInfo.lengthMin"
      :lengthMax="matchMaterialInfo.lengthMax"
      :scriptReplaceId="matchMaterialInfo.item.id"
      @close="matchMaterialClose"
      @updateSelectInfo="updateMatchFun"
      :mediaType="mediaType"
    />
  </div>
</template>
<script setup>
import selectMaterial from '@/views/sumvideo/components/material/select_material_dialog.vue'
import matchMaterial from '@/views/sumvideo/components/material/match_material.vue'

import { throttle } from '@/utils/tools'
// import { list } from '@/api/content_center/material_library.js'
import { getMaterialList } from './js/choose_material.js'

const props = defineProps({
  info: Object,
  extraInfo: Object,
  templateId: Number || String,
  creativeReplaceId: Number || String,
  mediaType: Number,
  disabled: Boolean,
  materialDuration: Number
})
const { info, extraInfo, templateId, creativeReplaceId, mediaType, disabled, materialDuration } =
  toRefs(props)
const emits = defineEmits(['updateChooseList'])

// 精确匹配---
const chooseMaterialDialog = ref({
  creativeReplaceId: null,
  show: false,
  dialogTitle: '',
  materialType: '' // 原料类型 1视频 2图片 3音频 4文本
})

// 打开精确匹配的弹窗
const accurateMatch = throttle(function () {
  console.log('精确选择', mediaType.value, info.value)

  chooseMaterialDialog.value = {
    useAIText: false,
    creativeReplaceId: creativeReplaceId.value,
    show: true,
    dialogTitle: '匹配原料',
    subtitle:
      mediaType.value === 1 || mediaType.value === 3
        ? `时长小于该分镜0.5倍的${
            mediaType.value === 1 ? '视频' : '音频'
          }将不参与合成，0.5-1倍时长的${mediaType.value === 1 ? '视频' : '音频'}将自动倍速`
        : '',
    showSubTip: mediaType.value === 4,
    materialType: mediaType.value,
    showBackSelectMaterialList: [],
    materialTypeList: [mediaType.value],
    lengthMin:
      mediaType.value === 4 && materialDuration.value
        ? parseInt((materialDuration.value / 1000) * 4.2)
        : null,
    lengthMax:
      mediaType.value === 4 && materialDuration.value
        ? parseInt((materialDuration.value / 1000) * 5.5)
        : null,
    resourceType: 0
  }
})

// 获取到选中的原料ID信息
function updateSelectFun(ids, dialog, btnLoading) {
  console.log('获取到选中的原料ID信息', ids, mediaType.value)
  info.value.isDynamicFilter = false
  info.value.creationIds = [...new Set((info.value.creationIds || []).concat(ids))]
  info.value.creationList = []
  info.value.filter = {}
  if (mediaType.value === 3) {
    extraInfo.value.audioIsDynamicFilter = false
    extraInfo.value.audioFilter = {}
    extraInfo.value.audioCreationIds = info.value.creationIds
    extraInfo.value.audioCreationList = []
  }
  getMaterialList(
    {
      info: info.value
    },
    'chooseType',
    'select',
    dialog,
    btnLoading,
    emits
  )
}

// 条件匹配---
const matchMaterialInfo = reactive({
  show: false,
  currentIndex: null, // 导入的哪个分镜的index
  item: {} // 导入分镜
})
// 条件匹配 - 不需要回显
const conditionMatch = throttle(function () {
  console.log('条件匹配', mediaType.value, info.value)
  // chooseMaterialDialog.currentIndex = index
  matchMaterialInfo.item = {}
  matchMaterialInfo.subtitle =
    mediaType.value === 1 || mediaType.value === 3
      ? `时长小于该分镜0.5倍的${
          mediaType.value === 1 ? '视频' : '音频'
        }将不参与合成，0.5-1倍时长的${mediaType.value === 1 ? '视频' : '音频'}将自动倍速`
      : ''

  matchMaterialInfo.showSubTip = mediaType.value === 4

  matchMaterialInfo.lengthMin =
    mediaType.value === 4 && materialDuration.value
      ? parseInt((materialDuration.value / 1000) * 4.2)
      : null
  matchMaterialInfo.lengthMax =
    mediaType.value === 4 && materialDuration.value
      ? parseInt((materialDuration.value / 1000) * 5.5)
      : null

  matchMaterialInfo.show = true
})
// 获取到的筛选条件信息
function updateMatchFun(filter, dialog, btnLoading) {
  // 音频非BGM选择文本要加上字数的限制
  if (mediaType.value === 4) {
    filter.lengthMin = materialDuration.value
      ? parseInt((materialDuration.value / 1000) * 4.2)
      : null
    filter.lengthMax = materialDuration.value
      ? parseInt((materialDuration.value / 1000) * 5.5)
      : null
  }
  info.value.isDynamicFilter = true
  info.value.creationIds = []
  info.value.creationList = []
  info.value.filter = filter || {}
  if (mediaType.value === 3) {
    extraInfo.value.audioIsDynamicFilter = true
    extraInfo.value.audioFilter = filter || {}
    extraInfo.value.audioCreationIds = []
    extraInfo.value.audioCreationList = []
  }
  getMaterialList(
    {
      info: info.value
    },
    'chooseType',
    'match',
    dialog,
    btnLoading,
    emits
  )
}

function matchMaterialClose() {
  matchMaterialInfo.show = false
}
</script>
<style lang="scss" scoped>
.drop_btn {
  font-size: 12px;
  height: 24px;
  min-height: 24px !important;
  padding: 0 8px;
}
</style>
