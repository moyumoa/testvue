<template>
  <el-dialog v-model="visible" title="运营矩阵号" width="695px" custom-class="choose_part_dialog">
    <div class="header_search">
      <el-input
        v-model="name"
        placeholder="请输入矩阵号名称"
        style="width: 360px"
        @keyup.enter="getList"
      >
        <template #suffix>
          <el-icon class="el-input__icon" style="cursor: pointer; top: -8px" @click="getList">
            <i-search />
          </el-icon>
        </template>
      </el-input>
      <div class="search_right">
        <p style="margin: 0 24px 0 0">
          已选：
          <span>{{ checked.length }}个账号</span>
        </p>
        <span @click="onClear">清空</span>
      </div>
    </div>
    <div class="line"></div>
    <div class="list_wrapper">
      <el-checkbox-group v-model="checked">
        <el-checkbox
          class="list_item"
          v-for="item in list"
          :key="item.operatorId"
          :label="item.operatorId"
        >
          <!-- :disabled="item.status === 2" -->
          <div class="list_item_content">
            <div class="item_photo" :class="{ g_failure: item.status === 2 }">
              <img :src="item.authAccountPhoto" alt="" />
              <div :class="[`xm_platformIcon_${item.platform}`]"></div>
            </div>
            <span class="item_name">{{ item.authAccountName }}</span>
          </div>
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { getOperatorAccount } from '@/api/system_setting/account.js'

const props = defineProps({
  showDialog: {
    type: Object,
    default: () => {
      return {
        visible: false,
        data: null
      }
    },
    required: true
  }
})
const emits = defineEmits(['setResult'])

const name = ref('')
const originList = ref([])
const list = ref([])
const checked = ref([])
const visible = toRef(props.showDialog, 'visible')

const confirm = () => {
  const result = []
  checked.value.forEach(id => {
    const data = originList.value.find(l => l.operatorId === id)
    if (data) {
      result.push(data)
    }
  })

  emits('setResult', result)
  handleClose()
}
const handleClose = () => {
  visible.value = false
}
const onClear = () => {
  checked.value = []
}
const getList = () => {
  const { data } = props.showDialog
  getOperatorAccount({
    authAccountName: name.value,
    operatorIdList: data ? data.map(i => i.operatorId) : []
  }).then(res => {
    list.value = res.data.filter(i => i.isChoose === 0)
    if (originList.value.length === 0) {
      originList.value = list.value
    }
  })
}

onMounted(getList)
watchEffect(() => {
  if (props.showDialog.data) {
    checked.value = props.showDialog.data.map(i => i.operatorId)
  }
})
</script>

<style lang="scss" scoped>
.header_search {
  padding: 16px 28px 16px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  :deep(.el-input__suffix) {
    transform: translateY(25%);
  }
  p {
    font-weight: 500;
    color: #909399;
    span {
      color: #333333;
    }
  }
  span {
    color: #364fcd;
    cursor: pointer;
  }
  .search_right {
    width: calc(100% - 390px);
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
}
.line {
  // position: absolute;
  width: 100%;
  border-bottom: 1px solid #dcdfe6;
  // left: 0;
  // top: 130px;
}
.list_wrapper {
  max-height: 500px;
  overflow-y: auto;
  // margin-top: 34px;
  padding: 0 16px;
  width: 100%;
  .list_item {
    box-shadow: inset 0px -1px 0px 0px #ebedf0;
    width: calc(100% - 16px);
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px 0 4px;

    &:hover {
      background: #eff3fd;
      border-radius: 4px;
    }
    &_content {
      display: flex;
      align-items: center;
      .item_photo {
        position: relative;
        width: 40px;
        height: 40px;
        > img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
      }
      .item_name {
        margin-left: 16px;
        color: #323233;
      }
    }
  }
}
:deep(.el-checkbox) {
  margin: 0;
  height: 56px;
  padding: 0;
  .el-checkbox__inner {
    width: 16px;
    height: 16px;
  }
  .el-checkbox__inner::after {
    width: 5px;
    height: 8px;
  }
}
</style>
