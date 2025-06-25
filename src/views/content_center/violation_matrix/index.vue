<template>
  <div class="matrix_page">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    />
    <!-- 表格 -->
    <div class="table_box">
      <div class="xm_promptAboveTheTable">默认展示近30天违规矩阵号列表</div>
      <!-- class="pic_table" -->
      <xm_table
        tableType="avatar"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
        @sort-change="sortChange"
        :default-sort="{
          prop: 'violationNum',
          order: 'descending'
        }"
      >
        <el-table-column min-width="150" label="矩阵号信息">
          <template #default="scope">
            <!-- <router-link :to="toUserDetail(scope.row.dyOpenId || '11')"> -->
            <div class="user_box">
              <img v-if="scope.row.dyHeadUrl" :src="scope.row.dyHeadUrl" class="user_head" alt />
              <img
                v-else
                src="@/assets/images/content_center/default_user.png"
                class="user_head"
                alt
              />
              <!-- <el-tooltip
                  effect="dark"
                  v-if="
                    scope.row.openIdAuthStatusVo.dyAuth == 2 ||
                    scope.row.openIdAuthStatusVo.byAuth == 2
                  "
                  placement="top-start"
                >
                  <template #content>
                    <div style="max-width: 300px">
                      {{ scope.row.openIdAuthStatusVo.byAuth == 2 ? '百应授权失效' : '' }}
                      {{
                        scope.row.openIdAuthStatusVo.byAuth == 2 &&
                        scope.row.openIdAuthStatusVo.dyAuth == 2
                          ? ','
                          : ''
                      }}
                      {{ scope.row.openIdAuthStatusVo.dyAuth == 2 ? '抖音授权失效' : '' }}
                    </div>
                  </template>
                  <img
                    class="expired_img"
                    src="@/assets/images/content_center/warning_icon.png"
                    alt
                  />
                </el-tooltip>-->
              <div class="user_content">
                <div class="content1">
                  <div class="content_text">
                    {{ scope.row.matrixNickname || '--' }}
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
                        alt
                      />
                      <img
                        src="@/assets/images/content_center/fs.png"
                        v-if="scope.row.xuserType == 3"
                        alt
                      />-->
                  </div>
                </div>
                <div class="content2">抖音号：{{ scope.row.dyDisplayId || '--' }}</div>
              </div>
            </div>
            <!-- </router-link> -->
          </template>
        </el-table-column>

        <el-table-column sortable="custom" prop="violationNum" label="违规次数">
          <template #default="scope">{{ wanSliceFormat(scope.row.violationNum || 0) }}</template>
        </el-table-column>
        <el-table-column sortable="custom" prop="violationCount" label="累计违规次数">
          <template #default="scope">{{ wanSliceFormat(scope.row.violationCount || 0) }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" header-align="center">
          <template #default="scope">
            <!-- <NavLink :active="isActive" :href="href" @click="navigate">
                {{ route.fullPath }}
              </NavLink> -->
            <el-link type="primary" @click="upRule(scope.row)">详情</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { getQuery } from '@/utils/get_query.js'
import { pageList } from './model/get_list.js'
import { wanSliceFormat, throttle } from '@/utils/tools.js'
import { useRouter } from 'vue-router'
const { searchComponents, tableForm, getList } = pageList()

// 重置
function resetSearch() {
  tableForm.orderItem = 'violationNum'
  tableForm.orderBy = 2
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
resetSearch()
// 查询
function searchList() {
  tableForm.page.index = 1
  getList()
}
// 跳转详情页
const emits = defineEmits(['upRule'])
// 更新数据
const upRule = throttle(function (e) {
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  const recordInfo = {
    name: e.xuserId,
    // dyh: '抖音号',
    startTime: data.startTime,
    endTime: data.endTime
  }
  emits('upRule', recordInfo)
  toDetail(e)
}, 500)
const router = useRouter()
const toDetail = e => {
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  router.push({
    path: '/content_center/live_monitor',
    query: {
      type: 'violationRecord',
      name: window.encodeURIComponent(e.xuserId),
      // dyh: window.encodeURIComponent('4545154515121'),
      startTime: window.encodeURIComponent(data.startTime),
      endTime: window.encodeURIComponent(data.endTime)
    }
  })
}
// const toUserDetail = openId => {
//   return `/content_center/content_matrix/details?openId=${openId}`
// }
// 排序
function sortChange(column, prop, order) {
  if (column.prop === 'violationCount') {
    if (column.order === 'ascending') {
      tableForm.orderItem = 'violationCount'
      tableForm.orderBy = 1
    } else if (column.order === 'descending') {
      tableForm.orderItem = 'violationCount'
      tableForm.orderBy = 2
    }
  } else if (column.prop === 'violationNum') {
    if (column.order === 'ascending') {
      tableForm.orderItem = 'violationNum'
      tableForm.orderBy = 1
    } else if (column.order === 'descending') {
      tableForm.orderItem = 'violationNum'
      tableForm.orderBy = 2
    }
  } else {
    tableForm.orderItem = 'violationNum'
    tableForm.orderBy = 2
  }
  searchList()
}
</script>
<style lang="scss" scoped>
.table_box {
  border-radius: 4px;
  margin-top: 16px;
  padding: 22px 24px 24px;
  background: #fff;
  .user_box {
    // cursor: pointer;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    .user_head {
      width: 40px;
      height: 40px;
      border-radius: 100%;
      margin-right: 6px;
    }
    .expired_img {
      width: 14px;
      height: 14px;
      position: absolute;
      left: 22px;
      top: 0px;
    }
    .user_content {
      width: calc(100% - 56px);
      min-height: 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      padding: 5px 0 2px;
      .content1 {
        width: 100%;
        font-size: 14px;

        font-weight: 500;
        color: #303133;
        line-height: 20px;
        .content_text {
          width: max-content;
          max-width: 100%;
          // max-width: calc(100% - 40px);
        }
        img {
          width: 16px;
          height: 16px;
          margin-left: 4px;
          vertical-align: text-top;
        }
      }
      .content2 {
        font-size: 12px;

        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
}
// :deep(.el-table__fixed-right-patch) {
//   width: 0 !important;
// }
// :deep(.search_item:first-child) {
//   flex-basis: 450px;
// }
// :deep(.el-select__tags > span) {
//   width: 70%;
// }
// :deep(.el-select__tags .el-tag) {
//   max-width: 50%;
// }
// :deep(.el-select__tags .el-tag__content) {
//   width: 100%;
// }

// :deep(.el-select__tags .el-select__tags-text) {
//   max-width: 50% !important;
// }

// :deep(.el-input__inner) {
//   height: 32px !important;
// }
// :deep(.el-select__input) {
//   max-width: 40% !important;
// }
// :deep(.el-select__tags) {
//   display: flex;
//   flex-direction: row;
//   justify-content: flex-start;
//   align-items: center;
// }
</style>
