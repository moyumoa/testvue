<template>
  <div style="height: 100%">
    <g-tabs :data="tabs" v-model:current="currentTab" />

    <frameworkDOM v-if="currentTab === 'framework'"></frameworkDOM>
    <template v-else>
      <weChatSetting v-if="isWeChat"></weChatSetting>
      <wxSetting v-else-if="isWeiXin"></wxSetting>
      <fs-setting v-else />
    </template>
  </div>
</template>

<script setup>
import frameworkDOM from '@/views/system/organization_framework/framework.vue'

import FsSetting from './fs_setting.vue'
import weChatSetting from './weChat_setting.vue'
import wxSetting from './wx_setting.vue'
import GTabs from '../components/g_tabs/index.vue'

import { ref } from 'vue'

const isWeChat = ref(true)
isWeChat.value = localStorage.getItem('isWeChat') === '1'
const isWeiXin = ref(true)
isWeiXin.value = localStorage.getItem('isWeiXin') === '1'

const currentTab = ref('framework')
const tabs = ref([
  { label: '组织架构', value: 'framework' },
  { label: '组织架构设置', value: 'setting' }
])
</script>

<style lang="scss" scoped>
.page_layout {
  display: flex;
  height: calc(100%);
  .section_tree {
    width: 320px;
    background: #fff;
    margin-right: 16px;
    padding: 24px;
    box-sizing: border-box;
    overflow-y: auto;
    .search_input {
      width: 100%;
      margin: 0 5px;
      margin: 0;
    }
    .tree_section {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 16px;
      cursor: pointer;
      padding: 5px;
      &:hover {
        background: #ecf5ff;
      }
      .node_icon {
        width: 26px;
        height: 26px;
        margin-right: 8px;
      }
      .text {
        line-height: 26px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow-wrap: break-word;
        max-width: calc(100% - 60px);
      }
      .icon-dianpu {
        margin-left: 6px;
        font-size: 20px;
        line-height: 26px;
        color: $theme_color;
      }
    }
    .tree_node {
      display: flex;
      line-height: 26px;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      .node_text {
        display: flex;
        align-items: center;
        .node_icon {
          width: 26px;
          height: 26px;
          margin-right: 8px;
          background: #364fcd;
          opacity: 0.6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .node_empty {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-right: 10px;
        }
        .icon-dianpu {
          margin-left: 6px;
          //font-size: 20px;
          //line-height: 26px;
          color: $theme_color;
        }
      }
      .node_btns {
        display: none;
        align-items: center;
        i {
          color: $theme_color;
          margin-right: 24px;
          &:last-child {
            margin-right: 16px;
            color: #303133;
          }
        }
      }
      &:hover {
        .node_btns {
          display: flex;
        }
      }
    }
  }
  .section_staff {
    width: calc(100% - 320px);
    min-height: calc(100vh - 155px);
    background: #fff;
    padding: 22px 24px;
    box-sizing: border-box;

    .staff_title {
      font-size: 18px;
      font-weight: 600;
      line-height: 25px;
      margin-bottom: 22px;
      display: flex;
      align-items: center;
      .icon {
        font-size: 20px;
        margin: 0 8px 0 12px;
      }
      .staff_total {
        flex: 1;
        font-weight: normal;
        font-size: 14px;
        color: #c0c4cc;
        display: flex;
        align-items: center;
        transform: translateY(1px);
        span {
          line-height: 25px;
          transform: translateY(1px);
        }
      }
    }
    .staff_list {
      box-sizing: border-box;
    }
    .staff_search {
      display: flex;
      align-items: center;
    }
    .table_photo {
      display: flex;
      align-items: center;
      img {
        width: 40px;
        height: 40px;
        margin-right: 16px;
        border-radius: 50%;
      }
      .name_box {
        max-width: calc(100% - 56px);
      }
    }
  }
}
.more_btns {
  .btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    cursor: pointer;
    &:last-child {
      margin-bottom: 0;
    }
    &.del {
      color: #ff3366;
    }
  }
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: #f0f4ff;
}

.section_top {
  margin-bottom: 20px;
  .section_top1 {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .section_title {
      width: calc(100% - 120px);

      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .section_title_title {
        @include mult_line(1);
        max-width: calc(100% - 200px);
        font-size: 18px;
        font-weight: 600;
        color: #333333;
        line-height: 26px;
      }
      .section_title_no {
        margin-left: 12px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
      }
    }
    .section_quit {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #364fcd;
      line-height: 20px;
      .quit_icon {
        width: 16px;
        height: 16px;
        object-fit: cover;
        margin-right: 4px;
      }
    }
  }
  .section_top2 {
    margin-top: 16px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    .section_switch {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .switch_mark {
        margin-left: 14px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
        line-height: 18px;
      }
    }
    .section_btn {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      .el-button + .el-button {
        margin-left: 20px;
      }
    }
  }
}
</style>
