<template>
  <div class="customer_overview page_main" v-loading="loading">
    <div class="top-title">获客大盘</div>
    <div class="center_circle">
      <!-- 文案     -->
      <div class="bold_text">{{ info.clientCount }}</div>
      <div>累计获客数</div>
      <!--  左边四个     -->
      <div class="box_content box_left box_left_top">
        <div class="sub_text">视频评论数</div>
        <div class="sub_bold_text">{{ wanSliceFormat(info.videoCommentCount) }}</div>
      </div>
      <div class="box_content box_left box_left_second">
        <div class="sub_text">获客视频数</div>
        <div class="sub_bold_text">{{ wanSliceFormat(info.clientVideoCount) }}</div>
      </div>
      <div class="box_content box_left box_left_third">
        <div class="sub_text">视频潜客数</div>
        <div class="sub_bold_text">{{ wanSliceFormat(info.videoClientCount) }}</div>
      </div>
      <div class="box_content box_left box_left_bottom">
        <div class="sub_text">私信潜客数</div>
        <div class="sub_bold_text">{{ wanSliceFormat(info.imClientCount) }}</div>
      </div>
      <!--  右边四个     -->
      <div class="box_content box_right box_right_top">
        <div class="sub_text">直播弹幕数</div>
        <div class="sub_bold_text">{{ wanSliceFormat(info.liveRoomChatCount) }}</div>
      </div>
      <div class="box_content box_right box_right_second">
        <div class="sub_text">获客直播场次</div>
        <div class="sub_bold_text">{{ wanSliceFormat(info.clientLiveRoomSiteCount) }}</div>
      </div>
      <div class="box_content box_right box_right_third">
        <div class="sub_text">直播潜客数</div>
        <div class="sub_bold_text">{{ wanSliceFormat(info.liveClientCount) }}</div>
      </div>
      <div class="box_content box_right box_right_bottom">
        <div class="sub_text">留资转化数</div>
        <div class="sub_bold_text">{{ wanSliceFormat(info.clientTransferCount) }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { getCustomerOverview } from '@/api/scrm/operation'
import {isNotEmpty, wanSliceFormat} from '@/utils/tools'

const props = defineProps({
  params: {
    type: Object,
    default: () => {
      return {
        deptIds: '',
        endTime: '',
        startTime: ''
      }
    }
  }
})
const { params } = toRefs(props)

const loading = ref(true)

const info = ref({})
const resetInfo = () => {
  info.value = {
    clientCount: 0,
    videoCommentCount: 0,
    clientVideoCount: 0,
    videoClientCount: 0,
    imClientCount: 0,
    liveRoomChatCount: 0,
    clientLiveRoomSiteCount: 0,
    liveClientCount: 0,
    clientTransferCount: 0
  }
}
const getList = () => {
  loading.value = true
  getCustomerOverview(params.value)
    .then(res => {
      loading.value = false
      if (res.code === 0 && isNotEmpty(res.data)) {
        const mate = res.data
        for (const key in mate) {
          info.value[key] = mate[key] || 0
        }
      } else {
        resetInfo()
      }
    })
    .catch(err => {
      console.error(err)
      loading.value = false
    })
}

const init = () => {
  resetInfo()
  getList()
}
init()

watch(
  () => params.value,
  value => {
    getList()
  }
)
</script>

<style scoped lang="scss">
@media screen and(max-width: 1700px) {
  .center_circle {
    transform: scale(0.85);
  }
}
.customer_overview {
  display: flex;
  flex-direction: column;
  align-items: center;
  .top-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #303133;
    align-self: flex-start;
  }
  .center_circle {
    width: 400px;
    height: 400px;
    background-image: url('https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/0f517578b1cb419ebc74ec67053dd33d_1688722904830.png');
    background-size: contain;
    //background: linear-gradient(180deg, #95b0ff 0%, #5c78ff 100%);
    border: 42px solid #f0f4ff;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    //justify-content: center;
    color: #ffffff;
    position: relative;
    .bold_text {
      margin-top: 60px;
      font-size: 40px;
      line-height: 56px;
      margin-bottom: 8px;
    }
    .box_content {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 160px;
      height: 80px;
      border-radius: 12px 0px 0px 12px;
      .sub_text {
        color: #909399;
        line-height: 20px;
        font-size: 14px;
        font-weight: 400;
        padding-left: 24px;
        margin-top: 12px;
      }
      .sub_bold_text {
        line-height: 34px;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        padding-left: 24px;
      }
    }
    // 左边
    .box_left {
      border: 1px solid transparent;
      border-radius: 12px;
      background-image: linear-gradient(90deg, rgba(241, 245, 255, 1), rgba(255, 255, 255, 1)),
        linear-gradient(90deg, rgba(92, 120, 255, 1), rgba(255, 255, 255, 1));
      background-origin: border-box;
      background-clip: content-box, border-box;
    }
    .box_left_top {
      top: -42px;
      left: -172px;
    }
    .box_left_second {
      top: 65px;
      left: -262px;
    }
    .box_left_third {
      top: 171px;
      left: -262px;
    }
    .box_left_bottom {
      bottom: -42px;
      left: -172px;
    }
    // 右边
    .box_right {
      border: 1px solid transparent;
      border-radius: 12px;
      background-image: linear-gradient(270deg, rgba(241, 245, 255, 1), rgba(255, 255, 255, 1)),
        linear-gradient(270deg, rgba(92, 120, 255, 1), rgba(255, 255, 255, 1));
      background-origin: border-box;
      background-clip: content-box, border-box;
      .sub_text {
        padding-left: 46px;
      }
      .sub_bold_text {
        padding-left: 46px;
      }
    }
    .box_right_top {
      top: -42px;
      right: -172px;
    }
    .box_right_second {
      top: 65px;
      right: -262px;
    }
    .box_right_third {
      top: 171px;
      right: -262px;
    }
    .box_right_bottom {
      bottom: -42px;
      right: -172px;
    }
  }
}
</style>
