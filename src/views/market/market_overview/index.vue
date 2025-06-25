<template>
  <div class="page">
    <div class="leftBox" id="leftBox">
      <operateData></operateData>
      <marketingActivity v-if="systemVersion === 3"></marketingActivity>
      <marketingTasks></marketingTasks>
      <dataTrend></dataTrend>
      <dataAmount></dataAmount>
      <quickEntrance></quickEntrance>
    </div>
    <div class="rightBox">
      <calendar v-if="systemVersion !== 4"></calendar>
      <userPlay></userPlay>
      <taskPlay></taskPlay>
    </div>
  </div>
</template>
<script>
import calendar from './components/calendar.vue'
import operateData from './components/operational_data.vue'
import marketingTasks from './components/marketing_tasks.vue'
import marketingActivity from './components/marketing_activity.vue'
import dataTrend from './components/dataTrend.vue'
import dataAmount from './components/dataAmount.vue'
import quickEntrance from './components/quickEntrance.vue'
import userPlay from './components/userPlay.vue'
import taskPlay from './components/taskPlay.vue'

import { useStore } from 'vuex'
export default {
  components: {
    calendar,
    operateData,
    marketingActivity,
    marketingTasks,
    dataTrend,
    userPlay,
    dataAmount,
    quickEntrance,
    taskPlay
  },
  setup() {
    const store = useStore()
    const systemVersion = computed(() => store.state.user.systemVersion)
    return {
      systemVersion
    }
  }
}
</script>
<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;

  .leftBox {
    width: calc(100% - 350px);
  }
  .rightBox {
    width: 334px;
    margin-left: 16px;
  }
}
</style>
