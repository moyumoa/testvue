<template>
  <div class="preview_page">
    <div class="preview_content">
      <div class="content_top">
        <img src="https://tagvv-1256030678.file.myqcloud.com/202306160kg6c.png" />
      </div>
      <div
        style="height: 100%"
        class="one_content"
        v-for="(value, name, index) in configList"
        :key="index"
        @click="updateTabFun(name)"
      >
        <component
          :chooseTab="props.chooseTab"
          :is="value.previewPage"
          :data="props.data && props.data[value.infoKey] ? props.data[value.infoKey] : {}"
          :followUpNum="props.followUpNum"
          :somePreviewInfo="props.somePreviewInfo"
        />

        <!--上面对应的格式参考如下 拿排行榜作为案例 -->
        <!-- <rankPreview
                v-if="name == 'mission:rank'"
                :data="props.data && props.data.rankInfo ? props.data.rankInfo : {}"
              ></rankPreview> -->
      </div>
    </div>
  </div>
</template>
<script setup>
import { configList } from './components/config.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  configInfo: {
    type: Object
  },
  data: {
    type: Object
  },
  chooseTab: {
    type: String
  },
  followUpNum: {
    type: String || Number,
    default: null
  },
  somePreviewInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const emits = defineEmits(['updateTab'])
const updateTabFun = throttle(e => {
  emits('updateTab', e)
}, 400)
</script>
<style lang="scss" scoped>
@import '@/views/market/miniprogram_operation/components/css/setting_page.scss';
.content_brand {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  left: 0px;
  top: 54px;
  width: 100%;

  .brand_name {
    width: 100%;
    font-weight: 600;
    font-size: 16px;
    color: #1f2329;
    line-height: 22px;
    text-align: center;
  }
}
.preview_page {
  padding-top: 24px !important;
  height: 100% !important;
}
.preview_content {
  position: relative;
}
.content_top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  img {
    width: 100%;
    height: 76px;
    object-fit: contain;
  }
}

.content_box {
  padding: 6px 16px 0 !important;
}
div::-webkit-scrollbar {
  display: none;
}
</style>
