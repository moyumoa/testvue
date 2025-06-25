<template>
  <div class="videoAnalysis_wrap">
    <!-- 视频数据概览-->
    <div class="data_overview">
      <div class="title_wrap">
        <h4>视频数据概览</h4>
        <div class="time_wrap">
          <div class="time_title">增量统计时间范围：</div>
          <div class="date_table">
            <span
              :class="dateTabValue === item.value ? 'active' : ''"
              @click="changeDateTab(item)"
              v-for="(item, index) in dateTable"
              :key="index"
            >
              {{ item.label }}
            </span>
          </div>
          <div class="item_content">
            <el-date-picker
              :unlink-panels="true"
              v-model="daterangeArray"
              @change="changDaterange('overview')"
              style="width: 250px"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :disabled-date="
                time => {
                  return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
                }
              "
            ></el-date-picker>
          </div>
        </div>
      </div>
      <ul class="task_list">
        <template v-for="(item, index) in overviewList" :key="index">
          <li
            class="task_item"
            v-if="item.show"
            :style="{
              width: brandViewMode === 1 ? '14.2%' : '20%'
            }"
          >
            <h4 v-if="index === 2">{{ '￥' + wanSliceFormat(item.value || 0) }}</h4>
            <h4 v-else>{{ wanSliceFormat(item.value || 0) }}</h4>
            <span>{{ item.name }}</span>
          </li>
        </template>
      </ul>
    </div>
    <!-- 直播列表 -->
    <div class="table_wrap">
      <div class="table_title">
        <span>视频列表</span>
        <div class="time_wrap">
          <div class="time_title">视频发布时间范围：</div>
          <div class="date_table">
            <span
              :class="dateTabValueOfList === item.value ? 'active' : ''"
              @click="changeDateTab(item, 'list')"
              v-for="(item, index) in dateTable"
              :key="index"
            >
              {{ item.label }}
            </span>
          </div>
          <div class="item_content">
            <el-date-picker
              :unlink-panels="true"
              v-model="daterangeArrayOfList"
              @change="changDaterange('list')"
              style="width: 250px"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :disabled-date="
                time => {
                  return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
                }
              "
            ></el-date-picker>
          </div>
        </div>
        <!-- <div class="search_item">
          <div class="item_content">
            <el-input
              placeholder="请输入直播标题"
              :prefix-icon="transElIconName('Search')"
            ></el-input>
          </div>
          <el-button type="primary">搜索</el-button>
        </div> -->
      </div>
      <xm_table
        class="pic_table"
        v-loading="tableState.loading"
        :data="tableState.listData"
        v-model:page="tableState.page"
        @getTableData="getList"
      >
        <el-table-column label="视频" prop="name" min-width="280">
          <template #default="scope">
            <div class="video_wrap">
              <div class="video_cover">
                <el-image
                  v-if="scope.row.cover"
                  class="video_cover"
                  fit="cover"
                  :src="scope.row.cover"
                  alt=""
                >
                  <template #error>
                    <div class="video_cover errImg_box"></div>
                  </template>
                </el-image>
                <div v-else class="video_cover" style="background: #d8d8d8"></div>
                <imgTextTask_ICON
                  v-if="scope.row.mediaType == 2"
                  :info="scope.row"
                  :useClick="false"
                />
              </div>
              <div class="info_wrap">
                <div class="head">
                  <!-- <el-tooltip effect="dark" v-if="scope.row.title" placement="top-start">
                    <template #content>
                      <div style="max-width: 300px">
                        {{ scope.row.title || '--' }}
                      </div>
                    </template>
                    <div class="title row_overflow">
                      {{ scope.row.title || '--' }}
                    </div>
                  </el-tooltip>
                  <div v-else class="title row_overflow">--</div> -->
                  <p>{{ scope.row.title || '--' }}</p>
                  <el-popover
                    placement="bottom"
                    popper-class="qrcode_popper"
                    width="154px"
                    trigger="click"
                  >
                    <template #reference>
                      <img
                        style="cursor: pointer"
                        src="@/assets/images/content_center/qrcode.png"
                        alt=""
                      />
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
                <span class="duration">
                  视频时长：{{
                    scope.row.videoDuration
                      ? secondToDate((scope.row.videoDuration / 1000).toFixed(2) || 0)
                      : '--'
                  }}
                </span>
                <span>发布时间：{{ scope.row.createTime ? scope.row.createTime : '--' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="播放数" prop="phone" min-width="128">
          <template #default="scope">{{ wanSliceFormat(scope.row.playCount || 0) }}</template>
        </el-table-column>
        <el-table-column label="点赞数" prop="section" min-width="128">
          <template #default="scope">{{ wanSliceFormat(scope.row.diggCount || 0) }}</template>
        </el-table-column>
        <el-table-column label="评论数" prop="date" min-width="128">
          <template #default="scope">{{ wanSliceFormat(scope.row.commentCount || 0) }}</template>
        </el-table-column>
        <el-table-column label="分享数" prop="date" min-width="128">
          <template #default="scope">{{ wanSliceFormat(scope.row.shareCount || 0) }}</template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="148"
          align="center"
          header-align="center"
        >
          <template #default="scope">
            <el-link type="primary" @click="toDetail(scope.row)">详情</el-link>
            <el-link type="warning" @click="playVideo(scope.row)" style="margin-left: 20px">
              播放
            </el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <preview_imgText v-if="previewDialog.show" :previewDialog="previewDialog" />
  </div>
</template>
<script setup>
import qrcodeVue from 'qrcode.vue'
import { useRouter } from 'vue-router'
import { listVideo } from '@/api/content_center/content_manage.js'
import api from '@/api/content_center/content_matrix.js'
import { dateFormat, wanSliceFormat, throttle, secondToDate } from '@/utils/tools.js'
import { useStore } from 'vuex'
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const router = useRouter()
const props = defineProps({
  openId: {
    type: String,
    default: () => ''
  }
})
// 日期切换
const dateTable = reactive([
  { label: '昨天', value: 2 },
  { label: '近7天', value: 7 },
  { label: '近15天', value: 15 },
  { label: '近30天', value: 30 }
])
// 数据概览筛选参数
const dateTabValue = ref(2)
const daterangeArray = ref([])
// 视频列表筛选参数 属于
const dateTabValueOfList = ref(2)
const daterangeArrayOfList = ref([])
// table列表
const tableState = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
// 切换日期 overview 概览 list 列表
const changeDateTab = (item, type = 'overview') => {
  const nowTime = new Date()
  const oldTime = new Date()
  nowTime.setTime(new Date() - 1 * 24 * 3600 * 1000)
  oldTime.setTime(new Date() - item.value * 24 * 3600 * 1000)
  if (item.value === 2) {
    oldTime.setTime(new Date() - (item.value - 1) * 24 * 3600 * 1000)
    nowTime.setTime(new Date() - (item.value - 1) * 24 * 3600 * 1000)
  }

  if (type === 'overview') {
    dateTabValue.value = item.value
    daterangeArray.value = JSON.parse(
      JSON.stringify([dateFormat(oldTime) + ' 00:00:00', dateFormat(nowTime) + ' 23:59:59'])
    )
    getOverviewData()
  } else {
    dateTabValueOfList.value = item.value
    daterangeArrayOfList.value = JSON.parse(
      JSON.stringify([dateFormat(oldTime) + ' 00:00:00', dateFormat(nowTime) + ' 23:59:59'])
    )
    getList()
  }
}
changeDateTab({ label: '昨天', value: 2 }, 'overview')
changeDateTab({ label: '昨天', value: 2 }, 'list')
// 时间选择器切换
function changDaterange(type = 'overview') {
  let dateTabTemp = null
  let daterangeArrayTemp = type === 'overview' ? daterangeArray.value : daterangeArrayOfList.value
  const nowTime = new Date()
  const oldTime1 = new Date()
  const oldTime2 = new Date()
  const oldTime3 = new Date()
  const oldTime4 = new Date()
  nowTime.setTime(new Date() - 1 * 24 * 60 * 60 * 1000)
  oldTime1.setTime(new Date() - 1 * 24 * 60 * 60 * 1000)
  oldTime2.setTime(nowTime - 6 * 24 * 60 * 60 * 1000)
  oldTime3.setTime(nowTime - 14 * 24 * 60 * 60 * 1000)
  oldTime4.setTime(nowTime - 29 * 24 * 60 * 60 * 1000)
  if (daterangeArrayTemp) {
    if (dateFormat(daterangeArrayTemp[1]) === dateFormat(nowTime)) {
      if (dateFormat(daterangeArrayTemp[0]) === dateFormat(oldTime2)) {
        dateTabTemp = 7
      } else if (dateFormat(daterangeArrayTemp[0]) === dateFormat(oldTime3)) {
        dateTabTemp = 15
      } else if (dateFormat(daterangeArrayTemp[0]) === dateFormat(oldTime4)) {
        dateTabTemp = 30
      } else if (dateFormat(daterangeArrayTemp[0]) === dateFormat(oldTime1)) {
        dateTabTemp = 2
      } else {
        dateTabTemp = null
      }
    } else {
      dateTabTemp = null
    }
  }
  const endDateTime = new Date(dateFormat(daterangeArrayTemp[1]) + ' 00:00:00').getTime()
  const startDateTime = new Date(dateFormat(daterangeArrayTemp[0]) + ' 00:00:00').getTime()
  const three = 89 * 24 * 3600 * 1000
  const threeMonths = endDateTime - three
  if (startDateTime < threeMonths) {
    message.error('最多只能选择3个月')
    daterangeArrayTemp = [
      dateFormat(daterangeArrayTemp[0]) + ' 00:00:00',
      dateFormat(
        new Date(
          new Date().setTime(
            new Date(dateFormat(daterangeArrayTemp[0]) + ' 00:00:00').getTime() +
              89 * 24 * 60 * 60 * 1000
          )
        )
      ) + ' 23:59:59'
    ]
  } else {
    daterangeArrayTemp = [
      dateFormat(daterangeArrayTemp[0]) + ' 00:00:00',
      dateFormat(daterangeArrayTemp[1]) + ' 23:59:59'
    ]
  }
  if (type === 'overview') {
    dateTabValue.value = dateTabTemp
    daterangeArray.value = daterangeArrayTemp
    getOverviewData()
  } else {
    dateTabValueOfList.value = dateTabTemp
    daterangeArrayOfList.value = daterangeArrayTemp
    getList()
  }
}

const overviewList = reactive([
  { name: '新增视频数', value: null, show: true },
  { name: '新增带货视频', value: null, show: false },
  { name: '新增销售额', value: null, show: brandViewMode.value === 1 },
  { name: '新增播放', value: null, show: true },
  { name: '新增点赞', value: null, show: true },
  { name: '新增评论', value: null, show: true },
  { name: '新增分享', value: null, show: true }
])
// 获取数据概览
function getOverviewData() {
  api
    .dyUserVideoData({
      endTime: daterangeArray.value[1],
      openId: props.openId,
      searchType:
        dateTabValue.value === 2
          ? 0
          : dateTabValue.value === 7
          ? 1
          : dateTabValue.value === 15
          ? 2
          : dateTabValue.value === 30
          ? 3
          : null,
      startTime: daterangeArray.value[0]
    })
    .then(res => {
      if (res.code === 0) {
        const data = res.data
        overviewList[0].value = data.videoCount || 0
        overviewList[1].value = data.saleCount || 0
        overviewList[2].value = data.saleAmount / 100 || 0
        overviewList[3].value = data.playCount || 0
        overviewList[4].value = data.diggCount || 0
        overviewList[5].value = data.commentCount || 0
        overviewList[6].value = data.shareCount || 0
      }
    })
    .catch(() => {})
}
function getList() {
  tableState.loading = true
  listVideo({
    dyOpenId: props.openId,
    videoStatus: 1,
    pageNo: tableState.page.index,
    pageSize: tableState.page.size,
    platform: 1, // 默认抖音平台
    sortType: 'DESC:create_time',
    minCreateTime: new Date(daterangeArrayOfList.value[0]).getTime(),
    maxCreateTime: new Date(daterangeArrayOfList.value[1]).getTime()
  })
    .then(res => {
      if (res.code === 0) {
        tableState.listData = res.data.records || []
        tableState.page.total = res.data.total || 0
      } else {
        tableState.listData = []
        tableState.page.total = 0
      }
      tableState.loading = false
    })
    .catch(() => {
      tableState.listData = []
      tableState.page.total = 0
      tableState.loading = false
    })
}
// 获取视频列表
function resetForm() {
  tableState.loading = true
  getList()
}
// 前往详情
const toDetail = throttle(e => {
  router.push({
    path: '/content_center/content_manage/manage_detail',
    query: {
      itemId: e.itemId
    }
  })
}, 300)
const previewDialog = ref({
  show: false,
  info: {}
}) // 图文的预览
const message = inject('$message')
// 播放视频
const playVideo = throttle(e => {
  // 小红书并且是图文的话，就打开图文详情
  if (e.mediaType === 2 && e.platform === 3) {
    previewDialog.value.info = e
    previewDialog.value.show = true
    return
  }
  if (e.shareUrl) {
    window.open(e.shareUrl, '_blank')
  } else {
    message.warning('暂未找到相关地址')
  }
}, 300)
onMounted(() => {
  getOverviewData()
  resetForm()
})
</script>
<style lang="scss" scoped>
@import './index.scss';
@import '../../../components/css/qrcode.scss';
.row_overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-wrap: break-word;
}
</style>
