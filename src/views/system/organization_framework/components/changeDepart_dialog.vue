<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    title="变更部门"
    width="420px"
    v-model="show"
    custom-class="xm_element_dialog "
  >
    <div class="dialog_content" style="padding-bottom: 25px">
      <choose_dept_search
        ref="chooseDeptSearchRef"
        @updateDeptIds="onChangeDepartment"
        :multiple="true"
        :isUsePermission="false"
        searchLabel="所属部门"
      />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="saveFun">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { udpateStaffDepart } from '@/api/system_setting/framework.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  changeDepartDialog: {
    type: Object,
    default: () => {
      return {
        userIds: null,
        show: true // 是否显示弹窗
      }
    },
    required: true
  },
  leftTree: {
    type: Array,
    default: () => []
  }
})
const loading = ref(false)
const chooseId = ref([]) // 选中的部门ID
const dialog = ref()
const show = toRef(props.changeDepartDialog, 'show')
function closeDialog() {
  dialog.value.handleClose()
}
function onChangeDepartment(e) {
  chooseId.value = e || []
}
const $message = inject('$message')
const emits = defineEmits(['resetStaffList'])
const saveFun = throttle(() => {
  if (chooseId.value && chooseId.value.length > 0) {
    console.log(chooseId.value)
    udpateStaffDepart({
      targetDeptId: chooseId.value,
      userIds: props.changeDepartDialog.userIds
    })
      .then(res => {
        if (res.code === 0) {
          emits('resetStaffList')
        }
        closeDialog()
      })
      .catch(() => {
        closeDialog()
      })
  } else {
    $message.warning('请先选择部门')
  }
}, 700)
</script>
<style lang="scss" scoped>
.delpart_content {
  font-size: 14px;
  padding-bottom: 37px;
  font-weight: 400;
  color: #323233;
  line-height: 20px;
}
:deep(.input_box) {
  width: 100% !important;
}
:deep(.input_box .input_choose .one_choose) {
  max-width: 180px !important;
}
</style>
