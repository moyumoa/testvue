<template>
  <div class="operation-activity">
    <title-wrapper title="" :subtitle="subtitleObj[inspirationInfo.switch]">
      <template #right>
        <el-switch
          @change="validConfigFun"
          :before-change="beoreOpenChange.bind(this, inspirationInfo.switch)"
          v-model="inspirationInfo.switch"
          active-value="1"
          inactive-value="0"
        />
      </template>
    </title-wrapper>
    <div class="container">
      <!-- <navSetting
        :title="inspirationInfo.title"
        :defaultTitle="inspirationInfo.defaultTitle"
        @updateTitle="updateTitle"
      /> -->
      <div class="container_title">内容设置</div>
      <div class="wrapper">
        <div class="tip">
          <div>
            该模块的灵感视频为小程序-“创意灵感”页面内的灵感速递，当日没有灵感速递时，会显示灵感库内的最新视频
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { beforeOpenSwitchChange } from '../config.js'

// import navSetting from '../../../components/nav_setting.vue'
import TitleWrapper from '../../../components/title_wrapper.vue'
const props = defineProps({
  switchOpenNumber: Number, // 开关打开的个数

  data: {
    type: Object,
    default() {
      return {
        inspirationInfo: {
          switch: '1',
          title: ''
        }
      }
    }
  }
})
const { inspirationInfo } = toRefs(props.data)
const subtitleObj = {
  1: '行业爆款视频展示，案例拆解为员工提供创作灵感！',
  0: '开关关闭，全员营销小程序活动页将隐藏“创意灵感”'
}

const emits = defineEmits(['updateSetting', 'validConfig'])
function validConfigFun() {
  emits('validConfig', 'creative_inspiration')
}
// 更新标题栏
// function updateTitle(e) {
//   inspirationInfo.value.title = e
// }
function beoreOpenChange(e) {
  console.log('squareInfo.switch', e, props.switchOpenNumber)
  return new Promise(resolve => {
    if (e === '1') {
      resolve(true)
    } else {
      resolve(beforeOpenSwitchChange(props.switchOpenNumber))
    }
  })
}
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
          max-width: calc(100% - 26px);
        }
      }
    }
  }
}
</style>
