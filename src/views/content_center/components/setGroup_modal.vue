<template>
  <div>
    <el-dialog
      ref="dialog"
      @close="close"
      v-model="show"
      title="设置商品分组"
      width="500px"
      destroy-on-close
    >
      <div class="dialog_content">
        <div class="add_box">
          <p>新建分组</p>
          <el-input
            clearable
            v-model.trim="addName"
            maxlength="4"
            placeholder="请输入新建分组名称"
            type="text"
          ></el-input>
          <el-button type="primary" :loading="loadingAdd" @click="addGroupFun">添加</el-button>
        </div>
        <el-checkbox-group v-model="checkList" class="group_box">
          <el-checkbox :label="item.id" v-for="(item, index) in groupList" :key="index">
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import { UpdateShopProduct, selectSimpleList, addGroup } from '@/api/content_center/good_store.js'
const props = defineProps({
  setGroupForm: {
    type: Object,
    default: () => {
      return {
        show: false, // 弹窗是否展示
        goodId: [], // 商品ID
        groupList: [] // 已设置的商品分组
      }
    },
    required: true
  }
})
const message = inject('$message')
const dialog = ref(null) // ==$refs.dialog
const show = toRef(props.setGroupForm, 'show') // 是否显示弹窗
const addName = ref('') // 新增分组名称
const loadingAdd = ref(false) // 新增分组的loading
const checkList = toRef(props.setGroupForm, 'groupList')
const groupList = ref([])
const loading = ref(false) // 确定按钮的loading
const emits = defineEmits(['updateList', 'updateGroup'])
// 打开弹窗并将获取已有的商品分组
function init() {
  console.log('设置分组弹窗打开')
  selectSimpleList().then(res => {
    if (res.code === 0) {
      const list = res.data || []
      groupList.value = list
    }
  })
}
init()
// 新增分组名称
const addGroupFun = throttle(() => {
  if (addName.value) {
    addGroup({
      name: addName.value
    }).then(res => {
      if (res.code === 0) {
        message.success('新建分组成功')
        addName.value = ''
        init()
      }
    })
  } else {
    message.warning('请先输入新建分组名称')
  }
}, 300)
// 弹窗的取消事件
function closeDialog() {
  dialog.value.handleClose()
}
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  // if (checkList.value.length > 0) {
  dialog.value.handleClose()
  console.log(checkList.value)
  const list = props.setGroupForm.goodId.map(x => {
    return { id: x, productGroupIds: checkList.value.join(',') }
  })
  UpdateShopProduct(list).then(res => {
    if (res.code === 0) {
      message.success('设置成功')
      emits('updateList')
    }
  })
  // } else {
  //   message.warning('请先选择商品分组')
  // }
}, 300)
function close() {
  emits('updateGroup')
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  width: 100%;
  .add_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    p {
      width: 70px;
    }
    .el-input {
      width: 292px;
    }
    .el-button {
      margin-left: 16px;
    }
  }
  .group_box {
    margin-top: 16px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .el-checkbox {
      width: 25%;
      margin: 0;
    }
  }
}
</style>
