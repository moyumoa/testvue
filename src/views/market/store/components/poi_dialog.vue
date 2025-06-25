<template>
  <el-dialog
    ref="dialog"
    :model-value="modelValue"
    title="管理POI位置"
    destroy-on-close
    width="800px"
    @open="getList"
    @close="emits('update:modelValue', false)"
  >
    <div v-loading="loading">
      <div class="top-info">
        <div class="item">{{ storeInfo.storeName }}（{{ storeInfo.storeId }}）</div>
        <div class="add-item" @click="addItem">
          <i class="iconfont icon-tianjia"></i>
          添加POI
        </div>
      </div>
      <el-form
        :model="form"
        :inline="true"
        label-position="left"
        :hide-required-asterisk="true"
        ref="ruleFormRef"
      >
        <template v-for="(item, index) in form.poiInfos" :key="index">
          <el-form-item :rules="poiName" :prop="'poiInfos.' + index + '.poiName'">
            <template #label>名称</template>
            <el-input
              @input="formatter(item)"
              :model-value="item.poiName"
              v-model="item.poiName"
              clearable
              maxlength="15"
              type="text"
              class="form-input"
              placeholder="请填写POI名称"
            ></el-input>
          </el-form-item>
          <el-form-item :inline="true" :rules="poiRules" :prop="'poiInfos.' + index + '.poi'">
            <template #label>POI值</template>
            <el-input
              v-model="item.poi"
              clearable
              type="text"
              class="form-input"
              placeholder="请填写POI值"
            ></el-input>
          </el-form-item>
          <div class="delete-btn" @click="deleteItem(index)">删除</div>
        </template>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emits('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="onConfirm(ruleFormRef)">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { getPOIListById } from '@/api/market/store.js'

const props = defineProps({
  modelValue: Boolean,
  storeInfo: {
    type: Object,
    required: true
  }
})
const emits = defineEmits(['update:modelValue', 'confirm'])
const { modelValue, storeInfo } = toRefs(props)
const loading = ref(true)
const getList = () => {
  loading.value = true
  getPOIListById({
    storeId: storeInfo.value.storeId
  }).then(res => {
    loading.value = false
    if (res.code === 0) {
      form.poiInfos = res.data || []
    }
  })
}
const form = reactive({
  storeId: storeInfo.value.storeId,
  poiInfos: [
    {
      poiName: '',
      poi: ''
    }
  ]
})
const poiName = [{ required: true, message: '请填写门店名称', trigger: 'blur' }]
const poiRules = [
  { required: true, message: '请填写门店POI位置', trigger: 'blur' },
  {
    validator: (rule, value, callback) =>
      /^\d{10,30}$/.test(value) ? callback() : callback(new Error('POI格式为10～30位纯数字')),
    trigger: 'blur'
  }
]
const ruleFormRef = ref(null)
const formatter = item => {
  item.poiName = item.poiName.replace(/\s+/g, '')
}
const addItem = () => {
  form.poiInfos.push({
    poiName: '',
    poi: ''
  })
}
const deleteItem = index => {
  form.poiInfos.splice(index, 1)
}

function onConfirm(formEl) {
  if (!formEl) return
  formEl.validate(valid => {
    if (valid) {
      console.log('通过校验')
      form.storeId = storeInfo.value.storeId
      emits('update:modelValue', false)
      emits('confirm', form)
    }
  })
}
</script>

<style lang="scss" scoped>
.top-info {
  font-size: 16px;
  font-weight: 400;
  color: #333333;
  line-height: 22px;

  .add-item {
    margin: 16px 0;
    color: $theme_color;
    display: flex;
    align-items: center;
    cursor: default;

    .icon-tianjia {
      font-size: 20px;
      margin-right: 11px;
    }
  }
}

// 重置全局样式的label 默认宽度
:deep(.el-form-item__label) {
  min-width: auto;
}

.form-input {
  width: 220px;
}

.delete-btn {
  cursor: default;
  color: $theme_color;
  line-height: 32px;
  display: inline-block;
  margin-bottom: 20px;
  vertical-align: middle;
  font-size: 14px;
}
</style>
