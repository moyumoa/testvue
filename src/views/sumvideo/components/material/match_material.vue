<template>
  <el-dialog
    :close-on-click-modal="false"
    ref="dialog"
    custom-class="rule_setting_dialog hide_footer_line show_header_line"
    destroy-on-close
    v-model="show"
    title="匹配原料"
    width="560px"
    :append-to-body="origin == 'templateEdit'"
  >
    <template #title>
      <div class="dialog_title">
        匹配原料
        <el-tooltip v-if="subtitle" :content="subtitle" placement="right">
          <img
            class="item_value_tips"
            src="https://tagvv-1256030678.file.myqcloud.com/20240420tl3rw.png"
            alt
          />
        </el-tooltip>
        <div class="dialog_title_tip" v-if="showSubTip">
          建议字数：
          <span>
            {{ lengthMin }}
            ~
            {{ lengthMax }}
          </span>
        </div>
      </div>
    </template>
    <div class="match_material_content">
      <div class="item_line">
        <span class="label">文件夹</span>
        <searchFile
          style="width: 230px"
          :selectRoot="true"
          :clearable="false"
          @select="selectFile"
        />
      </div>
      <div class="item_line">
        <span class="label">原料标签</span>
        <span>
          已选择
          <span style="color: #364fcd">{{ chooseLabelIds.length }}</span>
          个标签
        </span>
        <el-button type="default" style="margin-left: 12px" @click="openAddTag">选择</el-button>
      </div>
      <!-- <div class="item_line">
        <span class="label">过滤已使用的原料</span>
        <el-switch style="margin-left: 8px" v-model="filterUsed" inline-prompt></el-switch>
      </div> -->
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="btnLoading">确定</el-button>
      </span>
    </template>
    <!-- 选择原料标签 -->
    <addDialog v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
  </el-dialog>
</template>
<script setup>
import searchFile from '../files/search_file.vue'
import addDialog from '@/views/content_center/content_repository/components/addTag_dialog.vue'
import { throttle, isNotEmpty } from '@/utils/tools.js'

import {
  importMaterialByScript,
  listImportMaterialByScript
} from '@/api/sumvideo/create_by_script.js'

const props = defineProps({
  mediaType: {
    type: Number,
    default: null
  }, // 原料类型
  origin: {
    type: String,
    default: ''
  }, // templateEdit 模板分镜过来的
  info: {
    show: false
  }, // 回显信息可以放在info里
  pipelineId: {
    type: Number,
    default: null
  }, // 流水线id
  scriptReplaceId: {
    type: Number,
    default: null
  }, // 替换项id/分镜id
  subtitle: {
    type: String,
    default: null // 二级标题
  },
  showSubTip: {
    type: Boolean,
    default: false // 文本分镜下是否显示字数限制
  },
  lengthMin: {
    type: Number,
    default: null // 文本的最小长度
  },
  lengthMax: {
    type: Number,
    default: null // 文本的最大长度
  },
  materialTypeList: {
    type: Array,
    default: () => {
      return []
    }
  }, // 类型list
  durationMin: {
    type: Number,
    default: null // 视频的最小长度
  },
  durationMax: {
    type: Number,
    default: null // 视频的最大长度
  },
  replaceModel: Number || String, // 长原料的处理方式 目前只对视频/BGM（小于2s 非BGM）进行校验
  scriptStepMax: Number || String, // 剧本式生成的最大预估时长
  scriptStepMin: Number || String // 剧本式生成的最小预估时长
})
const addTagDialog = reactive({
  show: false,
  id: null,
  hideTitleSpan: false,
  type: null,
  chooseTagList: [],
  index: [],
  source: null
})
// const message = inject('$message')
const chooseFile = ref({}) // 选择的文件夹
const chooseLabelIds = ref([]) // 选择的标签列表
// const filterUsed = ref(true) // 是否过滤已使用原料
const btnLoading = ref(false)
const listParams = ref({}) // 上次请求参数

const show = toRef(props.info, 'show')
const {
  pipelineId,
  scriptReplaceId,
  subtitle,
  showSubTip,
  materialTypeList,
  lengthMin,
  lengthMax,
  durationMin,
  durationMax,
  replaceModel,
  scriptStepMax,
  scriptStepMin
} = toRefs(props)
const emits = defineEmits(['close', 'updateSelectInfo'])

const tableForm = reactive({
  page: {
    index: 1,
    size: 20,
    total: 0
  }
})

const dialog = ref(null)
// const btnLoading = ref(false)
function closeDialog() {
  emits('close')
}

function selectFile(val) {
  console.log('选择文件夹', val)
  chooseFile.value = val
}

// 获取分镜原料用于页面显示
function getEmitsList(importNum = 0) {
  const params = {
    orderSetting: '',
    pageNo: 1,
    pageSize: 20,
    searchCount: true,
    pipelineId: pipelineId.value,
    scriptReplaceId: scriptReplaceId.value
  }

  const emitsInfo = {
    list: [],
    total: 0
  }

  listImportMaterialByScript(params)
    .then(res => {
      if (res.code === 0) {
        emitsInfo.list = res.data?.records || []
        emitsInfo.total = importNum || 0
        emits('updateSelectInfo', emitsInfo, 'matchMaterial')
        btnLoading.value = false
        dialog.value.handleClose()
      }
      btnLoading.value = false
    })
    .catch(() => {
      btnLoading.value = false
    })
}
// 导入流水线分镜原料 - 条件匹配相当于精确匹配的全选
function importFn() {
  console.log('流水线id', pipelineId.value)
  const params = {
    pipelineId: pipelineId.value, // 流水线id
    scriptReplaceId: scriptReplaceId.value, // 分镜或替换项的id
    queryParam: listParams.value, // 获取当前列表的入参
    resourceType: 0, // 资源类别 0原料库资源 3音色 6普通文本转音频，默认0，仅音频分镜导入文本原料时传6
    isSelectAll: true,
    excludeResourceIds: []
  }

  // 剧本式生成保存入参增加预估最大和最小时长
  if (props.origin === 'scriptStep') {
    params.maxDuration = scriptStepMax.value
    params.minDuration = scriptStepMin.value
    // 增加长原料处理模式的校验
    if (isNotEmpty(replaceModel.value)) {
      params.replaceModel = replaceModel.value
    }
  }

  console.log('入参', params)
  importMaterialByScript(params)
    .then(res => {
      console.log('导入原料res', res)
      if (res.code === 0) {
        getEmitsList(res.data || 0)
      } else {
        btnLoading.value = false
      }
    })
    .catch(() => {
      btnLoading.value = false
    })
}

function handleConfirm() {
  console.log('点击确定按钮')
  btnLoading.value = true
  const tagIds = (chooseLabelIds.value || []).map(item => item.id)
  const folderIds =
    chooseFile.value?.id == null
      ? []
      : chooseFile.value && chooseFile.value?.id !== '0'
      ? [chooseFile.value.id]
      : ['0']
  if (props.origin === 'templateEdit') {
    const filter = {
      name: '',
      folderIds,
      tags: tagIds,
      sources: null,
      type: props.mediaType,
      excludeIds: [] // 每次条件匹配的时候 都要把之前的排除作品ID清空，保证每次都是最新的
    }
    // if (filterUsed.value) {
    //   filter.useTimesMax = 0
    // }
    emits('updateSelectInfo', filter, dialog.value, btnLoading.value)
    return
  }

  const emitInfo = {
    name: '',
    batchNumber: '',
    createTimeMax: '',
    createTimeMin: '',
    folderIds,
    tags: tagIds,
    sources: null,
    subSource: [1, 0],
    type: materialTypeList.value,
    pageSize: tableForm.page.size,
    pageNo: tableForm.page.index,
    isDelete: 0
  }
  // 剧本式生成过滤0.5倍原料
  if (props.origin === 'scriptStep') {
    if (durationMin.value) {
      emitInfo.durationMin = durationMin.value
    }
    if (durationMax.value) {
      emitInfo.durationMax = durationMax.value
    }
    if (durationMin.value || durationMax.value) {
      emitInfo.timeUnit = 'ms'
    }
    emitInfo.queryDurationContainPhoto = true
  }
  // if (filterUsed.value) {
  //   emitInfo.useTimesMax = 0
  // }
  listParams.value = emitInfo
  importFn()
}
const openAddTag = throttle(function () {
  addTagDialog.type = 15
  addTagDialog.hideTitleSpan = false
  addTagDialog.id = null
  addTagDialog.index = []
  addTagDialog.source = null
  addTagDialog.chooseTagList = chooseLabelIds.value || []
  addTagDialog.show = true
})
function updateTag(val) {
  console.log('updateTag', val)
  chooseLabelIds.value = val
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_title {
  display: flex;
  align-items: center;
  .item_value_tips {
    width: 16px;
    height: 16px;
    margin-left: 8px;
    display: flex;
    object-fit: contain;
  }
  .dialog_title_tip {
    margin-left: 8px;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    span {
      margin: 0;
      font-weight: 600;
      color: #364fcd;
    }
  }
}

.match_material_content {
  padding: 16px 16px 8px 16px;
  .item_line {
    display: flex;
    align-items: center;
    .label {
      white-space: nowrap;
      margin-right: 12px;
    }
  }
  .item_line + .item_line {
    margin-top: 20px;
  }
}
</style>
