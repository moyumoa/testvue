<template>
  <div class="leaderboard">
    <title-wrapper title="排行榜设置" :subtitle="subtitle">
      <template #right>
        <el-switch v-model="switchValue" @change="onSwitch" />
      </template>
    </title-wrapper>
    <div class="container" v-if="switchValue">
      <el-form class="type-radio">
        <el-form-item label="视频榜：">
          <el-radio-group v-model="radioForm.video_rank">
            <el-radio label="play_cnt">播放数</el-radio>
            <el-radio label="digg_cnt">点赞数</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="直播榜：">
          <el-radio-group v-model="radioForm.live_rank">
            <el-radio label="watch_cnt">观看人次</el-radio>
            <el-radio label="max_online_ucnt">人气峰值</el-radio>
            <el-radio label="digg_cnt">点赞数</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金币榜：">
          <el-radio-group v-model="radioForm.gold_rank">
            <el-radio label="gold_cnt">获得金币数</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import TitleWrapper from './components/title_wrapper.vue'
import { getConfigByGroup, updateConfig } from '@/api/market/miniprogram_operation.js'
import { debounce, isEmpty } from '@/utils/tools.js'
import { operationConfig } from '@/views/market/miniprogram_operation/model.js'

const configKey = {
  CONFIG_GROUP: 'mission:rank',
  SWITCH_KEY: 'rank_mini_display',
  LIST_KEY: 'rank_display_options'
}
const subtitleObj = {
  open: '品牌内部视频、直播、金币排行每日更新，营造全员营销氛围',
  close: '开关关闭，全员营销小程序首页将隐藏"排行榜"'
}
const { switchValue, onSwitch, subtitle } = operationConfig(configKey, subtitleObj)
const radioForm = ref({
  video_rank: '',
  live_rank: '',
  gold_rank: ''
})
watch(
  () => radioForm.value,
  value => {
    update()
  },
  { deep: true }
)
const update = debounce(() => {
  updateConfig({
    configGroup: configKey.CONFIG_GROUP,
    configKey: configKey.LIST_KEY,
    configValue: JSON.stringify(radioForm.value)
  }).catch(res => {
    console.error(res)
  })
}, 1000)

const getInfo = () => {
  getConfigByGroup({
    configGroup: configKey.CONFIG_GROUP
  }).then(res => {
    if (res.code === 0) {
      switchValue.value = res?.data.find(item => item.key === configKey.SWITCH_KEY)?.value === '1'
      const temp = res?.data.find(item => item.key === configKey.LIST_KEY)?.value
      if (!isEmpty(temp)) radioForm.value = JSON.parse(temp)
    }
  })
}
getInfo()
</script>

<style lang="scss" scoped>
.leaderboard {
  .container {
    padding: 20px 12px;
    color: #323233;

    :deep(.el-form-item__label) {
      color: #333333;
    }

    :deep(.el-radio) {
      color: #323233;
    }
  }
}
</style>
