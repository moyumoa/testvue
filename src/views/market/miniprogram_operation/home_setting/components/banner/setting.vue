<template>
  <div class="operation-banner">
    <title-wrapper title="" :hasSolt="false" :subtitle="subtitle"></title-wrapper>
    <div class="container" :class="{ container_v1: systemVersion == 1 || systemVersion == 4 }">
      <div class="container_title">内容设置</div>
      <div class="add-and-tips">
        <div class="add-icon" @click="addItem"></div>
        <div class="add" @click="addItem">添加Banner图（{{ list.length }}/5）</div>
        <div class="tips">建议尺寸为702*200，最多上传5张，单个不超过2M，支持png、jpg、jpeg。</div>
      </div>
      <draggable
        v-model="list"
        group="banner_setting"
        @start="drag = true"
        @end="drag = false"
        item-key="index"
        handle=".icon-tuodongweizhi"
        :animation="300"
      >
        <template #item="{ element, index }">
          <div class="main">
            <banner-dialog :info="element" type="operation"></banner-dialog>
            <sort-icon :list="list" :index="index" :hasMove="true"></sort-icon>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import { ElMessage } from 'element-plus'
import TitleWrapper from '../../../components/title_wrapper.vue'
import BannerDialog from '../../../components/banner_dialog.vue'
import SortIcon from '../../../components/sort_icon.vue'
import { useStore } from 'vuex'
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {}
    }
  }
})
const drag = ref(false)
const list = ref([])
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)
const subtitle = `图片将展示在小程序首页，向员工传递关键运营信息。最多支持上传5张图片进行轮播${
  systemVersion.value === 3 ? '，支持点击跳转任务或课程页面。' : '。'
}`
function init() {
  if (
    props.data.bannerInfo &&
    props.data.bannerInfo.list &&
    props.data.bannerInfo.list.length > 0
  ) {
    list.value = JSON.parse(JSON.stringify(props.data.bannerInfo.list))
  } else {
    list.value = []
  }
  console.log('获取到的轮播图信息', list.value, props.data)
}
init()
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

const emits = defineEmits(['updateSetting'])
watch(
  () => list.value,
  value => {
    emits('updateSetting', 'mission:banner', value)
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
@import '../../../components/css/setting_page.scss';
.operation-banner {
  background-color: #fff;
  color: #909399;
  font-size: 14px;

  .container {
    .add-and-tips {
      line-height: 22px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding: 0px 0 21px;
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
  .container_v1 {
    :deep(.banner-dialog) {
      min-height: unset !important;
      padding-bottom: 16px !important;
    }
  }
}
:deep(.el-radio) {
  margin-right: 16px !important;
  &:last-child {
    margin-right: 0 !important;
  }
}
</style>
