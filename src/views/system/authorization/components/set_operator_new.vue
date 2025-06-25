<template>
  <div>
    <el-dialog
      :model-value="props.visible"
      custom-class="hide_footer_line"
      title="设置运营者"
      width="448px"
      :before-close="close"
    >
      <el-form ref="formRef" @submit.enter.prevent>
        <el-form-item label="搜索成员">
          <div>
            <el-autocomplete
              v-model="operator"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入成员姓名、手机号"
              ref="autocompleteRef"
            />
          </div>
        </el-form-item>
      </el-form>
      <!-- 视频审核多级审核 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="confirm">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listUserInfo, uptAuthOperation } from '@/api/system_setting/authorization'
const brandInfo = JSON.parse(localStorage.getItem('brandInfo'))
const props = defineProps({
  visible: { type: Boolean, default: false },
  data: { type: Object, required: true }
})

const emits = defineEmits(['update:visible', 'updateList'])
const $message = inject('$message')
const operator = ref('') // 查询员工
const autocompleteRef = ref(null)

// 实时匹配输入
const querySearchAsync = (queryString, cb) => {
  let nowResult = []
  if (operator.value) {
    listUserInfo({
      brandId: brandInfo.brandId,
      name: operator.value
    }).then(res => {
      nowResult = transformValue(res.data)
      cb(nowResult)
    })
  } else {
    cb(nowResult)
  }
}
function transformValue(data) {
  const result = data.map(function (item) {
    item.value = item.userBrandName
    return item
  })
  return result
}

// 关闭弹窗 初始化状态
const close = () => {
  operator.value = ''
  if (autocompleteRef.value) {
    autocompleteRef.value.suggestions = []
    autocompleteRef.value.highlightedIndex = -1
  }
  emits('update:visible', false)
}
// 提交更新
const confirm = () => {
  if (!operator.value) return $message.warning('请添加正确的用户信息')
  listUserInfo({
    brandId: brandInfo.brandId,
    name: operator.value
  }).then(res => {
    updateOperator(res.data[0].userId)
  })
}
// 更新运营者
function updateOperator(userId) {
  uptAuthOperation({
    userId,
    accountId: operator.value,
    operationId: props.data.operationId
  })
    .then(res => {
      if (res.code === 0) {
        $message.success('修改成功')
        emits('updateList')
      }
    })
    .catch(() => {
      $message.success('修改失败')
    })
    .finally(() => {
      close()
    })
}
</script>

<style lang="scss" scoped>
.input_wrapper {
  padding: 24px 0;
  span {
    margin-right: 12px;
  }
}
</style>
