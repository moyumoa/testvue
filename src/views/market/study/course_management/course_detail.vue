<template>
  <div class="course_detail" v-if="detail">
    <div class="block">
      <div class="block_title">基本信息</div>
      <div class="block_content">
        <div class="course_detail">
          <img :src="detail.cover" class="cover" />
          <div class="right">
            <div class="name">{{ detail.name }}</div>
            <div class="desc">{{ detail.description }}</div>
            <div class="total">共{{ detail.courseContentVOList.length }}节</div>
          </div>
        </div>
      </div>
    </div>
    <div class="block">
      <div class="block_title">课程内容</div>
      <div class="block_content">
        <div class="class_list">
          <div
            class="class_item"
            v-for="(item, index) in detail.courseContentVOList"
            :key="index"
            @click="showClassContent(item)"
          >
            <div class="class_index">第{{ index + 1 }}节</div>
            <img :src="item.cover" class="class_cover" />
            <div class="class_name">{{ item.title }}</div>
          </div>
        </div>
      </div>
    </div>
    <preview-class-dialog
      v-model:dialogVisible="dialogVisible"
      :classInfo="previewClass"
    ></preview-class-dialog>
  </div>
</template>

<script setup>
import previewClassDialog from './components/preview_class_dialog.vue'
import { getCourseDetail } from '@/api/market/course'
import { useRoute } from 'vue-router'

const route = useRoute()
const dialogVisible = ref(false)
const previewClass = ref({})
const detail = ref(null)

function showClassContent(item) {
  dialogVisible.value = true
  previewClass.value = item
}

onMounted(() => {
  getCourseDetail({ id: route.query.id }).then(res => {
    detail.value = res.data
  })
})
</script>

<style lang="scss" scoped>
.course_detail {
  min-width: 1000px;
  color: #303133;
  .block {
    background: #ffffff;
    border-radius: 4px;
    margin-bottom: 16px;
    .block_title {
      padding-left: 24px;
      line-height: 50px;
      border-bottom: 1px solid #e8e8e8;
      font-size: 18px;
      color: #323233;
    }
    .block_content {
      padding: 20px 24px;
    }
  }
  .course_detail {
    display: flex;
    .cover {
      flex-shrink: 0;
      height: 80px;
      width: 80px;
      margin-right: 12px;
      border-radius: 2px;
      object-fit: cover;
    }
    .right {
      flex: 1;
      position: relative;
      .name {
        @include mult_line(1);
        font-size: 14px;
        font-weight: bold;
        line-height: 20px;
      }
      .desc {
        @include mult_line(2);
        margin-top: 2px;
        line-height: 17px;
        color: #606266;
        font-size: 12px;
      }
      .total {
        position: absolute;
        left: 0;
        bottom: 0;
        padding: 0 4px;
        line-height: 20px;
        font-size: 12px;
        background: #f6f8fa;
        border-radius: 2px;
        color: #606266;
      }
    }
  }
  .class_list {
    .class_item {
      cursor: pointer;
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #ebedf0;
      &:hover {
        background: #f5f6fd;
      }
      .class_index {
        flex-shrink: 0;
        width: 84px;
        text-align: center;
        font-size: 16px;
        line-height: 20px;
      }
      .class_cover {
        flex-shrink: 0;
        height: 80px;
        width: 80px;
        margin-right: 12px;
        border-radius: 2px;
        object-fit: cover;
        background-color: #e3e3e3;
      }
      .class_name {
        font-size: 14px;
        font-weight: bold;
        line-height: 20px;
      }
    }
  }
}
</style>
