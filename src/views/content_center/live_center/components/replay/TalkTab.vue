<template>
  <div class="talk-tabs">
    <!-- <div class="tab-select">
      <div class="select-item" :class="{'active': currentIndex === 0}" @click="currentIndex = 0">
        <span>弹幕</span>
        <div class="active-bg"></div>
      </div>
      <div class="select-item" :class="{'active': currentIndex === 1}" @click="currentIndex = 1">
        <span>词云</span>
        <div class="active-bg"></div>
      </div>
    </div> -->
    <div class="tabs-talk-warpper flex">
      <div class="tabs-talk-item" :class="{ active: currentIndex === 0 }" @click="currentIndex = 0">
        <i class="iconfont icon-danmu"></i>
        弹幕内容
      </div>
      <!-- <div class="tabs-talk-item" :class="{ active: currentIndex === 1 }" @click="currentIndex = 1">
        查看热词
      </div> -->
    </div>
    <div class="tab-list">
      <div class="talk-comm list-item" v-show="currentIndex === 0">
        <talk-comments
          :talkList="talkList"
          :talkHeight="410"
          :talkListTotal="talkListTotal"
        ></talk-comments>
      </div>
    </div>
  </div>
</template>
<script>
// import TalkWords from './TalkWords.vue'
// import HotTalk from './HotTalk.vue'
import TalkComments from './TalkComments.vue'
export default {
  components: {
    // TalkWords,
    // HotTalk,
    TalkComments
  },
  props: {
    talkList: {
      type: Array,
      default() {
        return []
      }
    },
    talkListTotal: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      currentIndex: 0
    }
  }
}
</script>
<style lang="scss" scoped>
.hidden {
  overflow: hidden;
}
.re {
  position: relative;
}
.line-hidden {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.two-hidden {
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.flex {
  display: flex;
}
.warp {
  flex-wrap: wrap;
}
.col {
  flex-direction: column;
}
.just-center {
  justify-content: center;
}
.just-start {
  justify-content: flex-start;
}
.just-end {
  justify-content: flex-end;
}
.just-a {
  justify-content: space-around;
}
.just-b {
  justify-content: space-between;
}
.align-center {
  align-items: center;
}
.align-end {
  align-items: flex-end;
}
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
.talk-tabs {
  margin: 16px 0 8px 0;
  // padding-left: 10px;
}
.select-item {
  padding: 6px 20px;
  &:first-child {
    border-right: 1px solid #dcdfe6;
  }
}
.tabs-talk-warpper {
  margin-bottom: 8px;
  .tabs-talk-item {
    cursor: pointer;
    height: 25px;
    font-size: 16px;
    line-height: 25px;
    font-weight: 600;
    .iconfont {
      color: $theme-color;
      margin-right: 4px;
    }
  }
}
.tab-select {
  border: 1px solid #dcdfe6;
  border-radius: 4px 4px 0px 0px;
  display: inline-block;
  display: inline-flex;
  border-bottom: none;
  .select-item {
    position: relative;
    cursor: pointer;
    &.active {
      color: $theme-color;
      .active-bg {
        display: block;
      }
    }
    .active-bg {
      position: absolute;
      display: none;
      left: 0;
      bottom: -1px;
      width: 100%;
      height: 3px;
      z-index: 100;
      background: #fff;
    }
  }
}
.tab-list {
  // border-top: 1px solid #efeeef;
  .list-item {
    width: 100%;
    // height: 215px;
    // height: 276px;
    // border-top: 1px solid #efeeef;
  }
  // .talk-comm {
  //   width: 254px;
  //   // height: 215px;
  //   height: 215px;
  //   overflow: hidden;
  //   overflow-y: auto;
  //   .talk-item {
  //     padding: 12px 0;
  //     border-bottom: 1px solid #efeeef;
  //     .talk-i-time {
  //       color: #909399;
  //       font-size: 12px;
  //       padding-right: 24px;
  //       width: 60px;
  //       height: 15px;
  //       overflow: hidden;
  //     }
  //     .talk-i-sub {
  //       color: #303133;
  //       font-size: 12px;
  //       flex: 1;
  //     }
  //   }
  // }
  .talk-work {
    width: 238px;
    // height: 215px;
    // height: 276px;
    overflow: hidden;
    .words {
      width: 236px;
      // height: 215px;
      height: 276px;
    }
  }
}
</style>
