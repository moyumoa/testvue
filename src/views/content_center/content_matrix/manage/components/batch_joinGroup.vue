<template>
  <div>
    <el-dialog
      ref="dialog"
      custom-class="matrxi_dialog "
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="批量加入分组"
      width="560px"
    >
      <div class="content_box">
        <div class="one_content">
          <div class="content_label">请选择加入的分组:</div>
          <div class="content_content">
            <el-select
              filterable
              v-model="checkList"
              placeholder="选择分组"
              style="width: 394px; margin-bottom: 8px"
              clearable
              :reserve-keyword="false"
              @change="selectChange"
            >
              <el-option
                v-for="item in groupList"
                :label="item.groupName"
                :value="item.id"
                :key="item.id"
              />
            </el-select>
            <div class="mark">注：此处仅支持加入单条件分组</div>
          </div>
        </div>
        <div class="one_content" style="margin-top: 20px; margin-bottom: 16px">
          <div
            class="content_label"
            style="color: #364fcd; cursor: pointer"
            @click="addInfo.show = true"
          >
            <img
              class="label_img"
              src="https://tagvv-1256030678.file.myqcloud.com/20221021rv2zv.png"
              alt=""
            />
            新建并加入分组
          </div>
          <div class="content_content" v-if="addInfo.show">
            <el-input
              style="width: 394px"
              @blur="retEmit($event)"
              clearable
              v-model.trim="addInfo.name"
              placeholder="请输入分组名称"
              maxlength="20"
              show-word-limit
            ></el-input>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="footer_box">
          <div class="footer_left">
            已选择抖音号
            <span>{{ props.addDialog.chooseLength || 0 }}</span>
            个
          </div>
          <span class="dialog-footer">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确定</el-button>
          </span>
        </div>
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
        show: false // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.addDialog, 'show')
const btnLoading = ref(false)
const form = ref(null) // 选中的筛选条件
const chooseUserList = ref([]) // 选中的矩阵号
const isAll = ref(false) // 矩阵号是否全选
const loading = ref(true)
const groupList = ref([]) // 分组列表
const checkList = ref('') // 选中的分组列表
const addInfo = reactive({
  show: false,
  name: undefined
}) // 新建的分组信息
function init() {
  if (props.addDialog.chooseList) {
    chooseUserList.value = JSON.parse(JSON.stringify(props.addDialog.chooseList))
  } else {
    chooseUserList.value = []
  }
  form.value = props.addDialog.form
  isAll.value = props.addDialog.isAll
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
        groupList.value = res.data || []
      }
    })
    .finally(() => {
      loading.value = false
    })
}
getNewGroupList()

// 监听如果有选择分组，那就清空新建的，选了新建的就清楚选择的分组
function selectChange() {
  // 如果选中了分组，那就把输入的分组名清掉
  addInfo.name = undefined
}

function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  addInfo.name = e.target.value.replace(reg, '')
  // 输入了分组名，那就把选中的清空掉
  checkList.value = ''
}
const emits = defineEmits(['updateList'])
const message = inject('$message')
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  btnLoading.value = true
  if (
    (checkList.value && checkList.value.length > 0) ||
    (addInfo.name && addInfo.name.length > 0)
  ) {
    api
      .joinGroup({
        form: form.value,
        groupIds: checkList.value && checkList.value.length > 0 ? [checkList.value] : [],
        isBatch: true,
        isJoinAll: isAll.value,
        joinType: 1,
        newGroupName: checkList.value && checkList.value.length > 0 ? '' : addInfo.name,
        openId: chooseUserList.value
      })
      .then(res => {
        if (res.code === 0) {
          emits('updateList')
          message.success('加入成功')
          dialog.value.handleClose()
        } else {
          btnLoading.value = false
        }
      })
      .finally(() => {
        btnLoading.value = false
      })
  } else {
    btnLoading.value = false
    message.warning('请先选择分组')
  }
}, 700)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_box {
  padding: 16px 16px 0;
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
    .mark {
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
  }
}
.footer_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 0px 4px;
  .footer_left {
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    span {
      color: #364fcd;
    }
  }
  .dialog-footer {
  }
}
</style>
