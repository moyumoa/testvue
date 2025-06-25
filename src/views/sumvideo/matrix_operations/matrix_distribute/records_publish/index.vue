<template>
  <div class="batch_publish">
    <xm_search
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="querySearch"
      @reset="resetSearch"
      @clearInput="clearInput"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportFun">导出</exp_button>
      </template>
    </xm_search>

    <div class="table_warp">
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
              <!-- @click="toDetail(row)" -->
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
              </div>

              <div class="live_content">
                <div class="content1">
                  <div style="max-width: 300px" class="content_text row_overflow">
                    {{ row.videoTitle || '--' }}
                  </div>
                </div>
                <div class="content2" v-if="row.mediaType != 2">
                  <!-- 时长为0.x秒时，直接显示0秒 -->
                  时长：{{
                    row.duration
                      ? secondToDate((row.duration / 1000).toFixed(2))
                        ? secondToDate((row.duration / 1000).toFixed(2))
                        : '0秒'
                      : '--'
                  }}
                </div>
                <!-- <div class="content2">
                  视频发布时间：{{ row.createTime ? formatDate(row.createTime) : '--' }}
                </div> -->
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发布账号" min-width="200">
          <template #default="{ row }">
            <div class="fs_user_box">
              <!-- @click="toUserDetail(row.dyOpenId, row)" -->
              <div :class="row.operator && row.operator.fsOpenId ? 'fs_content' : 'fs_content2'">
                <div class="user_box">
                  <!-- :style="row.xuserIsDel && row.xuserIsDel == 1 ? 'cursor: default' : ''" -->
                  <div class="user_head_box">
                    <img v-if="row.dyAvatar" :src="row.dyAvatar" class="user_head" alt />
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
                        {{ row.dyNickname || '--' }}
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
                    <!-- <table_column_department_info
                      className="blue_department_info"
                      :departmentName="row.xuserDeptName"
                      connectStr="/"
                      divisionStr=";"
                      trigger="hover"
                      tipPlacement="right"
                    ></table_column_department_info> -->
                  </div>
                </div>
              </div>
              <!-- v-if="row.fsOpenId" -->
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
        <el-table-column label="发布状态" min-width="120">
          <template #default="{ row }">
            <el-tooltip
              :disabled="row.status !== 4"
              popper-class="tooltip-class tooltip_group_list"
              placement="right"
            >
              <template #content>
                <div style="max-width: 400px; max-height: 400px; overflow-y: auto">
                  <template v-if="row.errorMessage">
                    {{ row.errorMessage || '--' }}
                  </template>
                  <template v-else>任务发布失败</template>
                </div>
              </template>
              <div class="xm_status_content" style="width: max-content">
                <div
                  :class="
                    'status_circle ' + BATCHPUBLISH_PUBLISHSTATUS.getCN(row.status || 1).class
                  "
                ></div>
                <div>{{ BATCHPUBLISH_PUBLISHSTATUS.getCN(row.status || 1).label }}</div>
                <img
                  v-if="row.status == 4"
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 16px; height: 16px; margin-left: 4px"
                />
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="作品数据" min-width="270">
          <template #default="{ row }">
            <taskDataNum :info="row" />
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            <span v-if="row.status == 3">{{ row.publishTime || '--' }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="110" align="right" fixed="right">
          <template #default="{ row }">
            <el-link
              type="primary"
              @click="previewFun(row)"
              v-if="(row.status === 3 && row.mediaType == 2) || row.mediaType != 2"
            >
              {{ row.mediaType == 2 ? '图文' : '视频' }}详情
            </el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 视频的弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
  </div>
</template>

<script setup>
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import { exportFileV2 } from '@/utils/exportFile'
import Track from '@/utils/tracking/index.js'

import { matrixTypeICON } from '@/utils/dictionary/content-center.js'

import taskDataNum from '../../components/task_data_num.vue'
import { BATCHPUBLISH_PUBLISHSTATUS } from '@/utils/dictionary/sumvideo.js'
import { throttle, secondToDate } from '@/utils/tools.js' //

import { getQuery } from '@/utils/get_query.js'
import api from '@/api/content_center/content_matrix.js'
import { publishVideoRecord, exportBatchPublishRecord } from '@/api/sumvideo/content_distribute.js'

const props = defineProps({
  bizId: String
})
const { bizId } = toRefs(props)
// const router = useRouter()
const searchComponents = ref([
  {
    type: 'input',
    label: '任务ID',
    val: '',
    placeholder: '请输入关联批量发布任务ID',
    clearHandle: true, // 是否需要清空输入框触发回调
    filed: 'bizId'
  },
  {
    type: 'input',
    label: '关联任务',
    val: '',
    placeholder: '请输入关联批量发布任务名称',
    filed: 'batchPublishTaskName'
  },
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
    filed: 'dyNickname'
  },
  {
    type: 'select',
    label: '矩阵号分组',
    placeholder: '请选择矩阵号分组',
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    defaultVal: undefined,
    val: null,
    selects: [],
    selectDefultName: ['id', 'groupName'],
    filed: 'groupIds'
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
const emits = defineEmits(['updateUrl'])

function clearInput(filed) {
  if (filed === 'bizId') {
    emits('updateUrl')
  }
}

// 分组
function getNewGroupListFn() {
  api.getNewGroupList({}).then(res => {
    if (res.code === 0) {
      const index = searchComponents.value.findIndex(item => item.label === '矩阵号分组')
      searchComponents.value[index || 3].selects = res.data || []
    }
  })
}

function commonParams() {
  const data = getQuery(searchComponents.value, ['publishTimeMin', 'publishTimeMax'])
  const params = {
    ...data,
    publishSource: 7 // 视频发布来源 1后台 2灵感跟拍 3首页发视频 7批量任务
  }
  return params
}
// 导出
const exportFun = () => {
  Track.clickBtn(210)

  return exportFileV2(exportBatchPublishRecord, commonParams(), '发布记录', 'xlsx')
}
// 获取列表
function getList() {
  const params = {
    ...commonParams(),
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size
  }
  publishVideoRecord(params)
    .then(res => {
      if (res.code === 0) {
        console.log('获取发布记录返回', res)
        tableForm.listData = res.data?.records || []
        tableForm.page.total = res.data?.total
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
function initQuery() {
  tableForm.page.index = 1
  tableForm.page.size = 10
  if (bizId.value) {
    const index = searchComponents.value.findIndex(item => item.label === '视频发布时间')
    searchComponents.value[index || 1].defaultVal = [
      new Date(new Date().setDate(new Date().getDate() - 2)),
      new Date()
    ]
    searchComponents.value[index || 1].val = [
      new Date(new Date().setDate(new Date().getDate() - 2)),
      new Date()
    ]
  }
}
// 重置
function resetSearch() {
  clearInput('bizId')
  tableForm.loading = true
  initQuery()
  getList()
}
function beforeGetList() {
  tableForm.loading = true
  getList()
}

const message = inject('$message')
// 预览信息
const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
// 去详情
const previewFun = throttle(e => {
  if (e.mediaType === 2) {
    if (e.shareUrl) {
      window.open(e.shareUrl, '_blank')
    } else {
      message.warning('暂未找到地址')
    }
    return
  }
  // if (e.shareUrl && e.platform === 1) {
  //   console.log('这个应该跳抖音观看吧')
  // }
  // if (e.videoTag === 3) {
  //   console.log('预览，产品原型没有', e)
  // } else {
  previewInfo.value = {
    show: true,
    title: '查看视频',
    url: e.videoUrl || '',
    type: 'video',
    cover: e.videoCoverUrl || ''
  }
  // }
}, 500)
// // 跳转详情页
// const toUserDetail = throttle(function (openId, e) {
//   // 如果矩阵号被删除，就不能跳转
//   if (e.xuserIsDel && e.xuserIsDel === 1) {
//     return
//   }
//   router.push(`/content_center/content_matrix/details?openId=${openId}`)
// }, 500)
// // 跳转作品播放页
// const toDetail = throttle(function (e) {
//   router.push(
//     `/content_center/content_manage/manage_detail?itemId=${window.encodeURIComponent(e.dyItemId)}`
//   )
// }, 500)
// 跳转飞书聊天
function toFschat(openId) {
  window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
}
onMounted(() => {
  if (bizId.value) {
    // const index = searchComponents.value.findIndex(x => x.filed === 'bizId')
    // searchComponents.value[index].val = taskName.value
    searchComponents.value.forEach(item => {
      if (item.filed === 'bizId') {
        item.val = bizId.value
      }
      if (item.filed === 'dateRange') {
        item.defaultVal = []
        item.val = []
      }
    })
  }
})
function initPage() {
  tableForm.loading = true
  getNewGroupListFn()
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
</style>
