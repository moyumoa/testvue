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
        tableType="live"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getTaskLiveInfo"
      >
        <el-table-column prop="amount1" label="直播" min-width="150">
          <template #default="scope">
            <div class="live_box">
              <div class="live_img_box">
                <img v-if="scope.row.liveCoverUrl" :src="scope.row.liveCoverUrl" class="live_img" />
                <img
                  class="live_img"
                  v-else
                  src="@/assets/images/content_center/default_cover.png"
                  alt
                />
                <div class="living" v-if="scope.row.liveStatus === 1">
                  <div class="living_animation">
                    <p></p>
                    <p></p>
                    <p></p>
                  </div>
                  直播中
                </div>
              </div>
              <div class="live_content">
                <div class="content1">
                  <div class="shadow">{{ scope.row.liveMountTitle }}</div>
                </div>
                <div class="content2">{{ scope.row.liveStatus === 0 ? '直播结束' : '直播中' }}</div>
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
            ></table_column_department_info>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="矩阵号" min-width="120">
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
        </el-table-column>

        <el-table-column prop="videoTime" label="开播时间" min-width="100">
          <template v-slot="{ row }">
            <div>
              <p>{{ row.duration ? secondToDate(row.duration / 1000) : '--' }}</p>
              <p v-if="row.liveStatus === 1">{{ row.startTime ? row.startTime : '--' }}</p>
              <p v-if="row.liveStatus === 0">
                {{ row.startTime ? row.startTime : '--' }} -- {{ row.endTime ? row.endTime : '--' }}
              </p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="观看人次" min-width="100" header-align="center" align="center">
          <template v-slot="{ row }">
            <p>{{ row.viewNum }}</p>
          </template>
        </el-table-column>
      </xm_table>
      <el-dialog v-model="dialogTableVisible" title="更新记录" width="60%">
        <el-table :data="updateList" stripe style="width: 100%">
          <el-table-column prop="gmtUpdate" label="更新次数">
            <template #header>
              <div class="table_head" style="display: inline-block">
                更新时间
                <el-tooltip effect="dark" placement="top">
                  <template #content>
                    数据每6小时更新一次，任务金币不再发放后，记录停止更新
                  </template>
                  <img
                    style="width: 14px; height: 14px; vertical-align: -10%"
                    src="@/assets/images/operate/tip_gray.png"
                    alt
                  />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="playCount" label="视频播放数">
            <template v-slot="{ row }">
              <div>{{ wanSliceFormat(row.playCount) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="diggCount" label="视频点赞数">
            <template v-slot="{ row }">
              <div>{{ wanSliceFormat(row.diggCount) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="commentCount" label="视频评论数">
            <template v-slot="{ row }">
              <div>{{ wanSliceFormat(row.commentCount) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="shareCount" label="视频分享数">
            <template v-slot="{ row }">
              <div>{{ wanSliceFormat(row.shareCount) }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { videoList } from '../data'
import { wanSliceFormat, secondToDate } from '@/utils/tools.js'

const {
  tableForm,
  dialogTableVisible,
  updateList,
  searchComponents,

  getTaskLiveInfo
} = videoList('lives')
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getTaskLiveInfo()
}
resetSearch()
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getTaskLiveInfo()
}
</script>

<style lang="scss" scoped>
@import '../../css/live_animation.scss';
.live_box {
  width: 100%;
}
@import '../../css/live_animation.scss';
.live_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .live_img_box {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    margin-right: 10px;
    position: relative;
  }
  .live_img {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
  }
  .live_content {
    max-width: calc(100% - 70px);
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    .content1 {
      max-width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;

      font-weight: 600;
      color: #303133;
      line-height: 20px;
      .shadow {
        display: -webkit-box;
        display: -moz-box;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
      }
      .content_text {
        width: calc(100% - 26px);
      }
      img {
        width: 18px;
        height: 18px;
        margin-left: 8px;
        cursor: pointer;
      }
    }
    .content2 {
      margin-top: 8px;
      font-size: 12px;

      font-weight: 400;
      color: #909399;
      line-height: 17px;
    }
  }
}
</style>
