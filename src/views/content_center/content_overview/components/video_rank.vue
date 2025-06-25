<template>
  <div class="video_rank">
    <div class="module_title">热门视频</div>
    <div class="video_rank_container" v-if="list.length > 0">
      <div
        class="video_rank_item"
        v-for="(item, index) in list"
        :key="index"
        @click="toDetail(item)"
      >
        <div :class="['item_index', `index_${index}`]">{{ index + 1 }}.</div>
        <div class="item_main">
          <div class="video_cover">
            <img v-if="item.cover" class="video_cover" :src="item.cover" />
            <img
              v-else
              class="video_cover"
              src="@/assets/images/content_center/default_cover.png"
              alt
            />
            <!-- 图集 -->
            <imgTextTask_ICON v-if="item.mediaType == 2" :info="item" :useClick="false" />
            <!-- 发布平台 -->
            <div :class="[`xm_platformIcon_${item.platform}`]"></div>
          </div>
          <div class="video_info">
            <div class="video_title">{{ item.itemTitle || '--' }}</div>
            <div class="video_img">
              <img class="user_icon" :src="item.xuserHeadImg" v-if="item.xuserHeadImg || false" />
              <img
                v-else
                class="user_icon"
                src="@/assets/images/content_center/default_user.png"
                alt
              />
              <div class="user_name">{{ item.nickname || '--' }}</div>
              <!-- 矩阵号被删除 -->
              <div class="xm_delClass" v-if="item.xuserIsDel && item.xuserIsDel == 1"></div>
            </div>
          </div>
        </div>
        <div class="item_right">{{ wanSliceFormat(item.playCount) }}播放</div>
      </div>
      <div class="more_info" @click="toMore" v-if="props.showMore">
        更多
        <el-icon>
          <i-arrow-right />
        </el-icon>
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
import { getvideoRanking } from '@/api/content_center/rank.js'
import { useRouter } from 'vue-router'
import { wanSliceFormat, isNotEmpty } from '@/utils/tools.js'
import dayjs from 'dayjs'

const props = defineProps({
  size: {
    type: Number,
    default: 5
  },
  // 是否显示更多
  showMore: {
    type: Boolean,
    default: true
  },
  groupId: String
})
watch(
  () => props.groupId,
  () => {
    getList()
  }
)
const otherParams = ref()
const list = ref([])
const getList = () => {
  let params = {
    pageNo: 1,
    pageSize: props.size,
    groupIds: props.groupId ? [props.groupId] : [],
    platform: null, // null 表示全部平台， 不传默认抖音平台
    videoRankingType: 1, // 视频排行类别 1 播放 2 点赞 3 评论 4分享 5 销售额 6 销售量 7 线索数
    startDate: dayjs(new Date()).subtract(1, 'day').format('YYYY-MM-DD 00:00:00'),
    endDate: dayjs(new Date()).subtract(1, 'day').format('YYYY-MM-DD 23:59:59')
  }
  params = { ...params, ...otherParams.value }
  getvideoRanking(params).then(res => {
    if (res.code === 0) {
      list.value = res?.data?.records || []
    }
  })
}
getList()
const router = useRouter()
// 去视频排行榜列表
const toMore = () => {
  router.push('/content_center/video_rankinglist')
}
// 去当前视频的数据详情
const toDetail = item => {
  router.push(
    `/content_center/content_manage/manage_detail?itemId=${window.encodeURIComponent(
      item.dyItemId
    )}`
  )
}
function paramChange(param) {
  otherParams.value = isNotEmpty(param) ? param : null
  getList()
}
defineExpose({
  paramChange
})
</script>

<style lang="scss" scoped>
.video_rank {
  flex: 1;
  margin-top: 16px;
  //margin-right: 16px;
  padding: 22px 24px;
  background-color: #fff;
  border-radius: 4px;
  //height: 531px;

  .module_title {
    font-size: 18px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #303133;
    line-height: 26px;
  }

  .video_rank_container {
    margin-top: 20px;
    color: #8f939a;
    height: calc(100% - 50px);
    display: flex;
    flex-direction: column;
    //justify-content: ;

    .video_rank_item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      cursor: pointer;

      .item_index {
        width: 26px;
        font-family: Helvetica;
        font-size: 16px;
      }

      .index_0 {
        color: #db5335;
      }

      .index_1 {
        color: #dd713e;
      }

      .index_2 {
        color: #eeaf14;
      }

      .item_main {
        flex: 1;
        display: flex;
        align-items: center;
        margin-right: 15px;

        .video_cover {
          width: 48px;
          height: 64px;
          margin-right: 10px;
          border-radius: 4px;
          object-fit: cover;
          position: relative;
          .platform_icon_box {
            width: 16px;
            height: 16px;
          }
        }

        .video_info {
          width: calc(100% - 58px);
          .video_title {
            //max-width: 188px;
            height: 20px;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #303133;
            line-height: 20px;
            @include mult_line(1);
          }

          .video_img {
            display: flex;
            align-items: center;
            margin-top: 6px;

            .user_icon {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              object-fit: cover;
              margin-right: 8px;
            }
            .user_name {
              max-width: calc(100% - 78px);
              @include mult_line(1);
              line-height: 1.5;
            }
          }
        }
      }
    }

    .more_info {
      margin-top: auto;
      text-align: center;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .no_data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100% - 50px);
  }
}
</style>
