<template>
  <div class="content_page live_inspection">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="searchList"
      @reset="resetSearch"
    />
    <!-- 列表 -->
    <div class="table_box">
      <xm_table
        class="pic_table"
        tableType="live"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="220" label="直播信息">
          <template #default="scope">
            <div class="live_box">
              <div
                class="live_img_box"
                :style="scope.row.roomStatus == 1 ? 'cursor: pointer;' : ''"
                @click="toDetail(scope.row.roomStatus == 1, scope.row.roomUrl)"
              >
                <el-image v-if="scope.row.roomPhoto" :src="scope.row.roomPhoto" class="live_img">
                  <template #error>
                    <div class="live_img errImg_box"></div>
                  </template>
                </el-image>
                <img
                  class="live_img"
                  v-else
                  src="@/assets/images/content_center/default_cover.png"
                  alt=""
                />
                <liveAnimation v-if="scope.row.roomStatus == 1"></liveAnimation>
              </div>
              <div class="live_content">
                <div class="content1">
                  <!-- <el-tooltip effect="dark" placement="top-start" v-if="scope.row.roomTitle">
                    <template #content>
                      <div style="max-width: 300px">
                        {{ scope.row.roomTitle || '--' }}
                      </div>
                    </template> -->
                  <div
                    class="content_text row_overflow"
                    :style="scope.row.roomStatus == 1 ? '' : 'max-width:100%'"
                  >
                    {{ scope.row.roomTitle || '--' }}
                  </div>
                  <!-- </el-tooltip>
                  <div v-else class="content_text row_overflow">--</div> -->
                  <el-popover
                    v-if="scope.row.roomStatus == 1"
                    placement="bottom"
                    popper-class="qrcode_popper"
                    width="154px"
                    trigger="click"
                  >
                    <template #reference>
                      <img src="@/assets/images/content_center/qrcode.png" alt="" />
                    </template>
                    <div class="qrcode_box" v-if="scope.row.roomId">
                      <qrcode-vue
                        :value="localOrign + '/sumflyh5/activity?roomId=' + scope.row.roomId"
                        :size="126"
                        level="H"
                      />
                      <div class="qr_mark">
                        <img
                          src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                          alt=""
                        />
                        抖音扫码观看
                      </div>
                    </div>
                    <div v-else class="qrcode_box">
                      <div class="qr_mark">暂未找到相关地址</div>
                    </div>
                  </el-popover>
                </div>
                <div class="content2" v-if="scope.row.roomStatus == 2">直播已结束</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="170" label="开播时间">
          <template #default="scope">{{ scope.row.liveStartTime || '--' }}</template>
        </el-table-column>
        <el-table-column min-width="130" label="直播时长">
          <template #default="scope">
            <!-- {{ secondToDate((scope.x || 0) * 60) }} -->
            {{ scope.row.liveDurationTimeStr || '--' }}
          </template>
        </el-table-column>
        <el-table-column min-width="200" label="矩阵号昵称">
          <template #default="scope">
            <div class="user_box" @click="toUserDetail(scope.row.dyOpenId)">
              <img v-if="scope.row.avatar" :src="scope.row.avatar" class="user_head" alt="" />
              <img
                v-else
                src="@/assets/images/content_center/default_user.png"
                class="user_head"
                alt=""
              />
              <el-tooltip
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
                  alt=""
                />
              </el-tooltip>
              <div class="user_content">
                <div class="content1">
                  <div class="content_text">
                    {{ scope.row.nickName || '--' }}

                    <img
                      :src="
                        eaccountRoleICON.getCN(scope.row.eaccountRole) ||
                        '@/assets/images/content_center/change.png'
                      "
                      v-if="scope.row.eaccountRole"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column min-width="130" label="关联任务">
          <template #default="scope">        
            <div class="row_overflow" style="max-width: max-content">
              {{ scope.row.relatedTaskName || '--' }}
            </div>
          </template>
        </el-table-column> -->
        <el-table-column min-width="110" label="观看人次">
          <template #default="scope">{{ wanSliceFormat(scope.row.watchTimes || 0) }}</template>
        </el-table-column>
        <el-table-column width="140" label="质检状态">
          <template #default="scope">
            <div class="status_content" v-if="scope.row.isChecked == 0">
              <div class="status_circle"></div>
              <div>未质检</div>
            </div>
            <div v-else>
              <div class="status_content" v-if="scope.row.isPass == 1">
                <div class="status_circle green_circle"></div>
                <div>质检合格</div>
              </div>
              <div class="status_content" v-else-if="scope.row.isPass == 0">
                <div class="status_circle red_circle"></div>
                <div>质检不合格</div>
              </div>

              <div class="status_content" v-else>--</div>
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
            <el-link
              type="primary"
              v-if="scope.row.isChecked == 1"
              @click="showDetailModal(scope.row.checkId)"
            >
              详情
            </el-link>
            <el-button
              v-else
              class="inspection_btn"
              @click="showModal(scope.row)"
              type="primary"
              size="small"
              :disabled="scope.row.roomStatus == 2"
              plain
            >
              质检
            </el-button>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <inspectionDetail :detailModal="detailModal" v-if="detailModal.show"></inspectionDetail>

    <inspectionModal
      :inspectionModal="modal"
      @updateList="getList"
      v-if="modal.show"
    ></inspectionModal>
  </div>
</template>
<script>
import { eaccountRoleICON } from '@/utils/dictionary/content-center.js'
import liveAnimation from '../components/live_animation.vue'
import { getCheckDetail } from '@/api/content_center/inspection.js'
import inspectionDetail from '../components/inspection_detail.vue'
import inspectionModal from '../components/inspection_modal.vue'
import qrcodeVue from 'qrcode.vue'
import { pageList } from './model/get_list.js'
import { wanSliceFormat, secondToDate, throttle } from '@/utils/tools.js'
import { useRouter } from 'vue-router'
export default {
  components: {
    qrcodeVue,
    inspectionModal,
    inspectionDetail,
    liveAnimation
  },
  setup(props) {
    const vm = getCurrentInstance()
    const message = inject('$message')
    // const localOrign = 'https://test.tagvv.com'
    const localOrign = location.origin
    const modal = reactive({
      show: false,
      title: '直播质检',
      xcontentId: '',
      type: 'live'
    })
    const detailModal = reactive({
      show: false,
      title: '质检记录',
      data: null,
      type: 'live'
    })
    const { searchComponents, tableForm, getList } = pageList()

    // 打开质检弹窗
    function showModal(e) {
      modal.xcontentId = e.xcontentId
      modal.show = true
      vm.appContext.config.globalProperties.$tracking.clickBtn(107)
    }
    // 打开质检详情弹窗
    function showDetailModal(checkId) {
      getCheckDetail({
        checkId: checkId
      }).then(res => {
        if (res.code === 0 && res.data) {
          detailModal.data = res.data
          detailModal.show = true
        }
      })
    }
    // 重置
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
    const router = useRouter()
    const toUserDetail = throttle(function (openId) {
      router.push(`/content_center/content_matrix/details?openId=${openId}`)
    }, 500)
    // const toUserDetail = throttle(function (openId) {
    //   if (openId) {
    //     router.push({
    //       path: '/content_center/content_matrix/details',
    //       query: {
    //         openId: openId
    //       }
    //     })
    //   } else {
    //     message({
    //       type: 'warning',
    //       message: '暂未获取到账号相关信息'
    //     })
    //   }
    // }, 700)
    const toDetail = throttle(function (stu, roomUrl) {
      if (stu) {
        if (roomUrl) {
          window.open(roomUrl, '_blank')
        } else {
          message({
            type: 'warning',
            message: '暂未获取到直播相关信息'
          })
        }
      }
    }, 700)

    return {
      eaccountRoleICON,
      toDetail,
      toUserDetail,
      localOrign,
      wanSliceFormat,
      secondToDate,
      modal,
      detailModal,
      tableForm,
      getList,
      searchComponents,
      showModal,
      showDetailModal,
      resetSearch,
      searchList
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../components/css/qrcode.scss';
@import '../components/css/page.scss';
@import '../components/css/inspection.scss';
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
      width: calc(100% - 70px);
      min-height: 60px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .content1 {
        margin: 6px 0;
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
          max-width: calc(100% - 26px);
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

        font-weight: 400;
        color: #909399;
        line-height: 17px;
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
    position: relative;
    .user_head {
      width: 36px;
      height: 36px;
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
      width: calc(100% - 42px);
      min-height: 36px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        width: 100%;
        // display: flex;
        // flex-direction: row;
        // justify-content: flex-start;
        // align-items: center;
        font-size: 13px;

        font-weight: 500;
        color: #303133;
        line-height: 20px;
        .content_text {
          max-width: calc(100% - 0px);
          margin-bottom: 4px;
        }
        img {
          width: 16px;
          height: 16px;
          margin-left: 4px;
          vertical-align: text-top;
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
}
:deep(.el-button--primary.is-plain.is-disabled, .el-button--primary.is-plain.is-disabled:active, .el-button--primary.is-plain.is-disabled:focus, .el-button--primary.is-plain.is-disabled:hover) {
  color: #bfc4cd;
  background: rgba(191, 196, 205, 0.2);
}
</style>
