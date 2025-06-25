<template>
  <div class="c_det" v-loading="loading">
    <!-- 客户信息 -->
    <UserInfo :info="userInfo" :clientUserType="clientUserType" @updateInfo="getDetail" />
    <!-- 客户阶段   -->
    <Stage :step="userInfo?.clientConsultStage"></Stage>
    <!-- 跟进记录+互动记录 -->
    <div class="c_det_bottom">
      <el-tabs class="tab_box" v-model="activeTab">
        <el-tab-pane label="跟进记录" name="followHistory">
          <FollowHistory :info="records" :userInfo="userInfo" />
        </el-tab-pane>
        <el-tab-pane label="互动记录" name="interactiveRecord">
          <InteractiveRecord :info="route.query" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import InteractiveRecord from './components/interactive_record.vue'
import UserInfo from './components/info.vue'
import FollowHistory from './components/follow_his.vue'
import { getCustomDetail } from '@/api/scrm/customer.js'
import { useRoute } from 'vue-router'
import Stage from './components/stage.vue'

const route = useRoute()
const userInfo = ref(null)
const records = ref(null)
const loading = ref(true)
const clientUserType = ref(null)
clientUserType.value = route.query.clientUserType
function getDetail() {
  getCustomDetail(route.query).then(res => {
    loading.value = false
    if (res.code === 0) {
      userInfo.value = res.data?.clientDetail
      records.value = res.data?.clientConsultHistories
    }
  })
}

getDetail()

const activeTab = ref('followHistory')
onMounted(() => {
  if (route.query.toType) {
    activeTab.value = route.query.toType
  }
})
</script>

<style lang="scss" scoped>
.c_det_bottom {
  border-radius: 4px;
  margin-top: 16px;
  background: #fff;
}
:deep(.el-tabs__header) {
  background: #fff;
  padding: 0;

  // margin-bottom: 0;

  .el-tabs__item {
    padding: 22px 12px 22px 24px;
    font-size: 18px;
    font-weight: 400;
    color: #303133;
  }
  .is-active {
    font-weight: 600;
  }
}
:deep(.el-tabs__nav-scroll) {
  padding-left: 24px;
}
.c_det,
.tab_box,
:deep(.el-tab-pane) {
  width: 100%;
  height: 100%;
}
.c_det_bottom {
  height: calc(100% - 432px);
  min-height: 281px;
}
:deep(.el-tabs__content) {
  height: calc(100% - 84px);
}
</style>
