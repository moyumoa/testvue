<template>
  <div
    :class="[
      'one_preview',
      'video_preview',
      props.data.err ? 'err_preview' : '',
      props.chooseTab === 'video_recommend' ? 'choose_preview' : ''
    ]"
    v-if="props.data.switch === '1'"
  >
    <div class="preview_title">
      <img class="title_img" v-if="props.data.title" :src="props.data.title" alt="" />
    </div>
    <div class="video_box" v-if="props.data.list && props.data.list.length > 0">
      <div
        :class="[
          'one_video',
          index === 0 ? 'first_video' : index === 1 ? 'second_video' : 'thrid_video'
        ]"
        v-for="(item, index) in props.data.list"
        :key="index"
      >
        <template v-if="item.videoImgUrl">
          <!-- 封面 -->
          <img class="video_cover" :src="item.videoImgUrl" alt="" />
          <div class="video_back">
            <!-- 显示数据 -->
            <div class="video_num" v-if="item.displayOptions != 'none'">
              <template v-if="item.displayOptions == 'play_cnt'">
                <img src="https://tagvv-1256030678.file.myqcloud.com/20221119sx3mq.png" alt="" />
                {{ wanSliceFormat(item.playCount || 0) }}
              </template>
              <template v-else>
                <img src="https://tagvv-1256030678.file.myqcloud.com/20221121nzrzq.png" alt="" />
                {{ wanSliceFormat(item.diggCount || 0) }}
              </template>
            </div>
            <!-- 用户信息 -->
            <div class="user_box">
              <div class="user_head">
                <img
                  class="head_back"
                  src="https://tagvv-1256030678.file.myqcloud.com/20221119pv79h.png"
                  alt=""
                />
                <div class="head_box">
                  <img class="head_url" :src="item.avatar || defaultPhoto" alt="" />
                </div>
              </div>
              <div class="user_info">
                <div class="user_name line-hidden1">{{ item.userName || '' }}</div>
                <div class="user_part line-hidden1">{{ item.orgName || '' }}</div>
              </div>
            </div>
          </div>
        </template>

        <img
          v-else
          class="err_box"
          src="https://tagvv-1256030678.file.myqcloud.com/20221121pmlwk.png"
          alt=""
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { wanSliceFormat } from '@/utils/tools.js'
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
.video_preview {
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  // height: 266px;
  .video_box {
    width: 100%;
    position: relative;
    margin-top: 4px;
    padding: 0 12px;
    height: 200px;
    margin-bottom: 14px;
  }
  .one_video {
    width: 126px;
    height: 168px;
    border-radius: 8px;
    overflow: hidden;
    .video_cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .video_back {
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);

      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      .video_num {
        position: absolute;

        top: 8px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding: 0px 6px;

        height: 18px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 10px;
        font-size: 12px;
        font-weight: 400;
        color: #ffffff;
        line-height: 18px;
        img {
          width: 16px;
          height: 16px;
          object-fit: contain;
          margin-right: 2px;
        }
      }
      .user_box {
        width: 100%;
        padding: 0 5px 0 10px;
        position: absolute;
        bottom: 10px;
        left: 0;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .user_head {
          margin-right: 6px;
          position: relative;
          .head_back {
            position: absolute;
            left: -5px;
            top: -7px;
            object-fit: contain;
            width: 16px;
            height: 16px;
          }
          .head_box {
            width: 27px;
            height: 27px;
            border-radius: 100%;
            padding: 1.5px;

            background: linear-gradient(207deg, rgba(255, 224, 101, 1), rgba(255, 187, 18, 1));
            .head_url {
              width: 24px;
              height: 24px;
              object-fit: cover;
              border-radius: 100%;
            }
          }
        }
        .user_info {
          width: calc(100% - 33px);
          .user_name {
            font-size: 12px;
            font-weight: 500;
            color: #ffffff;
            line-height: 18px;
          }
          .user_part {
            font-size: 10px;
            font-weight: 400;
            color: #ffffff;
            line-height: 14px;
          }
        }
      }
    }
  }
  .second_video {
    position: absolute;
    left: 12px;
    top: 16px;
    .video_num {
      left: 8px;
    }
  }
  .first_video {
    position: absolute;
    // left: 113px;
    left: 108px;
    top: 0px;
    width: 150px;
    height: 200px;
    z-index: 2;
    .video_num {
      right: 8px;
    }
    .head_back {
      width: 20px !important;
      height: 20px !important;
      left: -7px !important;
      top: -9px !important;
    }
    .head_box {
      width: 31px !important;
      height: 31px !important;
      .head_url {
        width: 28px !important;
        height: 28px !important;
      }
    }
  }
  .thrid_video {
    position: absolute;
    right: 12px;
    top: 16px;
    .video_num {
      right: 8px;
    }
  }
}
.err_box {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
