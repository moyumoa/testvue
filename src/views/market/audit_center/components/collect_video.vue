<template>
  <div class="audit_info">
    <div class="title">视频信息</div>
    <!-- <div class="cover" @click="playVideo(auditInfo.taskUserMaterial.materialUrl)">
      <img :src="auditInfo.taskUserMaterial.cover" />
      <img class="play_icon" src="https://tagvv-1256030678.file.myqcloud.com/20220325a6shx.png" />
    </div> -->
    <div class="cover">
      <material-item :materialInfo="auditInfo.taskUserMaterial" type="video"></material-item>
    </div>
  </div>
</template>

<script setup>
// import { pageList } from '../video_audit/model/get_list'
import materialItem from '@/views/market/components/material_item.vue'

const props = defineProps({
  auditInfo: Object
})
const { auditInfo } = toRefs(props)
// const { playVideo } = pageList()
</script>

<style lang="scss" scoped>
.audit_info {
  .title {
    height: 24px;
    font-size: 16px;
    color: #303133;
    line-height: 24px;
    margin-bottom: 12px;
  }
  .cover {
    position: relative;
    flex-shrink: 0;
    width: 60px;
    height: 80px;
    border-radius: 4px;
    margin-right: 12px;
    img {
      width: 100%;
      height: 100%;
    }
    .play_icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
      height: 24px;
    }
  }
  .info {
    flex: 1;
  }
}
</style>
