<template>
  <div class="videoDetail">
    <div class="detail_left">
      <div class="userInfo_tip">
        <img src="@/assets/images/content_center/video.png" alt />
        <span>视频信息</span>
      </div>
      <div
        v-if="vedioObj.value && vedioObj.value.anchorType && vedioObj.value.anchorType != -1"
        :class="['xm_anchorType_tag', `xm_anchorType${vedioObj.value.anchorType}_tag`]"
      >
        <div :class="`xm_anchorType${vedioObj.value.anchorType}_ICON`"></div>
        {{ contentAnchorType.getEN(vedioObj.value.anchorType) }}
      </div>
      <!-- 账户信息 -->
      <div class="userInfo_box">
        <!-- 头像昵称企业 -->
        <div class="info_top">
          <div class="info_left">
            <div class="info_head" @click="startPlay(vedioObj.value.shareUrl, vedioObj.value)">
              <el-image
                v-if="vedioObj.value && vedioObj.value.cover"
                class="head_img"
                :src="vedioObj.value && vedioObj.value.cover"
                alt
                fit="cover"
              >
                <template #error>
                  <div class="head_img errImg_box"></div>
                </template>
              </el-image>
              <img v-else class="head_img" src="@/assets/images/content_center/cover.jpg" alt />
              <div class="inner" v-if="vedioObj.value && vedioObj.value.isDelete === 1">
                <img src="@/assets/images/content_center/delete.png" alt />
                <span>已删除</span>
              </div>
              <!-- 图集ICON -->
              <!-- :useClick="
                  vedioObj.value &&
                  (vedioObj.value.platform == 3 ||
                    (vedioObj.value.platform != 3 && vedioObj.value.isDelete === 1))
                " -->
              <imgTextTask_ICON
                v-if="vedioObj.value && vedioObj.value.mediaType == 2"
                :info="vedioObj.value"
                :useClick="vedioObj.value && vedioObj.value.platform == 3"
                :class="vedioObj.value && vedioObj.value.isDelete === 1 ? 'xhs_imgText_Icon' : ''"
              />
              <!-- 除图集外所有未删除作品才会有播放按钮 -->
              <div
                class="play_box"
                v-if="
                  vedioObj.value && vedioObj.value.isDelete !== 1 && vedioObj.value.mediaType != 2
                "
              >
                <img src="@/assets/images/content_center/inspection_play.png" alt />
              </div>
            </div>
          </div>
          <div class="info_right">
            <div class="info_name">
              <span class="content_text row_overflow2">
                {{ (vedioObj.value && vedioObj.value.title) || '--' }}
              </span>
              <div class="platform_icon_box" v-if="vedioObj.value && vedioObj.value.platform">
                <div :class="[`xm_platformIcon_${vedioObj.value.platform}`]"></div>
              </div>

              <el-popover
                v-if="vedioObj.value && vedioObj.value.shareUrl && vedioObj.value.platform == 1"
                placement="bottom"
                popper-class="qrcode_popper"
                width="154px"
                trigger="hover"
              >
                <template #reference>
                  <img
                    style="cursor: pointer"
                    src="@/assets/images/content_center/qrcode.png"
                    alt
                  />
                </template>
                <div class="qrcode_box" style="padding: 12px 0; text-align: center">
                  <qrcode-vue
                    :size="126"
                    level="H"
                    :value="vedioObj.value && vedioObj.value.shareUrl"
                  />
                  <div class="qr_mark">
                    <img
                      alt
                      style="width: 20px; height: 20px; margin-top: 10px; vertical-align: sub"
                      src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                    />
                    抖音扫码观看
                  </div>
                </div>
              </el-popover>
            </div>
            <div>
              <div class="info_during">
                视频状态：
                {{
                  vedioObj.value &&
                  (vedioObj.value.dyVideoStatus == 7 || vedioObj.value.dyVideoStatus == 2)
                    ? '隐私视频'
                    : '公开视频'
                }}
              </div>
              <div class="info_time" v-if="vedioObj.value && vedioObj.value.mediaType != 2">
                时长：{{
                  (vedioObj.value &&
                    secondToDate((vedioObj.value.videoDuration / 1000).toFixed(2))) ||
                  '--'
                }}
              </div>
              <div class="info_time">
                发布时间：{{
                  (vedioObj.value &&
                    vedioObj.value.createTime &&
                    formatDate(vedioObj.value.createTime)) ||
                  '--'
                }}
              </div>
              <div class="info_time">
                来源：{{ (vedioObj.value && videoSource(vedioObj.value.source)) || '--' }}
              </div>
              <div class="info_time">
                备注：{{ (vedioObj.value && vedioObj.value.remark) || '--' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 账号数据 -->
      <div class="userData_box">
        <!-- <div class="data_line"></div> -->
        <div class="num_box">
          <div class="one_num">
            <div class="num">
              {{ wanSliceFormat((vedioObj.value && vedioObj.value.playCount) || 0) }}
            </div>
            <div class="title">播放量</div>
          </div>
          <div class="one_num">
            <div class="num">
              {{ wanSliceFormat((vedioObj.value && vedioObj.value.diggCount) || 0) }}
            </div>
            <div class="title">点赞数</div>
          </div>
          <div class="one_num">
            <div class="num">
              {{ wanSliceFormat((vedioObj.value && vedioObj.value.shareCount) || 0) }}
            </div>
            <div class="title">分享数</div>
          </div>
          <div class="one_num">
            <div class="num">
              {{ wanSliceFormat((vedioObj.value && vedioObj.value.commentCount) || 0) }}
            </div>
            <div class="title">评论数</div>
          </div>
          <div class="one_num" v-if="brandViewMode === 1">
            <div class="num">
              ¥{{
                wanSliceFormat(
                  ((vedioObj.value && vedioObj.value.commerceCount / 100) || 0).toFixed(2)
                )
              }}
            </div>
            <div class="title">销售额</div>
          </div>
          <div class="one_num" v-if="brandViewMode === 1">
            <div class="num">
              {{ wanSliceFormat((vedioObj.value && vedioObj.value.saleCount) || 0) }}
            </div>
            <div class="title">销售量</div>
          </div>
          <div class="one_num">
            <div class="num">
              {{
                vedioObj.value && vedioObj.value.clueCount
                  ? parseFloat(vedioObj.value && vedioObj.value.clueCount)
                  : 0
              }}
            </div>
            <div class="title">线索数</div>
          </div>
          <div class="one_num" v-if="vedioObj.value && vedioObj.value.cartExposureTimes">
            <div class="num">
              {{
                vedioObj.value && vedioObj.value.playOverRate
                  ? parseFloat(vedioObj.value && vedioObj.value.playOverRate).toFixed(2)
                  : 0
              }}%
            </div>
            <div class="title">完播率</div>
          </div>
          <div class="one_num" v-if="vedioObj.value && vedioObj.value.avgWatchDuration">
            <div class="num">
              {{
                secondToDate(
                  parseInt((vedioObj.value && vedioObj.value.avgWatchDuration) || 0),
                  'm',
                  false
                )
              }}
            </div>
            <div class="title">平均观看时长</div>
          </div>
          <div
            class="one_num"
            v-if="brandViewMode === 1 && vedioObj.value && vedioObj.value.cartExposureTimes"
          >
            <div class="num">
              {{ wanSliceFormat((vedioObj.value && vedioObj.value.cartExposureTimes) || 0) }}
            </div>
            <div class="title">购物车曝光次数</div>
          </div>
          <div class="one_num" v-if="brandViewMode === 1 && vedioObj.value && vedioObj.value.gpm">
            <div class="num">
              ¥{{ wanSliceFormat(((vedioObj.value && vedioObj.value.gpm / 100) || 0).toFixed(2)) }}
            </div>
            <div class="title">千次观看成交额</div>
          </div>
          <div
            class="one_num"
            v-if="brandViewMode === 1 && vedioObj.value && vedioObj.value.drainLiveAmount"
          >
            <div class="num">
              ¥{{
                wanSliceFormat(
                  ((vedioObj.value && vedioObj.value.drainLiveAmount / 100) || 0).toFixed(2)
                )
              }}
            </div>
            <div class="title">引流直播间金额</div>
          </div>
          <div class="one_num" v-if="vedioObj.value && vedioObj.value.drainLiveTimes">
            <div class="num">
              {{ wanSliceFormat((vedioObj.value && vedioObj.value.drainLiveTimes) || 0) }}
            </div>
            <div class="title">引流直播间次数</div>
          </div>
          <div class="one_num" v-if="vedioObj.value && vedioObj.value.liveEntranceClickRate">
            <div class="num">
              {{ wanSliceFormat((vedioObj.value && vedioObj.value.liveEntranceClickRate) || 0) }}%
            </div>
            <div class="title">直播入口点击率</div>
          </div>
        </div>
      </div>
      <!-- 抖音扫码数据 -->
      <div class="userData_box" v-if="vedioObj.nativeShareUrl">
        <div class="data_line"></div>
        <div class="data_code"></div>
        <div class="data_descript">抖音扫码，查看完整视频</div>
      </div>
      <!-- 视频作者数据 -->
      <div class="userData_box">
        <div class="data_line" style="margin-bottom: 25px"></div>
        <div class="userInfo_tip">
          <img src="@/assets/images/content_center/user.png" alt />
          <span>作者信息</span>
        </div>
        <div class="data_content">
          <div class="data_content_left">
            <img
              v-if="vedioObj.value && vedioObj.value.authorInfoVO.avatar"
              class="head_img"
              :src="vedioObj.value && vedioObj.value.authorInfoVO.avatar"
              alt
              @click="toDetail2(vedioObj.value)"
              :style="
                vedioObj.value &&
                vedioObj.value.authorInfoVO.xuserIsDel &&
                vedioObj.value.authorInfoVO.xuserIsDel == 1
                  ? 'cursor: default'
                  : ''
              "
            />
            <img v-else class="head_img" src="@/assets/images/content_center/cover.jpg" alt />
            <el-tooltip
              effect="dark"
              v-if="
                vedioObj.value &&
                vedioObj.value.authorInfoVO.openIdAuthStatusVo &&
                ((vedioObj.value.platform == 4 &&
                  vedioObj.value.authorInfoVO.openIdAuthStatusVo.dyAuth == 2) ||
                  (vedioObj.value.platform == 3 &&
                    vedioObj.value.authorInfoVO.openIdAuthStatusVo.xhsAuth == 2) ||
                  (vedioObj.value.platform != 3 &&
                    vedioObj.value.authorInfoVO.openIdAuthStatusVo.dyAuth == 2))
              "
              placement="top-start"
            >
              <template #content>
                <div style="max-width: 300px">
                  {{
                    vedioObj.value.platform == 4 &&
                    vedioObj.value.authorInfoVO.openIdAuthStatusVo.dyAuth == 2
                      ? '快手授权失效'
                      : vedioObj.value.platform == 3 &&
                        vedioObj.value.authorInfoVO.openIdAuthStatusVo.xhsAuth == 2
                      ? '小红书授权失效'
                      : vedioObj.value && vedioObj.value.authorInfoVO.openIdAuthStatusVo.dyAuth == 2
                      ? '抖音授权失效'
                      : ''
                  }}
                </div>
              </template>
              <img
                class="expired_img"
                src="@/assets/images/content_center/warning_icon.png"
                alt=""
              />
            </el-tooltip>
          </div>
          <div class="data_content_middle">
            <div class="name" style="margin-bottom: 0; width: 100%">
              <div class="content_text data_content_middle_name">
                <div class="row_overflow2">
                  {{ (vedioObj.value && vedioObj.value.authorInfoVO.nickname) || '--' }}
                </div>
                <!-- 矩阵号被删除 -->
                <div
                  class="xm_delClass"
                  v-if="
                    vedioObj.value &&
                    vedioObj.value.authorInfoVO.xuserIsDel &&
                    vedioObj.value.authorInfoVO.xuserIsDel == 1
                  "
                ></div>
              </div>
            </div>
            <div class="number">
              粉丝数：
              {{
                wanSliceFormat(
                  Math.round((vedioObj.value && vedioObj.value.authorInfoVO.fansCount) || 0)
                )
              }}
            </div>
            <!-- v-if="" -->
            <div
              v-if="
                vedioObj.value &&
                vedioObj.value.authorInfoVO.operator &&
                vedioObj.value.authorInfoVO.operator.operatorName
              "
              class="fs_user_box number"
              :style="vedioObj.value.authorInfoVO.operator.fsOpenId ? 'cursor: pointer' : ''"
              @click="
                vedioObj.value.authorInfoVO.operator.fsOpenId
                  ? toFschat(vedioObj.value.authorInfoVO.operator.fsOpenId)
                  : ''
              "
            >
              <div style="max-width: calc(100% - 21px)" class="line-hidden1">
                运营者：{{ vedioObj.value.authorInfoVO.operator.operatorName || '--' }}
              </div>
              <img
                v-if="vedioObj.value.authorInfoVO.operator.fsOpenId"
                style="width: 18px; margin-left: 3px"
                src="@/assets/images/content_center/fsChat.png"
                alt=""
              />
            </div>
          </div>
        </div>
        <!-- <div class="data_line"></div> -->
        <div class="num_box">
          <div class="one_num">
            <div class="num">
              {{
                wanSliceFormat(
                  Math.round((vedioObj.value && vedioObj.value.authorInfoVO.worksCount) || 0)
                )
              }}
            </div>
            <div class="title">发布视频数</div>
          </div>
          <div class="one_num">
            <div class="num">
              {{
                wanSliceFormat(
                  Math.round((vedioObj.value && vedioObj.value.authorInfoVO.avgDigg) || 0)
                )
              }}
            </div>
            <div class="title">平均点赞数</div>
          </div>
          <div class="one_num">
            <div class="num">
              {{
                wanSliceFormat(
                  Math.round((vedioObj.value && vedioObj.value.authorInfoVO.avgPlay) || 0)
                )
              }}
            </div>
            <div class="title">平均播放数</div>
          </div>
          <div class="one_num">
            <div class="num">
              {{
                wanSliceFormat(
                  Math.round((vedioObj.value && vedioObj.value.authorInfoVO.avgComment) || 0)
                )
              }}
            </div>
            <div class="title">平均评论数</div>
          </div>
          <div class="one_num">
            <div class="num">
              {{
                wanSliceFormat(
                  Math.round((vedioObj.value && vedioObj.value.authorInfoVO.avgShare) || 0)
                )
              }}
            </div>
            <div class="title">平均分享数</div>
          </div>
          <!-- 矩阵号被删除就没有Ta的更多数据 -->
          <div
            class="other_msg"
            @click="toDetail"
            v-if="
              !(
                vedioObj.value &&
                vedioObj.value.authorInfoVO.xuserIsDel &&
                vedioObj.value.authorInfoVO.xuserIsDel == 1
              )
            "
          >
            Ta的更多数据
          </div>
        </div>
      </div>
    </div>
    <div class="detail_right">
      <template v-if="brandViewMode === 1">
        <el-tabs class="right_tab_box" v-model="activeName">
          <el-tab-pane label="视频详情" name="workDetail">
            <workDetail></workDetail>
          </el-tab-pane>
          <el-tab-pane label="效果分析" name="shopAnalysis">
            <shopAnalysis :videoForm="videoForm" :dateOBj="dateOBj"></shopAnalysis>
          </el-tab-pane>
        </el-tabs>
      </template>
      <template v-else><workDetail></workDetail></template>
    </div>
    <!-- 视频号的视频预览弹窗 -->
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
<script setup>
import { contentAnchorType } from '@/utils/dictionary/content-center.js'
import { wanSliceFormat, formatDate, secondToDate } from '@/utils/tools.js'
import shopAnalysis from './components/shop_analysis.vue'
import workDetail from './components/work_detail.vue'
import qrcodeVue from 'qrcode.vue'
import { useRoute } from 'vue-router'
import router from '@/router/index.js'
import { videoStatisticsInfo } from '@/api/content_center/content_manage.js'
import { useStore } from 'vuex'
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const route = useRoute()
const dateOBj = reactive({})
const openId = ref('')
const data = reactive({
  vedioObj: {
    cover: '',
    title: '',
    videoDuration: '',
    releasesTime: '',
    playCount: '',
    diggCount: '',
    commentCount: '',
    shareCount: '',
    saleCount: '',
    updateTime: '',
    authorInfoVO: {
      avatar: '',
      avgComment: '',
      avgDigg: '',
      avgPlay: '',
      avgShare: '',
      fansCount: '',
      nickname: '',
      worksCount: '',
      openIdAuthStatusVo: {}
    }
  },
  activeName: 'workDetail',
  videoDialog: {
    show: false,
    url: ''
  }
})
const { vedioObj, activeName, videoDialog } = data
onMounted(() => {
  getVideoInfo()
})

function videoSource(source) {
  const obj = {
    1: '运营策略中心',
    2: 'sumvideo',
    3: '手动上传',
    4: '第三方平台（酷家乐）',
    8: '灵感跟拍',
    9: '首页发视频',
    10: '模板封面',
    null: '非系统发布'
    // 需求（支持脱离任务转发视频、相册上传发布）中要求将视频关联的来源为 sumvideo,手动上传,征集任务，第三方上传的成品统一处理为来源于运营策略中心，备注为发布任务一键转发。
    // 1: '运营策略中心',
    // 2: '运营策略中心',
    // 3: '运营策略中心',
    // 4: '运营策略中心',
    // 8: '灵感跟拍',
    // 9: '首页发视频',
    // 10: '模板封面',
    // null: '非系统发布'
  }
  return obj[source] || null
}

const videoForm = reactive({
  itemId: route.query.itemId || '',
  brandId: localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : ''
  // platform: 1 // 默认抖音平台
})
// 视频信息数据
async function getVideoInfo() {
  const res = await videoStatisticsInfo({
    itemId: window.decodeURIComponent(route.query.itemId) || '',
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : ''
    // platform: 1 // 默认抖音平台
  })
  vedioObj.value = res.data
  console.log(res.data, '直播视频详情res data')
  dateOBj.clueCount = res.data.clueCount
  dateOBj.commerceCount = res.data.commerceCount
  dateOBj.saleCount = res.data.saleCount
  openId.value = res.data.dyOpenId || ''
}
// 更多数据跳转个人详情
function toDetail() {
  // 如果矩阵号被删除，就不能跳转
  if (
    vedioObj.value &&
    vedioObj.value.authorInfoVO.xuserIsDel &&
    vedioObj.value.authorInfoVO.xuserIsDel === 1
  ) {
    return
  }
  router.push({
    path: '/content_center/content_matrix/details',
    query: {
      openId: openId.value
    }
  })
}
// 去矩阵详情
function toDetail2(e) {
  // 如果矩阵号被删除，就不能跳转
  if (e.authorInfoVO && e.authorInfoVO.xuserIsDel && e.authorInfoVO.xuserIsDel === 1) {
    return
  }
  router.push({
    path: '/content_center/content_matrix/details',
    query: {
      openId: e.dyOpenId
    }
  })
}

const message = inject('$message')
function startPlay(val, e) {
  if (vedioObj.value && vedioObj.value.isDelete === 1) {
    return
  }
  console.log('url', val)
  // 如果是视频号或者小红书，就出现预览弹窗
  if (e.platform === 2) {
    if (val) {
      videoDialog.url = val
      videoDialog.show = true
    } else {
      message.warning('暂未找到播放地址')
    }
    return
  }
  if (val) {
    window.open(val)
  }
}
// 跳转飞书聊天
function toFschat(openId) {
  window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
}
</script>
<style lang="scss" scoped>
@import url(@/styles/layout.scss);
@import '../components/css/page.scss';
.userInfo_tip {
  margin-bottom: 20px;
  img {
    width: 20px;
    height: 20px;
    vertical-align: top;
    margin-right: 6px;
    cursor: pointer;
  }
  span {
    height: 22px;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    line-height: 22px;
  }
}
.videoDetail {
  min-width: 950px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .data_line {
    border-bottom: 2px solid #f7f7f7;
  }
  .data_update {
    background: #ffffff;
    margin-left: 12px;
    margin-top: 16px;
    font-size: 14px;
    color: #999999;
  }
  .detail_left {
    position: relative;
    width: 320px;
    margin-right: 16px;
    border-radius: 4px;
    background: #fff;
    padding: 22px 24px;
    border-radius: 4px;

    .userInfo_box {
      width: 100%;
      .info_top {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        // margin-bottom: 24px;
        .info_left {
          position: relative;
          margin-right: 12px;
          width: 66px;
          height: 88px;
          .info_head {
            width: 100%;
            height: 100%;
            position: relative;
            .inner {
              border-radius: 4px;
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
              cursor: pointer;
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
            .head_img {
              width: 100%;
              height: 100%;
              border-radius: 4px;
              cursor: pointer;
              object-fit: cover;
            }
          }
          .info_living {
            position: absolute;
            left: 0;
            bottom: 0px;
            width: 64px;
            height: 20px;
            background: #ef3e3d;
            border-radius: 4px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            font-weight: 400;
            color: #ffffff;
          }
        }
        .info_right {
          width: calc(100% - 76px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          // height: 90px;
          margin-top: -2px;
          .info_name {
            width: 100%;
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            line-height: 20px;
            // margin-bottom: 20px;
            // margin-top: 2px;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            .content_text {
              max-width: calc(100% - 50px);
              margin-bottom: 4px;
              word-break: break-all;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              overflow: hidden;
            }
            .platform_icon_box {
              height: 20px;
              width: 20px;
              margin-left: 5px;
              margin-top: -1px;
              vertical-align: middle;
              position: relative;
              div {
                height: 20px;
                width: 20px;
              }
            }
            img {
              height: 18px;
              width: 18px;
              margin-left: 6px;
              vertical-align: middle;
              cursor: pointer;
            }
          }
          // .info_during {
          //   margin-top: 10px;
          // }
          // .info_time {
          //   margin-top: 4px;
          // }
          .info_during,
          .info_time {
            font-size: 12px;
            font-weight: 400;
            color: #999999;
            line-height: 18px;
          }
        }
      }
    }
    .userData_box {
      width: 100%;
      .data_title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        line-height: 22px;
        padding-bottom: 24px;
        margin-top: 24px;
      }
      .data_content {
        padding: 0 12px 4px;
        display: flex;
        margin-bottom: 24px;
        .data_content_left {
          margin-right: 12px;
          position: relative;
          .head_img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            cursor: pointer;
          }
          .expired_img {
            width: 14px;
            height: 14px;
            position: absolute;
            right: 0px;
            top: 0px;
          }
        }
        .data_content_middle {
          width: calc(100% - 76px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          .name {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            line-height: 20px;
            margin-bottom: 6px;
            img {
              position: absolute;
              height: 18px;
              width: 18px;
              top: 2px;
              margin-left: 6px;
            }
          }
          > .number {
            height: 20px;
            font-size: 14px;
            font-weight: 400;
            color: #a1a1a1;
            line-height: 20px;
            margin-top: 6px;
            position: relative;
          }
        }
        .data_content_right {
          cursor: pointer;
          img {
            width: 20px;
            height: 20px;
            margin-top: 5px;
          }
        }
      }
      .data_code {
        width: 146px;
        height: 146px;
        border-radius: 10px;
        background: #ffffff;
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.1);
        padding: 11px;
        margin: 24px auto;
        cursor: pointer;
        div {
          width: 100%;
          height: 100%;
        }
        img {
          width: 100%;
          height: 100%;
        }
      }
      .data_descript {
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        text-align: center;
        margin-bottom: 24px;
      }
      .num_box {
        margin-top: 16px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        .other_msg {
          width: 103px;
          height: 27px;
          border-radius: 4px;
          opacity: 0.5;
          border: 1px solid #364fcd;
          text-align: center;
          margin: auto;
          line-height: 27px;
          color: #364fcd;
          cursor: pointer;
        }
        .one_num {
          width: 33.33%;
          margin: 0px 0 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          .title {
            margin-top: 6px;
            font-size: 12px;
            font-weight: 400;
            color: #999999;
            line-height: 17px;
            text-align: left;
            // margin-left: 12px;
          }
          .num {
            margin-top: 8px;
            font-size: 18px;
            font-weight: bold;
            color: #333333;
            line-height: 22px;
            text-align: left;
            // margin-left: 12px;
          }
        }
      }
      .update_time {
        font-size: 14px;
        font-weight: 400;
        color: #999999;
        line-height: 20px;
        margin-top: -4px;
        margin-bottom: 24px;
        margin-left: 12px;
      }
    }
  }
  .detail_right {
    width: calc(100% - 362px);
    :deep(.el-tabs__nav-scroll) {
      background: #fff;
      padding: 14px 24px 0;
      border-radius: 10px;
    }
    :deep(.el-tabs__item) {
      line-height: 24px;
      padding-bottom: 14px;
      color: #909399;
      font-weight: 400;
    }
    :deep(.el-tabs__item.is-active) {
      color: #303133;
      font-weight: 600;
    }
    :deep(.el-tabs__nav-wrap::after) {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      background-color: transparent;
    }
    // ::v-deep .right_tab_box {
    //   .ivu-tabs-nav-wrap {
    //     margin-bottom: 0;
    //   }
    //   .ivu-tabs-bar {
    //     margin-bottom: 10px;
    //     border: none;
    //     width: 100%;
    //     height: 52px;
    //     background: #ffffff;
    //     border-radius: 10px;
    //     .ivu-tabs-nav-scroll {
    //       padding-left: 18px;
    //     }
    //     .ivu-tabs-tab {
    //       font-size: 14px;
    //       font-weight: 400;
    //       color: #909399;
    //       line-height: 20px;
    //       line-height: 52px;
    //       padding-top: 0;
    //       padding-bottom: 0;
    //       padding-left: 12px;
    //       padding-right: 12px;
    //     }
    //     .ivu-tabs-ink-bar {
    //       background-color: #364fcd;
    //       border-left: 12px solid #fff;
    //       border-right: 12px solid #fff;
    //       bottom: 0;
    //     }
    //     .ivu-tabs-tab:hover {
    //       color: #303133;
    //       font-weight: bold;
    //     }
    //     .ivu-tabs-tab-active {
    //       font-weight: bold;

    //       color: #303133;
    //     }
    //   }
    // }
  }
}
:deep .ivu-tooltip-rel {
  width: 90%;
  display: flex;
}
.data_content_middle_name {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .row_overflow2 {
    max-width: calc(100% - 48px);
  }
}
:deep(.xhs_imgText_Icon) {
  z-index: 99;
  .icon_icon {
    opacity: 0.5;
  }
}
.xm_anchorType_tag {
  position: absolute;
  right: 24px;
  top: 22px;
}
</style>
