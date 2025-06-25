<template>
  <div class="setting_page">
    <div class="setting_header g_bg">
      <!-- <div class="logo">
        <img src="@/assets/images/user/weChat.png" alt />
        <span>企业微信群通知:</span>
      </div> -->
      <p class="text1">企业微信群通知：利用群机器人功能，及时进行消息推送</p>
      <p class="text2">
        {{ showSystemName() }}支持设置同步企业微信群机器人，设置后将可以在相应的群进行消息通知
      </p>
    </div>
    <div class="setting_table">
      <div class="add_box">
        <el-button type="primary" @click="addFun">新建群通知</el-button>
        <div style="margin: 0 0px 0 18px; color: #909399; font-size: 12px">
          请添加群机器人，并复制机器人webhook地址，
        </div>
        <tipPop></tipPop>
      </div>
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="200" label="群名称">
          <template #default="scope">{{ scope.row.name || '--' }}</template>
        </el-table-column>
        <el-table-column min-width="300" label="webhook地址">
          <template #default="scope">{{ scope.row.webhookUrl || '--' }}</template>
        </el-table-column>
        <el-table-column min-width="300" label="订阅消息">
          <template #default="{ row }">{{ transSubscribeStr(row.subscribeNewsType) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" align="right" header-align="right">
          <template #default="{ row }">
            <el-link type="primary" class="ml_16" @click="editFun(row)">编辑</el-link>
            <el-link type="danger" class="ml_16" @click="delFun(row.id)">删除</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <el-dialog
      ref="dialog"
      v-model="modal.show"
      custom-class="hide_footer_line hide_header_line"
      :title="modal.isEdit ? '编辑群通知' : '新建群通知'"
      width="600px"
      :close-on-click-modal="false"
      :before-close="onClose"
    >
      <el-form :model="modal.info" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="群名称" prop="name">
          <el-input v-model="modal.info.name" maxlength="20" placeholder="请输入群名称" />
        </el-form-item>
        <el-form-item label="webhook" prop="webhookUrl">
          <el-input v-model="modal.info.webhookUrl" placeholder="请输入webhook" />
          <tipPop></tipPop>
        </el-form-item>
        <el-form-item label="订阅消息">
          <el-checkbox-group v-model="modal.subscribeNewsList">
            <el-checkbox label="1">员工授权排行榜</el-checkbox>
            <el-checkbox label="2">部门任务排行榜</el-checkbox>
            <el-checkbox label="3">抖音流量排行榜</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools'
import tipPop from './components/tip_pop.vue'
import {
  chatConfigPage,
  createChatConfig,
  updateChatConfig,
  deleteChatConfig
} from '@/api/system_setting/notice.js'

const showSystemName = inject('$showSystemName')

/**  查询 */
// 表格的查询条件
const tableForm = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})

function getList() {
  const data = {}
  data.orderBy = ''
  data.searchCount = true
  data.pageNumber = tableForm.page.index
  data.pageSize = tableForm.page.size
  chatConfigPage(data)
    .then(res => {
      tableForm.listData = res.data.records || []
      tableForm.page.total = res.data.total || 0
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}

// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
resetSearch()

/** 弹窗的操作 */
const message = inject('$message')
const $confirm = inject('$confirm')
const dialog = ref(null)
const ruleForm = ref(null)
const modal = reactive({
  isEdit: false, // true 编辑弹窗 false 新建弹窗
  show: false,
  subscribeNewsList: [],
  info: {
    id: null,
    name: '',
    webhookUrl: ''
  }
})
const rules = ref({
  name: [{ required: true, message: '请输入群名称', trigger: 'blur' }],
  webhookUrl: [{ required: true, message: '请输入webhook', trigger: 'blur' }]
})
function onClose(done) {
  ruleForm.value.resetFields()
  done()
}
// 取消
const handleClose = throttle(() => {
  dialog.value.handleClose()
  ruleForm.value.resetFields()
}, 700)
// 确定
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      modal.info.subscribeNewsType = modal.subscribeNewsList.join(',')
      if (modal.isEdit) {
        updateChatConfig(modal.info)
          .then(res => {
            message.success('操作成功')
            getList()
          })
          .finally(() => {
            handleClose()
          })
      } else {
        createChatConfig(modal.info)
          .then(res => {
            message.success('操作成功')
            getList()
          })
          .finally(() => {
            handleClose()
          })
      }
      console.log(122)
    }
  })
}, 700)
/** 表格的操作 */
// 新建
const addFun = throttle(() => {
  modal.isEdit = false
  modal.info = {
    id: null,
    name: '',
    webhookUrl: ''
  }
  modal.subscribeNewsList = []
  modal.show = true
})
// 编辑
const editFun = throttle(e => {
  modal.isEdit = true
  modal.info = {
    id: e.id,
    name: e.name,
    webhookUrl: e.webhookUrl,
    subscribeNewsType: e.subscribeNewsType
  }
  modal.subscribeNewsList = String(e.subscribeNewsType).split(',')
  console.log(modal.subscribeNewsList)
  modal.show = true
}, 700)
// 删除
const delFun = throttle(id => {
  $confirm({
    title: '提醒',
    content: '删除后，将无法对相应的企微群进行通知，确认删除？',
    success() {
      deleteChatConfig({
        id: id
      }).then(res => {
        message.success('删除成功')
        getList()
      })
    }
  })
}, 700)

const subscribeEnum = {
  1: '员工授权排行榜',
  2: '部门任务排行榜',
  3: '抖音流量排行榜'
}
function transSubscribeStr(value) {
  if (!value) {
    return '-'
  }
  const list = String(value).split(',')
  const afterList = []
  list.forEach(e => {
    afterList.push(subscribeEnum[Number(e)])
  })
  return afterList.join()
}
</script>
<style lang="scss" scoped>
.setting_header {
  .logo {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    > img {
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }
    > span {
      font-size: 18px;
      font-weight: 600;
      color: #323233;
    }
  }
  .text1 {
    line-height: 20px;
    font-size: 16px;
  }
  .text2 {
    margin-top: 4px;
    color: #909399;
    font-size: 12px;
    line-height: 20px;
  }
}
.setting_table {
  margin-top: 16px;
  background: #fff;
  padding: 24px;
  border-radius: 10px;
  .add_box {
    margin-bottom: 16px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    :deep(.tip_page) {
      color: #909399;
    }
  }
}
</style>
