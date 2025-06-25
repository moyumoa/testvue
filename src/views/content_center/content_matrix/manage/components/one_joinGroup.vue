<template>
  <div>
    <el-dialog
      ref="dialog"
      custom-class="matrxi_dialog "
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :title="title"
      width="560px"
    >
      <div class="content_box">
        <div class="one_content" style="margin-bottom: 20px">
          <div class="content_label" style="margin-top: 12px; height: 24px; width: 110px">
            已加入的分组：
          </div>
          <div class="content_content1">
            <div class="one_label" v-for="(item, index) in oldCheckList" :key="index">
              <span>{{ item.groupName }}</span>
              <!-- 只能删除固定分组 -->
              <span class="no_add" @click="noAdd(item)" v-if="item.complexType === 1">×</span>
            </div>
          </div>
        </div>
        <div class="one_content">
          <div class="content_label">请选择加入的分组：</div>
          <div class="content_content">
            <el-select
              multiple
              filterable
              v-model="checkList"
              placeholder="选择分组"
              style="width: 394px; margin-bottom: 8px"
              clearable
              :reserve-keyword="false"
            >
              <el-option
                v-for="item in groupList"
                :label="item.groupName"
                :value="item.id"
                :key="item.id"
              />
            </el-select>
            <div class="mark" style="color: #909399">注：此处仅支持加入固定分组</div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import api from '@/api/content_center/content_matrix.js'
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.addDialog, 'show')
const loading = ref(false)
const btnLoading = ref(false)
const title = ref('')
const oldCheckList = ref([])
const groupList = ref([]) // 分组列表
const checkList = ref([]) // 选中的分组列表
const info = ref({})
const delGroupIds = ref([]) // ×掉的分组ids
function init() {
  if (props.addDialog.info) {
    info.value = props.addDialog.info
    title.value = `【${props.addDialog.info.dyNickname || '--'}】分组管理`
  }
  if (props.addDialog.info.accountGroupList && props.addDialog.info.accountGroupList.length > 0) {
    const info = JSON.parse(JSON.stringify(props.addDialog.info))
    oldCheckList.value = info.accountGroupList

    getNewGroupList()
  } else {
    getNewGroupList()
  }
}
init()
// 获取分组
function getNewGroupList() {
  loading.value = true
  api
    .getNewGroupList({
      complexType: 1
    })
    .then(res => {
      if (res.code === 0) {
        const data = res.data || []

        groupList.value = [...data].filter(x =>
          [...oldCheckList.value].every(y => y.id + '' !== x.id)
        )
      }
    })
    .finally(() => {
      loading.value = false
    })
}

const emits = defineEmits(['updateList'])
const message = inject('$message')
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  console.log('点击弹窗确定，需要调用分组改变的接口---')
  // if (checkList.value && checkList.value.length > 0) {
  const groupIds = oldCheckList.value.map(x => {
    return x.id + ''
  })
  console.log(groupIds)
  const params = {
    groupIds:
      checkList.value && checkList.value.length > 0 ? checkList.value.concat(groupIds) : groupIds,
    isBatch: false,
    isJoinAll: false,
    joinType: 1,
    newGroupName: '',
    openId: [info.value.openId],
    delGroupIds: delGroupIds.value || []
  }
  api
    .joinGroup(params)
    .then(res => {
      if (res.code === 0) {
        delGroupIds.value = []
        emits('updateList')
        message.success('操作成功')
        dialog.value.handleClose()
      } else {
        btnLoading.value = false
      }
    })
    .finally(() => {
      btnLoading.value = false
    })
  // } else {
  // btnLoading.value = false
  // message.warning('请先选择分组')
  // }
}, 700)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
// 删除分组 --这里还没有掉接口，要在确定的时候调接口
function noAdd(item) {
  oldCheckList.value = oldCheckList.value.filter(x => {
    return x.id !== item.id
  })
  const index = delGroupIds.value.findIndex(x => x === item.id)
  if (index === -1) {
    delGroupIds.value.push(item.id)
  }
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_box {
  padding: 4px 16px 0;
  .one_content {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .content_label {
      width: 134px;
      display: flex;
      height: 32px;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .label_img {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }
    .content_content1 {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      width: calc(100% - 112px);
      .one_label {
        margin-top: 12px;
        margin-right: 12px;
        background: rgba(246, 248, 250, 1);
        border-radius: 2px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
      }
      .no_add {
        padding: 4px;
        cursor: pointer;
      }
    }
  }
}
</style>
