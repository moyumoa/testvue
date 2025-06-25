<template>
  <div v-loading="loading">
    <!-- <el-tabs class="tab_box hide_underline" v-model="tabKey" @tab-click="changeTab">
      <el-tab-pane label="汇总报表" name="1">
        <part1 v-if="tabKey == '1'" :key="1" @operateReportSearchChange="changeTime" />
      </el-tab-pane>
      <el-tab-pane label="矩阵号报表" name="2">
        <part2 v-if="tabKey == '2'" :key="2" :recordInfo="recordInfo"/>
      </el-tab-pane>
    </el-tabs>-->
    <div class="page_tabs">
      <div
        v-for="item in tabList"
        :key="item.key"
        :class="['tab_item', tabKey === item.key ? 'active' : '']"
        @click="changeTab(item)"
      >
        {{ item.isGroup ? item.label + '分组' : item.label }}报表
      </div>
      <!--      <div :class="['tab_item', tabKey == 1 ? 'active' : '']" @click="changeTab(1)">汇总报表</div>-->
      <!--      <div :class="['tab_item', tabKey == 2 ? 'active' : '']" @click="changeTab(2)">矩阵号报表</div>-->
    </div>
    <div class="search_box">
      <!-- 汇总报表 矩阵号报表 保持原有逻辑      -->
      <div v-show="tabKey === 'summary'">
        <part1 :tableHeight="tableHeight" key="1" @operateReportSearchChange="changeTime" />
      </div>
      <div v-if="tabKey === 'account'">
        <part2
          :tableHeight="tableHeight"
          :groupId="defaultGroupId"
          key="2"
          :recordInfo="recordInfo"
        />
      </div>
      <!--  成员报表     -->
      <MemberForm v-if="tabKey === 'member'" :tableHeight="tableHeight"></MemberForm>
      <!--  业务主体报表 -->
      <EntityForm
        v-if="!['summary', 'account', 'member'].includes(tabKey)"
        :key="tabKey"
        :tableHeight="tableHeight"
        :label="currentTab.label"
        :type="currentTab.key"
        :isGroup="currentTab.isGroup"
      ></EntityForm>
    </div>
  </div>
</template>

<script setup>
import part1 from './components/part1.vue'
import part2 from './components/part2.vue'
import { getBusinessEntity } from '@/api/system_setting/business_entity'
import MemberForm from './components/member_form.vue'
import EntityForm from './components/entity_form.vue'
import { useRoute } from 'vue-router'
const tabList = ref([
  {
    key: 'summary',
    label: '汇总'
  },
  {
    key: 'account',
    label: '矩阵号'
  },
  {
    key: 'member',
    label: '成员'
  }
])
const tabKey = ref('summary')
const currentTab = ref({})
function changeTab(val) {
  tabKey.value = val.key
  currentTab.value = val
}
const recordInfo = ref({})
function changeTime(params) {
  recordInfo.value = params
}
const route = useRoute()

const loading = ref(true)
// 获取用户打开的业务主题
const getEntity = () => {
  loading.value = true
  getBusinessEntity({}).then(res => {
    if (res.code === 0) {
      loading.value = false
      const list = res.data || []
      list.forEach(item => {
        // 如果业务主体打开了 就显示tab
        if (item.isOpen === 1) {
          tabList.value.push({
            label: item.principalName,
            key: item.principalType + '',
            isGroup: item.isGroup
          })
        }
        setDefaultByRouter()
      })
    }
  })
}

// 设置路由携带的默认值
const setDefaultByRouter = () => {
  const { tab } = route.query || {}
  // 选中路由中携带的tab
  if (tab) {
    const tabDefault = tabList.value.find(item => {
      return item.key === tab
    })
    if (tabDefault) {
      changeTab(tabDefault)
    }
  }
}
// const ref
const defaultGroupId = ref('')
const init = () => {
  getEntity()
  const { tab, groupId } = route.query || {}
  if (tab === 'account') {
    defaultGroupId.value = groupId
  }
}
init()
const tableHeight = ref(null)
function onResize() {
  tableHeight.value = parseInt(document.body.clientHeight) - 400
}
onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
})
</script>

<style lang="scss" scoped>
.page_tabs {
  border-radius: 4px;
  padding-left: 24px;
  background-color: #fff;
  height: 52px;
  display: flex;
  align-items: center;
  .tab_item {
    height: 100%;
    margin-right: 40px;
    line-height: 50px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  .active {
    border-bottom: 2px solid #364fcd;
  }
}
.search_box {
  margin-top: 16px;
}
</style>
