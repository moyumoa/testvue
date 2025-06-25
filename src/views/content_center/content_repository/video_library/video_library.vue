<template>
  <div class="video_library_warp">
    <div class="tab_box">
      <el-tabs v-model="chooseTabPlatform" @tab-click="changeTabPlatform">
        <el-tab-pane :name="tab.key" v-for="tab in tabListPlatform" :key="tab.key">
          <template #label>
            <span
              class="custom-tabs-label"
              :class="{ 'custom-tabs-label-no-padding': !tab.platform }"
            >
              <div
                v-if="tab.platform"
                :class="`xm_platformIcon_${tab.platform}`"
                style="left: 0"
              ></div>
              <span>{{ tab.label }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="video_library">
      <!-- 筛选条件 -->
      <xm_search
        :searchComponents="searchComponents"
        @getData="searchByGetData"
        :useOwnReset="true"
        @reset="resetSearch"
        ref="xmSearchRef"
      >
        <template #searchBtn>
          <el-button @click.stop="showSubWordsDialog">订阅词管理</el-button>
        </template>
      </xm_search>
      <!-- 列表 -->
      <div class="video_box" v-loading="uploadLoading">
        <div class="video_btn">
          <uploadVideo
            :showLoading="false"
            :maxSize="204800"
            :index="0"
            :useSelfTip="true"
            :disM4v="true"
            v-model:uploadLoading="uploadLoading"
            @success="uploadVideoSuccess"
            :acceptTypeList="['video/mp4', 'video/quicktime']"
          >
            <el-button :loading="uploadLoading" type="primary">上传灵感</el-button>
          </uploadVideo>
          <!-- <el-button style="margin-left: 18px" type="primary" @click="showDialogFun">
          链接载入
        </el-button> -->
          <div class="tip_right">
            <el-tooltip placement="top">
              <template #content>
                <p style="max-width: 260px">
                  灵感是系统自动从平台上汇集的一些具有低粉爆款、高完播率等特征的视频。每日10点左右更新。
                </p>
              </template>
              <div class="tip_tip">
                灵感是什么
                <img src="@/assets/images/operate/tip_line.png" />
              </div>
            </el-tooltip>
          </div>
        </div>
        <div class="video_list" v-loading="tableForm.loading">
          <template v-if="tableForm.listData && tableForm.listData.length > 0">
            <div
              class="all_video"
              :infinite-scroll-delay="1000"
              v-infinite-scroll="loadFun"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="
                pageOnHide || tableForm.listData.length >= tableForm.page.total
              "
            >
              <div
                class="one_video"
                v-for="item in tableForm.listData"
                :key="item.id"
                :style="{
                  width: `${oneWidth}px`,
                  height: `calc(${oneWidth}px * 1.43)`
                }"
                @click="toDetail(item)"
              >
                <div class="one_box">
                  <img class="video_cover" :src="item.videoCoverUrl || defaultCover" alt="" />
                  <div class="video_back">
                    <!-- 隐藏/可见+删除 按钮-->
                    <div class="video_btn">
                      <div class="visible_btn" @click.stop="visibleFun(item)">
                        {{ item.videoStatus == 1 ? '已显示' : '已隐藏' }}
                        <img
                          v-if="item.videoStatus == 1"
                          class="icon_time"
                          src="https://tagvv-1256030678.file.myqcloud.com/20230505xh0qs.png"
                          alt=""
                        />
                        <img
                          v-else
                          class="icon_time"
                          src="https://tagvv-1256030678.file.myqcloud.com/202305052jygo.png"
                          alt=""
                        />
                      </div>
                      <div class="del_btn" @click.stop="delFun(item)">
                        <img
                          class="icon_del"
                          src="https://tagvv-1256030678.file.myqcloud.com/202212068fuu7.png"
                          alt=""
                        />
                      </div>
                    </div>
                    <div class="video_info">
                      <div class="info_top" v-if="item.subscribeWords" style="margin-bottom: 4px">
                        <!-- 订阅词标签 -->
                        <div class="tag_box" v-for="(a, b) in item.subscribeWords" :key="b">
                          {{ a }}
                        </div>
                      </div>
                      <div class="info_top">
                        <div class="platform_warp" v-if="item.platform">
                          <div
                            :class="`xm_platformIcon_${item.platform}`"
                            style="left: 4px; bottom: 3px; width: 16px; height: 16px"
                          ></div>
                          {{ `${PLATFORM.getCN(item.platform) || '抖音'}灵感` }}
                        </div>
                        <!-- 视频灵感显示时长 -->
                        <div class="time_box" v-if="item.mediaType == 4">
                          <img
                            class="icon_time"
                            src="https://tagvv-1256030678.file.myqcloud.com/20221206hh7q6.png"
                            alt=""
                          />
                          {{ getTimeFun(item.videoDuration) }}
                        </div>
                        <!-- 图文灵感显示张数 -->
                        <div class="imgText_box" v-else>
                          <img src="https://tagvv-1256030678.file.myqcloud.com/20250425uexgo.png" />
                          {{ item.pictures ? JSON.parse(item.pictures).length : 0 }}
                        </div>
                      </div>

                      <div
                        class="title_box line-hidden2"
                        v-if="
                          item.mediaType == 4
                            ? item.videoTitle || ''
                            : item.videoTitle || item.videoCopywriting || ''
                        "
                      >
                        {{
                          item.mediaType == 4
                            ? item.videoTitle || ''
                            : item.videoTitle || item.videoCopywriting || ''
                        }}
                      </div>
                    </div>
                  </div>
                  <!-- <div class="video_icon" v-if="item.brandId == '0'">
                  <img src="https://tagvv-1256030678.file.myqcloud.com/202306088g390.png" alt="" />
                </div> -->
                </div>
              </div>
            </div>
            <div class="loading_library">
              <img
                src="/public/loading.gif"
                v-if="tableForm.loading && tableForm.page.index > 1"
                alt=""
              />
              {{
                tableForm.loading
                  ? tableForm.page.index === 1
                    ? ''
                    : '加载中...'
                  : tableForm.listData.length >= tableForm.page.total
                  ? '已经到底了~'
                  : '上拉加载更多~'
              }}
            </div>
          </template>
          <div v-else class="xm_noneData">
            <img src="@/assets/images/content_center/no_activity.png" alt />
            暂无数据
          </div>
        </div>
      </div>
      <linkDOM v-if="linkDialog.show" :addDialog="linkDialog" @showErr="showErrFun" />
      <errDOM v-if="errDialog.show" :addDialog="errDialog" />
      <!-- 订阅次弹窗 -->
      <subWordsDOM
        v-if="subWordsDialog.show"
        :subWordsDialog="subWordsDialog"
        @updateFun="searchByGetData"
      />
    </div>
  </div>
</template>
<script setup>
import subWordsDOM from './components/subWords_dialog.vue'
import errDOM from './components/err_dialog.vue'
import linkDOM from './components/link_dialog.vue'
import uploadVideo from '@/views/market/miniprogram_operation/components/upload_video.vue'
import { ElMessageBox } from 'element-plus'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import {
  // findChildrenByKey,
  inspirationVideoPage,
  saveInspirationVideo
} from '@/api/content_center/video_library.js'
import { getQuery } from '@/utils/get_query.js'
import { throttle, getCWidth } from '@/utils/tools.js'
import { PLATFORM } from '@/utils/dictionary/company.js'
import { getTimeFun } from '@/views/content_center/content_repository/video_library/js/index.js'
// import { useStore } from 'vuex'

// const store = useStore()
// 基础版只显示矩阵号等级规则，其余版本显示完整
// const systemVersion = computed(() => store.state.user.systemVersion)

const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')

const searchComponents = ref([
  {
    type: 'select',
    label: '灵感来源',
    placeholder: '请选择灵感来源',
    filed: 'inspirationSource',
    val: -1,
    defaultVal: -1,
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '企业订阅',
        value: 1
      },
      {
        label: '员工订阅',
        value: 2
      },
      {
        label: '本地上传',
        value: 3
      }
    ]
  },
  {
    type: 'input',
    label: '灵感标题',
    val: '',
    placeholder: '请输入灵感标题',
    filed: 'videoTitle'
  },
  // {
  //   type: 'select',
  //   label: '内容定位',
  //   placeholder: '请选择内容定位',
  //   filed: 'contentId',
  //   val: null,
  //   defaultVal: null,
  //   selectDefultName: ['id', 'name'],
  //   selects: []
  // },
  {
    type: 'select',
    label: '灵感状态',
    placeholder: '请选择灵感状态',
    filed: 'videoStatus',
    val: -1,
    defaultVal: -1,
    selectDefultName: ['id', 'name'],
    selects: [
      {
        name: '全部',
        id: -1
      },
      {
        id: 1,
        name: '可见'
      },
      {
        id: 0,
        name: '隐藏'
      }
    ]
  },
  {
    type: 'input',
    label: '订阅词',
    val: '',
    placeholder: '请输入订阅词搜索',
    filed: 'subscribeWord'
  }
])
// 表格的查询条件
const tableForm = reactive({
  loading: true,
  listData: [],
  newListData: [],
  page: {
    index: 1,
    size: 70,
    total: 0
  }
})

// 获取内容定位和类别
// --根据key去查询对应的数据 type类型:trade行业 category类别 content内容定位 label标签 platform来源平台

// function getKey(key, type) {
//   findChildrenByKey({
//     brandId: 0,
//     key: key
//   }).then(res => {
//     if (res.code === 0) {
//       const list = res.data || []
//       switch (type) {
//         case 'trade':
//           // 现在只有泛家居一种，所以直接获取类型了
//           if (res.data && res.data.length > 0) {
//             getKey(res.data[0].key, 'category')
//           }
//           break
//         case 'category':
//           searchComponents.value[0].selects = list
//           break
//         case 'content':
//           searchComponents.value[2].selects = list
//           break
//       }
//     }
//   })
// }
const srcollTop = ref(null)
// 清空查询参数
function clearSearchQuery() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 70
}
// 重置
function resetSearch() {
  clearSearchQuery()
  getList()
}
const tabListPlatform = ref([
  {
    label: '全部',
    key: 'all',
    platform: null
  },
  {
    label: '抖音',
    key: 'dy',
    platform: 1
  },
  {
    label: '小红书',
    key: 'xhs',
    platform: 3
  },
  {
    label: '快手',
    key: 'ks',
    platform: 4
  }
])
const chooseTabPlatform = ref('all') // 选中的平台

function changeTabPlatform() {
  const hasType = searchComponents.value.findIndex(x => x.filed === 'mediaType')
  console.log('切换平台', chooseTabPlatform.value, hasType)
  if (chooseTabPlatform.value === 'xhs') {
    // 如果是小红书添加灵感类型的筛选项
    if (hasType === -1) {
      searchComponents.value.splice(3, 0, {
        type: 'select',
        label: '灵感类型',
        placeholder: '请选择灵感类型',
        filed: 'mediaType',
        val: -1,
        defaultVal: -1,
        selectDefultName: ['id', 'name'],
        selects: [
          {
            name: '全部',
            id: -1
          },
          {
            id: 4,
            name: '视频灵感'
          },
          {
            id: 2,
            name: '图文灵感'
          }
        ]
      })
    }
  } else {
    // 否则 删除灵感类型的筛选项
    if (hasType > -1) {
      searchComponents.value.splice(hasType, 1)
    }
  }
  resetSearch()
}

clearSearchQuery()
const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  pageOnHide.value = false
  // getKey('content', 'content')
  console.log("menuOfKeepAlive('judge')", menuOfKeepAlive('judge'))
  if (menuOfKeepAlive('judge')) {
    chooseTabPlatform.value = 'all'
    if (xmSearchRef.value) {
      xmSearchRef.value?.reset()
    } else {
      resetSearch()
    }
    menuOfKeepAlive('reset')
  } else {
    tableForm.loading = true
    searchList()
    if (srcollTop.value) {
      const el = document.querySelector('.el-main')
      el.scrollTop = srcollTop.value
    }
  }
  nextTick(() => {
    srcollTop.value = null
  })
})
// 初始化查询
function searchByGetData() {
  tableForm.page.size = 70
  searchList()
}
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
function getList() {
  const data = getQuery(searchComponents.value)
  if (data.inspirationSource === 1) {
    data.source = 1
  } else if (data.inspirationSource === 2) {
    data.source = 2
  } else if (data.inspirationSource === 3) {
    data.uploadType = 1
  }

  data.orderSetting = 'DESC:gmt_update'
  data.pageSize = tableForm.page.size
  data.pageNo = tableForm.page.index
  data.platform =
    (tabListPlatform.value.find(x => x.key === chooseTabPlatform.value) || {}).platform || null
  inspirationVideoPage(data)
    .then(res => {
      if (res.code === 0) {
        if (tableForm.page.index === 1) {
          tableForm.listData = res.data.records || []
          tableForm.page.total = res.data.total || 0
        } else {
          tableForm.newListData = res.data.records || []
          tableForm.listData = tableForm.listData.concat(tableForm.newListData)
        }
      } else {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
          tableForm.page.total = 0
        }
      }
      tableForm.loading = false
    })
    .catch(() => {
      if (tableForm.page.index === 1) {
        tableForm.listData = []
        tableForm.page.total = 0
      }
      tableForm.loading = false
    })
}
const loadFun = throttle(function () {
  tableForm.loading = true
  tableForm.page.index++
  getList()
}, 1000)

const cLen = ref(7)
const listWidth = ref()
const oneWidth = ref(220)
function getWidth() {
  listWidth.value = getCWidth() - 32 - 30 - 7
  init()
}
getWidth()
function init() {
  cLen.value = Math.round((getCWidth() - 32 - 30) / 206)
  oneWidth.value = Math.floor(listWidth.value / cLen.value)
}
onMounted(() => {
  sessionStorage.removeItem('library_video')
  sessionStorage.removeItem('library_link')
  window.onresize = () => {
    getWidth()
  }
})
onUnmounted(() => {
  window.onresize = null
})
const pageOnHide = ref(false)
onBeforeRouteLeave((to, from) => {
  pageOnHide.value = true
  // 要记录滚动距离的页面地址，可以写完整，也可以写部分路径。

  const leavePage = ['/content_center/inspiration_library/', '/sumwhy_video/inspiration_library/']

  if (leavePage.findIndex(x => to.path.indexOf(x) > -1) > -1) {
    // 当前加载了多少条
    tableForm.page.size =
      tableForm.listData.length > tableForm.page.size
        ? tableForm.listData.length
        : tableForm.page.size
    // 滚动条的滚动距离
    srcollTop.value =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      document.querySelector('.el-main').scrollTop
  } else {
    tableForm.page.size = 70
    srcollTop.value = 0
  }
})
// 查看详情
const router = useRouter()
const toDetail = throttle(function (e) {
  console.log('查看详情', e.uploadType)
  if (e.uploadType === 1) {
    const path = '/sumwhy_video/inspiration_library/brandVideo_detail'
    router.push({
      path: path,
      query: {
        id: e.id
      }
    })
  } else {
    const path = '/sumwhy_video/inspiration_library/video_detail'
    router.push({
      path: path,
      query: {
        id: e.id
      }
    })
  }
}, 700)

// 本地上传
const uploadLoading = ref(false)
function uploadVideoSuccess(data) {
  sessionStorage.setItem('library_video', data.url)
  const path = '/sumwhy_video/inspiration_library/brandVideo_detail'
  // systemVersion.value === 1 || systemVersion.value === 4 || systemVersion.value === 3
  //   ? '/sumwhy_video/inspiration_library/brandVideo_detail'
  //   : '/content_center/inspiration_library/brandVideo_detail'
  router.push({
    path: path
  })
}

// 链接载入-显示弹窗
const linkDialog = reactive({
  show: false
})
// const showDialogFun = throttle(function () {
//   linkDialog.show = true
// }, 500)
const errDialog = reactive({
  show: false,
  downloadUrl: ''
})
function showErrFun(url) {
  errDialog.downloadUrl = url
  errDialog.show = true
}
const message = inject('$message')

// 隐藏/可见
const visibleFun = throttle(function (e) {
  saveInspirationVideo({
    brandId: e.brandId,
    accountFansCount: e.accountFansCount,
    diggCount: e.diggCount,
    commentCount: e.commentCount,
    shareCount: e.shareCount,
    id: e.id,
    videoStatus: e.videoStatus === 1 ? 0 : 1
  }).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      resetSearch()
    }
  })
}, 700)
// 显示删除的弹窗
const delFun = throttle(function (e) {
  ElMessageBox.confirm('是否确定删除该灵感？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: '',
    customClass: 'rule_setting_dialog hide_footer_line'
  })
    .then(() => {
      saveInspirationVideo({
        brandId: e.brandId,
        id: e.id,
        isDel: 1
      })
        .then(res => {
          if (res.code === 0) {
            message.success('删除成功')
            resetSearch()
          }
        })
        .catch(() => {})
    })
    .catch(() => {})
}, 700)

// 订阅词管理 begin--
const subWordsDialog = reactive({
  show: false
})
const showSubWordsDialog = throttle(() => {
  subWordsDialog.show = true
}, 500)
// 订阅词管理 end--
</script>
<style lang="scss" scoped>
.video_library_warp {
  .tab_box {
    background-color: #ffffff;
    height: 52px;
    border-radius: 4px;
    padding: 18px 24px 0;

    //margin-bottom
    :deep(.el-tabs__nav-wrap) {
      &::after {
        background-color: #ffffff;
      }

      .el-tabs__item {
        color: #909399;
        font-weight: 400;
        font-family: PingFangSC-Regular, PingFang SC;
      }

      .is-active {
        font-weight: 500;
        color: #303133;
      }
      .custom-tabs-label {
        display: inline-block;
        position: relative;
        padding-left: 24px;
      }
      .custom-tabs-label-no-padding {
        padding-left: 0;
      }
    }
  }
}
.video_library {
  margin-top: 16px;
}
div {
  box-sizing: border-box;
}

.loading_library {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 15px;

  img {
    height: 25px;
    margin-right: 4px;
  }
}

.video_box {
  margin-top: 16px;
  width: 100%;
  background: #ffffff;
  border-radius: 4px;
  padding: 24px 6px 24px 24px;
}
.video_btn {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  // padding-right: 24px;
  .tip_tip {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    img {
      width: 16px;
      height: 16px;
      object-fit: contain;
      display: flex;
      margin-left: 4px;
    }
  }
}
.all_video {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
}

.one_video {
  padding: 0 16px 16px 0;
  cursor: pointer;
  .one_box {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    position: relative;

    .video_cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }

    .video_back {
      border-radius: 4px;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px;
      .video_btn {
        opacity: 0;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;

        .visible_btn {
          font-size: 14px;
          font-weight: 400;
          color: #ffffff;
          line-height: 20px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 16px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          .icon_time {
            margin-left: 4px;
            width: 16px;
            height: 16px;
            object-fit: contain;
            display: flex;
          }
        }

        .del_btn {
          margin-left: 12px;
          width: 32px;
          height: 32px;
          border-radius: 100%;
          background: rgba(0, 0, 0, 0.4);

          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;

          .icon_del {
            object-fit: contain;
            width: 16px;
            height: 16px;
          }
        }
      }
      .info_top {
        width: 100%;

        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }
      .imgText_box {
        margin-right: 8px;
        padding: 2px 4px 2px 6px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 4px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        font-size: 14px;
        color: #ffffff;
        line-height: 18px;

        img {
          width: 12px;
          height: 12px;
          display: flex;
          margin-right: 4px;
        }
      }
      .tag_box {
        font-weight: 400;
        font-size: 12px;
        color: #ffffff;
        line-height: 18px;

        padding: 2px 4px;
        background: rgba(54, 79, 205, 0.6);
        border-radius: 4px;
        max-width: 100%;
        word-break: break-all;
      }
      .time_box + .time_box {
        margin-left: 8px;
      }
      .time_box {
        background: rgba(0, 0, 0, 0.4);
        border-radius: 4px;
        padding: 2px 4px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
        font-weight: 400;
        color: #ffffff;
        line-height: 18px;

        .icon_time {
          width: 16px;
          height: 16px;
          object-fit: contain;
          margin-right: 1px;
        }
      }
      .platform_warp {
        border-radius: 4px;
        padding: 2px 4px 2px 22px;
        position: relative;
        background: rgba(0, 0, 0, 0.4);
        margin-right: 8px;
        font-size: 12px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        color: #ffffff;
        line-height: 18px;
        white-space: nowrap;
      }
      .info_top + .title_box {
        margin-top: 8px;
      }
      .title_box {
        width: 100%;

        font-size: 14px;
        font-weight: 400;
        color: #ffffff;
        line-height: 20px;
      }
    }
    .video_back:hover {
      .video_btn {
        opacity: 1;
      }
    }
    .video_icon {
      position: absolute;
      left: 0;
      top: 0;
      img {
        width: 52px;
        height: 52px;
        object-fit: contain;
        display: flex;
      }
    }
  }
}
</style>
