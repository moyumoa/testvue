<template>
  <div class="preview_page">
    <div class="preview_head">小程序</div>
    <div class="preview_content">
      <div class="content_top">
        <img src="https://tagvv-1256030678.file.myqcloud.com/202306160kg6c.png" />
      </div>
      <div class="content_brand">
        <img class="brand_logo" :src="brandLogo" alt="" />
        <div class="brand_name">
          {{ brandInfo.brandName || '-' }}
        </div>
      </div>
      <!-- 具体的配置内容 -->
      <div class="content_content">
        <div class="content_box">
          <!-- Banner -->
          <bannerPreview
            :chooseTab="props.chooseTab"
            @click="updateTabFun('mission:banner')"
            :data="props.data && props.data.bannerInfo ? props.data.bannerInfo : {}"
          ></bannerPreview>
          <div class="content_bottom">
            <div
              class="one_content"
              v-for="(value, name, index) in configList"
              :key="index"
              @click="updateTabFun(name)"
            >
              <!-- 因为样式问题，Banner图的格式要特殊处理，所以Banner图要排除掉 -->
              <template v-if="name !== 'mission:banner'">
                <component
                  :chooseTab="props.chooseTab"
                  :is="value.previewPage"
                  :data="props.data && props.data[value.infoKey] ? props.data[value.infoKey] : {}"
                  :followUpNum="props.followUpNum"
                  :somePreviewInfo="props.somePreviewInfo"
                />
              </template>

              <!--上面对应的格式参考如下 拿排行榜作为案例 -->
              <!-- <rankPreview
                v-if="name == 'mission:rank'"
                :data="props.data && props.data.rankInfo ? props.data.rankInfo : {}"
              ></rankPreview> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import bannerPreview from './components/banner/preview.vue'
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
const judgeOEA = inject('$judgeOEA')
const LogoInfo = ref({
  xm: 'https://tagvv-1256030678.file.myqcloud.com/20250312v0fij.png'
  // oea: 'https://tagvv-1256030678.file.myqcloud.com/20230616eh9ij.png'
})
const brandLogo = ref('')
if (judgeOEA()) {
  brandLogo.value = LogoInfo.value.oea
} else {
  brandLogo.value = localStorage.getItem('brandLogo') || LogoInfo.value.xm
}
const brandInfo = JSON.parse(localStorage.getItem('brandInfo'))
const emits = defineEmits(['updateTab'])
const updateTabFun = throttle(e => {
  emits('updateTab', e)
}, 400)
</script>
<style lang="scss" scoped>
@import '../components/css/setting_page.scss';
.content_brand {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  left: 8px;
  top: 46px;
  width: calc(100% - 8px);
  .brand_logo {
    width: 114px;
    height: 31px;
    object-fit: cover;
    display: flex;
  }
  .brand_name {
    width: calc(100% - 202px);
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    line-height: 26px;
    @include mult_line(1);
    &::before {
      content: '';
      display: inline-block;
      width: 1px;
      height: 14px;
      background: #ffffff;
      opacity: 0.4;
      margin-right: 8px;
    }
  }
}
.preview_content {
  position: relative;
  background: #f3f4f8;
  background-image: url('https://tagvv-1256030678.file.myqcloud.com/20250226lcj6m.png');
  background-repeat: no-repeat;
  background-size: cover;
}
.content_top {
  height: 84px !important;
  img {
    width: 100%;
    height: 76px;
    object-fit: contain;
  }
}
.content_content {
  height: calc(100% - 86px) !important;
}
.content_box {
  padding-top: 8px !important;
}
div::-webkit-scrollbar {
  display: none;
}
</style>
