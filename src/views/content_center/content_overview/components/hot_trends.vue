<template>
  <div class="hot_trends" v-loading="loading">
    <div class="module_title">{{ props.type === 'platform' ? '平台热点' : '行业热点' }}</div>
    <div class="hot_trends_container" v-if="list.length > 0">
      <div
        class="container_item"
        @click="dyPlay(item)"
        v-for="(item, index) in list"
        :key="item.itemCover"
      >
        <div class="container_item_left">
          <div class="container_item_left_title">
            <span class="hot_icon" v-if="index < 3"></span>
            <span class="serial_number" v-else>{{ index + 1 }}.</span>
            <span class="title">
              {{ item.title }}
            </span>
          </div>
          <div class="container_item_left_number" v-if="item.hotValue">
            {{ wanSliceFormat(item.hotValue) }}
          </div>
        </div>
        <div class="container_item_right_warp">
          <img class="container_item_right" :src="item.itemCover" />
          <div :class="`xm_platformIcon_${item.platform}`"></div>
        </div>
      </div>
    </div>
    <div class="no_data" v-else>
      <el-empty
        :image-size="70"
        image="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/bb500557fe2e43cea32c45b68eca89dc_1685948431961.png"
        description="暂无数据"
      />
    </div>
  </div>
</template>

<script setup>
import { wanSliceFormat, getUserMenu, getUserParentMenu } from '@/utils/tools.js'
import { getHotRends, getIndustryRendsV2 } from '@/api/content_center/content_overview.js'
import { useRouter } from 'vue-router'
import { sendHrefMessage } from '@/utils/OEA.js'

// import { useStore } from 'vuex'

const props = defineProps({
  type: {
    type: String,
    default: 'platform' // platform 平台热词 industry 行业热词
  }
})

const list = ref([])
const loading = ref(true)
// const store = useStore()
// 基础版只显示矩阵号等级规则，其余版本显示完整
// const systemVersion = computed(() => store.state.user.systemVersion)

const getList = () => {
  loading.value = true
  if (props.type === 'platform') {
    getHotRends({}).then(res => {
      loading.value = false
      if (res.code === 0) {
        list.value = res?.data || []
      }
    })
  } else {
    getIndustryRendsV2({}).then(res => {
      loading.value = false
      if (res.code === 0) {
        const metaList = res?.data || []
        list.value = metaList.map(item => {
          return {
            id: item.id,
            title: item.videoTitle,
            itemCover: item.videoCoverUrl,
            platform: item.platform
            // hotValue: ''
          }
        })
      }
    })
  }
}
// if (props.type === 'platform')
getList()
const router = useRouter()
const dyPlay = item => {
  if (props.type === 'platform') {
    if (item.shareUrl) {
      window.open(item.shareUrl)
    }
  } else {
    const path = '/sumwhy_video/inspiration_library/video_detail'
    // systemVersion.value === 1 || systemVersion.value === 4 || systemVersion.value === 3
    //   ? '/sumwhy_video/inspiration_library/video_detail'
    //   : '/content_center/inspiration_library/video_detail'
    // 跨菜单跳转 begin
    const menu = getUserMenu('sumvideo:inspiration')
    const parentMenu = menu ? getUserParentMenu(menu.parentId) : null
    if (menu && parentMenu) {
      sessionStorage.setItem('menuActive', menu?.scopeUrl)
      sessionStorage.setItem('module', parentMenu?.parentName || parentMenu?.scopeName)
      const url = location.origin + path + '?id=' + item.id
      sendHrefMessage(url)
    } else {
      router.push({
        path: path,
        query: {
          id: item.id
        }
      })
    }
    // 跨菜单跳转 end
  }
}
</script>

<style lang="scss" scoped>
.hot_trends {
  //margin-top: 16px;
  background-color: #fff;
  border-radius: 4px;
  padding: 22px 12px;
  height: 614px;

  .module_title {
    font-size: 18px;
    padding: 0 12px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #303133;
    line-height: 26px;
    margin-bottom: 5px;
  }

  .hot_trends_container {
    height: calc(100% - 25px);
    overflow-y: scroll;
    &::-webkit-scrollbar {
      display: none;
    }

    .container_item {
      cursor: pointer;
      padding: 12px;
      height: 88px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &:hover {
        background: #f7f8fa;
      }

      .container_item_left {
        //@include mult_line(2);
        .container_item_left_title {
          //position: relative;
          max-height: 43px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
          @include mult_line(2);

          .title {
            vertical-align: top;
          }

          .serial_number {
            margin-right: 3px;
            font-size: 14px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #8f939a;
            line-height: 20px;
          }
        }

        .hot_icon {
          //position: absolute;
          //top: 50%;
          display: inline-flex;
          width: 20px;
          height: 20px;
          background-size: cover;
          background-image: url('https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/51b6e239cc654e66b8eb7fadd668549f_1686021751188.png');
        }

        .container_item_left_number {
          margin-top: 4px;
          width: 36px;
          height: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #909399;
          line-height: 20px;
        }
      }
      .container_item_right_warp {
        width: 64px;
        height: 64px;
        position: relative;
        flex-shrink: 0;
        margin-left: 8px;
        background-color: #d8d8d8;
        border-radius: 4px;
      }

      .container_item_right {
        width: 100%;
        height: 100%;
        background-color: #d8d8d8;
        border-radius: 4px;
      }
    }
  }

  .no_data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100% - 50px);
  }
}
.hot_trends + .hot_trends {
  margin-top: 16px;
}
</style>
