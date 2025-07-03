<template>
  <div :class="['one_preview', 'material_preview']">
    <!-- 标题 -->
    <div class="title_box">
      <div class="one_title choose_title">
        <div class="title_line"></div>
        视频素材
      </div>
      <div class="one_title">图片素材</div>
    </div>
    <!-- 筛选项 -->
    <div class="search_box">
      <div class="one_search">
        被使用次数
        <img src="https://tagvv-1256030678.file.myqcloud.com/20240511oth0r.png" alt="" />
      </div>
      <div class="one_search">
        选择文件夹
        <img src="https://tagvv-1256030678.file.myqcloud.com/202405110dli2.png" alt="" />
      </div>
      <div class="one_search">
        选择标签
        <img src="https://tagvv-1256030678.file.myqcloud.com/202405110dli2.png" alt="" />
      </div>
    </div>
    <!-- 列表 -->
    <div class="list_box">
      <div class="one_list" v-for="(item, index) in list" :key="index">
        <!-- 封面 -->
        <img class="list_cover" :src="item" alt="" />
        <!-- 内容 -->
        <div class="list_mask">
          <!-- 右下角 -->
          <div class="mask_bottom">
            <!-- 时长 -->
            <div class="bottom_time">00:03</div>
            <div class="bottom_tag"><div class="bottom_time">标签</div></div>
          </div>
          <!-- 播放按钮 -->
          <img
            class="mask_play"
            src="https://tagvv-1256030678.file.myqcloud.com/20250618peuj6.png"
            alt=""
          />
          <!-- 仅供参考 -->
          <div class="mask_refer">仅供参考</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const list = ref([
  'https://tagvv-1256030678.file.myqcloud.com/20250623d37v1.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/20250623bsmd0.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/20250623c1tfg.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/202506234fhtg.jpg'
])
</script>
<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';
.material_preview {
  .title_box {
    margin-left: 4px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-end;

    .one_title {
      position: relative;
      width: max-content;
      margin-right: 16px;
      font-weight: 400;
      font-size: 16px;
      color: #646a73;
      line-height: 22px;
      padding-bottom: 2px;
    }
    .choose_title {
      font-weight: 600;
      font-size: 20px;
      color: #1f2329;
      line-height: 28px;
      padding-bottom: 0;
    }
    .title_line {
      width: 80px;
      height: 6px;
      background: linear-gradient(270deg, rgba(105, 158, 250, 0) 0%, rgba(56, 101, 243, 0.4) 100%);
      border-radius: 3px;
      position: absolute;
      bottom: 2px;
      left: 0;
    }
  }
  .search_box {
    margin: 12px 0 16px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .one_search {
      margin-right: 12px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      width: max-content;

      padding: 8px 12px;
      height: 32px;
      background: #ffffff;
      border-radius: 16px;
      font-weight: 400;
      font-size: 12px;
      color: #8f959e;
      line-height: 18px;
      img {
        width: 16px;
        height: 16px;
        display: flex;
        object-fit: contain;
        margin-left: 4px;
      }
    }
  }
  .list_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_list {
      margin: 0 0 9px 0;
      width: calc((100% - 9px) / 2);

      height: 284px;
      border-radius: 8px;
      position: relative;
      .list_cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
        display: flex;
      }
      .list_mask {
        width: 100%;
        border-radius: 8px;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        // background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
        .mask_top {
          position: absolute;
          right: 8px;
          top: 8px;
          padding: 0 6px;
          font-weight: 400;
          font-size: 12px;
          color: #ffffff;
          line-height: 18px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 10px;
        }
        .mask_bottom {
          position: absolute;
          bottom: 8px;
          left: 8px;
          .bottom_time {
            margin-top: 4px;
            width: max-content;
            height: 16px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 2px;
            font-weight: 400;
            font-size: 11px;
            color: #ffffff;
            line-height: 16px;
            padding: 0 4px;
          }
          .bottom_tag {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
          }
        }
        .mask_play {
          display: flex;
          width: 48px;
          height: 48px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translateY(-50%) translate(-50%);
        }
        .mask_refer {
          width: 64px;
          height: 22px;
          border-radius: 2px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          font-size: 14px;
          font-weight: 400;
          color: #ffffff80;
          line-height: 20px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translateY(-50%) translate(-50%);
          z-index: 1;
        }
      }
    }
    .one_list:nth-child(2n) {
      margin-left: 9px;
    }
  }
}
</style>
