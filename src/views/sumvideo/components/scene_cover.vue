<template>
  <div class="scene_cover_page">
    <!-- 一张图 -->
    <div class="one_pic_box pic_box" v-if="list && list.length == 1">
      <img :src="getUrlFun(list[0])" />
    </div>
    <!-- 两张图 -->
    <div class="two_pic_box pic_box" v-if="list && list.length == 2">
      <div class="pic_two">
        <img :src="getUrlFun(list[0])" />
      </div>
      <div class="pic_two"><img :src="getUrlFun(list[1])" /></div>
    </div>
    <!-- 三张图 -->
    <div class="three_pic_box pic_box" v-if="list && list.length == 3">
      <div class="three_left">
        <img :src="getUrlFun(list[0])" />
      </div>
      <div class="three_right">
        <div class="three_other">
          <img :src="getUrlFun(list[1])" />
        </div>
        <div class="three_other">
          <img :src="getUrlFun(list[2])" />
        </div>
      </div>
    </div>
    <!-- 四张图 -->
    <div class="four_pic_box pic_box" v-if="list && list.length == 4">
      <div class="four_half">
        <div class="four_half_half">
          <img :src="getUrlFun(list[0])" />
        </div>
        <div class="four_half_half">
          <img :src="getUrlFun(list[1])" />
        </div>
      </div>
      <div class="four_half">
        <div class="four_half_half">
          <img :src="getUrlFun(list[2])" />
        </div>
        <div class="four_half_half">
          <img :src="getUrlFun(list[3])" />
        </div>
      </div>
    </div>
    <!-- 五张图 -->
    <div class="five_pic_box pic_box" v-if="list && list.length == 5">
      <div class="five_left">
        <div class="left_half">
          <img :src="getUrlFun(list[0])" />
        </div>
        <div class="left_half">
          <img :src="getUrlFun(list[1])" />
        </div>
      </div>
      <div class="five_right">
        <div class="right_half">
          <img :src="getUrlFun(list[2])" />
        </div>
        <div class="right_half">
          <img :src="getUrlFun(list[3])" />
        </div>
        <div class="right_half">
          <img :src="getUrlFun(list[4])" />
        </div>
      </div>
    </div>
    <!-- 六张图 -->
    <div
      class="six_pic_box pic_box"
      v-if="
        (!(origin && origin === 'imgTextList') && list && list.length > 5) ||
        (origin && origin === 'imgTextList' && list && list.length === 6)
      "
    >
      <div class="six_top">
        <div class="six_top_left"><img :src="getUrlFun(list[0])" /></div>
        <div class="six_top_right">
          <div class="top_right_half"><img :src="getUrlFun(list[1])" /></div>
          <div class="top_right_half"><img :src="getUrlFun(list[2])" /></div>
        </div>
      </div>
      <div class="six_bottom">
        <div class="bottom_half"><img :src="getUrlFun(list[3])" /></div>
        <div class="bottom_half"><img :src="getUrlFun(list[4])" /></div>
        <div class="bottom_half"><img :src="getUrlFun(list[5])" /></div>
      </div>
    </div>
    <!-- 九张图 -->
    <div
      class="nine_pic_box pic_box"
      v-if="origin && origin === 'imgTextList' && list && list.length === 9"
    >
      <div class="nine_half_1">
        <div class="nine_half_2"><img :src="getUrlFun(list[0])" /></div>
        <div class="nine_half_2"><img :src="getUrlFun(list[1])" /></div>
        <div class="nine_half_2"><img :src="getUrlFun(list[2])" /></div>
      </div>
      <div class="nine_half_1">
        <div class="nine_half_2"><img :src="getUrlFun(list[3])" /></div>
        <div class="nine_half_2"><img :src="getUrlFun(list[4])" /></div>
        <div class="nine_half_2"><img :src="getUrlFun(list[5])" /></div>
      </div>
      <div class="nine_half_1">
        <div class="nine_half_2"><img :src="getUrlFun(list[6])" /></div>
        <div class="nine_half_2"><img :src="getUrlFun(list[7])" /></div>
        <div class="nine_half_2"><img :src="getUrlFun(list[8])" /></div>
      </div>
    </div>
    <img
      v-if="isByXM"
      class="xm_icon"
      src="https://tagvv-1256030678.file.myqcloud.com/202410218dz9v.png"
      alt=""
    />
  </div>
</template>
<script setup>
// 场景图的封面 1张 2张 3张 4张 5张 6张 超过6张按6张显示
// 图文模板 1 3 6 9张
const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return []
    }
  },
  isByXM: Boolean,
  origin: String
})
const { list, isByXM } = toRefs(props)
// 防止有的图片太大，加载太慢，所以给每张图片都加一个绝对质量，进行压缩
function getUrlFun(info) {
  return info.thumbUrl || info.url
  // if (info.size > 1024) {
  //   const e = info.url
  //   const ossType = e.indexOf('aliyuncs.com') > -1 ? 'ali' : 'tx' // ali 阿里云的视频 tx 腾讯云的视频
  //   return `${e}${
  //     ossType === 'ali'
  //       ? (e.indexOf('?') > -1 ? '' : '?x-oss-process=image/quality') + ',Q_60'
  //       : (e.indexOf('?') > -1 ? '' : '?imageMogr2/') + 'quality/60'
  //   }`
  // } else {
  //   return info.url
  // }
}
</script>
<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.scene_cover_page {
  width: 100%;
  height: 100%;
  position: relative;
  .pic_box {
    width: 100%;
    height: 100%;
  }
  .two_pic_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .pic_two {
      width: calc((100% - 2px) / 2);
      height: 100%;
    }
    .pic_two + .pic_two {
      margin-left: 2px;
    }
  }
  .three_pic_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .three_left,
    .three_right {
      width: calc((100% - 2px) / 2);
      height: 100%;
    }
    .three_right {
      margin-left: 2px;
      .three_other {
        width: 100%;
        height: calc((100% - 2px) / 2);
      }
      .three_other + .three_other {
        margin-top: 2px;
      }
    }
  }
  .four_pic_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .four_half {
      width: 100%;
      height: calc((100% - 2px) / 2);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      .four_half_half {
        width: calc((100% - 2px) / 2);
        height: 100%;
      }
      .four_half_half + .four_half_half {
        margin-left: 2px;
      }
    }
    .four_half + .four_half {
      margin-top: 2px;
    }
  }
  .five_pic_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .five_left {
      width: calc((100% - 2px) / 3 * 2);
    }
    .five_right {
      width: calc((100% - 2px) / 3);
      margin-left: 2px;
    }
    .five_left,
    .five_right {
      height: 100%;
      .left_half {
        width: 100%;
        height: calc((100% - 2px) / 2);
      }
      .right_half {
        width: 100%;
        height: calc((100% - 4px) / 3);
      }
      .right_half + .right_half,
      .left_half + .left_half {
        margin-top: 2px;
      }
    }
  }
  .six_pic_box {
    .six_top {
      width: 100%;
      height: calc((100% - 2px) / 3 * 2);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      .six_top_left {
        width: calc((100% - 4px) / 3 * 2 + 2px);
        height: 100%;
      }
      .six_top_right {
        margin-left: 2px;
        width: calc((100% - 2px) / 3);
        height: 100%;
        .top_right_half {
          width: 100%;
          height: calc((100% - 2px) / 2);
        }
        .top_right_half + .top_right_half {
          margin-top: 2px;
        }
      }
    }
    .six_bottom {
      margin-top: 2px;
      width: 100%;
      height: calc((100% - 2px) / 3);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      .bottom_half {
        width: calc((100% - 4px) / 3);
        height: 100%;
      }
      .bottom_half + .bottom_half {
        margin-left: 2px;
      }
    }
  }
  .nine_pic_box {
    .nine_half_1 {
      width: 100%;
      height: calc((100% - 4px) / 3);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
    }
    .nine_half_1 + .nine_half_1 {
      margin-top: 2px;
    }
    .nine_half_2 {
      height: 100%;
      width: calc((100% - 4px) / 3);
    }
    .nine_half_2 + .nine_half_2 {
      margin-left: 2px;
    }
  }
}
img {
  border-radius: 4px;
  width: 100%;
  height: 100%;
  display: flex;
  object-fit: cover;
  // border: 1px solid #ffffff;
}
</style>
