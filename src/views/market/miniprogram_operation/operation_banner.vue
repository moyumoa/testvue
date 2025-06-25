<template>
  <div class="operation-banner">
    <title-wrapper title="Banner设置" :subtitle="subtitle"></title-wrapper>
    <div class="container">
      <div class="add-and-tips">
        <div class="add-icon" @click="addItem"></div>
        <div class="add" @click="addItem">添加Banner图（{{ list.length }}/5）</div>
        <div class="tips">建议尺寸为750*256，最多上传5张，单个不超过2M，支持png、jpg、jpeg。</div>
      </div>
      <div class="main" v-for="(item, index) in list" :key="item">
        <banner-dialog :info="item"></banner-dialog>
        <sort-icon :list="list" :index="index"></sort-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import TitleWrapper from './components/title_wrapper.vue'
import BannerDialog from './components/banner_dialog.vue'
import { debounce, isEmpty } from '@/utils/tools.js'
import SortIcon from './components/sort_icon.vue'
import { operationConfig } from '@/views/market/miniprogram_operation/model.js'
import { useStore } from 'vuex'

const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

const subtitle = `图片将展示在小程序首页，向员工传递关键运营信息。最多支持上传5张图片进行轮播${
  systemVersion.value === 3 ? '，支持点击跳转任务或课程页面。' : '。'
}`

const configKey = {
  CONFIG_GROUP: 'mission:banner',
  // SWITCH_KEY: '',
  LIST_KEY: 'banner_list'
}
const { list, getInfo, updateInfo } = operationConfig(configKey)
getInfo()
const addItem = () => {
  if (list.value.length === 5) {
    return ElMessage.warning('最多支持上传5张图片进行轮播')
  }
  list.value.push({
    coverUrl: '',
    type: 1, // 1 不跳转， 2, 任务 3 课程 4,子课程
    radio: 1,
    jump: {}
  })
}
watch(
  () => list.value,
  value => {
    // todo 初始赋值也会触发
    update(value)
  },
  { deep: true }
)
const update = debounce(() => {
  const filter = list.value.filter(item => !isEmpty(item.coverUrl))
  updateInfo(filter)
}, 1000)
</script>

<style lang="scss" scoped>
.operation-banner {
  background-color: #fff;
  color: #909399;
  font-size: 14px;

  .container {
    padding: 0 24px;

    .add-and-tips {
      line-height: 62px;
      display: flex;
      align-items: center;
      .add-icon {
        cursor: pointer;
        width: 20px;
        height: 20px;
        background-image: url('https://tagvv-1256030678.file.myqcloud.com/202210212istj.png');
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }

      .add {
        cursor: pointer;
        color: $theme-color;
        font-size: 16px;
        margin: 0 12px 0 5px;
      }
    }

    .main {
      position: relative;
      width: 468px;
    }
  }
}
</style>
