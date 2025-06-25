<template>
  <div class="dy_wrapper">
    <xm_search class="">
      <div class="search_item">
        <label class="item_label">抖店名称</label>
        <div class="item_content">
          <el-select v-model="name" placeholder="请选择抖店名称" clearable style="width: 100%">
            <el-option
              v-for="item in nameList"
              :label="item.shopName"
              :value="item.shopName"
              :key="item.shopId"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <el-button type="primary" @click="_getList">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </xm_search>
    <div class="g_bg mt_16">
      <div class="g_bw">
        <el-button type="primary" @click="addAuth">新增抖店授权</el-button>
        <el-link type="primary" v-copy="authUrl" style="margin-left: 20px" :underline="false">
          复制授权链接
        </el-link>
      </div>
      <xm_table v-loading="loading" :data="listData" v-model:page="page" @getTableData="getList">
        <el-table-column label="抖音小店昵称" prop="shopName" />
        <el-table-column label="小店shop_id" prop="shopId" />
        <el-table-column label="抖店授权时间" prop="authTime" />
        <el-table-column label="百应授权">
          <template #default="{ row }">
            <span :class="{ g_blue: row.buyinAuthStatus === 2, g_red: row.buyinAuthStatus === 3 }">
              {{ convertStatus(row.buyinAuthStatus) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250px" align="right" fixed="right">
          <template #default="{ row }">
            <el-popconfirm title="确定解除该抖店授权吗?" @confirm="removeAuth(row.shopId)">
              <template #reference>
                <el-link type="primary">
                  <span class="g_red">解除抖店授权</span>
                </el-link>
              </template>
            </el-popconfirm>
            <el-link
              v-if="row.buyinAuthStatus < 2"
              type="primary"
              class="ml_16"
              @click="byShowCode(row.shopId)"
            >
              授权百应
            </el-link>
            <el-link
              v-if="row.buyinAuthStatus === 3"
              type="primary"
              class="ml_16"
              @click="byShowCode(row.shopId)"
            >
              重新授权百应
            </el-link>
            <el-popconfirm
              v-if="row.buyinAuthStatus === 2"
              title="确定解除该百应授权吗?"
              @confirm="removeByAuth(row.shopId)"
            >
              <template #reference>
                <el-link type="danger" class="ml_16">解除百应授权</el-link>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <confirm-dialog v-model:visible="visible" tip="确认是否已授权?" @confirm="refresh" />

    <el-dialog
      destroy-on-close
      :before-close="onClose"
      v-model="byCodeVisible"
      custom-class="hide_footer_line hide_header_line"
      title="授权码"
      width="344px"
    >
      <div class="invite_code">
        <div class="code">
          <p style="margin-bottom: 8px">请使用抖音扫码加入</p>
          <div
            class="code_loading"
            style="width: 140px; height: 140px; margin: 0 auto"
            v-loading="showAuthReqLoading"
            element-loading-background="rgba(0,0,0,0.05)"
          >
            <div
              v-if="byCode"
              class="code_img"
              v-loading="scan"
              element-loading-text="账号验证中"
              custom-class="loading_box"
            >
              <img v-if="byCode" :src="byCode" alt="" />
              <div v-if="(count === 0 || authErr) && !scan" class="mask flex_center">
                <img src="../../../assets/images/auth/refresh.png" alt="" @click="refreshCode" />
              </div>
              <div v-if="scan" class="mask">
                <div class="success flex_center">
                  <i class="iconfont icon-wancheng wc_icon"></i>
                  <p>扫码成功</p>
                </div>
              </div>
            </div>
          </div>
          <p class="text" style="margin-bottom: 0" v-if="!scan && byCode">
            <template v-if="authErr">
              <div>授权失败，点击重新加载</div>
              <div style="color: red; margin-top: 10px" v-if="authErrReason">
                {{ authErrReason || '' }}
              </div>
            </template>
            <template v-else>
              <template v-if="count > 0">
                <span style="color: #364fcd">{{ count }}S</span>
                后失效
              </template>
              <template v-else>已失效，点击重新加载</template>
            </template>
          </p>
        </div>
      </div>
      <template #footer></template>
    </el-dialog>
  </div>
</template>

<script setup>
import vCopy from '@/directive/copy'
import {
  getShopAuth,
  getAllShopAuth,
  shopAuthLink,
  cancelShopAuth,
  dyShopAuthFresh,
  cancelDyShopAuth,
  dyShopAuthLink
} from '@/api/system_setting/authorization'
import ConfirmDialog from './components/confirm_dialog.vue'

import { debounce } from '@/utils/tools.js'
const $message = inject('$message')
const visible = ref(false)
const name = ref('')
const nameList = ref([])
const authUrl = ref('')
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

const getAuthLink = () => {
  shopAuthLink({}).then(res => {
    authUrl.value = res.data
  })
}
getAuthLink()
const addAuth = () => {
  window.open(authUrl.value)
  visible.value = true
}
const removeAuth = shopId => {
  cancelShopAuth({
    shopId
  }).then(res => {
    if (res.data === true) {
      $message.success('取消成功')
      getList()
    }
  })
}
// 百应-取消授权
const removeByAuth = shopId => {
  cancelDyShopAuth({
    shopId
  }).then(res => {
    if (res.data === true) {
      $message.success('取消成功')
      getList()
    }
  })
}
// 查询
function _getList() {
  page.value.index = 1
  getList()
}
const getList = () => {
  loading.value = true
  getShopAuth({
    pageNumber: page.value.index,
    pageSize: page.value.size,
    authName: name.value
  }).then(res => {
    listData.value = res.data.records
    page.value.total = res.data.total
    loading.value = false
  })
}
const getAllShop = () => {
  getAllShopAuth().then(res => {
    nameList.value = res.data
  })
}
const reset = () => {
  name.value = ''
  page.value.index = 1
  getList()
}
const refresh = () => {
  getList()
  getAllShop()
}
//  邀请码相关数据
const codeInfo = reactive({
  byCodeVisible: false,
  byCode: null
})
const { byCodeVisible, byCode } = toRefs(codeInfo)
const timer = ref(null)
const count = ref(180)
const operationId = ref(0)
const scan = ref(false)
const authErr = ref(false)
const authErrReason = ref('')
// 授权状态转换
const convertStatus = status => {
  if (status === 1) {
    return '未授权'
  } else if (status === 2) {
    return '已授权'
  } else if (status === 3) {
    return '授权失效'
  } else {
    return '未授权'
  }
}

// 百应-授权定时器
const setTimer = token => {
  timer.value = setInterval(() => {
    if (count.value === 0) {
      scan.value = false
      clearTimer()
    } else {
      count.value--
      dyShopAuthFresh({ token }).then(res => {
        // 0 初始化 1 扫码成功 2 授权成功 3授权失败
        if (res.data === '2') {
          $message.success('授权成功')
          clearTimer()
          byCodeVisible.value = false
          getList()
        }
        if (res.data === '1') {
          scan.value = true
        }
        if (res.data === '3') {
          clearTimer()
          scan.value = false
          authErrReason.value = res.msg || ''
          // byCodeVisible.value = false
          count.value = 180
          authErr.value = true
        }
        // if (res.data === '4') {
        //   $message.error('授权账号未开通百应权限，请开通后重新授权')
        //   clearTimer()
        //   byCodeVisible.value = false
        // }
      })
    }
  }, 1000)
}
const clearTimer = () => {
  clearInterval(timer.value)
  timer.value = null
}
// 百应请求接口的Loading
const showAuthReqLoading = ref(false)

// 百应-授权
const byShowCode = debounce(id => {
  showAuthReqLoading.value = true
  operationId.value = id
  authErr.value = false
  authErrReason.value = ''
  clearTimer()
  byCode.value = ''
  scan.value = false
  byCodeVisible.value = true
  dyShopAuthLink({
    shopId: operationId.value
  })
    .then(res => {
      if (res.code === 0) {
        const data = res.data
        byCode.value = 'data:image/jpeg;base64,' + data.qrCode

        count.value = 180
        setTimer(data.token)
      } else {
        byCodeVisible.value = false
      }
      showAuthReqLoading.value = false
    })
    .catch(() => {
      byCodeVisible.value = false
      showAuthReqLoading.value = false
    })
}, 700)

// 百应-重新授权
const refreshCode = debounce(() => {
  byCode.value = ''
  scan.value = false
  showAuthReqLoading.value = true
  clearTimer()
  dyShopAuthLink({
    shopId: operationId.value
  })
    .then(res => {
      if (res.code === 0) {
        const data = res.data
        byCode.value = 'data:image/jpeg;base64,' + data.qrCode

        count.value = 180
        setTimer(data.token)
        authErr.value = false
        authErrReason.value = ''
      } else {
        byCodeVisible.value = false
      }
      showAuthReqLoading.value = false
    })
    .catch(() => {
      byCodeVisible.value = false
      showAuthReqLoading.value = false
      authErr.value = false
      authErrReason.value = ''
    })
}, 700)
// 百应弹窗关闭
const onClose = () => {
  clearTimer()
  count.value = 180
  byCodeVisible.value = false
}
onMounted(() => {
  getList()
  getAllShop()
})
onBeforeUnmount(clearTimer)
</script>
<style lang="scss" scoped>
.invite_code {
  .code {
    text-align: center;
    .code_img {
      position: relative;
      margin: 0 auto;
      width: 140px;
      height: 140px;
      > img {
        width: 100%;
      }
      .mask {
        width: 100%;
        height: 100%;
        background-color: rgba($color: #fff, $alpha: 0.9);
        position: absolute;
        left: 0;
        top: 0;
        > img {
          width: 36px;
          height: 36px;
          cursor: pointer;
        }
        > .success {
          height: 100%;
          flex-direction: column;
          color: #7fe2a1;
          > .wc_icon {
            margin-bottom: 8px;
            font-size: 36px;
          }
        }
      }
    }
    .text {
      color: #909399;
      font-size: 14px;
      margin: 10px 0 22px 0;
    }
  }
}
// :deep(.code_img .el-loading-spinner .el-loading-text) {
//   font-size: 12px;
// }
</style>
