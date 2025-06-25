<template>
  <div class="detail_page" v-loading="loading">
    <div class="page_left">
      <!-- 视频 -->
      <video
        v-if="info.mediaType == 4"
        class="video_dom"
        :src="info.videoPlayUrl"
        :poster="info.videoCoverUrl || defaultCover"
        controls
      ></video>
      <!-- 图文 -->
      <div class="img_dom" v-else-if="info.mediaType == 2">
        <imgDOM :pictures="info.pictures" />
      </div>
    </div>
    <div class="page_right">
      <!-- 基本信息 -->
      <div class="one_info">
        <div class="info_title">
          <div class="title_line"></div>
          <div class="title_text">基本信息</div>
        </div>
        <div class="info_content">
          <div class="one_form" style="align-items: flex-start">
            <div class="form_label">标题：</div>
            <div class="form_content_xhs">
              <div :class="[info.mediaType == 2 ? 'xhs_title' : 'xhs_desc']" v-if="info.videoTitle">
                {{ info.videoTitle || '-' }}
              </div>
              <div class="xhs_desc" v-if="!info.videoTitle && info.mediaType == 4">
                {{ info.videoTitle || '-' }}
              </div>
              <div
                class="xhs_desc"
                v-if="info.videoCopywriting && info.mediaType == 2"
                v-html="info.videoCopywriting"
              ></div>
            </div>
          </div>
          <div class="one_form">
            <div class="form_label">拍摄难度：</div>
            <div class="form_content">
              <div class="one_start" v-for="(item, index) in 5" :key="index">
                <img
                  class="start_icon"
                  v-if="index + 1 > info.shootDifficult"
                  src="https://tagvv-1256030678.file.myqcloud.com/20221207kfqos.png"
                  alt=""
                />
                <img
                  class="start_icon"
                  v-else
                  src="https://tagvv-1256030678.file.myqcloud.com/20221207dv7qu.png"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div class="one_form">
            <div class="form_label">订阅词：</div>
            <div class="form_content">
              {{ info.subscribeWords || '--' }}
            </div>
          </div>
        </div>
      </div>
      <!-- 来源信息 -->
      <div class="one_info" v-if="info.sourceSwitch === 1">
        <div class="info_title">
          <div class="title_line"></div>
          <div class="title_text">来源信息</div>
        </div>
        <div class="info_content">
          <div class="flex_form">
            <div class="one_form">
              <div class="form_label">来源平台：</div>
              <div class="form_content">
                {{ platformMate('cn', info.platform) || '-' }}
              </div>
            </div>
          </div>
          <div class="flex_form">
            <div class="one_form">
              <div class="form_label">来源账号：</div>
              <div class="form_content" v-if="info.accountAvatar || info.sourceAccountNickname">
                <img class="info_img" :src="info.accountAvatar || defaultCover" alt="" />
                {{ info.sourceAccountNickname || '-' }}
              </div>
              <div class="form_content" v-else>-</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import imgDOM from './components/detail_img.vue'
import { inspirationVideoDetail } from '@/api/content_center/video_library.js'
import { platformMate } from '@/utils/tools.js'
import { useRoute } from 'vue-router'
// import { throttle } from '@/utils/tools.js'

const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')
const id = ref(null)
const loading = ref(true)
const info = ref({
  brandId: 0, // 品牌ID 初次是0
  videoStatus: 0, // 视频状态 初次是0 (0:隐藏 1:对所有品牌可见)
  videoPlayUrl: '', // 视频播放地址
  videoCoverUrl: '', // 视频封面
  videoTitle: '', // 标题
  tradeId: null, // 行业id
  categoryId: null, // 细分类别id
  contentId: null, // 内容定位id
  sourceSwitch: 0, // 来源信息的开关
  platform: null, // 来源平台
  accountFansCount: null, // 粉丝数
  sourceLink: null, // 来源链接
  performanceSwitch: 0, // 表现数据的开关
  diggCount: null, // 点赞数
  commentCount: null, // 评论数
  shareCount: null, // 分享数
  analysisSwitch: 1, // 灵感解析的开关
  shootDifficult: 0, // 拍摄难度
  videoLabel: '', // 视频标签--给后端的 id拼接成的字符串
  videoLabels: [], // 视频标签--前端展示用的
  videoAnalysis: '', // 灵感分析
  shootSuggest: '', // 拍摄建议
  videoCopywriting: '' // 灵感文案
})

const route = useRoute()
onMounted(() => {
  console.log('id', route.query.id)
  id.value = route.query.id || null
  getDetail()
})
function getDetail() {
  inspirationVideoDetail({
    id: id.value
  })
    .then(res => {
      if (res.code === 0) {
        const data = res.data || {}
        if (data.subscribeWords && data.subscribeWords.length > 0) {
          data.subscribeWords = data.subscribeWords.join(',')
        }
        info.value = res.data || {}
      }
    })
    .finally(() => {
      loading.value = false
    })
}
// const router = useRouter()
// const backFun = throttle(function () {
//   router.go(-1)
// }, 700)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.detail_page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;

  .page_left {
    width: 400px;
    height: 100%;
    background: #ffffff;
    border-radius: 4px;
    margin-right: 16px;
    padding: 20px 20px;

    .left_back {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      height: 44px;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      width: max-content;

      .icon_back {
        width: 16px;
        height: 16px;
        object-fit: contain;
        margin-right: 2px;
      }
    }

    .video_dom {
      width: 100%;
      height: calc(100% - 44px);
      max-height: 640px;
      border-radius: 4px;
      background: #181818;
    }
    .img_dom {
      width: 100%;
      height: 640px;
      border-radius: 4px;
    }
  }

  .page_right {
    width: calc(100% - 416px);
    height: 100%;
    overflow-y: auto;

    .one_info {
      width: 100%;
      background: #ffffff;
      border-radius: 4px;
      margin-bottom: 10px;

      .info_title {
        width: 100%;
        height: 58px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding-left: 30px;
        border-bottom: 1px solid #f7f7f7;

        .title_line {
          width: 2px;
          height: 18px;
          background: #364fcd;
          margin-right: 10px;
        }

        .title_text {
          font-size: 16px;
          font-weight: 400;
          color: #000000;
          line-height: 22px;
        }
      }

      .info_content {
        padding: 0px 0 20px 50px;
        .one_form {
          margin-top: 12px;
          margin-right: 60px;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          flex-wrap: wrap;

          .form_label {
            font-size: 14px;
            font-weight: 400;
            color: #606266;
            line-height: 20px;
          }
          .form_content_xhs {
            width: calc(100% - 60px);
            font-size: 14px;
            font-weight: 400;
            color: #323233;
            line-height: 20px;
            word-break: break-all;
            .xhs_title {
              font-size: 16px;
              font-weight: 600;
            }
            .xhs_title + .xhs_desc {
              margin-top: 4px;
            }
            .xhs_desc {
              white-space: pre-wrap;
            }
          }
          .form_content {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            font-size: 14px;
            font-weight: 400;
            color: #323233;
            line-height: 20px;
            word-break: break-all;
            .info_img {
              width: 32px;
              height: 32px;
              // background: #d8d8d8;
              border-radius: 100%;
              object-fit: cover;
              margin-right: 8px;
            }
          }
        }

        .one_form:last-child {
          margin-right: 0;
        }

        .flex_form {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          flex-wrap: wrap;
        }
      }
    }
  }
}
.one_start {
  .start_icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    display: flex;
  }
}
.one_tag {
  margin-top: 4px;
  background: #e4f8fe;
  border-radius: 3px;
  border: 1px solid #93d5fe;
  padding: 2px 9px;

  font-size: 12px;
  font-weight: 400;
  color: #1890ff;
  line-height: 18px;
  margin-right: 12px;
}
.one_tag:last-child {
  margin-right: 0;
}
.html_box {
  img {
    max-width: 100%;
  }
}
.html_form {
  align-items: flex-start !important;
}
.html_content {
  font-size: 14px;
  font-weight: 400;
  color: #323233;
  line-height: 20px;
  width: calc(100% - 80px);
  word-break: break-all;
  word-wrap: break-word;
  line-height: 1.5;
}
.tag_content {
  width: calc(100% - 80px);
  flex-wrap: wrap;
}
.tag_form {
  margin-top: 8px !important;
  .form_label {
    margin-top: 4px;
  }
}
</style>
