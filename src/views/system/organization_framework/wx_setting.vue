<template>
  <div class="fs_setting_wrapper mt_16">
    <div class="fs_setting_header g_bg">
      <div class="logo">
        <!--        <img src="https://tagvv-1256030678.file.myqcloud.com/20230210y5ahv.png" alt />-->
        <span>自建组织架构:</span>
      </div>
      <p class="text1">利用微信小程序或星麦云App进行全员内容创作</p>
      <p class="text2">
        支持在星麦云后台自建组织架构，便捷管理各部门员工进行矩阵营销任务分发，建立企业私域流量池
      </p>
    </div>
    <div class="fs_setting_main g_bg mt_16" style="padding-left: 0">
      <div class="form">
        <hierarchy-alias></hierarchy-alias>
      </div>
    </div>
  </div>
</template>

<script setup>
import hierarchyAlias from './components/hierarchy_alias.vue'
</script>

<style lang="scss" scoped>
.fs_setting_wrapper {
  .fs_setting_header {
    .logo {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      > img {
        width: 32px;
        height: 32px;
        margin-right: 8px;
      }
      > span {
        font-size: 18px;
        font-weight: 600;
        color: #323233;
      }
    }
    .text1 {
      line-height: 20px;
      font-size: 16px;
    }
    .text2 {
      margin-top: 4px;
      color: #909399;
      font-size: 12px;
      line-height: 20px;
    }
  }
  :deep(.fs_setting_main) {
    .form {
      &_item {
        display: flex;
        margin-bottom: 20px;
        &_label {
          width: 120px;
          text-align: right;
          margin-right: 8px;
          line-height: 32px;
        }
        &_content {
          flex: 1;
          .tip {
            color: #909399;
            font-size: 12px;
            margin-top: 4px;
            line-height: 17px;
          }
          .role_list {
            width: 400px;
            display: flex;
            flex-wrap: wrap;
            .role_item {
              height: 32px;
              line-height: 32px;
              margin-right: 24px;
              margin-bottom: 6px;
            }
          }
        }
      }
    }
  }
}
:deep(.form_item_label) {
  width: 100px !important;
}
</style>
