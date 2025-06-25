<template>
  <div class="preview_page">
    <div class="preview_head">小程序</div>
    <div class="preview_content" :style="showTab == 'my_activity' ? ' background: #F3F4F8;' : ''">
      <img
        class="my_back"
        v-if="showTab == 'my_activity'"
        src="https://tagvv-1256030678.file.myqcloud.com/202501060omgk.png"
        alt=""
      />
      <div class="conternt_content">
        <img
          class="content_top"
          src="https://tagvv-1256030678.file.myqcloud.com/202306160kg6c.png"
        />
        <div class="content_title">
          <template v-for="(item, index) in titleList">
            <div
              v-if="item.show"
              :class="{ one_title: true, one_title_act: item.choose }"
              :key="index"
              @click="updateTabFun(item.value)"
            >
              <div class="title_title">{{ item.label }}</div>
              <div class="title_act"></div>
            </div>
          </template>
        </div>
        <div class="content_content">
          <div
            class="content_box"
            :style="!['activity_square', 'my_activity'].includes(showTab) ? 'padding:0' : ''"
          >
            <template v-for="(value, name, index) in configList">
              <div
                class="one_content"
                v-if="showTab == name"
                :key="index"
                style="position: relative"
              >
                <component
                  :chooseTab="showTab"
                  :is="value.previewPage"
                  :data="props.data && props.data[value.infoKey] ? props.data[value.infoKey] : {}"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { configList } from './components/config.js'
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  switchOpenNumber: Number,
  previewTitleList: Array,
  configInfo: {
    type: Object
  },
  data: {
    type: Object
  },
  chooseTab: {
    type: String
  }
})
const titleList = ref([])
const myActivityIndex = props.previewTitleList.findIndex(x => x.value === 'my_activity')
titleList.value = JSON.parse(JSON.stringify(props.previewTitleList))
const showTab = ref('')
// 监听默认数据
watch(
  () => props.chooseTab,
  val => {
    let show = 'my_activity'
    if (props.data[configList[val].infoKey].switch === '1') {
      show = val
    }
    titleList.value.forEach(x => {
      x.choose = show === x.value
    })
    showTab.value = show
  },
  { deep: true, immediate: true }
)
// 监听默认数据
watch(
  () => props.data,
  val => {
    let show = ''
    titleList.value.forEach(x => {
      if (val[x.infoKey] && val[x.infoKey].switch === '1' && props.chooseTab === x.value) {
        show = x.value
        x.choose = true
      } else {
        x.choose = false
      }
      x.show = val[x.infoKey] ? val[x.infoKey].switch === '1' : true
    })
    if (!show) {
      showTab.value = 'my_activity'
      titleList.value[myActivityIndex].choose = true
    } else {
      if (showTab.value !== show) showTab.value = show
    }
  },
  { deep: true, immediate: true }
)
const emits = defineEmits(['updateTab'])
const updateTabFun = throttle(e => {
  if (e) emits('updateTab', e)
}, 400)
</script>
<style lang="scss" scoped>
@import '../components/css/setting_page.scss';
.preview_content {
  position: relative;
}
.my_back,
.conternt_content {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}
.conternt_content {
  height: 100%;
}
.content_title {
  position: absolute;
  left: 0;
  top: 0;
  height: 90px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  padding-left: 4px;
  .one_title {
    cursor: pointer;
    font-weight: 600;
    font-size: 18px;
    color: #8f959e;
    line-height: 26px;
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    white-space: nowrap;
    .title_act {
      margin-top: 2px;
      width: 24px;
      height: 4px;

      border-radius: 2px;
    }
  }
  .one_title_act {
    font-weight: 600;
    font-size: 20px;
    color: #1f2329;
    line-height: 28px;
    .title_act {
      background: linear-gradient(316deg, #3865f3 0%, #7b9bff 100%);
    }
  }
}
</style>
