<template>
  <div v-if="props.data.switch === '1'">
    <img
      style="width: 100%"
      class="img1"
      src="https://tagvv-1256030678.file.myqcloud.com/20250109q84rs.png"
      alt=""
    />
    <div class="page_mask">
      <div class="mask_refer">仅供参考</div>
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
</script>
<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';

.customer_preview {
  width: 100%;
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
          justify-content: flex-end;
          align-items: flex-start;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);

          border-radius: 8px;
          padding: 8px 12px;
          .title {
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            line-height: 20px;
            @include mult_line(1);
          }
          .start_box {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            .start_label {
              font-size: 10px;
              font-weight: 400;
              color: #ffffff;
              line-height: 14px;
              margin-right: 2px;
            }
            .start_content {
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: center;
              .one_start {
                width: 12px;
                height: 12px;
                .start_icon {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                  display: flex;
                }
              }
              .one_start + .one_start {
                margin-left: 2px;
              }
            }
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
