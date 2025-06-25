<template>
  <div class="tip_page">
    如何获取webhook地址？
    <el-popover placement="right" :width="dialogWidth" trigger="hover" popper-class="g_popper_gray">
      <template #reference>
        <div>
          <i
            style="font-size: 12px; cursor: pointer; margin-left: 4px"
            class="iconfont icon-wenhao"
          ></i>
        </div>
      </template>
      <div
        class="tip_box"
        :style="{
          height: dialogHeight
        }"
      >
        <div class="bold_text">如果已添加群机器人</div>
        <div class="margin_12">点击群机器人，复制webhook地址即可</div>
        <div class="margin_12 img_box">
          <img class="img" src="@/assets/images/tip/webhook_1.png" alt />
        </div>
        <div class="bold_text" style="margin: 25px 0 16px">如果未添加机器人</div>
        <div class="bold_text">Windows系统</div>
        <div class="margin_12">1.点击群聊右上角三个点，选择添加群机器人</div>
        <div class="margin_12 img_box">
          <img class="img" src="@/assets/images/tip/webhook_2.png" alt />
          <img class="img1" src="@/assets/images/tip/webhook_3.png" alt />
        </div>
        <div class="margin_12 img_box">
          <img class="img" src="@/assets/images/tip/webhook_4.png" alt />
          <img class="img2" src="@/assets/images/tip/webhook_5.png" alt />
        </div>
        <div style="margin-top: 24px">2.填写机器人相关信息，并复制webhook地址</div>
        <div class="margin_12 img_box">
          <img class="img" src="@/assets/images/tip/webhook_6.png" alt />
          <img class="img3" src="@/assets/images/tip/webhook_7.png" alt />
        </div>
        <div class="bold_text" style="margin-top: 24px">MAC系统</div>
        <div class="margin_12">1.鼠标邮件点击群聊，选择添加群机器人，并新建机器人</div>
        <div class="margin_12 img_box">
          <img class="img" src="@/assets/images/tip/webhook_8.png" alt />
          <img class="img4" src="@/assets/images/tip/webhook_9.png" alt />
        </div>
        <div class="margin_12">2.填写机器人相关信息，并复制webhook地址</div>
        <div class="margin_12 img_box">
          <img class="img" src="@/assets/images/tip/webhook_11.png" alt />
          <img class="img" src="@/assets/images/tip/webhook_10.png" alt />
        </div>
      </div>
    </el-popover>
  </div>
</template>
<script setup>
const dialogWidth = ref('590px')
const dialogHeight = ref('800px')
function resizeFun() {
  if (document.body.clientWidth > 1600) {
    dialogWidth.value = '590px'
    dialogHeight.value = '800px'
  } else {
    dialogWidth.value = '520px'
    dialogHeight.value = '600px'
  }
}
onMounted(() => {
  resizeFun()
})
window.addEventListener('resize', () => {
  resizeFun()
})
</script>
<style lang="scss" scoped>
.tip_page {
  color: #606266;
  font-size: 12px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.tip_box {
  color: #fff;
  overflow-y: auto;
}
.bold_text {
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
}
.margin_12 {
  margin-top: 12px;
}
.img_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  img + img {
    margin-left: 16px;
  }
  .img {
    width: 272px;
  }
  .img1 {
    width: 112px;
  }
  .img2 {
    width: 151px;
  }
  .img3 {
    width: 264px;
  }
  .img4 {
    width: 187px;
  }
  @media screen and (max-width: 1600px) {
    .img {
      width: 240px;
    }

    .img1 {
      width: 99px;
    }
    .img2 {
      width: 133px;
    }
    .img3 {
      width: 232px;
    }
    .img4 {
      width: 165px;
    }
  }
}
</style>
