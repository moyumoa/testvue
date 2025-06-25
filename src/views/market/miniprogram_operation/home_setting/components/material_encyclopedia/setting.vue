<template>
  <div class="operation-activity">
    <title-wrapper title="" :subtitle="subtitleObj[materialInfo.switch]">
      <template #right>
        <el-switch
          @change="validConfigFun"
          v-model="materialInfo.switch"
          active-value="1"
          inactive-value="0"
        />
      </template>
    </title-wrapper>
    <div class="container">
      <navSetting
        :title="materialInfo.title"
        :defaultTitle="materialInfo.defaultTitle"
        @updateTitle="updateTitle"
      />
      <div class="container_title">内容设置</div>
      <div class="wrapper">
        <div class="tip">
          <div>
            <div>该模块的素材来源于素材库中设置为开放状态的内容</div>
            <div style="margin-top: 2px">
              当前素材库中被设置为开放素材的数量：{{ materialNum || 0 }}个
              <span @click="toFun">立即设置</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import navSetting from '../../../components/nav_setting.vue'
import TitleWrapper from '../../../components/title_wrapper.vue'
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  data: {
    type: Object,
    default() {
      return {
        materialInfo: {
          switch: '1',
          title: ''
        }
      }
    }
  },
  materialNum: {
    type: Number || String,
    default: null
  }
})
const { materialInfo } = toRefs(props.data)
const subtitleObj = {
  1: '热门素材推荐，丰富员工素材积累',
  0: '开关关闭，全员营销小程序首页将隐藏"素材宝典"'
}

const emits = defineEmits(['updateSetting', 'validConfig'])
function validConfigFun() {
  emits('validConfig', 'creation_open')
}
// 更新标题栏
function updateTitle(e) {
  materialInfo.value.title = e
}

const toFun = throttle(() => {
  window.open(`${location.origin}/sumwhy_video/finish_product_store`)
})
</script>

<style lang="scss" scoped>
@import '../../../components/css/setting_page.scss';
.operation-activity {
  background-color: #fff;
  color: #909399;
  font-size: 14px;

  .container {
    .wrapper {
      .tip {
        width: 573px;
        min-height: 40px;
        background: #eaedfa;
        border-radius: 4px;
        border: 1px solid #889cff;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        font-size: 14px;
        font-weight: 400;
        color: #323233;
        line-height: 20px;
        padding: 10px 12px 10px 16px;
        &::before {
          content: ' ';
          background: url('https://tagvv-1256030678.file.myqcloud.com/20230609abqll.png') no-repeat;
          width: 16px;
          height: 16px;
          background-size: cover;
          margin-right: 10px;
          margin-top: 3px;
        }
        div {
          width: calc(100% - 26px);
        }
        span {
          margin-left: 12px;
          cursor: pointer;
          color: #364fcd;
        }
      }
    }
  }
}
</style>
