<template>
  <div
    :class="[
      'one_preview',
      'customer_preview',
      props.data.err ? 'err_preview' : '',
      props.chooseTab === 'creative_inspiration' ? 'choose_preview' : ''
    ]"
    v-if="props.data.switch === '1'"
  >
    <img class="top_img" v-if="props.data.title" :src="props.data.title" alt="" />

    <div class="bottom_content">
      <div class="content_box">
        <div class="one_content" v-for="(item, index) in 5" :key="index">
          <img :src="defaultImgList[index]" alt="" />

          <div class="content_mask">
            <div class="mask_top">
              <img class="top_sort" v-if="index < 3" :src="sortList[index]" alt="" />
              <div class="top_sort" v-else></div>
              <div class="top_type">视频</div>
            </div>
            <div class="mask_bottom">
              <div class="bottom_tag">标签</div>
              <div class="bottom_tag">被采用233次</div>
              <div class="bottom_title">视频标题视频标题视频标题视频标题视频标题视频标题</div>
            </div>
          </div>
          <div class="refer_box">仅供参考</div>
        </div>
        <div class="more_tip">
          点击查看更多
          <img src="https://tagvv-1256030678.file.myqcloud.com/20230809h1tey.png" alt="" />
        </div>
      </div>
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
  }
})
const sortList = [
  'https://tagvv-1256030678.file.myqcloud.com/202405116l1vs.png',
  'https://tagvv-1256030678.file.myqcloud.com/20240511ghn3d.png',
  'https://tagvv-1256030678.file.myqcloud.com/20240511rdlw8.png'
]
const defaultImgList = [
  'https://tagvv-1256030678.file.myqcloud.com/20230811wpv34.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/20230811s76eh.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/202308118hpgc.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/202308115oar4.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/20230811qt0mz.jpg'
]
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
    width: 100%;
    padding: 0px 0px 16px 12px;
    overflow-x: overlay;
    .content_box {
      width: max-content;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .one_content {
        margin-right: 9px;
        width: 126px;
        height: 168px;
        border-radius: 8px;
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
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);

          border-radius: 8px;

          .mask_top {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            padding: 6px 8px 0 6px;
            .top_sort {
              width: 28px;
              height: 28px;
              object-fit: contain;
              display: flex;
            }
            .top_type {
              margin-top: 2px;
              width: 36px;
              height: 18px;
              background: rgba(0, 0, 0, 0.4);
              border-radius: 10px;
              font-size: 12px;
              color: #ffffff;
              line-height: 18px;
              text-align: center;
            }
          }
          .mask_bottom {
            padding: 8px;
            .bottom_tag {
              background: rgba(0, 0, 0, 0.4);
              border-radius: 2px;
              width: max-content;
              font-size: 11px;
              color: #ffffff;
              line-height: 16px;
              text-align: center;
              padding: 0 4px;
              margin-bottom: 4px;
            }
          }
          .bottom_title {
            font-size: 12px;
            font-weight: 600;
            color: #ffffff;
            line-height: 18px;
            @include mult_line(1);
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

      .more_tip {
        width: 33px;
        height: 168px;
        padding: 0 12px 0 7px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 13px;
        font-weight: 400;
        color: #8f959e;
        line-height: 16px;
        text-align: center;
        img {
          width: 14px;
          height: 14px;
          object-fit: contain;
          display: flex;
          margin-top: 2px;
        }
      }
    }
  }
}
</style>
