<template>
  <div class="content_page video_inspection">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    />
    <!-- 列表 -->
    <div class="table_box">
      <el-tabs class="tab_box" v-model="chooseTab" @tab-click="resetSearch">
        <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.name">
          <template #label>
            <div class="tab_label">
              {{ tab.label }}
              <img
                v-if="chooseTab == tab.name"
                src="@/assets/images/content_center/tab_sort.png"
                alt
              />
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
      <xm_table
        class="pic_table"
        tableType="video"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="220" label="视频">
          <template #default="scope">
            <div class="live_box">
              <div class="live_img_box" :style="scope.row.isDelete == 1 ? '' : ''">
                <el-image v-if="scope.row.cover" :src="scope.row.cover" class="live_img">
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
                <div class="removed_box" v-if="scope.row.isDelete == 1">已下架</div>
                <div class="play_box" @click="startPlay(scope.row)">
                  <img src="@/assets/images/content_center/inspection_play.png" alt />
                </div>
              </div>
              <div class="live_content">
                <div class="content1">
                  <!-- <el-tooltip effect="dark" placement="top-start" v-if="scope.row.title">
                    <template #content>
                      <div style="max-width: 300px">
                        {{ scope.row.title || '--' }}
                      </div>
                    </template> -->
                  <div
                    class="content_text row_overflow"
                    :style="[scope.row.isDelete == 1 ? '' : 'cursor: pointer;']"
                    @click="toDetail(scope.row.isDelete == 1, scope.row, scope.row.isDelete)"
                  >
                    {{ scope.row.title || '--' }}
                  </div>
                  <el-popover
                    placement="bottom"
                    popper-class="qrcode_popper"
                    width="154px"
                    trigger="click"
                    v-if="scope.row.platform == 1"
                  >
                    <template #reference>
                      <img src="@/assets/images/content_center/qrcode.png" alt="" />
                    </template>
                    <div class="qrcode_box" v-if="scope.row.shareUrl">
                      <qrcode-vue :value="scope.row.shareUrl" :size="126" level="H" />
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
                <div class="content2">
                  时长：
                  {{
                    scope.row.videoDuration
                      ? secondToDate(scope.row.videoDuration || 0, 'm', false)
                      : '--'
                  }}
                </div>
                <div class="content2">
                  <!-- 发布时间：{{ scope.row.createTime ? getDateDiff(scope.row.createTime) : '--' }} -->
                  发布时间：{{ scope.row.createTime ? formatDate(scope.row.createTime) : '--' }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="200" label="矩阵号昵称">
          <template #default="scope">
            <!-- <router-link :to="toUserDetail(scope.row.dyOpenId)"> -->
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
                  <div class="content_text line-hidden2">
                    {{ scope.row.nickname || '--' }}
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
            <!-- </router-link> -->
          </template>
        </el-table-column>
        <!-- <el-table-column min-width="130" label="关联任务">
          <template #default="scope">
            <el-tooltip effect="dark" placement="top-start" v-if="scope.row.relatedTaskName">
              <template #content>
                <div style="max-width: 300px">
                  {{ scope.row.relatedTaskName }}
                </div>
              </template>
              <div class="row_overflow" style="max-width: max-content">
                {{ scope.row.relatedTaskName || '--' }}
              </div>
            </el-tooltip>
            <div v-else class="row_overflow" style="max-width: max-content">--</div>
          </template>
        </el-table-column> -->
        <el-table-column min-width="90" label="所属平台">
          <template #default="scope">
            {{
              scope.row.platform
                ? scope.row.platform == 1
                  ? '抖音'
                  : scope.row.platform == 2
                  ? '视频号'
                  : scope.row.platform == 3
                  ? '小红书'
                  : scope.row.platform == 4
                  ? '快手'
                  : '未知'
                : '全部平台'
            }}
          </template>
        </el-table-column>
        <el-table-column min-width="90" label="播放数">
          <template #default="scope">{{ wanSliceFormat(scope.row.playCount || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="90" label="点赞数">
          <template #default="scope">{{ wanSliceFormat(scope.row.diggCount || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="90" label="评论数">
          <template #default="scope">{{ wanSliceFormat(scope.row.commentCount || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="90" label="分享数">
          <template #default="scope">{{ wanSliceFormat(scope.row.shareCount || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="90" label="线索数">
          <template #default="scope">{{ wanSliceFormat(scope.row.clueCnt || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="150">
          <template #header>
            <div class="column_header">
              <span>已获得金币数</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                content="质检不合格时，不会扣除已发放的金币奖励"
                :style="{ 'margin-left': '4px' }"
              >
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="scope">{{ wanSliceFormat(scope.row.gold || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="240" label="关联任务">
          <template #default="scope">
            <div v-if="scope.row.relatedTaskUser">
              员工：
              <span>
                <!-- 姓名 -->
                <span v-if="scope.row.relatedTaskUser.userName">
                  {{ scope.row.relatedTaskUser.userName }}
                </span>
                <span v-else>--</span>
                <!-- 电话 -->
                (
                <table_column_phone
                  v-if="scope.row.relatedTaskUser.userPhone"
                  :phone="scope.row.relatedTaskUser.userPhone"
                ></table_column_phone>
                <span v-else>--</span>
                )
              </span>
            </div>
            <div v-if="scope.row.relatedTaskName && scope.row.relatedTaskId">
              任务：
              <span
                :style="scope.row.isDelete == 1 ? '' : 'cursor: pointer;'"
                @click="toTaskDetail(scope.row)"
                v-if="scope.row.relatedTaskName && scope.row.relatedTaskId"
              >
                {{ scope.row.relatedTaskName }}
              </span>
              <span v-else>--</span>
            </div>
            <div v-else>--</div>
          </template>
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

    <!-- 视频预览弹窗 -->
    <el-dialog
      destroy-on-close
      title="查看视频"
      width="444px"
      @close="videoDialog.show = false"
      v-model="videoDialog.show"
    >
      <video
        class="video"
        style="width: 400px; height: auto; max-height: 70vh"
        :src="videoDialog.url"
        controls="controls"
        autoplay
      ></video>
    </el-dialog>
  </div>
</template>
<script>
import { eaccountRoleICON } from '@/utils/dictionary/content-center.js'
import { getCheckDetail } from '@/api/content_center/inspection.js'
import inspectionDetail from '../components/inspection_detail.vue'
import inspectionModal from '../components/inspection_modal.vue'
import qrcodeVue from 'qrcode.vue'
import { pageList } from './model/get_list.js'
import { useRouter } from 'vue-router'
import { wanSliceFormat, secondToDate, throttle, getDateDiff, formatDate } from '@/utils/tools.js'
export default {
  components: {
    qrcodeVue,
    inspectionModal,
    inspectionDetail
  },
  setup(props) {
    const vm = getCurrentInstance()
    const message = inject('$message')
    const modal = reactive({
      show: false,
      title: '作品质检',
      xcontentId: '',
      type: 'video'
    })
    const detailModal = reactive({
      show: false,
      title: '质检记录',
      data: null,
      type: 'video'
    })
    const { searchComponents, tableForm, getList, tabList, chooseTab } = pageList()
    // 打开质检弹窗
    function showModal(e) {
      modal.xcontentId = e.xcontentId
      modal.show = true
      vm.appContext.config.globalProperties.$tracking.clickBtn(106)
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
      const num1 = ref(true)
      const num2 = ref(true)
      searchComponents.value
        .filter(x => x.type === 'numberRange')
        .forEach(item => {
          if (item.label === '播放数') {
            if (Number(item.minVal) > Number(item.maxVal) && item.maxVal) {
              tableForm.loading = false
              num1.value = false
            } else {
              num1.value = true
            }
          }
          if (item.label === '点赞数') {
            if (Number(item.minVal) > Number(item.maxVal) && item.maxVal) {
              tableForm.loading = false
              num2.value = false
            } else {
              num2.value = true
            }
          }
        })
      if (num1.value && num2.value) {
        getList()
      } else {
        message({
          type: 'warning',
          message: '筛选项有误，请检查！'
        })
      }
    }
    const toUserDetail = openId => {
      // return `/content_center/content_matrix/details?openId=${openId}`
      const newpage = router.resolve({
        path: '/content_center/content_matrix/details', // 跳转的页面路由
        query: {
          // 要传的参数
          openId
        }
      })
      window.open(newpage.href, '_blank')
    }
    const router = useRouter()

    const toDetail = throttle(function (stu, row, isDelete) {
      if (!stu) {
        if (row) {
          // 新开页面 跳转到内容中心->视频数据->详情
          const newpage = router.resolve({
            path: '/content_center/content_manage/manage_detail', // 跳转的页面路由
            query: {
              // 要传的参数
              itemId: row.itemId
            }
          })
          window.open(newpage.href, '_blank')
        } else {
          message({
            type: 'warning',
            message: '暂未获取到视频相关信息'
          })
        }
      }
    }, 700)
    // 去任务详情
    const toTaskDetail = throttle(function (row) {
      if (row) {
        if (row.relatedTaskId) {
          // /content_market/video_task/video_task_details?itemId=2125&type=1
          // 先判断跳转之前的任务id跟type少一个就不跳转。
          // 返回数据做处理后，未关联任务的记录不会显示任务名称,显示--，就无法点击，所以要在获取数据时处理是否跳转
          const newpage = router.resolve({
            path: '/content_market/video_task/video_task_details', // 跳转的页面路由
            query: {
              // 要传的参数
              itemId: row.relatedTaskId,
              type: 1 // 目前只有一个视频发布任务，固定传1
            }
          })
          window.open(newpage.href, '_blank')
        }
      } else {
        message({
          type: 'warning',
          message: '暂未获取到任务相关信息'
        })
      }
    }, 700)

    const videoDialog = reactive({
      show: false,
      url: ''
    })
    function startPlay(row) {
      const val = row.shareUrl
      // 抖音的shareUrl无法播放
      if (row.platform === 1 || row.platform === 3) {
        window.open(val)
      } else {
        if (val) {
          videoDialog.url = val
          videoDialog.show = true
        } else {
          message.warning('暂未找到播放地址')
        }
      }
    }

    return {
      eaccountRoleICON,
      toDetail,
      toTaskDetail,
      toUserDetail,
      secondToDate,
      searchList,
      modal,
      detailModal,
      tableForm,
      getList,
      searchComponents,
      wanSliceFormat,
      getDateDiff,
      showModal,
      showDetailModal,
      resetSearch,
      formatDate,
      tabList,
      chooseTab,
      videoDialog,
      startPlay
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../components/css/qrcode.scss';
@import '../components/css/page.scss';
@import '../components/css/inspection.scss';
.video_inspection {
  position: relative;
  .table_box {
    margin: $content_margin 0;
    background: #fff;
    padding: 24px;
    border-radius: $content_radius;
    .tab_label {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      img {
        display: flex;
        width: 14px;
        height: 14px;
      }
    }
  }
  .live_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .live_img_box {
      width: 60px;
      height: 80px;
      border-radius: 4px;
      margin-right: 10px;
      position: relative;
      .removed_box {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background: rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        font-size: 12px;

        font-weight: 600;
        color: #ffffff;
        line-height: 17px;
      }
      .play_box {
        opacity: 0;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.4);
        cursor: pointer;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        &:hover {
          opacity: 1;
        }
        img {
          width: 25px;
          height: 25px;
        }
      }
    }
    .live_img {
      width: 60px;
      height: 80px;
      border-radius: 4px;
      object-fit: cover;
    }
    .live_content {
      max-width: calc(100% - 70px);
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .content1 {
        margin-top: 5px;
        margin-bottom: 10px;
        // min-width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;

        font-weight: 500;
        color: #303133;
        line-height: 20px;
        .content_text {
          // width: calc(100% - 26px);
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 8px;
          // cursor: pointer;
        }
      }
      .content2 {
        margin-top: 4px;
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
          // max-width: calc(100% - 0px);
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
</style>
