<template>
  <el-dialog
    :model-value="props.visible"
    custom-class="hide_footer_line"
    title="设置运营者"
    width="448px"
    :before-close="close"
  >
    <!-- <div class="g_acc_info" v-if="props.data">
      <img :src="props.data.authAccountPhoto" alt="" />
      <span>{{ props.data.authAccountName }}</span>
    </div> -->
    <div class="input_wrapper">
      <span>运营者：</span>
      <el-select v-model="operator" placeholder="请选择运营者" style="width: 230px">
        <el-option
          v-for="item in operatorList"
          :label="item.userBrandName"
          :value="item.accountId"
          :key="item.accountId"
        />
      </el-select>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { uptAuthOperation } from '@/api/system_setting/authorization'
import { listUserForPc } from '@/api/system_setting/account'
const props = defineProps({
  visible: { type: Boolean, default: false },
  data: { type: Object, required: true }
})
const emits = defineEmits(['update:visible', 'updateList'])
const $message = inject('$message')
const operator = ref('')
const operatorList = ref([])

const close = () => {
  operator.value = ''
  emits('update:visible', false)
}
const confirm = () => {
  const temp = operatorList.value.find(i => i.accountId === operator.value) || {}
  uptAuthOperation({
    accountId: operator.value,
    userId: temp.userId,
    operationId: props.data.operationId
  }).then(res => {
    $message.success('修改成功')
    close()
    emits('updateList')
  })
}
const getList = () => {
  listUserForPc({ pageSize: 999, pageNumber: 1 }).then(res => {
    operatorList.value = res.data.records.filter(i => i.isValid === 1)
  })
}
watchEffect(() => {
  if (props.visible === true) {
    getList()
    operator.value = props.data.operationAccountId
  }
})
</script>

<style lang="scss" scoped>
.input_wrapper {
  padding: 24px 0;
  span {
    margin-right: 12px;
  }
}
</style>
