<template>
  <div class="private_account">
    <el-tooltip
      class=""
      effect="dark"
      content="私密账号，粉丝数更新可能会有延迟！"
      placement="right-start"
      popper-class="tooltip_group_list"
    >
      <template #content>
        <div class="tip_content">
          <div class="flex_box1">账号当前为私密状态，系统无法获取到粉丝数！</div>
          <div class="flex_box2">解决方法：</div>
          <div class="flex_box" style="margin-top: 12px">
            <div class="flex_num">①</div>
            <div>打开抖音APP - 点击右下角“我” - 点击右上角三道杠选择“设置” - 选择“隐私设置”</div>
          </div>
          <div class="flex_box">
            <div class="flex_num">②</div>
            <div>
              <div>将“关注和粉丝列表”设置为公开可见</div>
              <img
                class="tip_img1"
                src="https://tagvv-1256030678.file.myqcloud.com/202208311mar6.png"
              />
            </div>
          </div>
          <div class="flex_box">
            <div class="flex_num">③</div>
            <div>
              <div>将“私密账号”设置为关闭</div>
              <img
                class="tip_img1"
                src="https://tagvv-1256030678.file.myqcloud.com/20220831ycx1m.png"
              />
            </div>
          </div>
        </div>
      </template>
      <img class="tip_img" src="https://tagvv-1256030678.file.myqcloud.com/20220825ful6y.png" />
    </el-tooltip>
  </div>
</template>
<script setup></script>
<style lang="scss" scoped>
.private_account {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  .tip_img {
    width: 16px;
    height: 16px;
    object-fit: cover;
  }
}
.tip_content {
  max-width: 255px;
  padding: 8px 12px 8px 0;
  .flex_box1 {
    margin-bottom: 6px;
  }

  .flex_box {
    margin-top: 16px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    font-size: 12px;
    font-weight: 400;
    color: #ffffff;
    line-height: 18px;
    .tip_img1 {
      width: 100%;
      margin-top: 4px;
    }
    .flex_num {
      margin-right: 4px;
      margin-top: -1px;
    }
  }
}
</style>
