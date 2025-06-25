<template>
  <div
    :class="[
      'one_preview',
      'customer_preview',
      props.data.err ? 'err_preview' : '',
      props.chooseTab === 'creative_followUp' ? 'choose_preview' : ''
    ]"
    v-if="props.data.switch === '1'"
  >
    <img class="top_img" v-if="props.data.title" :src="props.data.title" alt="" />
    <!-- 跟拍模板数量大于0 -->
    <div class="bottom_content" v-if="followUpNum && followUpNum > 0">
      <div class="one_content" v-for="(item, index) in changeNum(followUpNum)" :key="index">
        <img :src="defaultImgList[index]" alt="" />
        <div class="content_mask">
          <div class="num_box">3分镜·233次拍同款</div>
          <div class="title">视频标题视频标题视频标题视频标题视频标题视频标题</div>
        </div>
        <div class="refer_box">仅供参考</div>
      </div>
    </div>
    <!-- 跟拍模板数量为0 -->
    <div class="bottom_content" v-else>
      <div class="one_content">
        <img src="https://tagvv-1256030678.file.myqcloud.com/202211288xxcm.png" alt="" />
      </div>
    </div>
    <!-- 跟拍模板数量大于4，显示查看更多 -->
    <div class="content_more" v-if="followUpNum && followUpNum > 4">
      查看更多
      <img src="https://tagvv-1256030678.file.myqcloud.com/20230809ww1jv.png" alt="" />
    </div>
  </div>
</template>
<script setup>
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
  },
  followUpNum: {
    type: String || Number,
    default: null
  }
})
const defaultImgList = [
  'https://tagvv-1256030678.file.myqcloud.com/20230811wpv34.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/20230811s76eh.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/202308118hpgc.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/202308115oar4.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/20230811qt0mz.jpg'
]
function changeNum(num) {
  console.log('num', num)
  if (num && num > 4) {
    return 4
  } else {
    return num ? parseInt(num) : num
  }
}
</script>
<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';

.customer_preview {
  width: 351px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;

  .top_img {
    width: 100%;
    object-fit: cover;
    margin-bottom: 4px;
    height: 54px;
  }

  .bottom_content {
    padding: 0 12px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_content {
      width: calc((100% - 9px) / 2);
      height: 264px;
      border-radius: 8px;
      margin-bottom: 9px;
      position: relative;
      img {
        border-radius: 8px;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: flex;
      }
      .content_mask {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-start;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);

        border-radius: 8px;
        padding: 8px 12px;
        .num_box {
          min-width: 106px;
          height: 18px;
          border-radius: 2px;
          background: rgba(0, 0, 0, 0.4);
          padding: 0 4px;
          text-align: center;
          font-size: 11px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.8);
          line-height: 18px;
        }
        .title {
          margin-top: 5px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          line-height: 20px;
          @include mult_line(2);
        }
      }
      .refer_box {
        width: 64px;
        height: 22px;
        border-radius: 2px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-size: 14px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.5);
        line-height: 20px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
      }
    }
  }
  .content_more {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    font-size: 12px;
    font-weight: 400;
    color: #8f959e;
    line-height: 18px;
    padding: 7px 0 16px;
    img {
      width: 14px;
      height: 14px;
      object-fit: contain;
      margin-top: -1px;
    }
  }
}
</style>
