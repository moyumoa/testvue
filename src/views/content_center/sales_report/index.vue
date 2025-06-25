<template>
  <div class="sales_report">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    />
    <!-- 列表 -->
    <div class="table_box">
      <div class="table_top">
        <div class="mark">数据说明：统计直播销售额</div>
        <el-button type="primary" @click="exportFun">导出</el-button>
      </div>
      <xm_table
        tableType="avatar"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
        @sort-change="sortChange"
        :default-sort="{
          prop: 'roomSalesMoneyMonth',
          order: 'descending'
        }"
      >
        <el-table-column min-width="150" label="矩阵号昵称">
          <template #default="scope">
            <div class="user_box" @click="toUserDetail(scope.row.openId)">
              <img v-if="scope.row.avatar" :src="scope.row.avatar" class="user_head" alt="" />
              <img
                v-else
                src="@/assets/images/content_center/default_user.png"
                class="user_head"
                alt=""
              />
              <div class="user_content">
                <div class="content1">
                  <div class="content_text row_overflow">
                    {{ scope.row.nickname || '--' }}
                  </div>

                  <!-- <img
                      v-if="scope.row.platform == 1"
                      src="@/assets/images/content_center/dy.png"
                      alt=""
                    />
                    <img
                      v-if="scope.row.platform == 2"
                      src="@/assets/images/content_center/ks.png"
                      alt=""
                    />
                    <img
                      v-if="scope.row.platform == 3"
                      src="@/assets/images/content_center/sph.png"
                      alt=""
                    />
                    <img
                      src="@/assets/images/content_center/change.png"
                      v-if="scope.row.xuserType == 2"
                      alt=""
                    />
                    <img
                      src="@/assets/images/content_center/fs.png"
                      v-if="scope.row.xuserType == 3"
                      alt=""
                    /> -->
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          min-width="130"
          prop="roomSalesMoney"
          sortable="custom"
          label="日销售额(元)"
        >
          <template #default="scope">
            {{ wanSliceFormat(scope.row.roomSalesMoney || 0) }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="130"
          prop="roomSalesMoneyMonth"
          sortable="custom"
          label="月累计销售额(元)"
        >
          <template #default="scope">
            {{ wanSliceFormat(scope.row.roomSalesMoneyMonth || 0) }}
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { wanSliceFormat, throttle } from '@/utils/tools.js'
import { pageList } from './model/get_list.js'
import { useRouter } from 'vue-router'

const vm = getCurrentInstance()
const { searchComponents, getList, tableForm, exportFun, searchList, sortChange } = pageList(vm)
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
resetSearch()
const router = useRouter()
const toUserDetail = throttle(function (openId) {
  router.push(`/content_center/content_matrix/details?openId=${openId}`)
}, 500)
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';
.table_box {
  margin-top: $content_margin;
  border-radius: $content_radius;
  width: 100%;
  background: #fff;
  padding: 22px 24px;
  .table_top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    .mark {
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
  }
}
.user_box {
  cursor: pointer;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .user_head {
    width: 36px;
    height: 36px;
    border-radius: 100%;
    margin-right: 4px;
  }
  .user_content {
    width: calc(100% - 40px);
    min-height: 36px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    .content1 {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;

      font-weight: 500;
      color: #303133;
      line-height: 20px;
      .content_text {
        width: max-content;
        // max-width: calc(100% - 40px);
        max-width: 100%;
      }
      img {
        width: 16px;
        height: 16px;
        margin-left: 4px;
      }
    }
    .content2 {
      margin-top: 6px;
      font-size: 12px;

      font-weight: 400;
      color: #909399;
      line-height: 17px;
    }
  }
}
:deep(.el-date-editor .el-icon) {
  top: 9px !important;
}
</style>
