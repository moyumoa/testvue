<template>
  <div
    :class="[
      'one_preview',
      'recommend_preview',
      props.data.err ? 'err_preview' : '',
      props.chooseTab === 'current_version_recommend' ? 'choose_preview' : ''
    ]"
    v-if="props.data.switch === '1'"
  >
    <div class="preview_title">
      <img class="title_img" v-if="props.data.title" :src="props.data.title" alt="" />
    </div>
    <!-- 具体内容 -->
    <!-- 设置了内容 -->

    <div class="all_box" v-if="props.data.list && props.data.list.length > 0">
      <div
        :class="{ one_box: true, shadow_box: index === 0 }"
        v-for="(item, index) in props.data.list"
        :key="index"
      >
        <!--自定义的第一个视频做特殊处理  -->
        <div class="other_box" v-if="index === 0">
          <!-- 视频封面-->

          <img :src="item.coverUrl" alt="" class="video_cover" />

          <!-- 视频标题+员工信息 -->
          <div class="other_bottom">
            <div class="bottom1 line-hidden2">
              {{ item.recommendReason ? `推荐理由:${item.recommendReason}` : item.title || '' }}
            </div>
            <div class="user_box" v-if="item.source === 2">
              <img class="info_head" :src="item.userPhoto || defaultPhoto" />
              <div class="info_name line-hidden1">
                {{ item.userName || '' }} {{ item.orgName || '' }}
              </div>
            </div>
          </div>
        </div>
        <div class="box_box" v-else>
          <!-- 视频封面-->

          <img :src="item.coverUrl" alt="" class="video_cover" />
          <div class="box_back">
            <!-- 视频标题+员工信息 -->
            <div class="back_bottom">
              <div class="bottom1 line-hidden2">
                {{ item.recommendReason ? `推荐理由:${item.recommendReason}` : item.title || '' }}
              </div>
              <div class="user_box" v-if="item.source === 2">
                <img class="info_head" :src="item.userPhoto || defaultPhoto" />
                <div class="info_name line-hidden1">
                  {{ item.userName || '' }} {{ item.orgName || '' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 视频右上角的信息 包含标签+显示数据+金币  -->
        <div class="top_back">
          <!-- 标签 -->
          <template v-if="item.extra1 && item.extra1.length > 0">
            <div class="one_data" v-for="(item, index) in item.extra1" :key="index">
              <img
                class="icon_icon icon_right"
                v-if="item === 'fiery'"
                src="https://tagvv-1256030678.file.myqcloud.com/20221121we1vx.png"
                alt=""
              />
              <img
                class="icon_icon icon_right"
                v-else-if="item === 'cheer'"
                src="https://tagvv-1256030678.file.myqcloud.com/20221122oilt4.png"
                alt=""
              />
              <template v-else>
                {{ tagList[item] }}
              </template>
            </div>
          </template>
          <!-- 显示数据 -->
          <div class="one_data" v-if="item.displayOptions && item.displayOptions != 'none'">
            <template v-if="item.displayOptions == 'play_cnt'">
              <img
                class="icon_icon icon_right"
                src="https://tagvv-1256030678.file.myqcloud.com/20221119sx3mq.png"
                alt=""
              />
              {{ wanSliceFormat(item.playCount || 0) }}
            </template>
            <template v-else>
              <img
                class="icon_icon icon_right"
                src="https://tagvv-1256030678.file.myqcloud.com/20221121nzrzq.png"
                alt=""
              />
              {{ wanSliceFormat(item.diggCount || 0) }}
            </template>
          </div>
          <!-- 金币数 -->
          <div class="one_data" v-if="item.taskId">
            <img
              class="icon_gold"
              src="https://tagvv-1256030678.file.myqcloud.com/20220816uiju7.png"
              alt=""
            />
            {{ wanSliceFormat(item.goldCnt || 0) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 未设置内容 -->
    <div class="all_box" v-else>
      <div class="one_box">
        <div class="box_box">
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/2022112279u74.png"
            alt=""
            class="video_cover"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { wanSliceFormat } from '@/utils/tools.js'
import { tagList } from './tag.js'
const props = defineProps({
  data: {
    type: Object,
    data() {
      return {
        switch: '0'
      }
    }
  },
  chooseTab: {
    type: String
  }
})
const defaultPhoto = ref('https://tagvv-1256030678.file.myqcloud.com/20220402eaa5p.png')
</script>
<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';
.recommend_preview {
  background: #ffffff;
  border-radius: 12px;
}
.all_box {
  width: 100%;
  padding: 4px 12px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;

  .one_box {
    width: calc(50% - 4.5px);
    margin-bottom: 9px;
    height: 264px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }
  .shadow_box {
    box-shadow: 0px 2px 12px 0px rgba(54, 55, 59, 0.1);
  }
  .top_back {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding-left: 8px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_data {
      margin: 8px 8px 0 0;
      background: rgba(0, 0, 0, 0.4);
      padding: 0 6px;
      border-radius: 12px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: max-content;
      font-size: 12px;
      font-weight: 400;
      color: #ffffff;
      line-height: 18px;
      height: 18px;
      .icon_icon {
        width: 16px;
        height: 16px;
        object-fit: cover;
      }
      .icon_gold {
        width: 12px;
        height: 12px;
        object-fit: cover;
        margin-right: 4px;
      }
      .icon_right {
        margin-right: 1px;
      }
    }
  }
  .box_box {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    .video_cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
    .box_back {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-end;
      .back_bottom {
        width: 100%;
        padding: 8px 12px;
        .bottom1 {
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
          line-height: 20px;
        }

        .user_box {
          margin-top: 8px;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          .info_head {
            width: 20px;
            height: 20px;
            border-radius: 100%;
            object-fit: cover;
            margin-right: 6px;
          }
          .info_name {
            width: calc(100% - 26px);

            font-size: 12px;
            font-weight: 400;
            color: #fff;
            line-height: 18px;
          }
        }
      }
    }
  }
  .other_box {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    .video_cover {
      width: 100%;
      height: 200px;
      border-radius: 8px 8px 0px 0px;
      object-fit: cover;
      border-radius: 8px 8px 0px 0px;
    }
    .other_bottom {
      width: 100%;
      height: 84px;
      background: #ffffff;
      border-radius: 0px 0px 8px 8px;
      padding: 8px;
      .bottom1 {
        font-size: 14px;
        font-weight: 500;
        color: #1f2329;
        line-height: 20px;
        height: 40px;
      }
      .user_box {
        margin-top: 8px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .info_head {
          width: 20px;
          height: 20px;
          border-radius: 100%;
          object-fit: cover;
          margin-right: 6px;
        }
        .info_name {
          width: calc(100% - 26px);

          font-size: 12px;
          font-weight: 400;
          color: #8f959e;
          line-height: 18px;
        }
      }
    }
  }
}
</style>
