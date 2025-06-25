<template>
  <div class="aut_main page_main">
    <div class="g_bw">
      <el-button
        type="primary"
        style="margin-right: 20px"
        @click="onClick"
        v-if="listData.length === 0"
      >
        新增小程序授权
      </el-button>
      <span class="link_wrapper" v-if="listData.length === 0">
        授权链接:
        <a style="color: #364fcd" href="https://microapp.bytedance.com/" target="_blank">
          https://microapp.bytedance.com/
        </a>
      </span>
    </div>
    <xm_table
      class="pic_table"
      tableType="avatar"
      v-loading="loading"
      :data="listData"
      v-model:page="page"
      @getTableData="getList"
    >
      <el-table-column label="小程序" prop="minProgram">
        <template #default="scope">
          <div class="table_photo">
            <img :src="scope.row.appPhoto" alt />
            <div>{{ scope.row.appName }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="授权时间" prop="time">
        <template #default="scope">{{ scope.row.authTime }}</template>
      </el-table-column>
      <el-table-column label="APP ID" prop="appId">
        <template #default="scope">{{ scope.row.appId }}</template>
      </el-table-column>
      <el-table-column label="店铺id">
        <template #default="scope">{{ scope.row.appShopId }}</template>
      </el-table-column>
      <el-table-column label="已绑定抖店">
        <template #default="scope">{{ scope.row.shopName }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200px">
        <template #default="{ row }">
          <el-link type="primary" @click="handleEdit(row)">设置抖店</el-link>
          <!-- <span class="action_item" @click="setMiniApp(row)">
            <el-link type="primary">
              {{ row.landingPage == 1 ? '取消落地页小程序' : '设为落地页小程序' }}
            </el-link>
            <el-tooltip
              popper-class="tooltip-class"
              placement="top"
              :style="{ 'margin-left': '4px' }"
            >
              <template #content>
                <div>1. 系统默认使用公共小程序【星互动】作为任务模块视频/小程序挂载的落地页</div>
                <div>2. 可将品牌自有小程序设置为落地页使用的小程序</div>
              </template>
              <img
                src="@/assets/images/operate/tip_line.png"
                style="width: 12px; height: 12px; margin-left: 4px"
              />
            </el-tooltip>
          </span> -->
          <el-link type="danger" :style="{ 'margin-left': '10px' }" @click="cancelAuth(row)">
            取消授权
          </el-link>
        </template>
      </el-table-column>
    </xm_table>
  </div>
  <el-dialog
    v-if="editModal.show"
    v-model="editModal.show"
    :title="editModal.title"
    width="541px"
    custom-class="hide_footer_line"
  >
    <el-form :model="modelForm" :rules="rules" ref="ruleForm">
      <el-form-item label="店铺id" prop="appShopId">
        <el-input v-model="modelForm.appShopId" placeholder="请填写店铺id" clearable></el-input>
        <div>
          请填写字节小程序后台绑定的小店id
          <el-popover placement="right" width="625px" trigger="hover" popper-class="g_popper_gray">
            <template #reference>
              <span class="question">如何查找?</span>
            </template>
            <div class="myTips">
              <div class="title">如何查找店铺id</div>
              <p>1.打开字节小程序后台 https://microapp.bytedance.com/</p>
              <p>2.登录后，点击设置-基础设置-关联设置，复制绑定的小店的店铺id</p>
              <img src="@/assets/images/content_config/h.png" alt />
            </div>
          </el-popover>
        </div>
      </el-form-item>
      <el-form-item label="选择抖店" prop="shopId">
        <el-select
          v-model="modelForm.shopId"
          placeholder="请选择抖店"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="item in dyShop"
            :label="item.shopName"
            :value="item.shopId"
            :key="item.shopId"
          />
        </el-select>
        <div>请选择与店铺id相对应的抖店</div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
  <confirm-dialog v-model:visible="dialogVisible" tip="确认是否已授权?" @confirm="getList" />
</template>

<script setup>
import ConfirmDialog from './components/confirm_dialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAppAuth,
  appAuthLink,
  programSetShop,
  getAuthShop,
  delMiniAuth
} from '@/api/system_setting/authorization'

const tableInfo = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})

const { loading, listData, page } = toRefs(tableInfo)
const dialogVisible = ref(false)

const modelForm = ref({
  shopId: '',
  appShopId: '',
  appId: ''
})
const ruleForm = ref(null)
const rules = {
  appShopId: [{ required: true, message: '请填写店铺id', trigger: 'blur' }],
  shopId: [{ required: true, message: '请选择抖店', trigger: 'blur' }]
}
const message = inject('$message')
const handleConfirm = () => {
  ruleForm.value.validate(valid => {
    if (valid) {
      editModal.show = false
      programSetShop(modelForm.value).then(res => {
        message.success('设置抖店成功')
        getList()
      })
    }
  })
}
const handleCancel = () => {
  editModal.show = false
  modelForm.value.appShopId = ''
  modelForm.value.shopId = ''
}
const onClick = () => {
  // window.open(authLink.value)
  // dialogVisible.value = true
  appAuthLink({}).then(res => {
    if (res.success) {
      authLink.value = res.data
      window.open(authLink.value)
      dialogVisible.value = true
    }
  })
}
const editModal = reactive({
  show: false,
  title: '设置抖店',
  row: null
})

const handleEdit = row => {
  editModal.title = '设置抖店'
  editModal.row = row
  editModal.show = true
  modelForm.value.appId = row.appId
}
const getList = () => {
  loading.value = true
  getAppAuth({
    pageSize: page.value.size,
    pageNumber: page.value.index
  })
    .then(res => {
      listData.value = res.data ? res.data.records : []
      page.value.total = res.data ? res.data.total : 0
    })
    .finally(() => {
      loading.value = false
    })
}
const authLink = ref(null)
// 查询授权链接
// const getAuthLink = () => {
//   appAuthLink({}).then(res => {
//     authLink.value = res.data
//   })
// }
const dyShop = ref([])
// 查询品牌下抖店
const getBrandShop = () => {
  getAuthShop().then(res => {
    if (res.data) {
      res.data = res.data.filter(item => item.status === 1)
    }
    dyShop.value = res.data || []
  })
}
// function setMiniApp(item) {
//   const _message =
//     item.landingPage === 1
//       ? '是否将【星互动】小程序设为落地页小程序？'
//       : `是否将【${item.appName}】小程序设为落地页小程序？`
//   ElMessageBox.confirm(_message, '系统提醒', {
//     confirmButtonText: '确认',
//     cancelButtonText: '取消'
//   }).then(res => {
//     setAppLandPage({ id: item.appAuthId }).then(res => {
//       ElMessage.success('设置成功')
//       getList()
//     })
//   })
// }
function cancelAuth(item) {
  ElMessageBox.confirm(`是否解除【${item.appName}】小程序授权？`, '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(res => {
    delMiniAuth({ id: item.appAuthId }).then(res => {
      ElMessage.success('解除成功')
      getList()
    })
  })
}
getList()
// getAuthLink()
getBrandShop()
</script>

<style lang="scss" scoped>
.question {
  margin-left: 20px;
  color: #364fcd;
  cursor: pointer;
}
.myTips {
  // padding: 24px 30px;
  padding: 6px 12px 0;
  color: #fff;
  font-size: 14px;
  .title {
    font-size: 16px;
    margin-bottom: 20px;
  }
  p {
    margin-bottom: 16px;
  }
  img {
    margin-bottom: 16px;
    width: 600px;
    height: 295px;
  }
}
.action_item {
  margin-left: 10px;
  > a,
  > img {
    vertical-align: middle;
  }
}
</style>
