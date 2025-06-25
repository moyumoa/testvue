<template>
  <div class="page">
    <div class="page_title">
      抖音小风车
      <span>（抖音企业号经营工具）</span>
    </div>
    <div class="page_content">
      <div class="content_left">
        <div class="gray_text" style="margin-bottom: 20px">
          支持员工做任务时在短视频或者直播间挂载抖音小风车工具，实现线索留资。
        </div>
        <div class="black_text" style="margin-bottom: 6px">
          线索获得后可以在
          <span class="bold_text">内容中台 - 效果中心</span>
          中查看和管理，具体包括：
        </div>
        <div class="flex_box" style="margin-bottom: 24px; flex-wrap: wrap">
          <div class="gray2_text" style="margin-right: 12px; margin-top: 6px">
            1、线索查看和导出
          </div>
          <div class="gray2_text" style="margin-top: 6px">
            2、可对接接口，实现线索自动同步到品牌已有的线索中心
          </div>
        </div>
        <div class="title_text">怎么使用小风车？</div>

        <div class="black_text flex_box step_text">
          <div class="blue_text bold_text flex_left">Step1：</div>
          <div class="flex_right">通知经销商或者门店注册抖音企业号并认证为蓝V账号</div>
        </div>
        <div class="black_text flex_box step_text">
          <div class="blue_text bold_text flex_left">Step2：</div>
          <div class="flex_right">
            在
            <el-link type="primary" style="line-height: 20px; margin-top: -2px" @click="toLink">
              抖音企业号后台
            </el-link>
            创建经营工具（小风车），审核通过后企业号即可挂载
          </div>
        </div>
        <div class="black_text flex_box step_text">
          <div class="blue_text bold_text flex_left">Step3：</div>
          <div class="flex_right">
            <div>若门店还有更多员工账号想要使用抖音小风车，可采用以下两种方式</div>
            <div class="gray2_text" style="margin: 8px 0">
              1、企业号直接创建新的员工账号，并分配给员工使用（推荐，员工离职时可重新分配账号）
            </div>
            <div class="gray2_text">2、将员工已有个人账号绑定成为企业员工号</div>
            <div class="tip_box gray2_text">
              提示：两种方法都需要员工有在职证明或者劳务合同，且所在公司与企业号认证企业一致。企业号经营值达到100分可以添加5个员工号，150分可以添加50个员工号。
            </div>
          </div>
        </div>
        <div class="black_text flex_box step_text">
          <div class="blue_text bold_text flex_left">Step4：</div>
          <div class="flex_right">
            员工做任务时可将小风车工具挂载在视频或直播间（注：需保证员工号的归属企业号也授权到系统中）
          </div>
        </div>
        <div class="black_text flex_box step_text">
          <div class="blue_text bold_text flex_left">Step5：</div>
          <div class="flex_right">用户留资后，线索统一保存到内容中台 - 效果中心进行管理</div>
        </div>
      </div>
      <div class="content_right">
        <div class="right_one">
          <image
            class="right_img1"
            src="https://tagvv-1256030678.file.myqcloud.com/20220921346om.png"
          ></image>
        </div>
        <div class="right_one">
          <image
            class="right_img2"
            src="https://tagvv-1256030678.file.myqcloud.com/202209218kz9f.png"
          ></image>
          <div class="right_text">
            <div>· 只有行业工具出现在视频右下角</div>
            <div>· 其他经营工具出现在视频评论区</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const toLink = throttle(() => {
  window.open('https://e.douyin.com/site/component-center/get-customers', '_blank')
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.page {
  width: 100%;
  min-height: 100%;
  border-radius: 4px;
  background: #fff;
  .page_title {
    width: 100%;
    height: 70px;
    border-bottom: 1px solid #dcdeed;
    padding: 0 24px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    line-height: 26px;
    span {
      margin-left: 4px;
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
  }
  .page_content {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 0px 20px 20px;
    .content_left {
      max-width: 50vw;
      margin-right: 20px;
      padding-top: 20px;
      .flex_box {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }
      .gray_text {
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
      }
      .black_text {
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
      }
      .bold_text {
        font-weight: bold !important;
      }

      .gray2_text {
        font-size: 14px;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
      }
      .title_text {
        font-size: 16px;
        font-weight: 600;
        color: #1f2329;
        line-height: 22px;
      }
      .blue_text {
        font-size: 14px;
        font-weight: 400;
        color: #364fcd;
        line-height: 20px;
      }
      .tip_box {
        max-width: 576px;
        margin-top: 12px;
        background: #f6f8fa;
        padding: 8px;
      }
      .step_text {
        margin-top: 16px;
        align-items: flex-start !important;
      }
    }
    @media screen and (max-width: 1400px) {
      .content_left {
        max-width: 560px;
      }
    }
    .content_right {
      padding-top: 15px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      .right_one {
        .right_img1 {
          width: 240px;
          height: 412px;
          object-fit: cover;
        }
        .right_img2 {
          width: 210px;
          height: 412px;
          object-fit: cover;
        }
        .right_text {
          padding: 9px 0 0 7px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
          div + div {
            margin-top: 11px;
          }
        }
      }
      .right_one + .right_one {
        margin-left: 20px;
      }
    }
  }
}
</style>
