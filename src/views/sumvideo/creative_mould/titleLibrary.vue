<template>
  <div class="ai_title">
    <div class="top_title_warp">
      <div class="top_title">{{ name }}</div>
      <div class="back_det_warp" @click="backDet">
        返回模板分镜详情页
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20240228kj247.png"
          alt=""
          class="icon_img"
        />
      </div>
    </div>
    <el-tabs class="tab_box" v-model="chooseTab" @tab-click="changeTab">
      <template v-for="(tab, i) in tabList" :key="i">
        <el-tab-pane v-if="tab.show" :label="tab.label" :name="tab.value">
          <template #label>
            <div class="tab_label">
              {{ tab.label }}
            </div>
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
    <titlePage v-if="chooseTab == 'title_l'" @changeTab="changeTabPage" :creativeId="creativeId" />
    <createPage v-if="chooseTab == 'create_title'" :creativeId="creativeId" />
  </div>
</template>
<script setup>
import titlePage from './titleLibraryPage/title_page.vue'
import createPage from './titleLibraryPage/create_page.vue'
import { useRoute, useRouter } from 'vue-router'

const tabList = [
  { label: '标题文案库', value: 'title_l', show: true },
  { label: 'AI生成标题文案', value: 'create_title', show: true }
]
const creativeId = ref('')
const chooseTab = ref('title_l')
const route = useRoute()
const router = useRouter()
creativeId.value = route.query.id || ''
const name = route.query.name || ''

function changeTab() {
  console.log('标题切换')
}
function changeTabPage(val) {
  chooseTab.value = val
}
function backDet() {
  router.go(-1)
}
onMounted(() => {
  nextTick(() => {
    if (route.query.tab) {
      chooseTab.value = route.query.tab
    }
  })
})
</script>

<style lang="scss" scoped>
.ai_title {
  height: 100%;
  min-height: 100%;
  background: #fff;
  padding-top: 22px;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 400;
  .top_title_warp {
    position: relative;
    .top_title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      line-height: 22px;
      padding: 0 24px;
    }
    .back_det_warp {
      position: absolute;
      top: 0;
      right: 24px;
      display: flex;
      align-items: center;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #303133;
      line-height: 20px;
      padding: 6px 12px;
      border-radius: 4px;
      border: 1px solid rgba(153, 153, 153, 0.5);
      cursor: pointer;
      .icon_img {
        width: 14px;
        min-width: 14px;
        height: 14px;
        margin-left: 4px;
      }
    }
  }
  .tab_box {
    margin-top: 16px;
    padding: 0 24px;
  }
}
</style>
