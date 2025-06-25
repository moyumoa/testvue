<template>
  <div class="choose_modal">
    <el-dialog
      v-model="show"
      ref="dialog"
      title="选择页面"
      width="834px"
      destroy-on-close
      custom-class="hide_footer_line"
    >
      <el-tabs v-model="chooseTab" class="tab_box">
        <template v-for="(item, index) in tabList" :key="index">
          <el-tab-pane
            v-if="showList.indexOf(item.name) > -1"
            :name="item.name"
            :label="item.label"
          >
            <component
              :is="item.page"
              @upPage="upPage"
              :showNavigation="props.modal.showNavigation"
            />
          </el-tab-pane>
        </template>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script setup>
import navigationPage from './components/navigation_page.vue'
import appletPage from './components/applet_page.vue'
import functionPage from './components/function_page.vue'
import liveRoom from './components/live_room.vue'
import goods from './components/goods.vue'
defineComponent(navigationPage, appletPage, functionPage, liveRoom, goods)
/**
 * props-modal的案例
 * const modal = ref({
 *  show: false,
 *  type: 'liveRoom',
 *  showList: ['diyPage', 'liveRoom'],//只展示小程序页面和直播间的tab
 *  showNavigation:['home','category'] //只展示首页和分类页的跳转入口
 * })
 */
const props = defineProps({
  modal: {
    type: Object,
    default: () => {
      return {
        show: false,
        type: '', // 展示选中哪个tab，默认第一个
        showList: [], // 需要展示的所有tab
        showNavigation: [] // 导航页展示那些页面
      }
    }
  }
})

// 是否展示
const show = toRef(props.modal, 'show')
// 所有的tab
const tabList = reactive([
  { label: '导航页', name: 'page', page: markRaw(navigationPage) },
  { label: '小程序页面', name: 'diyPage', page: markRaw(appletPage) },
  { label: '商品', name: 'goods', page: markRaw(goods) },
  { label: '功能', name: 'function', page: markRaw(functionPage) },
  { label: '直播间', name: 'liveRoom', page: markRaw(liveRoom) }
])
// 展示的tab
const showList = ref([])
// 打开后选中的tab
const chooseTab = ref('')
// 弹窗打开后，初始化展示的tab与选中的tab
function init() {
  if (props.modal.showList && props.modal.showList.length > 0) {
    showList.value = props.modal.showList
  } else {
    showList.value = tabList.map(x => x.name)
  }
  if (props.modal.type) {
    chooseTab.value = props.modal.type
  } else {
    chooseTab.value = showList.value[0]
  }
}
init()

const dialog = ref(null)
// 选中的数据
const emits = defineEmits(['upLink'])
function upPage(e) {
  console.log('选中的数据：', e)
  emits('upLink', e)
  dialog.value.close()
}
</script>
<style scoped lang="scss">
.choose_modal {
  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }
}
</style>
