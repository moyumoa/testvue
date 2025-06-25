<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="title"
    width="580px"
  >
    <div class="dialog_content" v-loading="loading">
      <el-select
        multiple
        filterable
        v-model="checkList"
        placeholder="选择分组"
        style="width: 85%; margin-bottom: 12px"
        clearable
      >
        <el-option
          v-for="item in groupList"
          :label="item.groupName"
          :value="item.id"
          :key="item.id"
        />
      </el-select>
      <div>此处只展示矩阵号单条件分组</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import api from '@/api/content_center/content_matrix.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  joinDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        info: {}
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.joinDialog, 'show')
const loading = ref(true)
const btnLoading = ref(false)
const title = ref('')
const groupList = ref([]) // 分组列表
const checkList = ref([]) // 选中的分组列表
const info = ref({})
function init() {
  if (props.joinDialog.info) {
    info.value = props.joinDialog.info
    title.value = `【${props.joinDialog.info.dyNickname || '--'}】所在分组管理`
    if (
      props.joinDialog.info.accountGroupList &&
      props.joinDialog.info.accountGroupList.length > 0
    ) {
      props.joinDialog.info.accountGroupList.forEach(x => {
        if (x.complexType === 1) {
          checkList.value.push(x.id + '')
        }
      })
    }
  }
}
init()
// 获取分组
function getNewGroupList() {
  loading.value = true
  api
    .getNewGroupList({
      complexType: 1
    })
    .then(res => {
      if (res.code === 0) {
        groupList.value = res.data || []
      }
    })
    .finally(() => {
      loading.value = false
    })
}
getNewGroupList()
const message = inject('$message')
const emits = defineEmits(['updateList'])
const handleConfirm = throttle(() => {
  console.log(1)
  btnLoading.value = true
  api
    .joinGroup({
      dyOpenId: info.value.openId,
      groupIds: checkList.value || [],
      joinType: 1
    })
    .then(res => {
      if (res.code === 0) {
        emits('updateList')
        message.success('加入成功')
        dialog.value.handleClose()
      }
    })
    .finally(() => {
      btnLoading.value = false
    })
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
// :deep(.el-select__tags > span) {
//   padding-left: 8px;
// }
</style>
