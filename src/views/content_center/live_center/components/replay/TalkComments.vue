<template>
  <div class="talk-comments">
    <!-- <div class="talk-title">评论内容</div> -->
    <div class="talk-list" :style="talkCommentStyle" ref="talkComment">
      <!-- <div class="at-time" v-if="talkList.atTime">{{talkList.atTime.split(':').slice(0, 2).join(':')}}</div> -->

      <!-- <div class="talk-item flex" v-for="item in talkList" :key="Math.random()">
        <div class="talk-i-time">{{item.atTime.split(':').slice(0, 2).join(':')}}&nbsp;{{ item.nickName || '直播管家' }}：</div>
        <div class="talk-i-sub two-hidden">{{ item.content }}</div>
      </div> -->
      <div v-show="talkListTotal > 0">
        <!-- Math.random() -->
        <div class="talk-item" v-for="(item, index) in talkList" :key="index">
          <span class="talk-i-time">
            {{ item.atTime.split(':').slice(0, 2).join(':') }}&nbsp;{{
              item.nickName || '直播管家'
            }}：
          </span>
          {{ item.content }}
        </div>
      </div>
      <div class="no-talk" v-show="talkListTotal === 0">
        <img src="@/assets/images/replay/no-talk.png" alt="" srcset="" />
        <span>当前时间段暂无弹幕信息</span>
      </div>
      <div class="no-talk" v-show="talkListTotal === -1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="30px"
          height="30px"
          viewBox="0 0 50 50"
          style="enable-background: new 0 0 50 50"
          xml:space="preserve"
        >
          <path
            fill="#6647ff"
            d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z"
            transform="rotate(275.098 25 25)"
          >
            <animateTransform
              attributeType="xml"
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="0.6s"
              repeatCount="indefinite"
            ></animateTransform>
          </path>
        </svg>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    talkWidth: {
      type: Number,
      default: 272
    },
    talkListTotal: {
      type: Number,
      default: -1
    },
    talkHeight: {
      type: Number,
      default: 276
    },
    talkAtTime: {
      type: String,
      default: ''
    },
    talkList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  mounted() {
    console.log('width', this.talkWidth, 'height', this.talkHeight)
  },
  data() {
    return {}
  },
  computed: {
    talkCommentStyle() {
      return {
        width: this.talkWidth + 'px',
        height: this.talkHeight + 'px'
      }
    }
  },
  watch: {
    talkList: {
      handler(valV) {
        // this.$nextTick(() => {
        //   this.$refs.talkComment.scrollTop = 0
        // })
      },
      immediate: true,
      deep: true
    }
  }
}
</script>
<style lang="scss" scoped>
::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 4px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 4px;
  margin: 0 2px;
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 4px;
  background-color: #c0c2c2;
  // margin: 0 5px;
}
.talk-comments {
  .talk-title {
    font-size: 16px;
    margin-bottom: 20px;
  }
  .talk-list {
    overflow: hidden;
    overflow-y: auto;
  }
  .at-time {
    color: #909399;
    font-size: 12px;
    margin-bottom: 6px;
  }
  .talk-item {
    padding: 4px 0;
    font-size: 12px;
    line-height: 16px;
    // border-bottom: 1px solid #efeeef;
    .talk-i-time {
      color: #909399;
      font-size: 12px;
      // padding-right: 5px;
      // width: 80px;
      // height: 15px;
      // overflow: hidden;
    }
    .talk-i-sub {
      color: #303133;
      font-size: 12px;
      flex: 1;
    }
  }
  .no-talk {
    height: 100%;
    width: 226px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    img {
      width: 135px;
    }
    span {
      margin-top: 8px;
      color: #606266;
      font-size: 12px;
    }
  }
}
</style>
