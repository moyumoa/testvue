<template>
  <div class="aut_main page_main">
    <div class="g_bw">
      <el-button type="primary" style="margin-right: 20px" @click="addAuth">
        授权酷家乐账号
      </el-button>
    </div>
    <xm_table v-loading="loading" :data="listData" v-model:page="page" @getTableData="getList">
      <el-table-column show-overflow-tooltip label="账号名称" prop="accountName" min-width="170" />
      <el-table-column label="授权状态" min-width="120">
        <template #default="{ row }">
          <span :class="{ g_blue: row.stutus === 0, g_red: row.stutus === 1 }">
            {{ convertStatus(row.stutus) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="授权时间" prop="authTime" min-width="170" />
      <el-table-column label="操作人" prop="operatorUserName" min-width="120" />
      <el-table-column label="操作" align="right" fixed="right" width="170">
        <template #default="{ row }">
          <!-- <el-popconfirm title="确定解除该账号授权吗?" @confirm="removeAuth(row.shopId)">
            <template #reference>
              <el-link type="primary">
                <span class="g_red">解除授权</span>
              </el-link>
            </template>
          </el-popconfirm> -->
          <el-link type="primary" v-if="row.stutus === 1" class="ml_16" @click="addAuth">
            重新授权
          </el-link>
        </template>
      </el-table-column>
    </xm_table>
  </div>
  <confirm-dialog v-model:visible="dialogVisible" tip="确认是否已授权?" @confirm="getList" />
</template>

<script setup>
import ConfirmDialog from './components/confirm_dialog.vue'
import { kujialeAuthLink, getKujialeAuthList } from '@/api/system_setting/authorization'
import { throttle } from '@/utils/tools.js'

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

// 授权状态转换
const convertStatus = status => {
  if (status === 0) {
    return '已授权'
  } else if (status === 1) {
    return '授权失效'
  } else {
    return '--'
  }
}
const authLink = ref(null)
// 查询授权链接
const getAuthLink = () => {
  const brandInfo = localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo'))
    : {}
  kujialeAuthLink({
    brandId: brandInfo.brandId || null
  }).then(res => {
    authLink.value = res.data
  })
}
getAuthLink()
const dialogVisible = ref(false)

const $message = inject('$message')
const addAuth = throttle(() => {
  if (authLink.value) {
    window.open(authLink.value)
    dialogVisible.value = true
  } else {
    $message.warning('未获取到地址链接，请联系管理员')
  }
}, 700)
const getList = () => {
  loading.value = true
  getKujialeAuthList({
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

getList()
// 解除授权
// const removeAuth = throttle(() => {
//   console.log('解除授权')
// }, 700)
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
</style>
