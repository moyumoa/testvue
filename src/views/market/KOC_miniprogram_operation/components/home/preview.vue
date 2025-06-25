<template>
  <div
    :class="['home_preview']"
    :style="
      props.data
        ? props.data.themeInfo
          ? props.data.themeInfo.backgroundStyle === 1
            ? `background:${props.data.themeInfo.backgroundColor}`
            : `background-image:url('${props.data.themeInfo.backgroundUrl}');background-repeat: no-repeat;background-size: cover;background-position: center center;`
          : ''
        : ''
    "
  >
    <!-- 页面标题 -->
    <div class="home_head">
      {{ props.data?.themeInfo?.name || '' }}
    </div>
    <!-- 页面内容 -->
    <div class="home_container">
      <!-- 轮播图信息 -->
      <div class="banner_content" v-if="imgList && imgList.length > 0">
        <!-- 如果轮播图超过1张 -->
        <el-carousel
          class="banner_swiper"
          trigger="click"
          height="120px"
          v-if="imgList.length > 1"
          arrow="never"
          :interval="3000"
        >
          <el-carousel-item v-for="(item, index) in imgList" :key="index">
            <div class="default_box" style="height: 120px">
              <img class="default_banner" :src="item.coverUrl" alt="" />
            </div>
          </el-carousel-item>
        </el-carousel>
        <!-- 轮播图只有一张 -->
        <div class="default_box" v-else-if="imgList.length == 1">
          <img
            class="default_banner"
            v-if="imgList[0].coverUrl"
            :src="imgList[0].coverUrl"
            alt=""
          />
          <div style="background: #fff" v-else class="default_banner" alt="" />
        </div>
      </div>
      <!-- 搜索框 -->
      <div class="search_content">
        <div class="">请输入活动名称</div>
        <img src="https://tagvv-1256030678.file.myqcloud.com/20250527b5pac.png" />
      </div>
      <!-- 任务列表 -->
      <div class="task_content">
        <div class="task_filter">
          <div class="filter_left">
            <div
              class="filter_text is_active"
              :style="{
                background: props.data?.themeInfo?.theme2
              }"
            >
              全部
            </div>
            <div class="filter_text">进行中</div>
            <div class="filter_text">已结束</div>
          </div>
        </div>
        <div class="task_list">
          <div class="one_task" v-for="(item, index) in [1, 1, 6, 1]" :key="index">
            <div class="one_task_left">
              <img class="task_icon" :src="taskImg[item]" alt="" />
              <div class="task_name">
                <div class="name1">活动名称</div>
                <div class="name2">报名人数：200/2000</div>
              </div>
            </div>
            <div class="one_task_right">
              <div
                class="task_btn"
                :style="{
                  background: props.data?.themeInfo?.theme1
                }"
              >
                去报名
              </div>
              <div class="task_time">2天后结束</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- tabbar -->
    <div class="home_tabbar">
      <div
        class="one_tabbar"
        :style="{
          color: props.data?.themeInfo?.theme2
        }"
      >
        <i class="iconfont icon-huodongguangchang"></i>
        <!-- <img src="https://tagvv-1256030678.file.myqcloud.com/20250527breo3.png" alt="" /> -->
        <div>{{ props.data?.themeInfo?.name || '粉丝活动' }}</div>
      </div>
      <div class="one_tabbar">
        <i class="iconfont icon-wodehuodongweixuanzhong"></i>
        <!-- <img src="https://tagvv-1256030678.file.myqcloud.com/20250527ofa47.png" alt="" /> -->
        <div>我的活动</div>
      </div>
      <div class="one_tabbar">
        <i class="iconfont icon-gerenzhongxinweixuanzhong"></i>
        <!-- <img src="https://tagvv-1256030678.file.myqcloud.com/20250527rl78e.png" alt="" /> -->
        <div>个人中心</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { isEmpty, isNotEmpty } from '@/utils/tools.js'
const props = defineProps({
  data: {
    type: Object,
    data() {
      return {}
    }
  },
  chooseTab: {
    type: String
  }
})
const taskImg = ref({
  1: 'https://tagvv-1256030678.file.myqcloud.com/202211218cq4m.png',
  2: 'https://tagvv-1256030678.file.myqcloud.com/20221121ph8j0.png',
  3: 'https://tagvv-1256030678.file.myqcloud.com/20221121a8efq.png',
  5: 'https://tagvv-1256030678.file.myqcloud.com/20221121y86f5.png',
  6: 'https://tagvv-1256030678.file.myqcloud.com/20230926bhqiz.png'
})
const imgList = ref([])
watch(
  () => props.data,
  val => {
    if (val && val.bannerList && val.bannerList.length > 0) {
      const bannerList = val.bannerList.filter(item => !isEmpty(item.coverUrl))
      imgList.value = isNotEmpty(bannerList)
        ? bannerList
        : [
            {
              coverUrl: ''
            }
          ]
    } else {
      imgList.value = []
    }
    console.log('最后的轮播图信息', val.bannerList, imgList.value)
  },
  { deep: true, immediate: true }
)
</script>
<style lang="scss" scoped>
@import '@/views/market/miniprogram_operation/components/css/preview_page.scss';
.home_preview {
  width: 100%;
  height: calc(100% - 0px);
  .home_head {
    width: 100%;
    height: 96px;
    text-align: center;
    padding-top: 54px;

    font-weight: 600;
    font-size: 16px;
    color: #1f2329;
    line-height: 22px;
  }
  .home_container {
    width: 100%;
    height: calc(100% - 96px - 74px);
    overflow-y: auto;
    padding: 0 16px;
    .search_content {
      width: 100%;
      height: 36px;
      background: #ffffff;
      box-shadow: 0px 4px 10px 0px rgba(208, 208, 208, 0.5);
      border-radius: 18px;
      font-weight: 400;
      font-size: 12px;
      color: #696e74;
      padding: 0 16px 0 20px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      img {
        cursor: pointer;
        width: 16px;
        height: 16px;
        display: flex;
      }
    }

    .task_content {
      .task_filter {
        margin: 16px 0;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .filter_left {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          .filter_text {
            padding: 4px 12px;
            font-weight: 400;
            font-size: 14px;
            color: #8f959e;
            line-height: 18px;
            background: #f8f9fa;
            border-radius: 13px;
          }
          .filter_text + .filter_text {
            margin-left: 12px;
          }
          .is_active {
            background: #997957;
            color: #ffffff;
          }
        }
        .filter_right {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
          font-weight: 400;
          font-size: 12px;
          color: #8f959e;
          line-height: 18px;
          img {
            width: 20px;
            height: 20px;
            margin-right: 4px;
            display: flex;
          }
        }
      }

      .task_list {
        width: 100%;
        .one_task {
          box-shadow: 0px 4px 10px 0px rgba(208, 208, 208, 0.5);
          width: 100%;
          border-radius: 12px;
          background: #ffffff;
          height: 72px;

          margin-bottom: 12px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 0 12px;
          .one_task_left {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            .task_icon {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              margin-right: 8px;
              display: flex;
            }
            .task_name {
              width: calc(100% - 56px);
              .name1 {
                font-weight: 600;
                font-size: 15px;
                color: #1f2329;
                line-height: 22px;

                @include mult_line(1);
              }
              .name2 {
                font-weight: 400;
                font-size: 12px;
                color: #646a73;
                line-height: 18px;
                margin-top: 4px;
              }
            }
          }

          .one_task_right {
            text-align: center;
            .task_btn {
              width: 62px;
              height: 28px;
              background: #333333;
              border-radius: 14px;
              font-weight: 400;
              font-size: 13px;
              color: #ffffff;
              line-height: 28px;
            }
            .task_time {
              margin-top: 6px;
              font-weight: 400;
              font-size: 10px;
              color: #bbbfc3;
              line-height: 14px;
            }
          }
        }
      }
    }
  }
  .home_tabbar {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 74px;

    background: #ffffff;
    box-shadow: 0px -1px 0px 0px rgba(187, 191, 195, 0.1);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .one_tabbar {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 33.33%;
      text-align: center;
      font-weight: 400;
      font-size: 10px;
      color: #999999;
      line-height: 14px;
      div {
        height: 14px;
        margin-top: 6px;
      }
      i {
        font-size: 28px;
      }
    }
  }
}
.banner_content {
  margin-bottom: 12px;
  width: 100%;
  height: 120px;
  .default_box {
    width: 100%;
    height: 120px;
    // padding: 0 16px;
  }
  .default_banner {
    width: 100%;
    height: 100%;
    object-fit: cover;

    border-radius: 12px;
  }
}

:deep(.banner_swiper .el-carousel__indicator .el-carousel__button) {
  width: 6px;
  height: 6px;
  border-radius: 100%;
}
.square_preview:hover {
  border: 1px solid transparent;
  background: none;
  box-shadow: none;
}
</style>
