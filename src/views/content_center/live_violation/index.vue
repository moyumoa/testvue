<template>
  <div class="live_monitor">
    <el-tabs class="tab_box hide_underline" v-model="chooseRule" @tab-click="changeTab">
      <el-tab-pane label="违规矩阵号" name="violationMatrix">
        <violationMatrix
          v-if="chooseRuleTrue == 'violationMatrix'"
          @upRule="upRule"
        ></violationMatrix>
      </el-tab-pane>
      <el-tab-pane label="违规记录" name="violationRecord">
        <violationRecord
          v-if="chooseRuleTrue == 'violationRecord'"
          :recordInfo="recordInfo"
        ></violationRecord>
      </el-tab-pane>
      <el-tab-pane label="违规关键词" name="violationKeywords">
        <violationKeywords v-if="chooseRuleTrue == 'violationKeywords'"></violationKeywords>
      </el-tab-pane>
      <el-tab-pane label="提醒设置" name="violationRemind">
        <violationRemind v-if="chooseRuleTrue == 'violationRemind'"></violationRemind>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import violationMatrix from '../violation_matrix/index.vue'
import violationKeywords from '../violation_keywords/index.vue'
import violationRecord from '../violation_record/index.vue'
import violationRemind from '../violation_remind/index.vue'
import { useRoute, useRouter } from 'vue-router'
defineComponent(violationMatrix, violationKeywords, violationRecord, violationRemind)
const chooseRule = ref('violationMatrix')
const chooseRuleTrue = ref('')
const isWeiXin = ref(true)
isWeiXin.value = localStorage.getItem('isWeiXin') === '1'

const route = useRoute()
const router = useRouter()
const recordInfo = ref({})
onMounted(() => {
  console.log('mounted', route.query)
  if (route.query.type) {
    chooseRule.value = route.query.type
    chooseRuleTrue.value = route.query.type
  } else {
    chooseRuleTrue.value = chooseRule.value
  }
  if (route.query.name) {
    recordInfo.value = {
      name: window.decodeURIComponent(route.query.name),
      dyh: window.decodeURIComponent(route.query.dyh),
      startTime: window.decodeURIComponent(route.query.startTime),
      endTime: window.decodeURIComponent(route.query.endTime)
    }
  }
})
function upRule(e) {
  console.log('e', e)
  recordInfo.value = e
  nextTick(() => {
    chooseRule.value = 'violationRecord'
  })
}
function changeTab() {
  recordInfo.value = {}
  const query = {
    type: chooseRule.value
  }
  router.push({ path: route.path, query })
}
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';
:deep(.el-tabs__header) {
  background: #fff;
  padding: 16px 0 0 24px;
  border-radius: $content-radius;
}
.live_monitor {
  position: relative;
}
</style>
