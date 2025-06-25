<template>
  <div class="store_management">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>
    <div class="table_box">
      <div class="btn_box">
        <el-link type="primary" class @click="toAuth">
          授权管理
          <img src="@/assets/images/content_center/right_blue.png" alt />
        </el-link>
      </div>
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="店铺名称">
          <template #default="scope">
            <!-- <el-tooltip effect="dark" placement="top-start" v-if="scope.row.shopName">
              <template #content>
                <div style="max-width: 300px">
                  {{ scope.row.shopName || '--' }}
                </div>
            </template>-->
            <div class="row_overflow" style="max-width: max-content">
              {{ scope.row.shopName || '--' }}
            </div>
            <!-- </el-tooltip>
            <div v-else>--</div>-->
          </template>
        </el-table-column>
        <el-table-column label="抖店id">
          <template #default="scope">{{ scope.row.shopId || '--' }}</template>
        </el-table-column>
        <el-table-column label="销售额(元)">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.shopOrderAmount / 100) || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="授权状态">
          <template #default="scope">
            <div class="status_content">
              <div :class="'status_circle ' + statusList.get(scope.row.shopAuth || 0).class"></div>
              <div>{{ statusList.get(scope.row.shopAuth || 0).label }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="授权时间">
          <template #default="scope">{{ scope.row.authTime || '--' }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { throttle, wanSliceFormat } from '@/utils/tools.js'
import { pageList } from './model/get_list.js'
import { useRouter } from 'vue-router'
const router = useRouter()
const { searchComponents, statusList, tableForm, getList } = pageList()
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
resetSearch()
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
// 是否在飞书客户端
const isFlyBook = ref(true)
const isWeChat = ref(true)
isFlyBook.value = localStorage.getItem('isFlyBook') === '1'
isWeChat.value = localStorage.getItem('isWeChat') === '1'
const isBrowser = localStorage.getItem('is_browser') === '1'

// 授权管理
const toAuth = throttle(() => {
  if (isBrowser) {
    router.push('/system_manage/tripartitlePlatform_auth?type=dy')
  } else {
    window.open(`${location.origin}/system_manage/tripartitlePlatform_auth?type=dy`)
  }
}, 300)
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';
.store_management {
  .table_box {
    margin: $content_margin 0;
    background: #fff;
    padding: 22px 24px 24px;
    border-radius: $content_radius;
    .btn_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 16px;
      :deep(.el-link--inner) {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        img {
          width: 14px;
          height: 14px;
          margin-left: 2px;
        }
      }
    }
  }
}
:deep(.cell) {
  line-height: 32px !important;
}
</style>
