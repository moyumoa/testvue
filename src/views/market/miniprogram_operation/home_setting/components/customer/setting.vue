<template>
  <div class="operation-activity">
    <title-wrapper title="" :subtitle="subtitleObj[customerInfo.switch]">
      <template #right>
        <el-switch
          @change="validConfigFun"
          v-model="customerInfo.switch"
          active-value="1"
          inactive-value="0"
        />
      </template>
    </title-wrapper>
    <div class="container">
      <navSetting
        :title="customerInfo.title"
        :defaultTitle="customerInfo.defaultTitle"
        @updateTitle="updateTitle"
      />
      <div class="container_title">效果预览</div>
      <div class="wrapper">
        <div class="content">
          <img class="top_img" v-if="customerInfo.title" :src="customerInfo.title" />
          <img class="top_img" v-else :src="customerInfo.defaultTitle" />
          <div class="bottom_content">
            <div class="module_top space_between">
              <span>个人获客成果</span>
              <span class="arrow_icon">今天</span>
            </div>
            <div class="space_between">
              <div class="data_main_item space_between">
                <img
                  src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/b038b0343e3946cebbd14ebe589796e1_1687167230911.png"
                  alt=""
                  class="data_main_img"
                />
                <div class="data_main_right">
                  <div class="bold_font">视频潜客</div>
                  <div>899</div>
                </div>
              </div>
              <div class="data_main_item space_between">
                <img
                  src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/ccbba8c772c944be989e2076658dbe02_1687167202198.png"
                  alt=""
                  class="data_main_img"
                />
                <div class="data_main_right">
                  <div class="bold_font">直播潜客</div>
                  <div>588</div>
                </div>
              </div>
            </div>
            <div class="space_between">
              <div class="other_data_item">
                <div>297</div>
                <div class="arrow_text">
                  待跟进
                  <el-icon><i-arrow-right-bold /></el-icon>
                </div>
              </div>
              <div class="other_data_item">
                <div>512</div>
                <div class="arrow_text">
                  跟进中
                  <el-icon><i-arrow-right-bold /></el-icon>
                </div>
              </div>
              <div class="other_data_item">
                <div>118</div>
                <div class="arrow_text">
                  已留资
                  <el-icon><i-arrow-right-bold /></el-icon>
                </div>
              </div>
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
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {
        customerInfo: {
          switch: '1',
          title: ''
        }
      }
    }
  }
})
const { customerInfo } = toRefs(props.data)
const subtitleObj = {
  1: '获客数据展示，意向用户有迹可循！',
  0: '开关关闭，全员营销小程序首页将隐藏“智能获客”'
}

const emits = defineEmits(['updateSetting', 'validConfig'])
function validConfigFun() {
  emits('validConfig', 'customer_record')
}
// 更新标题栏
function updateTitle(e) {
  customerInfo.value.title = e
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
      width: 375px;
      background: #f6f7f8;
      padding: 12px;
      border-radius: 4px;
      .content {
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
          .space_between {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .module_top {
            font-weight: 500;
            font-family: PingFangSC-Medium, PingFang SC;
            font-size: 16px;
            color: #1f2329;
            margin-bottom: 16px;
            .arrow_icon {
              display: flex;
              align-items: center;
            }
            .arrow_icon::after {
              content: '';
              margin-left: 6px;
              display: inline-block;
              background-image: url('https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/7e1df178c7e14d82bc0dd689e9b936e4_1687166483747.png');
              width: 10px;
              height: 7px;
              background-size: cover;
            }
          }
          // 有图片icon的数据
          .data_main_item {
            background-color: #f3f3f3;
            width: 158px;
            height: 60px;
            padding: 10px 16px;
            border-radius: 8px;
            .data_main_img {
              width: 32px;
              height: 32px;
            }
            .data_main_right {
              flex: 1;
              margin-left: 12px;
              line-height: 20px;
              .bold_font {
                color: #1f2329;
                font-size: 14px;
                font-family: PingFangSC-Semibold, PingFang SC;
                font-weight: 600;
              }
            }
          }
          // 下面的数据
          .other_data_item {
            font-size: 18px;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 600;
            color: #1f2329;
            line-height: 26px;
            padding: 14px 20px;
            .arrow_text {
              display: flex;
              align-items: center;
              height: 18px;
              font-size: 12px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #8f959e;
              line-height: 18px;
            }
          }
        }
      }
    }
  }
}
</style>
