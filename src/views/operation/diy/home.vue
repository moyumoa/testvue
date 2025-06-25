<template>
  <div class="diy_home">
    <div class="preview_wrapper">
      <page-view v-model:data="componentList" v-model:pageInfo="pageInfo" :disabled="true" />
    </div>
    <config-setting @save="onSave">
      <div class="home_config">
        <p class="config_title">小程序主页设置</p>
        <p class="home_config_tip">选择一个页面作为小程序主页</p>
        <div class="formItem">
          <span>选择首页</span>
          <el-input
            v-model="listInfo.currentPage.title"
            style="width: 278px; margin-left: 14px"
            disabled
          />
          <p class="text_btn">
            <span style="color: #364fcd; margin-right: 14px" @click="path">装修</span>
            <span @click="showListInfoFun">更换</span>
          </p>
        </div>
      </div>
    </config-setting>
    <el-dialog
      v-model="listInfo.visible"
      title="选择小程序页面"
      width="834px"
      :close-on-click-modal="false"
      :before-close="close"
    >
      <xm_search style="padding: 0">
        <div class="search_item">
          <label class="item_label" style="flex-basis: 30px">标题</label>
          <div class="item_content">
            <el-input
              v-model="listInfo.title"
              placeholder="请输入标题"
              clearable
              style="width: 230px"
            />
          </div>
        </div>
        <div class="search_item">
          <el-button type="primary" @click="onQuery">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </div>
      </xm_search>
      <xm_table
        max-height="400px"
        v-loading="listInfo.loading"
        :data="listInfo.listData"
        v-model:page="listInfo.page"
        @getTableData="getList"
      >
        <el-table-column label="标题" prop="title" />
        <el-table-column label="创建时间" prop="gmtCreateTime" />
        <el-table-column label="操作" fixed="right" width="120" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="onSelect(row)">选择</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </el-dialog>
  </div>
</template>

<script setup>
import { throttle } from '@/utils/tools.js'
import { useHome } from './model/use_home'
import ConfigSetting from './config_setting.vue'
import PageView from '../page_decorate/page_view.vue'
import { useRouter } from 'vue-router'

const { listInfo, getList, onQuery, reset, close, onSelect, onSave, componentList, pageInfo } =
  useHome()
const router = useRouter()

// 跳转地址
const path = throttle(() => {
  if (!listInfo.currentPage.id) {
    return '/content_market/diyPrograme_page_decorate'
  } else {
    // 使侧边栏数据展示正确 begin
    sessionStorage.setItem('menuActive', 'diyPrograme_page_decorate')
    // 使侧边栏数据展示正确 end
    sessionStorage.setItem('diyPage', JSON.stringify(listInfo.currentPage))
    router.push({
      path: '/content_market/diyPrograme_page_decorate/detail',
      query: { id: listInfo.currentPage.id }
    })
  }
}, 500)
const showListInfoFun = throttle(() => {
  getList()
  listInfo.visible = true
}, 700)
</script>

<style lang="scss" scoped>
.diy_home {
  display: flex;
  height: 100%;
  .preview_wrapper {
    background-color: #f6f8fa;
    flex: 1;
    min-width: 400px;
    overflow-y: auto;
    padding: 40px 0;
    .phone_view {
      margin: 0 auto;
      width: 375px;
      height: 667px;
      background-color: #fff;
      .phone_header {
        width: 100%;
      }
    }
  }
  .home_config {
    &_tip {
      color: #909399;
      line-height: 20px;
      margin: 20px 0 12px 0;
    }
    .formItem {
      position: relative;
      :deep(.el-input.is-disabled .el-input__inner) {
        background-color: #fff;
        cursor: default;
        color: #303133;
      }
      .text_btn {
        padding: 4px;
        background-color: #fff;
        color: #364fcd;
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        > span {
          cursor: pointer;
        }
      }
    }
  }
}
</style>
