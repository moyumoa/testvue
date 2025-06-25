<template>
  <div class="content_page live_inspection">
    <!-- 筛选条件 -->
    <xm_search :searchComponents="searchComponents" @getData="querySearch" @reset="resetSearch">
      <template #searchBtn>
        <!-- <el-button @click="exportFiles">导出</el-button>-->
        <exp_button :asyncFunc="exportFiles">导出</exp_button>
      </template>
    </xm_search>
    <!-- 列表 -->
    <div class="table_box">
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="线索昵称" prop="userNickname" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.userNickname || '--' }}
          </template>
        </el-table-column>
        <!-- 线索手机 -->
        <el-table-column min-width="150" label="线索手机">
          <template #default="scope">
            <table_column_phone :phone="scope.row.mobile"></table_column_phone>
          </template>
        </el-table-column>
        <!-- 线索地址 -->
        <el-table-column min-width="150" label="线索地址">
          <template #default="scope">
            <el-tooltip effect="dark" placement="top-start">
              <template #content>
                <div style="max-width: 300px">{{ scope.row.position || '--' }}</div>
              </template>
              <div class="row_overflow" style="max-width: max-content">
                {{ scope.row.position || '--' }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <!-- 来源载体 -->
        <el-table-column min-width="90" label="来源载体">
          <template #default="scope">
            <div class="row_overflow" style="max-width: max-content">
              {{ scope.row.source === 1 ? '视频' : scope.row.source === 2 ? '直播' : '--' }}
            </div>
          </template>
        </el-table-column>
        <!-- 来源活动 -->
        <el-table-column min-width="150" label="来源活动">
          <template #default="scope">
            <el-tooltip effect="dark" placement="top-start">
              <template #content>
                <div style="max-width: 300px" class="row_overflow">
                  {{ scope.row.activityTitle || '--' }}
                </div>
              </template>
              <div style="max-width: max-content" class="row_overflow">
                {{ scope.row.activityTitle || '--' }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <!-- 关联员工 -->
        <el-table-column min-width="280" label="关联员工">
          <template #default="scope">
            <div>
              <div class="member_info" v-if="scope.row.staffName || scope.row.xuserName">
                <el-image class="avatar_icon" :src="scope.row.staffHeadUrl" alt>
                  <template #error>
                    <div class="avatar_icon errImg_box"></div>
                  </template>
                </el-image>
                <div class="name_mobile">
                  <div class="flex_box" style="flex-wrap: wrap">
                    <div class="name">
                      {{ scope.row.staffName || '--' }}
                      <span
                        class="xm_depart"
                        style="display: inline-block"
                        v-if="scope.row.staffStatus && scope.row.staffStatus == 2"
                      ></span>
                    </div>
                    <div class="phone_box">
                      <template v-if="scope.row.staffPhone">
                        (
                        <table_column_phone
                          size="small"
                          :phone="scope.row.staffPhone"
                        ></table_column_phone>
                        )
                      </template>
                    </div>
                  </div>
                  <div class="flex_box">
                    <div class="name">{{ scope.row.xuserName || '--' }}</div>
                    <div class="phone_box" v-if="scope.row.dyDisPlayId">
                      ({{ scope.row.dyDisPlayId || '--' }})
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>--</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="150" label="关联企业号">
          <template #default="scope">
            <el-tooltip effect="dark" placement="top-start" v-if="scope.row.cgpXUserName">
              <template #content>
                <div style="max-width: 300px">
                  {{ scope.row.cgpXUserName || '--' }}
                </div>
              </template>
              <div style="max-width: max-content" class="row_overflow">
                {{ scope.row.cgpXUserName || '--' }}
              </div>
            </el-tooltip>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column min-width="150" label="关联任务">
          <template #default="scope">
            <el-tooltip effect="dark" placement="top-start">
              <template #content>
                <div style="max-width: 300px">
                  {{ scope.row.taskName || '--' }}
                </div>
              </template>
              <div style="max-width: max-content" class="row_overflow">
                {{ scope.row.taskName || '--' }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <!-- 留资时间 -->
        <el-table-column width="170" label="留资时间">
          <template #default="scope">
            <div class="row_overflow" style="max-width: max-content">
              {{ scope.row.orderCreateTime || '--' }}
            </div>
          </template>
        </el-table-column>
        <!-- 查看详情 -->
        <el-table-column label="操作" width="120" align="center" header-align="center">
          <template #default="scope">
            <el-link type="primary" @click="showDetail(scope.row)">详情</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script>
import { pageList } from './model/get_list.js'
import { useRouter } from 'vue-router'
import { throttle } from '@/utils/tools.js'
export default {
  setup(props) {
    const { searchComponents, tableForm, getList, exportFiles } = pageList()
    const router = useRouter()
    // 进入线索详情
    const showDetail = throttle(row => {
      const id = row.id
      router.push({
        path: '/content_market/clues_management/detail',
        query: {
          id
        }
      })
    }, 300)
    // // 显示隐藏手机号
    // function showPhoneFun(e, i) {
    //   tableForm.listData[i].showPhone = !tableForm.listData[i].showPhone
    // }
    // 查询的回调
    const querySearch = throttle(function () {
      tableForm.page.index = 1
      getList()
    }, 500)
    // 重置的回调
    const resetSearch = throttle(function () {
      tableForm.page = {
        index: 1,
        size: 10,
        total: 0
      }
      getList()
    }, 500)
    resetSearch()
    return {
      tableForm,
      getList,
      searchComponents,
      showDetail,
      resetSearch,
      exportFiles,
      querySearch
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../css/qrcode.scss';
@import '../css/page.scss';
@import '../css/inspection.scss';
@import '@/styles/layout.scss';
.live_inspection {
  .table_box {
    margin: $content_margin 0;
    background: #fff;
    padding: 24px;
    border-radius: $content_radius;
  }
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
      min-height: 60px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .content1 {
        margin: 6px 0;
        max-width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 600;
        color: #303133;
        line-height: 20px;
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
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
  .user_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .user_head {
      width: 48px;
      height: 48px;
      border-radius: 100%;
      margin-right: 10px;
    }
    .user_content {
      max-width: calc(100% - 58px);
      min-height: 48px;
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
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 600;
        color: #303133;
        line-height: 20px;
        .content_text {
          width: calc(100% - 22px);
        }
        img {
          width: 16px;
          height: 16px;
          margin-left: 6px;
        }
      }
      .content2 {
        margin-top: 6px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
}
.flex_box {
  display: flex;
  align-items: center;
  width: 100%;
}
.member_info {
  display: flex;
  align-items: center;
  .avatar_icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  .name_mobile {
    margin-left: 16px;
    width: calc(100% - 56px);
    .mobile {
      font-size: 12px;
      color: #909399;
      line-height: 17px;
    }
    .phone_box {
      margin-left: 6px;
      min-width: 120px;
      font-size: 12px;
      flex: 1;
      color: #909399;
      line-height: 20px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      span {
        color: #909399 !important;
      }
      .eye_icon {
        width: 12px;
        height: 12px;
        margin-left: 5px;
        cursor: pointer;
        img {
          width: 100%;
          height: 100%;
          display: flex;
        }
      }
    }
  }
}
:deep(.phone span) {
  // color: #909399 !important;
}
</style>
