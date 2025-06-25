<template>
  <el-dialog
    v-model="dialogFormVisible"
    destroy-on-close
    title="重新命名分组"
    width="580px"
    @close="cancel"
  >
    <el-form :model="groupForm" ref="groupFormRef" :rules="groupFormRules" style="padding: 15px 0">
      <el-form-item label="分组名" label-width="80px" prop="name">
        <el-input
          v-model="groupForm.name"
          @blur="retEmit($event)"
          style="width: 380px"
          :maxlength="20"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirmAmendName">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  dialogFormVisible: {
    type: Boolean,
    default: false
  },
  groupForm: {
    type: Object,
    default: () => {
      return {
        name: '', // 分组名
        id: '' // 分组id
      }
    }
  }
})
const { dialogFormVisible, groupForm } = toRefs(props)
// 表单校验规则
const groupFormRules = reactive({
  name: [{ required: true, message: '请输入分组名', trigger: 'blur' }]
})
const emits = defineEmits(['confirmAmendName', 'cancel'])

function retEmit(e, index) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  groupForm.name = e.target.value.replace(reg, '')
}

function cancel() {
  emits('cancel')
}
function confirmAmendName() {
  emits('confirmAmendName', groupForm.value)
}
</script>

<style lang="scss" scoped></style>
