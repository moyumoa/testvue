<template>
  <div class="batch_publish">
    <xm_search
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="querySearch"
      @reset="resetSearch"
    ></xm_search>

    <div class="table_warp">
      <div class="table_top" v-if="status == 2">
        <div class="top_left" style="color: #909399">
          数据同步可能存在延迟，请耐心等待，无需频繁操作
        </div>
        <el-button :loading="syncLoading" @click="syncFun">同步数据</el-button>
      </div>
      <xm_table
        tableType="video"
        class="matrix_table"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        v-loading="tableForm.loading"
        @getTableData="beforeGetList"
      >
        <el-table-column label="作品信息" min-width="220">
          <template #default="{ row }">
            <div class="live_box">
              <div class="live_img_box">
                <el-image
                  fit="cover"
                  v-if="row.videoCoverUrl"
                  :src="row.videoCoverUrl"
                  alt
                  class="live_img"
                >
                  <template #error>
                    <div class="live_img errImg_box"></div>
                  </template>
                </el-image>
                <img v-else src="@/assets/images/content_center/cover.jpg" alt class="live_img" />
                <!-- icon -->
                <div class="avrIcon">
                  <div :class="[`xm_platformIcon_${row.platform || 1}`]"></div>
                </div>
                <div class="inner" v-if="row.isDelete === 1">
                  <img src="@/assets/images/content_center/delete.png" alt />
                  <span>已删除</span>
                </div>
                <!-- 图集没有时长。 -->
                <div class="imgTextBox" v-if="row.mediaType == 2">
                  <imgTextTask_ICON :info="row" :useClick="false" class="imgText_one" />
                </div>
              </div>

              <div class="live_content">
                <div class="content1">
                  <div style="max-width: 300px" class="content_text row_overflow">
                    {{ row.videoTitle || '--' }}
                  </div>
                </div>
                <div class="content2" v-if="row.mediaType != 2">
                  时长：{{
                    row.duration
                      ? secondToDate((row.duration / 1000).toFixed(2))
                        ? secondToDate((row.duration / 1000).toFixed(2))
                        : '0秒'
                      : '--'
                  }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发布账号" min-width="200">
          <template #default="{ row }">
            <div class="fs_user_box">
              <div :class="row.operator && row.operator.fsOpenId ? 'fs_content' : 'fs_content2'">
                <div class="user_box">
                  <div class="user_head_box">
                    <img
                      v-if="row.accountHeadUrl"
                      :src="row.accountHeadUrl"
                      class="user_head"
                      alt
                    />
                    <img
                      v-else
                      src="@/assets/images/content_center/default_user.png"
                      class="user_head"
                      alt
                    />
                    <!-- icon -->
                    <div class="platform_icon_box">
                      <div :class="[`xm_platformIcon_${row.platform || 1}`]"></div>
                    </div>
                  </div>
                  <div class="user_content">
                    <div class="content1">
                      <div class="content_text">
                        {{ row.accountNickname || '--' }}
                        <template
                          v-if="
                            row.dyAccountRole && matrixTypeICON.getCN(row.dyAccountRole) && false
                          "
                        >
                          <el-tooltip effect="dark" placement="top">
                            <template #content>
                              <div style="max-width: 300px">
                                {{ matrixTypeICON.getCN(row.dyAccountRole).name }}
                              </div>
                            </template>
                            <img :src="matrixTypeICON.getCN(row.dyAccountRole).img" alt="" />
                          </el-tooltip>
                        </template>
                        <!-- 矩阵号被删除 -->
                        <div class="xm_delClass" v-if="row.xuserIsDel && row.xuserIsDel == 1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <img
                v-if="row.operator && row.operator.fsOpenId"
                @click="toFschat(row.operator.fsOpenId)"
                class="fs_chat"
                src="@/assets/images/content_center/fsChat.png"
                alt=""
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="作品数据" min-width="270">
          <template #default="{ row }">
            <taskDataNum
              :showList="
                row.platform == 1
                  ? ['digg', 'comment', 'collect', 'share']
                  : ['digg', 'comment', 'collect']
              "
              :info="row"
            />
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="220">
          <template #default="{ row }">
            <span>{{ row.publishTime || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最近更新时间" width="220">
          <template #default="{ row }">
            <div class="time_tip">
              <div>{{ row.latestSyncTime || '--' }}</div>
              <el-tooltip v-if="row.syncStatus == 2" class="item" effect="dark" placement="top">
                <template #content>
                  <div style="max-width: 300px" class="tooltip_wrap">
                    {{ row.errorLog || '--' }}
                  </div>
                </template>
                <div class="xm_tooltipOfRight2" style="margin-left: 4px"></div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="90" align="right" fixed="right">
          <template #default="{ row }">
            <el-link type="primary" @click="previewFun(row)">查看</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 视频的弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 图文详情的预览弹窗 -->
    <preview_imgText v-if="previewImgTextInfo.show" :previewDialog="previewImgTextInfo" />
  </div>
</template>

<script setup>
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'

import { matrixTypeICON } from '@/utils/dictionary/content-center.js'

import taskDataNum from '../../components/task_data_num.vue'
import { throttle, secondToDate } from '@/utils/tools.js' //

import { getQuery } from '@/utils/get_query.js'
import { listQrCodePublishRecord, syncData } from '@/api/sumvideo/content_distribute.js'

const props = defineProps({
  qrId: String,
  status: Number || String
})
const { qrId, status } = toRefs(props)

const searchComponents = ref([
  {
    type: 'dateRange',
    label: '视频发布时间',
    disabledDate(time) {
      return time.getTime() > Date.now()
    },
    defaultVal: [new Date(new Date().setDate(new Date().getDate() - 2)), new Date()],
    val: [new Date(new Date().setDate(new Date().getDate() - 2)), new Date()], // 默认是近三天的数据
    isDisEdit: true,
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange'
  },
  {
    type: 'input',
    label: '矩阵号昵称',
    val: '',
    placeholder: '请输入矩阵号昵称',
    filed: 'accountNickname'
  }
])

const tableForm = reactive({
  loading: false,
  listData: [], // 素材列表
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})

// 获取列表
function getList() {
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  const params = {
    ...data,
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    qrId: qrId.value,
    orderSetting: 'DESC:publish_time'
  }
  listQrCodePublishRecord(params)
    .then(res => {
      if (res.code === 0) {
        console.log('获取发布记录返回', res)
        tableForm.listData = res.data?.records || []
        tableForm.page.total = res.data?.total || 0
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}

// 查询
function querySearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}

// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
function beforeGetList() {
  tableForm.loading = true
  getList()
}
const message = inject('$message')
const syncLoading = ref(false)
// 同步数据
const syncFun = throttle(() => {
  syncLoading.value = true
  syncData({
    qrId: qrId.value
  })
    .then(res => {
      if (res.code === 0) {
        message.success('数据更新中，请耐心等待')
      }
      syncLoading.value = false
    })
    .catch(() => {
      syncLoading.value = false
    })
}, 500)
// 预览信息
const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
const previewImgTextInfo = ref({
  show: false,
  info: {}
}) // 图文的预览
// 去详情
const previewFun = throttle(e => {
  if (e.mediaType === 2) {
    previewImgTextInfo.value.info = e
    previewImgTextInfo.value.show = true
  } else {
    if (e.videoUrl) {
      previewInfo.value = {
        show: true,
        title: '查看视频',
        url: e.videoUrl || '',
        type: 'video',
        cover: e.videoCoverUrl || ''
      }
    } else {
      message.warning('查找不到相关地址')
    }
  }
}, 500)

// 跳转飞书聊天
function toFschat(openId) {
  window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
}

function initPage() {
  tableForm.loading = true
  getList()
}

defineExpose({
  initPage
})
</script>

<style lang="scss" scoped>
@import '@/views/content_center/components/css/qrcode.scss';

.batch_publish {
  // background: #fff;
  .table_warp {
    margin-top: 16px;
    border-radius: 4px;
    padding: 22px 24px;
    background: #fff;
  }
}
.live_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  :deep(.icon_box),
  :deep(.icon_icon) {
    cursor: default !important;
  }
  .live_img_box {
    width: 60px;
    height: 80px;
    border-radius: 4px;
    margin-right: 10px;
    position: relative;
    // cursor: pointer;
    .avrIcon {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 24px;
      height: 24px;
      div {
        width: 100%;
        height: 100%;
      }
      img {
        width: 24px;
        height: 24px;
        vertical-align: middle;
      }
    }
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
        // cursor: pointer;
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
.fs_user_box {
  width: 100%;
}
.user_box {
  // cursor: pointer;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .user_head_box {
    width: 36px;
    height: 36px;
    position: relative;
    margin-right: 6px;
  }
  .user_head {
    width: 36px;
    height: 36px;
    border-radius: 100%;
  }
  .platform_icon_box {
    height: 20px;
    width: 20px;
    right: 0px;
    bottom: 0px;
    vertical-align: middle;
    position: absolute;
    div {
      height: 20px;
      width: 20px;
    }
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
        width: max-content;
        max-width: 100%;
        // margin-bottom: 4px;
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
      margin-top: 6px;
      font-size: 12px;

      font-weight: 400;
      color: #909399;
      line-height: 17px;
    }
  }
}
.table_top {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.time_tip {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
</style>
