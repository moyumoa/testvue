<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="原料筛选"
    width="820px"
    custom-class="rule_setting_dialog"
  >
    <!--    <template #title>-->
    <!--      <div class="dialog_title">-->
    <!--        创意元素筛选-->
    <!--        <span>无选中元素时，员工侧仅可选择星麦内置元素进行分镜替换</span>-->
    <!--      </div>-->
    <!--    </template>-->
    <div class="dialog_content">
      <rulesFilter
        :minDuration="$data.minDuration"
        :form="$data.info"
        :rulesOrigin="props.elementDialog.elementOrigin"
        :showRules="$data.elementRules[props.elementDialog.elementOrigin]"
        @updateInfo="updateInfoFun"
      ></rulesFilter>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveFun">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
// 元素筛选弹窗
import rulesFilter from '@/views/sumvideo/creative_mould/components/template/rules_filter.vue'
import { throttle, isEmpty } from '@/utils/tools.js'
const props = defineProps({
  elementDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        minDuration: undefined,
        elementOrigin: null, // 元素类型 1视频 2图片 3音频 4文本
        info: {}
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.elementDialog, 'show')

const $data = reactive({
  minDuration: undefined,
  info: {},
  elementRules: {
    1: [
      'elementOrigin',
      'isDynamicFilter',
      'createTime',
      'tags',
      'elementName',
      'sources',
      'useTime',
      'duration'
    ],
    2: [
      'elementOrigin',
      'isDynamicFilter',
      'createTime',
      'tags',
      'elementName',
      'sources',
      'useTime'
    ],
    3: [
      'elementOrigin',
      'isDynamicFilter',
      'createTime',
      'tags',
      'elementName',
      'sources',
      'useTime',
      'duration'
    ],
    4: [
      'elementOrigin',
      'isDynamicFilter',
      'createTime',
      'tags',
      'elementName',
      'sources',
      'useTime'
    ]
  },
  chooseList: []
})
function init() {
  $data.minDuration = props.elementDialog.minDuration || undefined
  if (isEmpty(props.elementDialog.info)) {
    $data.info = JSON.parse(
      JSON.stringify({
        isDynamicFilter: true
      })
    )
  } else {
    $data.info = JSON.parse(JSON.stringify(props.elementDialog.info))
  }
  $data.info.type = [props.elementDialog.elementOrigin]
}
init()

// 关闭弹窗
function closeDialog() {
  dialog.value.handleClose()
}
function updateInfoFun(e) {
  $data.info = e
}
const emits = defineEmits(['updateInfo'])
// 确认
const saveFun = throttle(() => {
  // 动态规则 就返回筛选条件 否则就返回选中的数据
  const data = JSON.parse(JSON.stringify($data.info))
  if ($data.info.isDynamicFilter) {
    data.creationIds = []
    data.creationList = []
  } else {
    data.filter = {}
  }
  console.log('元素弹窗关闭', data, $data.info)
  emits('updateInfo', data)
  closeDialog()
}, 500)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
</style>
