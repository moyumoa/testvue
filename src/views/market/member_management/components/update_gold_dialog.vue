<template>
  <el-dialog v-model="showDialog" title="变更金币" :width="600" @closed="closeDialog">
    <div v-loading="loading">
      <el-form label-width="157px" ref="taskForm" :rules="data.rules" :model="data.form">
        <el-form-item label="变更金币类型" prop="goldTypeId">
          <el-select
            placeholder="请选择"
            v-model="data.form.goldTypeId"
            class="width240"
            @change="golTypeChange"
          >
            <el-option
              v-for="item in goldTypeList"
              :key="item.value"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="`当前${currentGold.name}余额`">
          <div class="gary-color">{{ currentGold.userBalance }}</div>
        </el-form-item>
        <el-form-item label="变更方式" prop="updateType">
          <el-radio-group v-model="data.form.updateType">
            <el-radio :label="1">增加</el-radio>
            <el-radio :label="2">减少</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="变更数值" prop="updateValue">
          <el-input-number
            v-model="data.form.updateValue"
            @change="checkInt"
            style="width: 120px"
            :min="0"
            :max="99999"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="变更备注" prop="remark">
          <el-input
            v-model="data.form.remark"
            @input="clearEnter"
            style="width: 300px"
            placeholder="请输入变更备注"
            type="textarea"
            :autosize="{
              minRows: 2,
              maxRows: 4
            }"
            :maxlength="15"
            resize="none"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item :label="`变更后${currentGold.name}余额`">
          <div class="main-color">{{ updateBalance(currentGold.userBalance) }}</div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <div class="footer-tips">
          <div class="footer-tips__item">
            当前金币总余额
            <span class="gary-color">{{ info.gold }}</span>
          </div>
          <div class="footer-tips__item">
            变更后金币总余额
            <span class="main-color">{{ updateBalance(info.gold) }}</span>
          </div>
        </div>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="data.loading" @click="confirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { getCustomerGoldBalance, updateUserGold } from '@/api/market/operate_analysis.js'
import { getGoldList } from '@/api/market/gold_exchange_gifts.js'

const props = defineProps({
  showDialog: Boolean,
  info: Object
})
const { showDialog, info } = toRefs(props)

const emits = defineEmits(['update:showDialog', 'success'])
const message = inject('$message')
const taskForm = ref(null)

const data = reactive({
  form: {
    goldTypeId: '', // 金币类型
    updateType: 1,
    updateValue: 0,
    remark: ''
  },
  loading: false,
  rules: {
    goldTypeId: [{ required: true, message: '请选择金币类型', trigger: 'change' }],
    updateType: [{ required: true, message: '请选择变更方式', trigger: 'change' }],
    updateValue: [{ required: true, message: '请选择变更方式', trigger: 'change' }],
    remark: [
      {
        required: true,
        message: '\n'
      }
    ]
  }
})
// 获取金币类型选项
const goldTypeList = ref([])
// 用户金币类型余额
const balanceList = ref([])
// 当前金币类型
const currentGold = ref({
  name: ''
})
const loading = ref(true)
onBeforeMount(() => {
  loading.value = true
  Promise.all([
    getGoldList({ isValid: 1 }),
    getCustomerGoldBalance({
      userId: info.value.userId
    })
  ]).then(resultList => {
    loading.value = false
    const [res1, res2 = {}] = resultList
    goldTypeList.value = res1.data || []
    // 默认选中普通金币类型
    data.form.goldTypeId = goldTypeList.value.find(item => item?.goldType === 1)?.id ?? ''
    balanceList.value = res2.data?.goldDetails || []
    golTypeChange(data.form.goldTypeId)
  })
})

// 金币类型改变
const golTypeChange = value => {
  // 选择金币类型
  currentGold.value = goldTypeList.value.find(item => item.id === value)
  // 查询当前用户金币余额
  currentGold.value.userBalance = balanceList.value.find(item => item.id === value)?.balance ?? 0
  console.log(currentGold.value)
  // 查询当前用户的余额
}

// 变更后余额
const updateBalance = number => {
  // const goldNumber = currentGold.value?.userBalance ?? 0
  return data.form.updateType === 1
    ? Number(number) + Number(data.form.updateValue)
    : number - data.form.updateValue < 0
    ? 0
    : number - data.form.updateValue
}

function closeDialog() {
  data.form.updateType = 1
  data.form.updateValue = 0
  data.form.remark = ''
  emits('update:showDialog', false)
}

// 去除换行
function clearEnter(value) {
  const _value = value.replace(/[\r\n]/g, '')
  data.form.remark = _value.trim()
}

// 输入框转为正整数
function checkInt(value) {
  setTimeout(() => {
    data.form.updateValue = parseInt(value)
  }, 0)
}

function confirm() {
  if (!data.form.remark) return message.warning('请输入变更备注')
  if (data.form.updateValue <= 0) return message.warning('变更数值不可为0')
  data.loading = true
  const param = {
    userId: info.value.userId,
    changeGold: data.form.updateType === 1 ? data.form.updateValue : data.form.updateValue * -1,
    reason: data.form.remark,
    phoneNum: info.value.phoneNum,
    goldTypeId: data.form.goldTypeId
  }
  updateUserGold(param)
    .then(res => {
      closeDialog()
      emits('success')
      message.success('修改成功')
    })
    .finally(() => {
      data.loading = false
    })
}

watch(
  () => info.value,
  val => {
    data.form.updateType = 1
    data.form.updateValue = 0
    data.form.remark = ''
  }
)
</script>

<style lang="scss" scoped>
.main-color {
  color: #364fcd;
}

.gary-color {
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  padding-left: 24px;
  align-items: center;

  .footer-tips {
    flex: 1;
    text-align: left;
    display: flex;

    .footer-tips__item {
      width: 180px;
      color: #606266;
      @include mult_line(1);
    }
  }
}
</style>
