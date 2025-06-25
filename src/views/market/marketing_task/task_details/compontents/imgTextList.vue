<template>
  <div>
    <!-- search -->
    <section class="search">
      <xm_search
        :searchComponents="searchComponents"
        @getData="searchList"
        :useOwnReset="true"
        @reset="resetSearch"
      ></xm_search>
    </section>

    <!-- content -->
    <div class="page_main mt_16">
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getTaskVideoInfo"
        tableType="video"
      >
        <el-table-column prop="amount1" label="视频" min-width="100">
          <template v-slot="{ row }">
            <div style="width: 60px; height: 80px; position: relative">
              <!-- 拿到视频能播放 -->
              <div v-if="row.videoCoverUrl" style="width: 60px; position: relative">
                <img
                  :src="row.videoCoverUrl"
                  style="width: 60px; height: 80px; object-fit: cover"
                  alt
                />
                <imgTextTask_ICON :info="row" />
              </div>
              <div v-else>
                <img
                  src="@/assets/images/operate/delete.png"
                  style="width: 60px; height: 60px"
                  alt
                />
              </div>
              <div class="platform_img">
                <div :class="[`xm_platformIcon_${row.platform}`]"></div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成员信息" min-width="180">
          <template v-slot="{ row }">
            <table_column_matrix_account
              :info="row"
              showPhone
              :showDyNum="false"
              name="name"
              :showLeaving="row.staffStatus && row.staffStatus == 2"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="部门" min-width="150">
          <template v-slot="{ row }">
            <table_column_department_info
              :departmentName="row.orgInfo"
              v-if="row.orgInfo"
              connectStr="/"
              divisionStr=";"
              trigger="hover"
              className="dept_flex"
            ></table_column_department_info>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- <el-table-column prop="amount2" label="矩阵号" min-width="120">
          <template v-slot="{ row }">
            <div>
              <p>
                {{ row.dyName ? row.dyName : '--' }}
                <img
                  v-if="row.accountType === 'LarkStaff'"
                  style="width: 16px; height: 16px; vertical-align: -10%"
                  src="@/assets/images/operate/fs.png"
                  alt
                />
                <img
                  v-else-if="
                    row.accountType !== 'LarkStaff' &&
                    row.accountType !== null &&
                    row.accountType.length !== 0
                  "
                  style="width: 16px; height: 16px; vertical-align: -10%"
                  src="@/assets/images/operate/change.png"
                  alt
                />
              </p>
              <p>{{ row.douYinAccount ? row.douYinAccount : '--' }}</p>
            </div>
          </template>
        </el-table-column> -->

        <el-table-column prop="videoTime" label="发布时间" min-width="100" />
        <el-table-column label="操作" min-width="100" header-align="right" align="right">
          <template v-slot="{ row }">
            <el-link type="primary" @click="handleEdit(row, true)">更新记录</el-link>
          </template>
        </el-table-column>
      </xm_table>
      <!-- 更新记录 -->
      <el-dialog v-model="dialogTableVisible" title="更新记录" width="60%">
        <!-- <el-table :data="updateList" stripe style="width: 100%"> -->
        <xm_table
          class="pic_table"
          v-loading="tableForm.loading"
          :data="updateForm.updateList"
          v-model:page="updateForm.page"
          @getTableData="getUpdateList"
          style="width: 100%"
        >
          <el-table-column prop="gmtUpdate" label="更新次数">
            <template #header>
              <div class="table_head" style="display: inline-block">
                更新时间
                <el-tooltip effect="dark" placement="top">
                  <template #content>视频每日0点、12点、20点更新</template>
                  <img
                    style="width: 14px; height: 14px; vertical-align: -10%"
                    src="@/assets/images/operate/tip_gray.png"
                    alt
                  />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="plays" label="视频播放数">
            <template v-slot="{ row }">
              <div>{{ wanSliceFormat(row.playCount) || 0 }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="likes" label="视频点赞数">
            <template v-slot="{ row }">
              <div>{{ wanSliceFormat(row.diggCount) || 0 }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="commits" label="视频评论数">
            <template v-slot="{ row }">
              <div>{{ wanSliceFormat(row.commentCount) || 0 }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="share" label="视频分享数">
            <template v-slot="{ row }">
              <div>{{ wanSliceFormat(row.shareCount) || 0 }}</div>
            </template>
          </el-table-column>
        </xm_table>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { videoList } from '../data'
import { wanSliceFormat } from '@/utils/tools.js'

const {
  tableForm,
  dialogTableVisible,
  updateForm,
  searchComponents,
  getTaskVideoInfo,

  handleEdit,
  getUpdateList
} = videoList('imgText')
// getTaskVideoInfo(searchVideo)
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getTaskVideoInfo()
}
resetSearch()
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getTaskVideoInfo()
}
</script>

<style lang="scss" scoped>
.platform_img {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 18px;
  height: 18px;
  div {
    width: 18px;
    height: 18px;
  }
}
</style>
