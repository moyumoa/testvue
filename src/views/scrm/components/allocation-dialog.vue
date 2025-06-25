<template>
  <el-dialog v-model="show" :width="560" @close="close">
    <template #title>
      <div class="dialog_title">{{ isBatch ? '批量分配客户' : '分配客户' }}</div>
    </template>
    <div class="dialog_content">
      选择员工：
      <el-select
        v-model="selectValue"
        filterable
        clearable
        placeholder="请选择或输入搜索"
        remote
        reserve-keyword
        remote-show-suffix
        @focus="remoteMethod(undefined)"
        :remote-method="remoteMethod"
        :loading="loading"
        width="230px"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <template #footer>
      <div class="footer_box">
        <div class="footer_left" v-if="isBatch">
          已选择客户
          <span>{{ customerLength || 0 }}</span>
          个
        </div>
        <div v-else></div>
        <span class="dialog-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" :loading="btnLoading" @click="confirm">确定</el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { listUserForPc } from '@/api/system_setting/account'

const props = defineProps({
  btnLoading: {
    type: Boolean,
    default: false
  },
  isBatch: {
    type: Boolean,
    default: false
  }, // 是否批量分配
  customerLength: {
    type: Number,
    default: null
  } // 批量分配时客户数量
})

const { isBatch, customerLength, btnLoading } = toRefs(props)

const show = true
const emits = defineEmits(['close', 'confirm'])
const message = inject('$message')

const selectValue = ref('')
const loading = ref(false)
const params = reactive({
  pageSize: 999,
  status: 1,
  pageNumber: 1
})

function getUserList() {
  listUserForPc(params).then(res => {
    if (res.code === 0) {
      const arr = ref([])
      res.data.records.forEach(item => {
        const oneBoj = reactive({})
        if (item.depList && item.depList.length > 0) {
          oneBoj.label = item.userBrandName + ' / ' + item.depList.join(' / ')
        } else {
          oneBoj.label = item.userBrandName
        }
        oneBoj.value = item.userId
        arr.value.push(oneBoj)
      })
      options.value = arr.value
    }
    loading.value = false
  })
}

getUserList()
const remoteMethod = query => {
  params.userName = query
  loading.value = true
  getUserList()
}
const options = ref([])

function close() {
  emits('close', true)
}

function confirm() {
  if (selectValue.value) {
    emits('confirm', selectValue.value)
  } else {
    message.error('未选择员工，无法分配')
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-select) {
  width: 358px;
}

.dialog_content {
  display: flex;
  align-items: center;

  .el-select__caret::before {
    content: '\e6e1';
  }

  .is-focus {
    .el-select__caret {
      transform: rotateZ(0deg);
    }
  }
}
.footer_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 0px 0 24px;
  .footer_left {
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    span {
      color: #364fcd;
    }
  }
}
</style>
