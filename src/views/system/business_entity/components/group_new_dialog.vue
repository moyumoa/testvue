<template>
  <el-dialog
    ref="dialog"
    width="560px"
    :title="props.info.title"
    v-model="show"
    destroy-on-close
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="content">
      <el-form :model="formData" ref="formRef" :rules="rules" @submit.enter.prevent>
        <el-form-item :label="props.info.labelName" label-width="120px" prop="name">
          <el-input
            v-model="formData.name"
            @blur="retEmit($event)"
            style="width: 372px"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { isNotEmpty, throttle } from '@/utils/tools'

const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        show: false,
        title: '',
        type: 1,
        labelName: ''
      }
    }
  }
})
const { show } = toRefs(props.info)
const emits = defineEmits(['cancel', 'submit'])
const loading = ref(false)
const formRef = ref(null)
const formData = reactive({
  name: '', // 分组名
  id: '' // 分组id
})
// 表单校验规则
const rules = reactive({
  name: [{ required: true, message: ' ', trigger: 'blur' }]
})
function retEmit(e, index) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  formData.name = e.target.value.replace(reg, '')
}
function handleClose() {
  console.log('关闭')
  emits('cancel')
  loading.value = false
}
const handleConfirm = throttle(function () {
  formRef.value.validate(valid => {
    if (valid) {
      console.log('通过验证')
      loading.value = true
      emits('submit', formData)
    } else {
      console.log('不通过验证')
    }
  })
}, 500)

onMounted(() => {
  console.log(props.info, 'infoooooooooo')
  if (isNotEmpty(props.info?.item)) {
    formData.name = props.info?.item?.groupName || ''
  }
})
</script>
<style lang="scss" scoped>
.content {
  padding: 15px 0;
}
</style>
