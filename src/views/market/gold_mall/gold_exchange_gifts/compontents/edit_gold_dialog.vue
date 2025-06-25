<template>
  <el-dialog v-model="show" width="550px" :title="`${isEmpty(props.initValue)?'添加':'设置'}金币类型`" @close="closeAfter">
    <el-form :model="formData" :rules="rules" ref="formRef" hide-required-asterisk>
      <el-form-item label="类型名称" prop="name" label-width="100px">
        <el-input
          v-model="formData.name"
          show-word-limit
          class="dialog-input"
          placeholder="请输入类型名称"
          maxlength="5"
        ></el-input>
        <div class="input-tips">示例：活动金币</div>
      </el-form-item>
      <template v-if="formData.goldType !== 1">
        <el-form-item label="金币有效期" label-width="100px">
          <el-radio-group v-model="formData.goldType">
            <!--  系统默认有效期    -->
            <el-radio v-if="formData.goldType === 1" :label="1">永久有效</el-radio>
            <el-radio v-else :label="-1">永久有效</el-radio>
            <el-radio :label="2">绝对有效期</el-radio>
            <el-radio :label="3">相对有效期</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label=" " prop="time" v-if="formData.goldType === 2" label-width="100px">
          <div class="type-container">
            过期时间：
            <el-date-picker
              v-model="formData.time"
              type="datetime"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              placeholder="请选择时间"
              :disabled-date="time => time.getTime() < Date.now() - 24 * 60 * 60 * 1000"
            ></el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label=" " prop="days" v-if="formData.goldType === 3" label-width="100px">
          <div class="type-container">
            金币发放成功
            <el-input-number
              class="type-container--center"
              v-model="formData.days"
              :min="1"
              controls-position="right"
            ></el-input-number>
            天后自动过期
          </div>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="show = false">取消</el-button>
      <el-button type="primary" v-debounce="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { isEmpty } from '@/utils/tools.js'
import vDebounce from '@/directive/debounce/index.js'

const props = defineProps({
  modelValue: Boolean,
  initValue: Object
})
const emits = defineEmits(['update:modelValue', 'confirm', 'close'])
const show = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    // 弹窗关闭 删除数据
    if (!value) {
      emits('close')
    }
    return emits('update:modelValue', value)
  }
})

// const typeDisabled = ref(false)

onBeforeMount(() => {
  if (!isEmpty(props.initValue)) {
    formData.value = JSON.parse(JSON.stringify(toRaw(props.initValue))) // { ....value }
    const { goldType, expiredValue } = formData.value
    formData.value.days = goldType === 3 ? +expiredValue : 30
    if (goldType === 2) {
      formData.value.time = expiredValue
    }
    // 余量大余0不可以编辑 过期类型 系统默认类型也不可以编辑
    // typeDisabled.value = props.initValue?.balance > 0 || goldType === 1
  }
})
const formData = ref({
  name: '',
  // 1 系统默认 -1 永久有效 2 绝对有效 3 相对有效
  goldType: -1,
  // 金币过期值 1:固定-1 2:yyyy-MM-dd HH:mm 3:天数
  expiredValue: -1,
  time: null,
  days: 30
})
const formRef = ref(null)
const rules = ref({
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  goldType: [{ required: true, message: '请选择金币有效期', trigger: 'change' }],
  time: [{ required: true, message: '请选择时间', trigger: 'change' }],
  days: [{ required: true, message: '请输入时间', trigger: 'change' }]
})

const closeAfter = () => {
  formData.value = {
    name: '',
    // 1 系统默认 -1 永久有效 2 绝对有效 3 相对有效
    goldType: -1,
    // 金币过期值 1:固定-1 2:yyyy-MM-dd HH:mm 3:天数
    expiredValue: -1
  }
  emits('close')
}
const onConfirm = () => {
  formRef.value.validate(valid => {
    if (valid) {
      const data = formData.value
      if (data.goldType === 1) {
        data.expiredValue = -1
      }
      if (data.goldType === 2) {
        data.expiredValue = formData.value.time
      }
      if (data.goldType === 3) {
        data.expiredValue = formData.value.days
      }
      console.log(formData.value)
      emits('confirm', data)
    }
  })
}
</script>

<style lang="scss" scoped>
.dialog-input {
  width: 324px;
}

.input-tips {
  width: 324px;
  font-weight: 400;
  color: #909399;
  font-size: 12px;
}

.type-container {
  display: flex;
  align-items: center;

  .type-container--center {
    margin: 0 5px;
  }
}

:deep(.el-date-editor) {
  .el-icon {
    height: inherit;
  }
}
</style>
