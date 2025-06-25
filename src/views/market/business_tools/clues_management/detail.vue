<template>
  <div class="detail">
    <!-- 线索详情 -->
    <div style="background: #fff; margin-bottom: 16px">
      <div class="box">线索详情</div>
      <div class="line"></div>
      <!-- 抖音小风车的信息 -->
      <div class="box2" v-if="data.detailForm.cgpClueId && data.detailForm.cgpClueId !== null">
        <div class="clues_detail_text_item">
          <div class="label">商品信息</div>
          <div class="content_text">
            <div style="margin-bottom: 6px">
              {{ data.detailForm.soruceInfo.split(' - ')[0] || '--' }}
            </div>
            <div>
              {{ data.detailForm.soruceInfo.split(' - ')[1] || '--' }}
            </div>
          </div>
        </div>
        <div class="clues_detail_text_item">
          <div class="label">留资时间</div>
          <div class="text">{{ data.detailForm.orderCreateTime || '--' }}</div>
        </div>
        <div class="clues_detail_text_item">
          <div class="label">线索状态</div>
          <div class="text">{{ data.detailForm.isFollowUp === 0 ? '待跟进' : '已跟进' }}</div>
        </div>
      </div>
      <div class="box2" v-else>
        <div class="clues_detail_box">
          <img
            class="clues_detail_img"
            :src="
              data.activityHeadImg || 'https://tagvv-1256030678.file.myqcloud.com/20220429646vr.png'
            "
          />
          <div class="clues_detail_content">
            <div class="title">{{ data.detailForm.activityTitle || '--' }}</div>
            <div class="price_box">
              <span class="selling_price">{{ imputedPrice(data.detailForm.presentPrice) }}</span>
              <span class="original_price">{{ imputedPrice(data.detailForm.originalPrice) }}</span>
            </div>
          </div>
        </div>
        <div class="clues_detail_text_item">
          <div class="label">留资时间</div>
          <div class="text">{{ data.detailForm.orderCreateTime || '--' }}</div>
        </div>
      </div>
    </div>
    <!-- 基础信息 -->
    <div style="background: #fff; margin-bottom: 16px">
      <div class="box">基础信息</div>
      <div class="line"></div>
      <!-- 抖音小风车的信息 -->
      <div class="box3" v-if="data.detailForm.cgpClueId && data.detailForm.cgpClueId !== null">
        <div class="text_item_box">
          <div class="label">线索昵称</div>
          <div class="text">{{ data.detailForm.userNickname || '--' }}</div>
        </div>
        <div class="text_item_box">
          <div class="label">手机号码</div>
          <template v-if="data.detailForm.mobile">
            <div class="text">
              {{ data.detailForm.mobile.substring(0, 3) }}****{{
                data.detailForm.mobile.substring(7)
              }}
            </div>
          </template>
          <div class="text" v-else>--</div>
        </div>
        <div class="text_item_box">
          <div class="label">姓名</div>
          <div class="text">{{ data.detailForm.username || '--' }}</div>
        </div>
      </div>
      <div class="box3" v-else>
        <div class="text_item_box">
          <div class="label">线索昵称</div>
          <div class="text">{{ data.detailForm.userNickname || '--' }}</div>
        </div>
        <!-- 手机号 -->
        <div class="text_item_box">
          <div class="label">手机号码</div>
          <template v-if="data.detailForm.mobile">
            <!-- <div class="text" v-if="isShowPhone">{{ data.detailForm.mobile }}</div>-->
            <div class="text">
              {{ data.detailForm.mobile.substring(0, 3) }}****{{
                data.detailForm.mobile.substring(7)
              }}
            </div>
            <!--  <div class="eye_icon">
              <img
                src="@/assets/images/content_center/yanjing_xianshi.png"
                alt
                @click="showPhoneFun()"
                v-if="isShowPhone"
              />
              <img
                src="@/assets/images/content_center/yanjing_yincang.png"
                alt
                @click="showPhoneFun()"
                v-else
              />
            </div> -->
          </template>
          <div class="text" v-else>--</div>
        </div>
        <!-- 地址 -->
        <div class="text_item_box">
          <div class="label">地址</div>
          <div class="text">{{ data.detailForm.position || '--' }}</div>
        </div>
        <!-- 其他字段 -->
        <template v-if="data.detailForm.otherInfoList">
          <div
            class="text_item_box"
            v-for="(item, index) in data.detailForm.otherInfoList"
            :key="index"
          >
            <div class="label">{{ item.configTitle }}</div>
            <div class="text">{{ item.configValue || '--' }}</div>
          </div>
        </template>
      </div>
    </div>
    <!-- 线索来源 -->
    <div style="background: #fff; margin-bottom: 16px" v-if="data.detailForm.source">
      <div class="box">线索来源</div>
      <div class="line"></div>
      <div class="box3">
        <!-- 来源载体 data.detailForm.source  (1: 视频  2: 直播) -->
        <div class="text_item_box">
          <div class="label">来源载体</div>
          <div
            class="img_box"
            v-if="data.detailForm.source === 1 && data.detailForm.videoPlayUrl"
            @click="playVideo"
          >
            <img class="cover_url" :src="data.detailForm.coverUrl" alt="" />
            <img class="play" src="@/assets/images/play_btn.png" alt="" />
          </div>
          <img
            class="cover_url"
            v-if="data.detailForm.source === 2"
            :src="
              data.detailForm.coverUrl ||
              'https://tagvv-1256030678.file.myqcloud.com/20220429646vr.png'
            "
          />
          <div class="source_detail">
            <div class="carrier_title">{{ data.detailForm.title || '--' }}</div>
            <div class="time" v-if="data.detailForm.source === 1 && data.detailForm.videoPlayUrl">
              发布时间：{{ data.detailForm.videoPublishTime }}
            </div>
            <template v-if="data.detailForm.source === 2">
              <div class="time" v-if="data.detailForm.livingEndTime">
                直播时间：{{
                  `${data.detailForm.livingStartTime} - ${data.detailForm.livingEndTime}`
                }}
              </div>
              <div class="time" v-else>
                直播时间：{{ `${data.detailForm.livingStartTime || '-'}` }}
              </div>
              <div class="time" v-if="data.detailForm.livingDuration">
                直播时长：{{ getLivingDuration(data.detailForm.livingDuration) }}
              </div>
              <div class="time" style="color: #52c41a" v-else>直播中</div>
            </template>
          </div>
        </div>
        <!-- 关联矩阵号 -->
        <div class="text_item_box">
          <div class="label">关联矩阵号</div>
          <div class="text">{{ data.detailForm.xUserName || '--' }}</div>
        </div>
        <!-- 关联矩阵号 -->
        <div
          class="text_item_box"
          v-if="data.detailForm.cgpClueId && data.detailForm.cgpClueId !== null"
        >
          <div class="label">关联企业号</div>
          <div class="text">{{ data.detailForm.cgpXUserName || '--' }}</div>
        </div>
        <!-- 关联任务 -->
        <div class="text_item_box">
          <div class="label">关联任务</div>
          <div class="text">{{ data.detailForm.taskName || '--' }}</div>
        </div>
        <!-- 员工名称 -->
        <div class="text_item_box">
          <div class="label">员工名称</div>
          <div class="text">
            {{ data.detailForm.staffName || '--' }}
            <span
              class="xm_depart"
              style="display: inline-block"
              v-if="data.detailForm.staffStatus && data.detailForm.staffStatus == 2"
            ></span>
          </div>
        </div>
        <!-- 员工手机号 -->
        <div class="text_item_box">
          <div class="label">员工手机号</div>
          <template v-if="data.detailForm.staffPhone">
            <!-- <div class="text" v-if="isShowStaffPhone">{{ data.detailForm.staffPhone }}</div>-->
            <div class="text">
              {{ data.detailForm.staffPhone.substring(0, 3) }}****{{
                data.detailForm.staffPhone.substring(7)
              }}
            </div>
            <!-- <div class="eye_icon">
              <img
                src="@/assets/images/content_center/yanjing_xianshi.png"
                alt
                @click="showStaffPhoneFun()"
                v-if="isShowStaffPhone"
              />
              <img
                src="@/assets/images/content_center/yanjing_yincang.png"
                alt
                @click="showStaffPhoneFun()"
                v-else
              />
            </div> -->
          </template>
          <div class="text" v-else>--</div>
        </div>
      </div>
    </div>
    <!-- 播放视频的弹窗 -->
    <el-dialog
      destroy-on-close
      title="查看视频"
      width="344px"
      @close="bigVideoVisible = false"
      v-model="bigVideoVisible"
    >
      <video
        id="bigVideo"
        :src="data.bigVideoUrl"
        controls="controls"
        autoplay
        style="width: 100%"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { getAppointmentOrderDetail } from '@/api/market/business_tools.js'
import { useRoute } from 'vue-router'
const message = inject('$message')
const route = useRoute()
const data = reactive({
  orderId: '', // 留资订单id
  detailForm: {}, // 留资详情
  activityHeadImg: '', // 活动头图
  bigVideoUrl: ''
})
// const isShowPhone = ref(false)
// const isShowStaffPhone = ref(false)
const bigVideoVisible = ref(false)
// const showPhoneFun = () => {
//   isShowPhone.value = !isShowPhone.value
// }
// const showStaffPhoneFun = () => {
//   isShowStaffPhone.value = !isShowStaffPhone.value
// }
// 根据订单 id 查询留资订单详情
function getDetail(id) {
  getAppointmentOrderDetail(id)
    .then(res => {
      if (res.code === 0) {
        const detail = res.data
        data.detailForm = detail
        getImg(detail.activityHeadImg)
      }
    })
    .catch(() => {})
}
// 计算价格
function imputedPrice(price) {
  let text = ''
  if (price) {
    text = `¥${((price * 1.0) / 100).toFixed(2)}`
  }
  return text
}
// 获取活动头图
function getImg(imgListJson) {
  data.activityHeadImg = JSON.parse(imgListJson)[0]
}
// 播放时长转化
function getLivingDuration(duration) {
  if (!duration) return
  let durationText = `${duration}分钟`
  if (duration >= 60) {
    durationText = `${parseInt(duration / 60)}小时${duration % 60}`
  }
  return durationText
}
// 打开视频弹窗并播放视频
function playVideo() {
  if (data.detailForm.videoPlayUrl) {
    data.bigVideoUrl = data.detailForm.videoPlayUrl
    bigVideoVisible.value = true
    const videoContext = document.getElementById('bigVideo')
    videoContext.play()
  } else {
    message.warning('该视频出错')
  }
}
onMounted(() => {
  data.orderId = route.query.id
  if (route.query.id) {
    getDetail(route.query.id)
  }
})
</script>

<style lang="scss" scoped>
@import url(../css/comment.css);
.detail {
  font-size: 14px;
  height: 100%;
  position: relative;
  .go_back {
    padding: 10px 0;
    color: #fff;
  }
  .box {
    // margin-bottom: 16px;
    border-radius: 4px;
    background: #fff;
    padding: 0 0 0 24px;
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    line-height: 50px;
  }
  .box2 {
    padding: 16px 0 24px 170px;
    // 线索详情
    .clues_detail_box {
      display: flex;
      .clues_detail_img {
        width: 75px;
        min-width: 75px;
        height: 100px;
        border-radius: 5px;
        object-fit: cover;
      }
      .clues_detail_content {
        margin-left: 14px;
        .title {
          min-width: 168px;
          margin: 12px 0 34px 0;
          height: 20px;
          font-size: 14px;
          font-weight: bold;
          color: #303133;
          line-height: 20px;
        }
        .selling_price {
          font-size: 16px;
          font-weight: bold;
          color: #303133;
          line-height: 22px;
        }
        .original_price {
          margin-left: 12px;
          font-size: 14px;
          font-weight: 400;
          color: #babbbc;
          line-height: 20px;
          text-decoration: line-through;
        }
      }
    }
    .clues_detail_text_item {
      display: flex;
      margin-top: 20px;
      .label {
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
      }
      .text {
        margin-left: 14px;
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
      }
      .content_text {
        width: calc(100% - 104px);
        margin-left: 14px;
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
    // 基础信息
  }
  .box3 {
    padding: 24px 0 24px 0;
    .text_item_box {
      &:last-child {
        margin: 0;
      }
      display: flex;
      margin-bottom: 20px;
      .label {
        width: 225px;
        min-width: 225px;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        text-align: right;
      }
      .text {
        margin-left: 14px;
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
      }
      .eye_icon {
        margin-left: 8px;
        font-size: 0;
        img {
          width: 16px;
          height: 16px;
          margin-top: 2px;
          object-fit: cover;
        }
      }
      .img_box {
        position: relative;
        cursor: pointer;
        .play {
          position: absolute;
          position: absolute;
          height: 14px;
          width: 14px;
          object-fit: cover;
          top: 50%;
          left: calc(50% + 10px);
          transform: translate(-50%, -50%);
        }
      }
      .cover_url {
        width: 60px;
        min-width: 60px;
        height: 80px;
        margin-left: 14px;
        object-fit: cover;
        border-radius: 4px;
      }
      .source_detail {
        margin-left: 10px;
        .carrier_title {
          font-size: 14px;
          font-weight: bold;
          color: #303133;
          line-height: 20px;
        }
        .time {
          margin-top: 6px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
        }
        .duration {
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
        }
      }
    }
  }
  .line {
    width: 100%;
    height: 1px;
    background: #e8e8e8;
  }
}
</style>
