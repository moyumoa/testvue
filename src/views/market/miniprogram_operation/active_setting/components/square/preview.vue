<template>
  <div
    :class="[
      'one_preview',
      'square_preview',
      props.data.err ? 'err_preview' : '',
      props.chooseTab === 'activity_square1' ? 'choose_preview' : ''
    ]"
  >
    <!-- 开关打开 -->
    <template v-if="props.data.switch === '1'">
      <div class="one_component" v-for="(item, index) in props.data.list" :key="index">
        <template v-if="item.type === 'banner'">
          <div class="banner_box" v-if="item.banner && item.banner.switch === '1'">
            <img
              v-if="item.banner && item.banner.coverUrl"
              class="banner_img"
              :src="item.banner.coverUrl"
              alt=""
            />
            <img
              v-else
              class="banner_img"
              src="https://tagvv-1256030678.file.myqcloud.com/20221124f0ng4.png"
              alt=""
            />
          </div>
        </template>
        <div class="active_box" v-else>
          <div :class="{ active_title: true, first_title: item.first }">
            <img
              class="title_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20221124o3ry8.png"
              alt=""
            />
            {{ item.title }}
          </div>
          <div class="active_task" v-if="item.tasks && item.tasks.length > 0">
            <div class="one_task" v-for="(x, y) in item.tasks" :key="y">
              <previewTask :task="x"></previewTask>
              <div class="line_box" v-if="y != item.tasks.length - 1"></div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import previewTask from '@/views/market/miniprogram_operation/components/preview_task.vue'
const props = defineProps({
  data: {
    type: Object,
    data() {
      return {
        switch: '1'
      }
    }
  },
  chooseTab: {
    type: String
  }
})
watch(
  () => props.data,
  value => {
    let id = null
    value.list.forEach(x => {
      if (x.type === 'task' && id == null) {
        id = x.id
        x.first = true
      } else {
        x.first = false
      }
    })
  },
  { deep: true, immediate: true }
)
// function showFirst(e) {
//   const list = props.data.list.filter(x => x.type === 'task')
//   console.log(list)
//   return list && list.length > 0 ? list[0].id === e.id : false
// }
</script>
<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';
.square_preview:hover {
  border: 1px solid transparent;
  background: none;
  box-shadow: none;
}
.square_preview {
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  // height: 100%;
  // padding: 0 12px;

  .one_component + .one_component {
    margin-top: 8px;
  }
  .one_component {
    .banner_box {
      width: 100%;
      height: 120px;
      border-radius: 12px;
    }
    .banner_img {
      width: 100%;
      height: 120px;
      border-radius: 12px;
      object-fit: cover;
    }
    // 任务
    .active_box {
      width: 100%;
      background: #ffffff;
      border-radius: 12px;
      .active_title {
        width: 100%;
        height: 50px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
        color: #1f2329;
        padding-left: 20px;
        line-height: 26px;
        .title_icon {
          display: none;
          width: 24px;
          height: 24px;
          object-fit: contain;
          margin-right: 4px;
        }
      }
      .first_title {
        background: linear-gradient(180deg, rgba(255, 156, 80, 0.2) 0%, rgba(255, 156, 82, 0) 100%);
        border-radius: 12px 12px 0px 0px;
        .title_icon {
          display: block;
        }
      }
      .active_task {
        padding: 4px 0 12px;
      }
      :deep(.one_card_box) {
        padding: 0 0px 0px 12px;
      }

      .line_box {
        width: 249px;
        border-top: 1px dashed rgba(31, 35, 41, 0.1);
        height: 0;
        margin: 12px 0 12px 78px;
      }
    }
  }
}
</style>
