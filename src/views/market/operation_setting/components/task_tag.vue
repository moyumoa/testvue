<template>
  <div class="task_tag">
    <div class="page_title">
      任务标签管理
      <span>任务标签可用于标记任务的紧急程度或是活动分类</span>
    </div>
    <div class="page_content" v-loading="$data.loading">
      <el-button type="primary" @click="addTag">添加标签</el-button>
      <div class="tag_box">
        <div class="one_tag" v-for="(item, index) in $data.tagList" :key="index">
          <div
            class="tag_content"
            :style="{
              background: `rgba(${(item.tagColor, 0.1)})`,
              borderColor: `rgb(${item.tagColor})`,
              color: `rgb(${item.tagColor})`
            }"
          >
            {{ item.tagName }}
          </div>
          <el-link
            type="primary"
            class="ml_16"
            style="margin: 0; line-height: 20px"
            @click="delTag(item)"
          >
            删除
          </el-link>
        </div>
      </div>
    </div>
    <!-- 新建标签的弹窗 -->
    <tagDialog
      v-if="$data.tagForm.show"
      :addDialog="$data.tagForm"
      @updateList="resetSearch"
    ></tagDialog>
  </div>
</template>
<script setup>
import { tagList, saveTag } from '@/api/market/task_tag.js'
import tagDialog from './tag_dialog.vue'
import { throttle } from '@/utils/tools.js'
const $data = reactive({
  tagList: [],
  tagForm: {
    show: false
  },
  loading: false
})
function resetSearch(showLoaing) {
  console.log('获取数据')
  if (showLoaing) {
    $data.loading = true
  }
  tagList({})
    .then(res => {
      if (res.code === 0) {
        console.log(res)
        $data.tagList = res.data || []
      }
    })
    .finally(() => {
      $data.loading = false
    })
}
resetSearch(true)
const addTag = throttle(() => {
  console.log('添加标签')
  $data.tagForm.show = true
}, 500)
const message = inject('$message')
const $confirm = inject('$confirm')
const delTag = throttle(e => {
  $confirm({
    title: '系统提醒',
    content: `确认删除标签"${e.tagName || ''}"?`,
    success() {
      saveTag({
        id: e.id,
        isDel: 1
      }).then(res => {
        if (res.code === 0) {
          message.success('删除成功')
          resetSearch()
        }
      })
    }
  })
}, 500)
</script>
<style lang="scss">
div {
  box-sizing: border-box;
}
.task_tag {
  background: #fff;
  .page_title {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: 70px;
    padding: 0 24px;
    border-bottom: 1px solid #dcdee0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    line-height: 26px;
    span {
      margin-left: 12px;

      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
  }
  .page_content {
    padding: 22px 24px;
    .tag_box {
      margin-top: 4px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      .one_tag {
        width: 20%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        margin-top: 24px;
        .tag_content {
          border-radius: 2px;
          border: 1px solid #fff;
          padding: 2px 4px;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          margin-right: 12px;
        }
      }
    }
  }
}
</style>
