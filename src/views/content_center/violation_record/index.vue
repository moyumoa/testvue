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
      <div class="xm_promptAboveTheTable">默认展示近30天违规记录列表</div>
      <!-- class="pic_table" -->
      <xm_table
        tableType="live"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="250" label="直播信息">
          <template #default="scope">
            <div class="live_box">
              <img
                v-if="scope.row.roomPhoto"
                class="live_cover"
                :src="scope.row.roomPhoto"
                alt=""
              />
              <img
                v-else
                src="@/assets/images/content_center/default_cover.png"
                class="live_cover"
                alt
              />
              <div class="live_content line-hidden2">{{ scope.row.roomTitle || '--' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="250" label="矩阵号信息">
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
                  <div class="content_text line-hidden1">
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

        <el-table-column min-width="150" label="违规原因">
          <template #default="scope">
            <div>{{ scope.row.violationReason || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column min-width="300" label="违规描述">
          <template #default="scope">
            <div>
              {{ scope.row.violationDesc || '--' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="250" label="处罚结果">
          <template #default="scope">
            <div>{{ scope.row.failedReason || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column min-width="250" label="整改建议">
          <template #default="scope">
            <div>{{ scope.row.suggestion || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column width="170" label="违规时间">
          <template #default="scope">
            {{ scope.row.penalizeTime || '--' }}
          </template>
        </el-table-column>
        <el-table-column min-width="120" label="累计违规次数">
          <template #default="scope">{{ wanSliceFormat(scope.row.violationCount || 0) }}</template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="120"
          align="center"
          header-align="center"
        >
          <template #default="scope">
            <a
              :href="scope.row.ruleExplainUrl"
              target="_blank"
              style="color: var(--el-color-primary)"
            >
              规则解读
            </a>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { pageList } from './model/get_list.js'
import { wanSliceFormat } from '@/utils/tools.js'
// import { useRoute } from 'vue-router'
const { searchComponents, tableForm, getList } = pageList()

const props = defineProps({
  recordInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
// 查询
function searchList() {
  tableForm.page.index = 1
  getList()
}

onMounted(() => {
  console.log('record-mounted', props.recordInfo)
  if (props.recordInfo.name) {
    searchComponents.value[0].val = [props.recordInfo.name]
    let startTime = props.recordInfo.startTime || ''
    let endTime = props.recordInfo.endTime || ''
    if (startTime) {
      startTime = new Date(startTime.replace(/-/g, '/'))
    }
    if (endTime) {
      endTime = new Date(endTime.replace(/-/g, '/'))
    }
    if (startTime && endTime) {
      searchComponents.value[2].val = startTime && endTime ? [startTime, endTime] : ''
    }
  }
  resetSearch()
})
// const toUserDetail = openId => {
//   return `/content_center/content_matrix/details?openId=${openId}`
// }
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.table_box {
  border-radius: 4px;
  margin-top: 16px;
  padding: 22px 24px 24px;
  background: #fff;

  .live_box {
    height: 48px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .live_cover {
      width: 48px;
      height: 48px;
      border-radius: 100%;
      margin-right: 8px;
      object-fit: cover;
    }
    .live_content {
      width: calc(100% - 56px);
    }
  }
  .user_box {
    // cursor: pointer;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    .user_head {
      width: 48px;
      height: 48px;
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
// :deep(.el-table:not(.el-table--scrollable-x) .el-table__fixed-right) {
//   height: 100% !important;
// }
// :deep(.xm_table_box .is-hidden) {
//   height: 89px;
//   padding: 0 !important;
// }
</style>
