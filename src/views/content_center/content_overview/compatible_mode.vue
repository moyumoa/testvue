<template>
  <!-- 兼容模式的首页  -->
  <div class="content_page content_overview">
    <!-- 数据来源的切换 快手号需求产品说删除 -->
    <div class="platform_box" v-if="false">
      数据来源：
      <el-select v-model="selectPlatformVal" class="m-2" placeholder=" " @change="platformChange">
        <el-option
          v-for="item in platform"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <!-- 数据总览+2个文档 -->
    <div class="page_center">
      <!-- 数据总览 -->
      <div class="center_left data_screening" style="padding-top: 16px">
        <div class="title_box" style="margin-bottom: 16px">
          <div class="title">
            <div
              style="
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                margin: 3px 0;
              "
            >
              数据概览
              <span style="font-size: 14px; font-weight: 400; margin-left: 6px; color: #909399">
                昨日数据
              </span>
              <el-tooltip class="item" effect="dark" placement="right-start">
                <template #content>
                  <div class="tooltip_wrap">
                    每日02:00左右更新前一日矩阵内容统计数据
                    <br />
                    （注：数据为系统每日运算出的增量数据，可能与官方数据有细微出入，为正常现象。）
                  </div>
                </template>
                <img
                  src="@/assets/images/content_center/tip_line.png"
                  style="width: 14px; height: 14px"
                  alt
                />
              </el-tooltip>
            </div>
            <div class="title_right">
              <span style="font-size: 14px; font-weight: 400; margin-left: 6px; color: #909399">
                更新时间：{{ tabForm.time }}
              </span>
              <div class="large_screen">
                <div class="screen_btn" @click="toScreen('current_live')" v-if="showLiveScreen">
                  <screen-svg></screen-svg>
                  实时直播大屏
                </div>
                <div class="screen_btn" @click="toScreen('home')" v-if="showRealScreen">
                  <screen-svg></screen-svg>
                  综合数据大屏
                </div>
              </div>
            </div>

            <!-- <el-tooltip effect="dark" placement="top">
              <template #content>昨日关键数据：{{ tabForm.time }}更新</template>

              <img src="@/assets/images/content_center/tip_gray.png" alt="" />
            </el-tooltip>-->
          </div>
        </div>
        <div class="data_box">
          <template v-for="(item, index) in tabForm.chooseData" :key="index">
            <div :class="{ one_data: true, one_data_3: brandViewMode === 2 }" v-if="item.show">
              <div class="data1">{{ item.title }}</div>
              <div class="data2" v-if="item.isJE">
                {{ tabForm.loading ? '--' : changeTwoDecimal(item.num1 || 0, true) }}
              </div>
              <div class="data2" v-else>
                {{ tabForm.loading ? '--' : wanSliceFormat(item.num1 || 0) }}
              </div>
              <div
                :class="{
                  data3: true,
                  green_text: !tabForm.loading && item.num2 < 0,
                  red_text: !tabForm.loading && item.num2 >= 0 && item.num2 != null
                }"
              >
                <span class="data3_mark">较前1日</span>
                <span>{{ !tabForm.loading && item.num2 > 0 ? '+' : '' }}</span>
                <span v-if="item.isJE">
                  {{
                    tabForm.loading
                      ? '--'
                      : item.num2 == null
                      ? '--'
                      : changeTwoDecimal(item.num2 || 0, true)
                  }}
                </span>
                <span v-else>
                  {{
                    tabForm.loading
                      ? '--'
                      : item.num2 == null
                      ? '--'
                      : wanSliceFormat(item.num2 || 0)
                  }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="center_right" v-if="false">
        <!-- 文章 -->
        <div class="one_right" v-for="(item, index) in rightContent" :key="index">
          <div class="title_box">
            <div class="title">{{ item.name }}</div>
            <!-- <div class="mark" @click="toDetail(item.link)">
              查看更多
              <img src="@/assets/images/content_center/right_gray.svg" alt="" />
            </div>-->
          </div>
          <!-- 内容 -->
          <div class="right_content" v-loading="item.loading">
            <template v-if="item.list.length > 0">
              <div
                class="one_line"
                :style="item.name == '内容周报' ? 'cursor:default' : ''"
                v-for="(x, i) in item.list"
                :key="i"
                @click="toContent(x.url, item.name)"
              >
                {{ x.title || x.content }}
              </div>
            </template>
            <template v-if="item.list.length == 0 && !item.loading">
              <div class="no_line">暂无数据</div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <!-- 3个排行榜 -->
    <div :class="{ ranking_box: true, ranking_box_2: brandViewMode === 2 }">
      <rankingList type="videos" ref="rankingListVideo"></rankingList>
      <rankingList type="lives" ref="rankingListLives"></rankingList>
      <rankingList type="goods" ref="rankingListGoods" v-if="brandViewMode === 1"></rankingList>
    </div>
    <!-- 折线图 -->
    <echartList ref="echartListRef"></echartList>
    <!-- 快捷入口 -->
    <div class="quick_entrance" v-if="false">
      <div class="title" style="padding-left: 12px">快捷入口</div>
      <div class="entrance_box">
        <template v-for="(item, index) in entranceList" :key="index">
          <div
            v-if="item.show"
            class="one_entrance"
            @click="toDetail(item.link, item.newOpen, item.check)"
          >
            <img v-if="index == 0" src="@/assets/images/content_center/overview/1.png" alt />
            <img v-if="index == 1" src="@/assets/images/content_center/overview/2.png" alt />
            <img v-if="index == 2" src="@/assets/images/content_center/overview/3.png" alt />
            <img v-if="index == 3" src="@/assets/images/content_center/overview/4.png" alt />
            <img v-if="index == 4" src="@/assets/images/content_center/overview/5.png" alt />
            <img v-if="index == 5" src="@/assets/images/content_center/overview/6.png" alt />
            <img v-if="index == 6" src="@/assets/images/content_center/overview/7.png" alt />
            <div class="entrance_content">
              <div class="content_t1">{{ item.title }}</div>
              <div class="content_t2">{{ item.mark }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup>
import screenSvg from '@/views/main/choice_system/screen_svg.vue'
import echartList from './components/echart_list.vue'
import { useRouter } from 'vue-router'
import { wanSliceFormat, throttle, changeTwoDecimal } from '@/utils/tools.js'
import rankingList from './components/ranking_list.vue'
import { getTabData } from './model/get_data'
import { getContent } from './model/get_content'
import { useStore } from 'vuex'
defineComponent(echartList)
const message = inject('$message')
const router = useRouter()
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const { tabForm, getDataFun } = getTabData(brandViewMode)
const { rightContent } = getContent()

// 是否显示实时大屏数据
const showRealScreen = ref(false)
// 是否显示直播大屏按钮
const showLiveScreen = ref(false)
const selectPlatformVal = ref(null) // 初始化选择平台，并未赋值store里得值（每次进入页面默认全部），这样就要在离开页面时初始化store
const rankingListVideo = ref() // 用来调用子组件方法
const rankingListLives = ref()
const rankingListGoods = ref()
const echartListRef = ref()

const platform = [
  {
    value: null,
    label: '全部平台'
  },
  {
    value: 1,
    label: '抖音'
  },
  {
    value: 2,
    label: '视频号'
  },
  {
    value: 3,
    label: '小红书'
  }
]
function platformChange(val) {
  console.log('当前选中val', val)
  // 存在store里
  store.commit('content_center/setPlatform', val)
  getDataFun(val)
  // 切换时获取数据
  rankingListVideo.value.getEveryDataFun() // 视频排行榜
  rankingListLives.value.getEveryDataFun() // 直播排行榜
  if (brandViewMode.value === 1) {
    rankingListGoods.value.getEveryDataFun() // 矩阵带货榜
  }
  echartListRef.value.getAllChart() // 折线图
}

// 快捷入口--
const entranceList = ref([
  {
    img: 'https://tagvv-1256030678.file.myqcloud.com/img/202112071824438ab6138c67.png',
    title: '内容中心',
    mark: '视频与直播数据全量分析，为品牌提供内容精细化运营能力',
    link: '/content_center/content_manage',
    check: false,
    show: true
  },
  {
    img: 'https://tagvv-1256030678.file.myqcloud.com/img/202112071824438ab6138c67.png',
    title: '内容矩阵',
    mark: '企业内容标签化分类管理，赋能多终端调用分享',
    link: '/content_center/content_matrix',
    check: false,
    show: true
  },
  {
    img: 'https://tagvv-1256030678.file.myqcloud.com/img/202112071824438ab6138c67.png',
    title: '店铺矩阵',
    mark: '店铺快速授权，商品便捷分组，快速提升店铺商品管理能力',
    link: '/content_center/store_management',
    check: false,
    show: brandViewMode.value === 1
  },
  {
    img: 'https://tagvv-1256030678.file.myqcloud.com/img/202112071824438ab6138c67.png',
    title: '效果中心',
    mark: '高效管理订单与留资线索，提高订单管理与线索追踪能力',
    link: '/content_center/order_manage',
    check: false,
    show: true
  },
  {
    img: 'https://tagvv-1256030678.file.myqcloud.com/img/202112071824438ab6138c67.png',
    title: '内容质检',
    mark: '机器智能审核内容，指数级提高审核效率，规避违规风险',
    link: '/content_center/video_inspection',
    check: false,
    show: true
  },
  {
    img: 'https://tagvv-1256030678.file.myqcloud.com/img/202112071824438ab6138c67.png',
    title: '数据分析',
    mark: '数据大屏沉浸式数据分析体验，多维度检测，为效果负责',
    link: '',
    newOpen: true,
    check: false,
    show: true
  },
  {
    img: 'https://tagvv-1256030678.file.myqcloud.com/img/202112071824438ab6138c67.png',
    title: '内容工具',
    mark: '自动监控直播违规情况并推送，助力品牌直播团队高效复盘',
    link: '/content_center/live_monitor',
    check: false,
    show: brandViewMode.value === 2
  }
])
// 获取菜单--该文件不用了
// onMounted(() => {
//   const allMenu = sessionStorage.getItem('menu')
//   if (allMenu) {
//     const newAllMenu = JSON.parse(allMenu).filter(key => {
//       return key.path === '/content_center'
//     })
//     entranceList.value.forEach(x => {
//       newAllMenu[0].children.forEach(y => {
//         if (x.link.indexOf(y.path) > -1) {
//           x.check = true
//         }
//       })
//     })
//   }
//   const menu = JSON.parse(sessionStorage.getItem('systemModule'))
//   const contentCenter = menu.filter(item => item.scopeUrl === '/content_center')
//   if (contentCenter.length > 0) {
//     const dataAnalysis = contentCenter[0].childrenMenuList.filter(
//       item => item.scopeName === '内容概览'
//     )
//     if (
//       dataAnalysis.length > 0 &&
//       dataAnalysis[0].childrenPermissionList.filter(item => item.scopeName === '综合数据大屏')
//         .length
//     ) {
//       entranceList.value[5].check = true
//       showRealScreen.value = true
//     }
//     if (
//       dataAnalysis.length > 0 &&
//       dataAnalysis[0].childrenPermissionList.filter(item => item.scopeName === '实时直播大屏')
//         .length
//     ) {
//       showLiveScreen.value = true
//     }
//   }
// })

// 数据总览--
getDataFun(null)
// 文章【问答芝士+内容周报】--
// --获取内容周报的数据
// getWeeklyFun()
// 文章-跳转页面
function toContent(e, name) {
  if (name === '内容周报') {
    // message({ type: 'warning', message: '暂无相关内容' })
  } else {
    if (e) {
      window.open(e, '_blank')
    } else {
      message({ type: 'warning', message: '待开发' })
    }
  }
}
// 跳转页面
const toDetail = throttle(function (link, newOpen, check) {
  if (newOpen) {
    if (check) {
      let brandInfo = localStorage.getItem('brandInfo')

      brandInfo = brandInfo ? JSON.parse(brandInfo) : {}
      window.open(
        `${location.origin}/largeview/home?token=${localStorage.getItem('token')}&brandId=${
          brandInfo.brandId || null
        }&brandName=${window.encodeURI(window.encodeURI(brandInfo.brandName))}`
      )
    } else {
      message({ type: 'warning', message: '无查看权限' })
    }
  } else {
    if (link) {
      if (check) {
        router.push(link)
      } else {
        message({ type: 'warning', message: '无查看权限' })
      }
    } else {
      message({ type: 'warning', message: '待开发' })
    }
  }
}, 700)

onBeforeUnmount(() => {
  store.commit('content_center/setPlatform', null)
})

const toScreen = throttle(url => {
  let brandInfo = localStorage.getItem('brandInfo')
  if (!brandInfo) {
    message.info('请先选择品牌')
  }
  brandInfo = JSON.parse(brandInfo)
  // 是否飞书
  // if (localStorage.getItem('isFlyBook') === '1' || localStorage.getItem('isWeChat') === '1') {
  //   location.href = `${location.origin}/largeview/${url}?token=${localStorage.getItem(
  //     'token'
  //   )}&brandId=${brandInfo.brandId}&brandName=${window.encodeURI(
  //     window.encodeURI(brandInfo.brandName)
  //   )}`
  // } else {
  window.open(
    `${location.origin}/largeview/${url}?token=${localStorage.getItem('token')}&brandId=${
      brandInfo.brandId
    }&brandName=${window.encodeURI(window.encodeURI(brandInfo.brandName))}`
  )
  // }
}, 1000)
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';

.content_page {
  position: relative;
  .platform_box {
    position: absolute;
    top: -42px;
    right: 0;
    text-align: end;
    color: #303133;
    width: max-content;
    :deep() .el-select {
      --el-select-border-color-hover: unset;
      --el-select-disabled-border: unset;
      --el-select-font-size: unset;
      --el-select-close-hover-color: unset;
      --el-select-input-color: unset;
      --el-select-multiple-input-color: unset;
      --el-select-input-focus-border-color: unset;
      width: 100px;
      color: #303133;
    }
    :deep() .el-input__inner {
      border: unset;
      outline: unset;
      background-color: #f6f8fa;
      color: #303133;
    }
    :deep().el-icon {
      color: #303133;
    }
  }
  .quick_entrance {
    background: #ffffff;
    border-radius: $content-radius;
    width: 100%;
    padding: 22px 12px 6px;
    .entrance_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      .one_entrance {
        margin: 12px 0;
        cursor: pointer;
        width: 33.33%;
        padding: 12px;
        // box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        @media screen and (max-width: 1400px) {
          width: 50%;
        }
        &:hover {
          background: #f6f8fa;
        }
        img {
          width: 48px;
          height: 48px;
          object-fit: cover;
          margin-right: 12px;
        }
        .entrance_content {
          width: calc(100% - 60px);
          min-height: 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: flex-start;
          .content_t1 {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            line-height: 20px;
          }
          .content_t2 {
            font-size: 12px;
            font-weight: 400;
            color: #909399;
            line-height: 17px;
          }
        }
      }
    }
  }
  .page_center {
    margin-bottom: $content-margin;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    .center_left {
      width: 100%;
    }
    .data_screening {
      padding: 22px 24px;
      background: #ffffff;
      border-radius: $content-radius;
      .title {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .title_right {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
          .large_screen {
            display: flex;
            justify-content: flex-end;
            .screen_btn {
              margin-left: 16px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 134px;
              height: 36px;
              background: rgba(54, 79, 205, 0.05);
              border-radius: 4px;

              font-size: 14px;
              font-weight: 500;
              color: #303133;
              line-height: 20px;
              transition: all 0.3s;
              &:hover {
                background: rgba(54, 79, 205, 0.1);
              }
            }
          }
        }
      }
      .data_box {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        .one_data {
          min-height: 120px;
          background: #f6f8fa;
          width: calc((100% - 36px) / 4);
          padding: 20px 32px;
          margin-bottom: 12px;
          border-radius: 4px;
          &:nth-child(4n + 2) {
            margin-left: 12px;
            margin-right: 12px;
          }
          &:nth-child(4n + 3) {
            margin-right: 12px;
          }
          .data1 {
            font-size: 12px;
            font-weight: 400;
            color: #606266;
            line-height: 17px;
          }
          .data2 {
            margin: 8px 0 12px;
            font-size: 22px;
            color: #303133;
            line-height: 26px;
          }
          .data3 {
            font-size: 12px;
            font-weight: 400;
            color: #303133;
            line-height: 17px;
          }
          .data3_mark {
            font-size: 12px;
            font-weight: 400;
            color: #909399;
            line-height: 17px;
            margin-right: 4px;
          }
          .green_text {
            color: #00c800;
          }
          .red_text {
            color: #ec4019;
          }
        }
        .one_data_3 {
          width: calc((100% - 24px) / 3);

          &:nth-child(4n + 3),
          &:nth-child(4n + 2) {
            margin-right: 0px;
            margin-left: 0px;
          }
          &:nth-child(3n + 2) {
            margin-left: 12px;
            margin-right: 12px;
          }
        }
      }
    }
    .center_right {
      margin-left: $content-margin;
      width: 298px;
      .one_right {
        width: 100%;
        // height: 167px;
        height: 349px;
        padding: 22px 24px;
        background: #ffffff;
        border-radius: $content_radius;
        .right_content {
          margin-top: 20px;
          min-height: 70px;
          height: calc(100% - 49px);
          overflow: hidden;
          .no_line {
            color: #909399;
            min-height: 250px;
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
          }
          .one_line {
            // cursor: pointer;
            font-size: 12px;
            font-weight: 400;
            color: #303133;
            line-height: 17px;
          }
          .one_line + .one_line {
            border-top: 1px solid #e8e8e8;
            margin-top: 14px;
            padding-top: 14px;
          }
        }
      }
      .one_right + .one_right {
        margin-top: $content-margin;
      }
    }
  }

  .ranking_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .ranking_list {
      width: calc((100% - $content-margin * 2) / 3);
      background: #ffffff;
      border-radius: $content-radius;
      padding: 22px 24px 30px;
      margin-bottom: $content-margin;
      &:nth-child(2) {
        margin-left: $content-margin;
        margin-right: $content-margin;
      }
      @media screen and (max-width: 1280px) {
        width: calc((100% - $content-margin) / 2);
        &:nth-child(2) {
          margin-right: 0;
        }
      }
    }
  }
  .ranking_box_2 {
    .ranking_list {
      width: calc((100% - $content-margin) / 2);

      &:nth-child(2) {
        margin-left: $content-margin;
        margin-right: 0;
      }
      @media screen and (max-width: 1280px) {
        width: calc((100% - $content-margin) / 2);
        &:nth-child(2) {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
