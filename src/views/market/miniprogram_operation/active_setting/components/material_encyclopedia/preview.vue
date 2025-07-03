<template>
  <div class="material_preview" v-if="props.data.switch === '1'" style="background: #f3f4f8">
    <!-- 热门素材 -->
    <div class="page_hot">
      <div class="hot_title">
        <span>热门素材</span>
        最多人使用的热门素材，还不收入囊中！
      </div>
      <div class="hot_scroll">
        <div class="hot_list">
          <div class="one_list" v-for="(item, index) in hotList" :key="item">
            <!-- 背景图 -->
            <img class="list_cover" :src="item" alt="" />
            <div class="list_mask">
              <!-- 角标 -->
              <div class="mask_no">
                <img
                  v-if="index == 0"
                  src="https://tagvv-1256030678.file.myqcloud.com/202405116l1vs.png"
                  alt=""
                />
                <img
                  v-else-if="index == 1"
                  src="https://tagvv-1256030678.file.myqcloud.com/20240511ghn3d.png"
                  alt=""
                />
                <img
                  v-else-if="index == 2"
                  src="https://tagvv-1256030678.file.myqcloud.com/20240511rdlw8.png"
                  alt=""
                />
              </div>
              <!-- 类型 -->
              <div class="mask_type">{{ index % 2 == 0 ? '视频' : '图片' }}</div>

              <!-- 下方信息 -->
              <div class="mask_bottom">
                <div class="bottom_tag">标签</div>
                <div class="bottom_tag">被使用0次</div>
              </div>
              <!-- 仅供参考 -->
              <div class="mask_refer">仅供参考</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page_line"></div>
    <!-- 素材列表 -->
    <div class="page_list">
      <concisePreview />
    </div>
  </div>
</template>
<script setup>
import concisePreview from '../../../home_setting/components/material_encyclopedia/concise_preview.vue'

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
const hotList = ref([
  'https://tagvv-1256030678.file.myqcloud.com/20250623d37v1.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/20250623bsmd0.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/20250623c1tfg.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/202506234fhtg.jpg',
  'https://tagvv-1256030678.file.myqcloud.com/20250623icgvc.jpg'
])
</script>
<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';
.material_preview {
  width: 100%;
  height: 100%;
  background: #f3f4f8;
}
.page_hot {
  .hot_title {
    padding: 16px 0 12px 16px;
    font-weight: 400;
    font-size: 14px;
    color: #8f959e;
    line-height: 28px;
    span {
      font-weight: 600;
      font-size: 20px;
      color: #1f2329;
      line-height: 28px;
      margin-right: 12px;
    }
  }
  .hot_scroll {
    width: 100%;
    overflow-x: auto;
  }
  .hot_list {
    width: max-content;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .one_list {
      margin-left: 9px;
      width: 126px;
      height: 168px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      .list_cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: flex;
      }
      .list_mask {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
        border-radius: 8px;
        // background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-start;
        .mask_no {
          position: absolute;
          left: 8px;
          top: 6px;
          img {
            width: 28px;
            height: 28px;
            object-fit: contain;
            display: flex;
          }
        }
        .mask_type {
          position: absolute;
          right: 8px;
          top: 8px;
          width: max-content;
          height: 18px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 10px;
          padding: 0 6px;
          font-weight: 400;
          font-size: 12px;
          color: #ffffff;
          line-height: 18px;
        }
        .mask_bottom {
          padding: 8px;
          .bottom_tag {
            max-width: 100%;
            margin-top: 4px;
            width: max-content;
            height: 16px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 2px;
            padding: 0 4px;
            font-size: 11px;
            color: #ffffff;
            line-height: 16px;
            word-break: break-all;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
            overflow: hidden;
          }
        }
      }
    }
  }
}
.page_line {
  margin: 20px 12px 16px;
  width: calc(100% - 24px);
  height: 1px;
  background: rgba(31, 35, 41, 0.1);
  border-radius: 8px;
}
.page_list {
  width: 100%;
  padding: 0 12px 15px 12px;
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
:deep(.one_preview:hover) {
  cursor: pointer;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  background: transparent;
  box-shadow: none;
}
</style>
