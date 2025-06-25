<template>
  <!-- 列表 -->
  <xm_table
    class="pic_table"
    :data="videoData && videoData.records"
    v-model:page="tableForm.page"
    v-loading="tableForm.page.loading"
    tableType="default"
    @getTableData="getList"
  >
    <el-table-column width="400" label="视频">
      <template #default="scope">
        <div class="live_box">
          <div class="live_img_box" @click="toDetail(scope.row)">
            <el-image
              v-if="scope.row.cover"
              :src="scope.row.cover"
              alt
              class="live_img"
              fit="cover"
            >
              <template #error>
                <div class="live_img errImg_box"></div>
              </template>
            </el-image>
            <img v-else src="@/assets/images/content_center/cover.jpg" alt class="live_img" />
            <div class="inner" v-if="scope.row.isDelete === 1">
              <img src="@/assets/images/content_center/delete.png" alt />
              <span>已删除</span>
            </div>
            <!-- 图集 -->
            <imgTextTask_ICON v-if="scope.row.mediaType == 2" :info="scope.row" :useClick="false" />
          </div>

          <div class="live_content">
            <div class="content1" :style="scope.row.platform == 1 ? '' : 'width:100%'">
              <div
                style="flex: none"
                v-if="scope.row.anchorType"
                :class="`xm_anchorType${scope.row.anchorType}_ICON`"
              ></div>
              <div style="max-width: 300px" class="content_text row_overflow">
                {{ scope.row.title || '--' }}
              </div>
              <el-popover
                placement="bottom"
                popper-class="qrcode_popper"
                width="154px"
                trigger="click"
                v-if="scope.row.shareUrl && scope.row.platform == 1"
              >
                <template #reference>
                  <img src="@/assets/images/content_center/qrcode.png" alt />
                </template>
                <div class="qrcode_box" style="padding: 12px 0">
                  <qrcode-vue :value="scope.row.shareUrl" :size="126" level="H" />
                  <div class="qr_mark">
                    <img
                      src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                      alt
                      style="width: 20px; height: 20px; vertical-align: sub"
                    />
                    抖音扫码观看
                  </div>
                </div>
              </el-popover>
            </div>
            <div class="content2" v-if="scope.row.mediaType != 2">
              时长：{{
                scope.row.videoDuration
                  ? secondToDate((scope.row.videoDuration / 1000).toFixed(2))
                  : '--'
              }}
            </div>
            <div class="content2">
              <!-- 视频发布时间：{{ scope.row.createTime ? getDateDiff(scope.row.createTime) : '--' }} -->
              视频发布时间：{{ scope.row.createTime ? formatDate(scope.row.createTime) : '--' }}
            </div>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column min-width="240" label="矩阵号昵称">
      <template #default="scope">
        <div class="fs_user_box">
          <div
            :class="
              scope.row.operator && scope.row.operator.fsOpenId ? 'fs_content' : 'fs_content2'
            "
            @click="toDetail2(scope.row)"
          >
            <div
              class="user_box"
              :style="scope.row.xuserIsDel && scope.row.xuserIsDel == 1 ? 'cursor: default' : ''"
            >
              <div class="user_avatar">
                <!-- <img v-if="scope.row.avatar" :src="scope.row.avatar" class="user_head" alt /> -->
                <el-image
                  fit="cover"
                  v-if="scope.row.avatar"
                  :src="scope.row.avatar"
                  alt
                  class="user_head"
                >
                  <template #error>
                    <div class="user_head errImg_box"></div>
                  </template>
                </el-image>
                <img
                  v-else
                  src="@/assets/images/content_center/default_user.png"
                  class="user_head"
                  alt
                />
                <template v-if="scope.row.platform === 1 && scope.row.openIdAuthStatusVo">
                  <el-tooltip
                    effect="dark"
                    v-if="scope.row.openIdAuthStatusVo.dyAuth == 2"
                    placement="top-start"
                  >
                    <template #content>
                      <div style="max-width: 300px">
                        {{ scope.row.openIdAuthStatusVo.dyAuth == 2 ? '抖音授权失效' : '' }}
                      </div>
                    </template>
                    <img
                      class="expired_img"
                      src="@/assets/images/content_center/warning_icon.png"
                      alt=""
                    />
                  </el-tooltip>
                </template>
              </div>
              <div class="user_content">
                <div class="content1">
                  <div style="max-width: 300px" class="content_text">
                    {{ scope.row.nickname || '--' }}

                    <!-- 发布平台类型 -->
                    <div class="platform_icon_box">
                      <div :class="[`xm_platformIcon_${scope.row.platform}`]"></div>
                    </div>
                    <template v-if="scope.row.xuserType && scope.row.xuserType > 1">
                      <el-tooltip effect="dark" placement="top">
                        <template #content>
                          <div style="max-width: 300px">
                            {{ matrixTypeICON.getCN(scope.row.xuserType).name }}
                          </div>
                        </template>
                        <img :src="matrixTypeICON.getCN(scope.row.xuserType).img" alt="" />
                      </el-tooltip>
                    </template>
                    <!-- 矩阵号被删除 -->
                    <div
                      class="xm_delClass"
                      v-if="scope.row.xuserIsDel && scope.row.xuserIsDel == 1"
                    ></div>
                  </div>
                </div>
                <table_column_department_info
                  className="blue_department_info"
                  :departmentName="scope.row.xuserDeptName"
                  connectStr="/"
                  divisionStr=";"
                  trigger="hover"
                  tipPlacement="right"
                ></table_column_department_info>
                <!-- 业务主体 -->
                <table_column_business_entity :list="scope.row.businessNameList" />
              </div>
            </div>
          </div>
          <!-- v-if="scope.row.fsOpenId" -->
          <img
            v-if="scope.row.operator && scope.row.operator.fsOpenId"
            @click="toFschat(scope.row.operator.fsOpenId)"
            class="fs_chat"
            src="@/assets/images/content_center/fsChat.png"
            alt=""
          />
        </div>
      </template>
    </el-table-column>
    <el-table-column width="130" label="播放数">
      <template #default="scope">{{ wanSliceFormat(scope.row.playCount || 0) }}</template>
    </el-table-column>
    <el-table-column width="130" label="热度指数">
      <template #header>
        <div class="column_header">
          <span>热度指数</span>
          <el-tooltip
            popper-class="tooltip-class"
            placement="top"
            content=""
            raw-content
            :style="{ 'margin-left': '4px' }"
          >
            <template #content>
              <div style="max-width: 400px">
                热度指数是根据当前视频点赞、评论、分享、账号粉丝量等基础数据计算得出的视频热度评估指数，用来描述当前视频的受欢迎程度
              </div>
            </template>
            <img
              src="@/assets/images/operate/tip_line.png"
              style="width: 12px; height: 12px; margin-left: 8px"
            />
          </el-tooltip>
        </div>
      </template>
      <template #default="scope">{{ wanSliceFormat(scope.row.hotValue || 0) }}</template>
    </el-table-column>
    <el-table-column width="130" label="点赞数">
      <template #default="scope">{{ wanSliceFormat(scope.row.diggCount || 0) }}</template>
    </el-table-column>
    <el-table-column width="130" label="评论数">
      <template #default="scope">{{ wanSliceFormat(scope.row.commentCount || 0) }}</template>
    </el-table-column>
    <el-table-column width="130" label="分享数">
      <template #default="scope">{{ wanSliceFormat(scope.row.shareCount || 0) }}</template>
    </el-table-column>
    <el-table-column width="130" label="销售额" v-if="brandViewMode === 1">
      <template #default="scope">
        ¥{{ wanSliceFormat(scope.row.saleAmount || 0) }}
        <!-- ¥{{ wanSliceFormat((scope.row.commerceCount / 100 || 0).toFixed(2)) }} -->
      </template>
    </el-table-column>
    <el-table-column width="130" label="销售量" v-if="brandViewMode === 1">
      <template #default="scope">{{ wanSliceFormat(scope.row.saleCount || 0) }}</template>
    </el-table-column>
    <el-table-column width="130" label="线索数">
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

    <el-table-column label="操作" fixed="right" width="210" align="center" header-align="center">
      <template #default="scope">
        <el-link style="margin-right: 20px" type="primary" @click="toDetail(scope.row)">
          数据
        </el-link>

        <el-link
          v-if="scope.row.isChecked == 1"
          type="primary"
          @click="showDetailModal(scope.row.checkId)"
          style="margin-right: 20px"
        >
          质检详情
        </el-link>
        <el-link v-else type="primary" @click="showModal(scope.row)">质检</el-link>
      </template>
    </el-table-column>
  </xm_table>
  <inspectionDetail :detailModal="detailModal" v-if="detailModal.show"></inspectionDetail>

  <inspectionModal
    :inspectionModal="modal"
    @updateList="getList"
    v-if="modal.show"
  ></inspectionModal>
</template>

<script setup>
import { matrixTypeICON } from '@/utils/dictionary/content-center.js'

// import { wanSliceFormat, getDateDiff, secondToDate } from '@/utils/tools.js'
import { wanSliceFormat, secondToDate, formatDate, throttle } from '@/utils/tools.js'

import { getCheckDetail } from '@/api/content_center/inspection.js'
import inspectionDetail from '@/views/content_center/components/inspection_detail.vue'
import inspectionModal from '@/views/content_center/components/inspection_modal.vue'
import { useRouter } from 'vue-router'

import qrcodeVue from 'qrcode.vue'
import { defineProps } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()
const message = inject('$message')

const brandViewMode = computed(() => store.state.user.brandViewMode)
const props = defineProps({
  videoData: {
    type: Object,
    default: () => {}
  },
  page: {
    type: Object,
    default: () => {}
  }
})
const tableForm = reactive({
  page: {}
})
tableForm.page = toRef(props, 'page')
onMounted(() => {})

const emit = defineEmits(['getList'])
const detailModal = reactive({
  show: false,
  title: '质检记录',
  data: null,
  type: 'video'
})
const vm = getCurrentInstance()
const modal = reactive({
  show: false,
  title: '作品质检',
  xcontentId: '',
  type: 'video'
})

// 去详情
const toDetail = throttle(function (e) {
  const link = `/content_center/content_manage/manage_detail?itemId=${window.encodeURIComponent(
    e.itemId
  )}`
  router.push(link)
}, 500)

// 去矩阵详情
const toDetail2 = throttle(function (e) {
  // 如果矩阵号被删除，就不能跳转
  if (e.xuserIsDel && e.xuserIsDel === 1) {
    return
  }
  const link = `/content_center/content_matrix/details?openId=${e.dyOpenId}`
  router.push(link)
}, 500)

function getList(obj) {
  emit('getList')
}
// 跳转飞书聊天
function toFschat(openId) {
  window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
}

// 打开质检详情弹窗
function showDetailModal(checkId) {
  console.log('checkId', checkId)
  getCheckDetail({
    checkId: checkId
  }).then(res => {
    if (res.code === 0 && res.data) {
      detailModal.data = res.data
      detailModal.show = true
    }
  })
}
// 打开质检弹窗
function showModal(e) {
  modal.xcontentId = e.xcontentId
  modal.show = true
  vm.appContext.config.globalProperties.$tracking.clickBtn(106)
}
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
</script>
<style lang="scss" scoped>
@import url(../../components/css/qrcode.scss);
@import url(../components/comment.css);
@import '../../components/css/page.scss';

.pic_table {
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
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
      cursor: pointer;
      .inner {
        font-size: 11px;
        position: absolute;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        z-index: 99;
        top: 0;
        background: #000000;
        opacity: 0.5;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        img {
          width: 16px;
          height: 16px;
          margin-left: 24px;
          margin-top: 4px;
        }
        span {
          margin-top: 10px;
          color: #fff;
        }
      }
    }
    .live_img {
      width: 60px;
      height: 80px;
      border-radius: 4px;
      object-fit: cover;
      img {
        object-fit: cover;
      }
    }
    .live_content {
      max-width: calc(100% - 70px);
      min-height: 70px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      .content1 {
        max-width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        line-height: 20px;
        margin-bottom: 14px;
        .content_text {
          // width: calc(100% - 26px);
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 8px;
          cursor: pointer;
        }
      }
      .content2 {
        margin-top: 4px;
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
    cursor: pointer;
    .user_avatar {
      position: relative;
      display: flex;
    }
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
      max-width: calc(100% - 42px);
      min-height: 36px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        max-width: 100%;
        // display: flex;
        // flex-direction: row;
        // justify-content: flex-start;
        // align-items: center;
        font-size: 13px;
        font-weight: 500;
        color: #303133;
        line-height: 20px;
        .content_text {
          width: calc(100% - 0px);
          .platform_icon_box {
            display: inline-block;
            width: 18px;
            height: 18px;
            margin-left: 3px;
            vertical-align: text-top;
            position: relative;
            margin-top: -2px;
            div {
              display: inline-block;
              width: 100%;
              height: 100%;
            }
          }
          // margin-bottom: 4px;
        }
        img {
          margin-top: -1px;
          width: 16px;
          height: 16px;
          margin-left: 4px;
          vertical-align: text-top;
        }
      }
      .content2 {
        // margin-top: 6px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
}
</style>
