<template>
  <div class="guest">
    <xm_search class="">
      <div class="search_item">
        <label class="item_label">商家信息</label>
        <div class="item_content">
          <el-input v-model="searchForm.name" placeholder="请输入来客商家名称/商家ID" clearable />
        </div>
      </div>
      <div class="search_item">
        <el-button type="primary" @click="_getList">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
      <!-- <div class="search_item guide_warp" @click="toGuide">
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20231205ka5rd.png"
          alt=""
          class="guide_icon"
        />
        商家授权指南
      </div> -->
    </xm_search>
    <div class="g_bg mt_16">
      <div class="g_bw">
        <el-button type="primary" @click="addAuth">新增商家授权</el-button>
      </div>
      <xm_table v-loading="loading" :data="listData" v-model:page="page" @getTableData="getList">
        <el-table-column label="商家名称" prop="name">
          <template #default="{ row }">
            <div>{{ row.name || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商家ID" prop="accountId">
          <template #default="{ row }">
            <div>{{ row.accountId || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="授权时间" prop="authTime">
          <template #default="{ row }">
            <div>{{ row.authTime || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="授权状态" prop="systemAuthStatus">
          <template #default="{ row }">
            <div
              class="value_tips_warp"
              :class="{ re_efficacy_test: row.systemAuthStatus == 1 || row.systemAuthStatus == 2 }"
            >
              {{ getAuthStatus(row.systemAuthStatus) || '--' }}
              <el-tooltip class="item" effect="dark" placement="top">
                <img class="value_tips" src="@/assets/images/operate/tip_line.png" alt />
                <template #content>
                  <div v-if="row.authTime">授权时间：{{ row.authTime }}</div>
                  <template v-if="row.systemAuthStatus == 1 || row.systemAuthStatus == 2">
                    <div>失效时间：{{ row.invalidTime || '--' }}</div>
                    <div style="width: 230px; display: flex">
                      <div style="white-space: nowrap">失效原因：</div>
                      <div>{{ row.systemAuthStatus == 1 ? '自动过期' : '后台手动解除' }}</div>
                    </div>
                  </template>
                </template>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="120"
          align="center"
          header-align="center"
        >
          <template #default="scope">
            <!-- <el-link
              type="danger"
              @click="authOpe('cancel', scope.row)"
              v-if="scope.row.systemAuthStatus == 0"
            >
              解除授权
            </el-link> -->
            <el-popconfirm
              v-if="scope.row.systemAuthStatus == 0"
              title="确定解除该商家授权吗?"
              @confirm="authOpe('cancel', scope.row)"
            >
              <template #reference>
                <el-link type="danger">解除授权</el-link>
              </template>
            </el-popconfirm>
            <el-link
              type="primary"
              @click="authOpe('submit', scope.row)"
              v-if="scope.row.systemAuthStatus == 1 || scope.row.systemAuthStatus == 2"
            >
              重新授权
            </el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <authGuest
      v-if="authGuestDialog.show"
      :authDialog="authGuestDialog"
      @updateFun="_getList"
      @close="authGuestClose"
    />
  </div>
</template>

<script setup>
import {
  listLifeAuthAccount,
  cancelLifeAccountAuth
  // accountLifeAuthLink
} from '@/api/content_center/content_guest_data.js'
import { throttle } from '@/utils/tools'

import authGuest from './components/auth_guest_dialog.vue'
const message = inject('$message')
const searchForm = reactive({
  name: ''
})
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

const authGuestDialog = reactive({
  show: false,
  info: {}
})
function getAuthStatus(status) {
  const obj = {
    0: '授权有效',
    1: '授权失效',
    2: '授权失效'
  }
  return obj[status] || null
}

onMounted(() => {
  _getList()
})

function authGuestClose() {
  authGuestDialog.info = {}
}

// 查询
function _getList() {
  page.value.index = 1
  getList()
}
const reset = () => {
  searchForm.name = ''
  page.value.index = 1
  getList()
}
const getList = () => {
  loading.value = true
  const brandId = localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : ''
  listLifeAuthAccount({
    info: searchForm.name,
    orderSetting: 'DESC:auth_time',
    pageNo: page.value.index,
    pageSize: page.value.size,
    searchCount: true,
    brandId
  })
    .then(res => {
      if (res.code === 0) {
        // res.data.records[0].systemAuthStatus = 2
        listData.value = res.data.records || []
        page.value.total = res.data.total
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
// function toGuide() {
//   window.open(
//     'https://sumwhy0902.feishu.cn/docx/BHrFdss2AofVRAx9GBlc9s3snle?from=from_copylink',
//     '_blank'
//   )
// }

// 授权操作
const authOpe = throttle(function (type, row) {
  console.log('授权操作', type, row)
  const brandId = localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : ''
  if (type === 'cancel') {
    cancelLifeAccountAuthFn({ brandId, openId: row.accountId })
  }
  if (type === 'submit') {
    accountLifeAuthLinkFn(row.accountId)
  }
}, 700)
// 解除授权
function cancelLifeAccountAuthFn(params) {
  cancelLifeAccountAuth(params)
    .then(res => {
      if (res.code === 0) {
        message.success('操作成功')
      } else {
        message.waring('操作失败')
      }
    })
    .catch(() => {
      message.waring('操作失败')
    })
    .finally(() => {
      getList()
    })
}
// 授权
function accountLifeAuthLinkFn(accountId) {
  // console.log(
  //   '点击重新授权，我觉得需要调接口，但是后端说走打开弹窗获取二维码的授权逻辑，如有有问题后端会在授权结果返回相关提示'
  // )
  authGuestDialog.info.type = 'reAuth'
  authGuestDialog.info.accountId = accountId
  addAuth()
}
// 新增授权
function addAuth() {
  authGuestDialog.show = true
}
</script>

<style lang="scss" scoped>
.guest {
  .guide_warp {
    font-size: 14px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    color: #364fcd;
    line-height: 20px;
    cursor: pointer;
    .guide_icon {
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }
  }
  .value_tips_warp {
    display: flex;
    align-items: center;
    .value_tips {
      width: 14px;
      height: 14px;
      margin-left: 8px;
    }
  }
  .re_efficacy_test {
    color: #f85151;
  }
}
</style>
