<template>
  <div class="operation-activity">
    <title-wrapper title="" :subtitle="subtitleObj[followUpInfo.switch]">
      <template #right>
        <el-switch
          @change="validConfigFun"
          v-model="followUpInfo.switch"
          active-value="1"
          inactive-value="0"
        />
      </template>
    </title-wrapper>
    <div class="container">
      <navSetting
        :title="followUpInfo.title"
        :defaultTitle="followUpInfo.defaultTitle"
        @updateTitle="updateTitle"
      />
      <div class="container_title">内容设置</div>
      <div class="wrapper">
        <div class="tip">
          <div>
            小程序上呈现的模板范围：在智能短视频-企业模板功能中设置为开放给成员的模板
            <div @click="toFun">
              快速跳转
              <img src="https://tagvv-1256030678.file.myqcloud.com/20230808peh4e.png" alt="" />
            </div>
          </div>
        </div>
        <div class="num">当前“创意跟拍”模块内的模板数量：{{ followUpNum || 0 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { throttle } from '@/utils/tools'
import navSetting from '../../../components/nav_setting.vue'
import TitleWrapper from '../../../components/title_wrapper.vue'
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {
        followUpInfo: {
          switch: '1',
          title: ''
        }
      }
    }
  },
  followUpNum: {
    type: String || Number,
    default: null
  }
})
const { followUpInfo } = toRefs(props.data)
const subtitleObj = {
  1: '优质模板展示，员工可直接使用模板制作视频发布',
  0: '开关关闭，全员营销小程序首页将隐藏“创意跟拍”'
}

const emits = defineEmits(['updateSetting', 'validConfig'])
function validConfigFun() {
  emits('validConfig', 'creative_followUp')
}
// 更新标题栏
function updateTitle(e) {
  followUpInfo.value.title = e
}

const toFun = throttle(() => {
  window.open(`${location.origin}/sumwhy_video/template_space`, '_blank')
}, 500)
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
        width: 650px;
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
        > div {
          width: calc(100% - 26px);
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          div {
            cursor: pointer;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
            font-size: 12px;
            font-weight: 400;
            color: #364fcd;
            line-height: 18px;
            img {
              width: 14px;
              height: 14px;
              object-fit: contain;
              display: flex;
              margin-left: 2px;
            }
          }
        }
      }
      .num {
        margin-top: 16px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #323233;
        line-height: 20px;
      }
    }
  }
}
</style>
